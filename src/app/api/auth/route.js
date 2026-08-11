import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Helper to write to audit log
const writeAuditLog = (userId, action, entity, before = null, after = null) => {
  db.insert("audit_logs", {
    actor_id: userId || "guest",
    action,
    entity,
    before,
    after,
    timestamp: new Date().toISOString()
  });
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const cookieStore = await cookies();

    // 1. REGISTRATION Flow
    if (action === "register") {
      const { name, email, phone, company, role, consent, profileData } = body;

      if (!name || !email || !phone || !company || !role) {
        return NextResponse.json({ error: "Missing mandatory fields" }, { status: 400 });
      }

      if (!consent) {
        return NextResponse.json({ error: "Explicit consent is required" }, { status: 400 });
      }

      // Check if email or phone already exists
      const existingUser = db.find("users", "email", email) || db.find("users", "phone", phone);
      if (existingUser) {
        return NextResponse.json({ error: "Account with this email/phone already exists" }, { status: 400 });
      }

      // Insert Account
      const account = db.insert("accounts", {
        name,
        company,
        role, // "brand" | "host"
        state: "unverified" // verified | unverified | suspended
      });

      // Insert User
      const user = db.insert("users", {
        account_id: account.id,
        name,
        email,
        phone,
        role,
        last_login_at: null
      });

      // Insert Profile
      if (role === "brand") {
        db.insert("brand_profiles", {
          account_id: account.id,
          niche: profileData?.niche || "",
          goals: profileData?.goals || [],
          primary_goal: profileData?.primary_goal || "",
          budget_band: profileData?.budget_band || "",
          geography: profileData?.geography || "",
          timeline: profileData?.timeline || "",
          consent_date: new Date().toISOString()
        });
      }

      // Write audit log
      writeAuditLog(user.id, "register_account", "accounts", null, account);

      // Create an OTP challenge automatically
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry
      
      const challenge = db.insert("otp_challenges", {
        user_id: user.id,
        phone,
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
        debugOtp: otpCode, // Exposed for easy testing in console/UI
        message: "Registration completed. OTP sent to phone."
      });
    }

    // 2. REQUEST OTP Flow (Login or Re-verify)
    if (action === "request-otp") {
      const { phone } = body;
      if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
      }

      // Find user
      const user = db.find("users", "phone", phone);
      if (!user) {
        return NextResponse.json({ error: "Phone number not registered. Please register first." }, { status: 404 });
      }

      // Hardening: check for rate limit or lockout (e.g. check failures in last 5 min)
      const account = db.find("accounts", "id", user.account_id);
      if (account && account.state === "suspended") {
        return NextResponse.json({ error: "Account is suspended. Please contact support." }, { status: 403 });
      }

      // Generate 6-digit OTP
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

      // Write audit log
      writeAuditLog(user.id, "request_otp", "otp_challenges");

      return NextResponse.json({
        success: true,
        userId: user.id,
        debugOtp: otpCode,
        message: "OTP generated successfully."
      });
    }

    // 3. VERIFY OTP Flow
    if (action === "verify-otp") {
      const { userId, code } = body;
      if (!userId || !code) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Find user
      const user = db.find("users", "id", userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Find active OTP challenges for this user
      const challenges = db.get("otp_challenges", (c) => c.user_id === user.id && !c.consumed_at);
      if (challenges.length === 0) {
        return NextResponse.json({ error: "No active OTP request found. Please request a new OTP." }, { status: 400 });
      }

      // Sort by newest
      challenges.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const latestChallenge = challenges[0];

      // Check expiry
      if (new Date() > new Date(latestChallenge.expires_at)) {
        return NextResponse.json({ error: "OTP expired. Please request a new OTP." }, { status: 400 });
      }

      // Check attempts (Lockout at 5 attempts)
      if (latestChallenge.attempts >= 5) {
        // Suspend account
        db.update("accounts", "id", user.account_id, { state: "suspended" });
        writeAuditLog(user.id, "account_suspended_lockout", "accounts");
        return NextResponse.json({ error: "Too many failed attempts. Account locked. Contact support." }, { status: 403 });
      }

      // Verify code
      if (latestChallenge.code !== code) {
        // Increment attempts
        db.update("otp_challenges", "id", latestChallenge.id, { attempts: latestChallenge.attempts + 1 });
        db.insert("auth_events", {
          user_id: user.id,
          type: "otp_failed",
          outcome: "failure",
          ip: "127.0.0.1",
          timestamp: new Date().toISOString()
        });
        return NextResponse.json({ error: `Invalid verification code. Attempts left: ${5 - (latestChallenge.attempts + 1)}` }, { status: 400 });
      }

      // Code matched! Mark challenge as consumed
      db.update("otp_challenges", "id", latestChallenge.id, { consumed_at: new Date().toISOString() });
      
      // Update account status to verified
      const account = db.find("accounts", "id", user.account_id);
      if (account.state === "unverified") {
        db.update("accounts", "id", user.account_id, { state: "verified" });
      }

      // Log last login
      db.update("users", "id", user.id, { last_login_at: new Date().toISOString() });

      // Create Session
      const sessionToken = `session-${Math.random().toString(36).substr(2, 12)}-${Math.random().toString(36).substr(2, 12)}`;
      const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30-day roll

      db.insert("sessions", {
        user_id: user.id,
        token: sessionToken,
        expires_at: sessionExpiry,
        revoked_at: null,
        user_agent: request.headers.get("user-agent") || "unknown",
        ip: "127.0.0.1"
      });

      // Write to auth events
      db.insert("auth_events", {
        user_id: user.id,
        type: "login_success",
        outcome: "success",
        ip: "127.0.0.1",
        timestamp: new Date().toISOString()
      });

      // Set cookie (secure httpOnly sameSite)
      cookieStore.set("otz_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(sessionExpiry),
        path: "/"
      });

      const profile = user.role === "brand" ? db.find("brand_profiles", "account_id", user.account_id) : null;

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          account_id: user.account_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: account.company,
          state: account.state,
          profile
        }
      });
    }

    // 4. MOCK EMAIL MAGIC LINK Flow
    if (action === "magic-link") {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const user = db.find("users", "email", email);
      if (!user) {
        return NextResponse.json({ error: "Email address not registered. Please register first." }, { status: 404 });
      }

      // Generate a mock token
      const magicToken = `magic-${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate sending magic link (expires in 15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      db.insert("otp_challenges", {
        user_id: user.id,
        phone: user.phone,
        code: magicToken,
        purpose: "magic_link",
        attempts: 0,
        expires_at: expiresAt,
        consumed_at: null
      });

      return NextResponse.json({
        success: true,
        userId: user.id,
        debugToken: magicToken,
        message: "Magic link generated. Check console/API response for link."
      });
    }

    // 5. SESSION VERIFICATION (GET/POST validation)
    if (action === "get-session") {
      const sessionCookie = cookieStore.get("otz_session");
      if (!sessionCookie) {
        return NextResponse.json({ user: null });
      }

      const session = db.find("sessions", "token", sessionCookie.value);
      if (!session || session.revoked_at || new Date() > new Date(session.expires_at)) {
        return NextResponse.json({ user: null });
      }

      const user = db.find("users", "id", session.user_id);
      if (!user) {
        return NextResponse.json({ user: null });
      }

      const account = db.find("accounts", "id", user.account_id);
      const profile = user.role === "brand" ? db.find("brand_profiles", "account_id", user.account_id) : null;

      return NextResponse.json({
        user: {
          id: user.id,
          account_id: user.account_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: account.company,
          state: account.state,
          profile
        }
      });
    }

    // 6. LOGOUT Flow
    if (action === "logout") {
      const sessionCookie = cookieStore.get("otz_session");
      if (sessionCookie) {
        db.update("sessions", "token", sessionCookie.value, { revoked_at: new Date().toISOString() });
      }

      // Clear cookie
      cookieStore.set("otz_session", "", { expires: new Date(0), path: "/" });

      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
