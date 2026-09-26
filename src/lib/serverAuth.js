import crypto from "crypto";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "otz-admin-production-session-secret-key-2026";

/**
 * Generate a cryptographically signed, stateless admin session token (HMAC-SHA256).
 * This persists seamlessly across Vercel serverless lambda instances and cold starts.
 */
export function generateAdminToken(email = "adminotz@gmail.com") {
  const payload = {
    id: "usr-admin-1",
    email: email.trim().toLowerCase(),
    role: "admin",
    name: "OTZ Administrator",
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days validity
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `otz_adm.${payloadB64}.${signature}`;
}

/**
 * Verifies any session token:
 * 1. HMAC-signed stateless token (otz_adm.*)
 * 2. Supabase Auth access token / JWT
 * 3. In-memory session record fallback
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  // 1. Signed admin session token (otz_adm.<payload>.<signature>)
  if (token.startsWith("otz_adm.")) {
    const parts = token.split(".");
    if (parts.length === 3) {
      const [, payloadB64, sig] = parts;
      try {
        const expectedSig = crypto
          .createHmac("sha256", AUTH_SECRET)
          .update(payloadB64)
          .digest("base64url");

        if (
          sig.length === expectedSig.length &&
          crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
        ) {
          const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
          if (Date.now() < payload.exp) {
            return {
              id: payload.id || "usr-admin-1",
              account_id: "acc-admin-1",
              email: payload.email,
              role: payload.role || "admin",
              name: payload.name || "OTZ Administrator",
              company: "OTZ Operations",
              state: "verified"
            };
          }
        }
      } catch (err) {
        console.error("Token verification parse error:", err);
      }
    }
  }

  // 2. Supabase Auth token verification if configured
  if (isServerSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServer();
      const {
        data: { user: sbUser },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && sbUser) {
        const adminEmail = (process.env.ADMIN_EMAIL || "adminotz@gmail.com").toLowerCase().trim();
        const isAdmin =
          sbUser.email?.toLowerCase() === adminEmail ||
          sbUser.user_metadata?.role === "admin" ||
          sbUser.app_metadata?.role === "admin";

        return {
          id: sbUser.id,
          account_id: "acc-admin-1",
          email: sbUser.email,
          name: sbUser.user_metadata?.name || (isAdmin ? "OTZ Administrator" : sbUser.email),
          role: isAdmin ? "admin" : sbUser.user_metadata?.role || "user",
          company: "OTZ Operations",
          state: "verified"
        };
      }
    } catch (sbErr) {
      // Supabase token verify notice
    }
  }

  // 3. Fallback in-memory database lookup
  try {
    const session = db.find("sessions", "token", token);
    if (session && !session.revoked_at && new Date() <= new Date(session.expires_at)) {
      const user = db.find("users", "id", session.user_id);
      if (user) {
        const account = db.find("accounts", "id", user.account_id);
        return { ...user, account };
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Server-side helper to extract and verify session user from request cookies or Authorization header.
 */
export async function getSessionUser(request) {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (request && typeof request.headers?.get === "function") {
      const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]?.trim();
      }
    }

    // 2. Check Next.js cookies() store
    if (!token) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("otz_session") || cookieStore.get("otz_token");
        if (sessionCookie?.value) {
          token = sessionCookie.value;
        }
      } catch (_) {}
    }

    // 3. Check raw cookie header if available
    if (!token && request && typeof request.headers?.get === "function") {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:otz_session|otz_token)=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) return null;

    return await verifySessionToken(token);
  } catch (err) {
    console.error("getSessionUser error:", err);
    return null;
  }
}
