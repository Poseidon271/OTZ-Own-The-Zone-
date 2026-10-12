import { NextResponse } from "next/server";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || searchParams.get("redirectTo") || "/dashboard";
  const type = searchParams.get("type");

  if (code && isServerSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.session && data.user) {
        // Sync profile
        try {
          const { data: existingProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!existingProf) {
            await supabase.from("profiles").insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0],
                phone: data.user.user_metadata?.phone || "",
                company: data.user.user_metadata?.company || "Personal Account",
                role: data.user.user_metadata?.role || "brand",
                avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || ""
              }
            ]);
          }
        } catch (_) {}

        const target = type === "recovery" ? "/reset-password" : next;
        const response = NextResponse.redirect(new URL(target, origin));

        // Set session cookies
        response.cookies.set("otz_session", data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          path: "/"
        });

        response.cookies.set("otz_token", data.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          path: "/"
        });

        return response;
      }
    } catch (e) {
      console.error("Auth callback exchange error:", e);
    }
  }

  // If client-side hash based flow or fallback, let client page complete it
  return NextResponse.redirect(new URL(next, origin));
}
