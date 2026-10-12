import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, verifyPassword, hashPassword } from "@/lib/db";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { generateAdminToken, getSessionUser, verifySessionToken } from "@/lib/serverAuth";

// Helper to write to audit log
const writeAuditLog = (userId, action, entity, before = null, after = null) => {
  try {
    db.insert("audit_logs", {
      actor_id: userId || "guest",
      action,
      entity,
      before,
      after,
      timestamp: new Date().toISOString()
    });
  } catch (_) {}
};

export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body || {};
    const cookieStore = await cookies();

    // =========================================================================
    // 0. EMAIL + PASSWORD LOGIN Flow (Supabase Auth with Admin Fallback)
    // =========================================================================
    if (action === "login-password" || action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const adminEmail = (process.env.ADMIN_EMAIL || "adminotz@gmail.com").trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || "otz@2026";
      const isAdminEmail = cleanEmail === adminEmail;

      let authenticatedViaSupabase = false;
      let supabaseSession = null;
      let sbUser = null;

      // 1. If Supabase is configured, attempt Supabase Auth sign in
      if (isServerSupabaseConfigured()) {
        try {
          const supabase = getSupabaseServer();
          
          const { data: sbSignIn, error: sbSignInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (!sbSignInErr && sbSignIn?.user) {
            authenticatedViaSupabase = true;
            supabaseSession = sbSignIn.session;
            sbUser = sbSignIn.user;
          } else if (isAdminEmail && password === adminPassword) {
            // Provision admin user in Supabase Auth if needed
            try {
              if (supabase.auth.admin && typeof supabase.auth.admin.createUser === "function") {
                const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
                  email: adminEmail,
                  password: adminPassword,
                  email_confirm: true,
                  user_metadata: { role: "admin", name: "OTZ Administrator" }
                });
                if (!createErr && newUser?.user) {
                  const { data: reSignIn } = await supabase.auth.signInWithPassword({
                    email: adminEmail,
                    password: adminPassword
                  });
                  if (reSignIn?.session) {
                    supabaseSession = reSignIn.session;
                    sbUser = reSignIn.user;
                    authenticatedViaSupabase = true;
                  }
                }
              }
            } catch (provErr) {
              console.warn("Supabase admin provision notice:", provErr);
            }
          }
        } catch (sbErr) {
          console.warn("Supabase Auth server error:", sbErr);
        }
      }

      // 2. Handle Supabase Authenticated User
      if (authenticatedViaSupabase && sbUser) {
        const supabase = getSupabaseServer();
        let userProfile = null;

        try {
          const { data: profData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sbUser.id)
            .maybeSingle();

          if (profData) {
            userProfile = profData;
          } else {
            // Create profile if missing
            const newProfile = {
              id: sbUser.id,
              email: cleanEmail,
              full_name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || cleanEmail.split("@")[0],
              phone: sbUser.user_metadata?.phone || "",
              company: sbUser.user_metadata?.company || (isAdminEmail ? "OTZ Operations" : "Personal Account"),
              role: isAdminEmail ? "admin" : (sbUser.user_metadata?.role || "brand")
            };
            const { data: insertedProf } = await supabase
              .from("profiles")
              .insert([newProfile])
              .select()
              .maybeSingle();
            userProfile = insertedProf || newProfile;
          }
        } catch (_) {}

        const token = supabaseSession?.access_token || generateAdminToken(cleanEmail);
        const expiresAt = supabaseSession?.expires_at 
          ? new Date(supabaseSession.expires_at * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Set cookies
        cookieStore.set("otz_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(expiresAt),
          path: "/"
        });

        cookieStore.set("otz_token", token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(expiresAt),
          path: "/"
        });

        const returnedUser = {
          id: sbUser.id,
          account_id: sbUser.id,
          name: userProfile?.full_name || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || (isAdminEmail ? "OTZ Administrator" : cleanEmail.split("@")[0]),
          email: cleanEmail,
          phone: userProfile?.phone || sbUser.user_metadata?.phone || "",
          role: isAdminEmail ? "admin" : (userProfile?.role || sbUser.user_metadata?.role || "brand"),
          company: userProfile?.company || (isAdminEmail ? "OTZ Operations" : "Personal Account"),
          state: "verified",
          avatar_url: userProfile?.avatar_url || sbUser.user_metadata?.avatar_url || "",
          profile: userProfile
        };

        return NextResponse.json({
          success: true,
          token,
          session: supabaseSession,
          user: returnedUser
        });
      }

      // 3. Fallback to Local Database Admin / In-Memory verification
      let user = db.find("users", "email", cleanEmail);
      let isValid = false;

      if (isAdminEmail) {
        if (password === adminPassword) {
          isValid = true;
        } else if (user && user.password_hash && verifyPassword(password, user.password_hash)) {
          isValid = true;
        }
      } else if (user && user.password_hash) {
        isValid = verifyPassword(password, user.password_hash);
      }

      if (!isValid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // If admin user doesn't exist in local database, ensure it is created
      if (!user && isAdminEmail) {
        let account = db.find("accounts", "id", "acc-admin-1");
        if (!account) {
          account = db.insert("accounts", {
            id: "acc-admin-1",
            name: "OTZ Administrator",
            company: "OTZ Admin",
            role: "admin",
            state: "verified"
          });
        }

        user = db.insert("users", {
          id: "usr-admin-1",
          account_id: account.id,
          name: "OTZ Administrator",
          email: adminEmail,
          phone: "9999999999",
          role: "admin",
          password_hash: hashPassword(adminPassword),
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        });
      }

      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const sessionToken = generateAdminToken(user.email);
      const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      cookieStore.set("otz_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(sessionExpiry),
        path: "/"
      });

      cookieStore.set("otz_token", sessionToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(sessionExpiry),
        path: "/"
      });

      return NextResponse.json({
        success: true,
        token: sessionToken,
        session: { access_token: sessionToken, expires_at: sessionExpiry },
        user: {
          id: user.id,
          account_id: user.account_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: "OTZ Operations",
          state: "verified"
        }
      });
    }

    // =========================================================================
    // 1. REGISTRATION / SIGNUP Flow (Supabase Auth + Database Profile)
    // =========================================================================
    if (action === "signup" || action === "register") {
      const { name, full_name, email, password, phone, company, company_name, role = "brand", consent, profileData } = body;
      const finalName = (name || full_name || "").trim();
      const finalEmail = (email || "").trim().toLowerCase();
      const finalPhone = (phone || "").trim();
      const finalCompany = (company || company_name || "").trim() || "Personal Account";
      const finalRole = (role || "brand").trim();

      if (!finalEmail) {
        return NextResponse.json({ error: "Email address is required" }, { status: 400 });
      }

      // If password provided: Supabase Auth Signup
      if (password) {
        if (password.length < 6) {
          return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        if (isServerSupabaseConfigured()) {
          try {
            const supabase = getSupabaseServer();

            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: finalEmail,
              password: password,
              options: {
                data: {
                  full_name: finalName,
                  name: finalName,
                  phone: finalPhone,
                  company: finalCompany,
                  role: finalRole
                }
              }
            });

            if (authError) {
              return NextResponse.json({ error: authError.message }, { status: 400 });
            }

            const createdUser = authData.user;
            if (!createdUser) {
              return NextResponse.json({ error: "Unable to create account" }, { status: 400 });
            }

            // 2. Ensure Profile record is in public.profiles
            try {
              await supabase
                .from("profiles")
                .upsert([
                  {
                    id: createdUser.id,
                    email: finalEmail,
                    full_name: finalName,
                    phone: finalPhone,
                    company: finalCompany,
                    role: finalRole,
                    niche: profileData?.niche || "",
                    goals: profileData?.goals || [],
                    primary_goal: profileData?.primary_goal || "",
                    budget_band: profileData?.budget_band || "",
                    geography: profileData?.geography || "",
                    timeline: profileData?.timeline || ""
                  }
                ], { onConflict: "id" });
            } catch (profErr) {
              console.warn("Profile creation notice:", profErr);
            }

            // 3. Set Session Cookies if session returned immediately
            let token = authData.session?.access_token || null;
            if (token) {
              const expiresAt = authData.session?.expires_at
                ? new Date(authData.session.expires_at * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

              cookieStore.set("otz_session", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: new Date(expiresAt),
                path: "/"
              });

              cookieStore.set("otz_token", token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: new Date(expiresAt),
                path: "/"
              });
            }

            // Also mirror in local DB
            try {
              const localAccount = db.insert("accounts", {
                id: `acc-${createdUser.id}`,
                name: finalName,
                company: finalCompany,
                role: finalRole,
                state: "verified"
              });
              db.insert("users", {
                id: createdUser.id,
                account_id: localAccount.id,
                name: finalName,
                email: finalEmail,
                phone: finalPhone,
                role: finalRole,
                password_hash: hashPassword(password),
                last_login_at: new Date().toISOString()
              });
            } catch (_) {}

            return NextResponse.json({
              success: true,
              user: {
                id: createdUser.id,
                account_id: createdUser.id,
                name: finalName,
                email: finalEmail,
                phone: finalPhone,
                company: finalCompany,
                role: finalRole,
                state: "verified"
              },
              session: authData.session,
              token,
              message: authData.session ? "Account created successfully!" : "Account created. Please check your email for confirmation."
            });
          } catch (sbErr) {
            console.error("Supabase signup error:", sbErr);
            return NextResponse.json({ error: "Failed to create account with Supabase" }, { status: 500 });
          }
        }
      }

      // Legacy OTP registration fallback if no password
      if (!finalName || !finalEmail || !finalPhone || !finalCompany) {
        return NextResponse.json({ error: "Missing mandatory fields" }, { status: 400 });
      }

      const existingUser = db.find("users", "email", finalEmail) || db.find("users", "phone", finalPhone);
      if (existingUser) {
        return NextResponse.json({ error: "Account with this email/phone already exists" }, { status: 400 });
      }

      const account = db.insert("accounts", {
        name: finalName,
        company: finalCompany,
        role: finalRole,
        state: "unverified"
      });

      const user = db.insert("users", {
        account_id: account.id,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        role: finalRole,
        last_login_at: null
      });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      db.insert("otp_challenges", {
        user_id: user.id,
        phone: finalPhone,
        code: otpCode,
        purpose: "registration",
        attempts: 0,
        expires_at: expiresAt,
        consumed_at: null
      });

      return NextResponse.json({
        success: true,
        userId: user.id,
        accountId: account.id,
        debugOtp: otpCode,
        message: "Registration completed. OTP sent to phone."
      });
    }

    // =========================================================================
    // 2. REQUEST OTP Flow (Phone SMS OTP Fallback)
    // =========================================================================
    if (action === "request-otp") {
      const { phone } = body;
      if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
      }

      const user = db.find("users", "phone", phone);
      if (!user) {
        return NextResponse.json({ error: "Phone number not registered. Please register first." }, { status: 404 });
      }

      const account = db.find("accounts", "id", user.account_id);
      if (account && account.state === "suspended") {
        return NextResponse.json({ error: "Account is suspended. Please contact support." }, { status: 403 });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      db.insert("otp_challenges", {
        user_id: user.id,
        phone,
        code: otpCode,
        purpose: "login",
        attempts: 0,
        expires_at: expiresAt,
        consumed_at: null
      });

      return NextResponse.json({
        success: true,
        userId: user.id,
        debugOtp: otpCode,
        message: "OTP generated successfully."
      });
    }

    // =========================================================================
    // 3. VERIFY OTP Flow
    // =========================================================================
    if (action === "verify-otp") {
      const { userId, code } = body;
      if (!userId || !code) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const user = db.find("users", "id", userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const challenges = db.get("otp_challenges", (c) => c.user_id === user.id && !c.consumed_at);
      if (challenges.length === 0) {
        return NextResponse.json({ error: "No active OTP request found. Please request a new OTP." }, { status: 400 });
      }

      challenges.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const latestChallenge = challenges[0];

      if (new Date() > new Date(latestChallenge.expires_at)) {
        return NextResponse.json({ error: "OTP expired. Please request a new OTP." }, { status: 400 });
      }

      if (latestChallenge.attempts >= 5) {
        db.update("accounts", "id", user.account_id, { state: "suspended" });
        return NextResponse.json({ error: "Too many failed attempts. Account locked. Contact support." }, { status: 403 });
      }

      if (latestChallenge.code !== code) {
        db.update("otp_challenges", "id", latestChallenge.id, { attempts: latestChallenge.attempts + 1 });
        return NextResponse.json({ error: `Invalid verification code. Attempts left: ${5 - (latestChallenge.attempts + 1)}` }, { status: 400 });
      }

      db.update("otp_challenges", "id", latestChallenge.id, { consumed_at: new Date().toISOString() });
      
      const account = db.find("accounts", "id", user.account_id);
      if (account && account.state === "unverified") {
        db.update("accounts", "id", user.account_id, { state: "verified" });
      }

      db.update("users", "id", user.id, { last_login_at: new Date().toISOString() });

      const sessionToken = `session-${Math.random().toString(36).substr(2, 12)}-${Math.random().toString(36).substr(2, 12)}`;
      const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      cookieStore.set("otz_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(sessionExpiry),
        path: "/"
      });

      return NextResponse.json({
        success: true,
        token: sessionToken,
        user: {
          id: user.id,
          account_id: user.account_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: account?.company,
          state: account?.state || "verified"
        }
      });
    }

    // =========================================================================
    // 4. SESSION RETRIEVAL (get-session)
    // =========================================================================
    if (action === "get-session") {
      const user = await getSessionUser(request);
      if (!user) {
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          account_id: user.account_id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role || "brand",
          company: user.company || "Personal Account",
          state: user.state || "verified",
          avatar_url: user.avatar_url || "",
          profile: user.profile || null
        }
      });
    }

    // =========================================================================
    // 5. SYNC OAUTH / GOOGLE PROFILE Flow
    // =========================================================================
    if (action === "sync-profile") {
      const user = await getSessionUser(request);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (isServerSupabaseConfigured()) {
        try {
          const supabase = getSupabaseServer();
          const { data: existingProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!existingProf) {
            const newProfile = {
              id: user.id,
              email: user.email,
              full_name: user.name,
              phone: user.phone || "",
              company: user.company || "Personal Account",
              role: user.role || "brand",
              avatar_url: user.avatar_url || ""
            };
            await supabase.from("profiles").insert([newProfile]);
          }
        } catch (e) {
          console.warn("Sync profile notice:", e);
        }
      }

      return NextResponse.json({ success: true, user });
    }

    // =========================================================================
    // 6. LOGOUT Flow
    // =========================================================================
    if (action === "logout") {
      cookieStore.set("otz_session", "", { expires: new Date(0), path: "/" });
      cookieStore.set("otz_token", "", { expires: new Date(0), path: "/" });

      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

