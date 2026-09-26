import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

const supabaseUrl = rawUrl.trim().replace(/\/+$/, "") || "https://placeholder-otz.supabase.co";
const supabaseServiceKey = rawServiceKey.trim() || "placeholder-service-key";

// Privileged server-side Supabase instance (never exposed client-side)
export const getSupabaseServer = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const isServerSupabaseConfigured = () => {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  return (
    !!url &&
    url !== "https://placeholder-otz.supabase.co" &&
    !!key &&
    key !== "placeholder-service-key" &&
    key !== "placeholder-anon-key"
  );
};

