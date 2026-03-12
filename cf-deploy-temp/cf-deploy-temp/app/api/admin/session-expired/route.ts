import { NextResponse } from "next/server";
import {
  buildAdminLoginPath,
  clearLastActivityCookie,
  normalizeAdminRedirectTo,
} from "@/app/lib/admin/auth";
import { getSupabaseServerClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = normalizeAdminRedirectTo(url.searchParams.get("redirectTo"));

  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Continue to login even if there is no active session to revoke.
  }

  const response = NextResponse.redirect(
    new URL(buildAdminLoginPath(redirectTo, "session-expired"), request.url)
  );
  clearLastActivityCookie(response, request);
  return response;
}
