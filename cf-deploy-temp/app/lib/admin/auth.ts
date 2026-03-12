import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/app/lib/supabase/server";

export const ADMIN_IDLE_COOKIE = "admin_last_activity";
export const ADMIN_IDLE_TIMEOUT_MS = 20 * 60 * 1000;

type CookieReader = {
  get: (name: string) => { value?: string } | undefined;
};

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

export function normalizeAdminRedirectTo(redirectTo: string | null | undefined): string {
  if (!redirectTo || !redirectTo.startsWith("/")) {
    return "/admin";
  }

  return redirectTo;
}

export function buildAdminLoginPath(
  redirectTo: string | null | undefined,
  reason?: "session-expired"
): string {
  const params = new URLSearchParams({
    redirectTo: normalizeAdminRedirectTo(redirectTo),
  });

  if (reason === "session-expired") {
    params.set("error", "session-expired");
  }

  return `/login?${params.toString()}`;
}

export function buildSessionExpiredPath(redirectTo: string | null | undefined): string {
  const params = new URLSearchParams({
    redirectTo: normalizeAdminRedirectTo(redirectTo),
  });

  return `/api/admin/session-expired?${params.toString()}`;
}

export function readLastActivityMs(cookieStore: CookieReader): number | null {
  const rawValue = cookieStore.get(ADMIN_IDLE_COOKIE)?.value;
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isIdleExpired(lastActivityMs: number | null, nowMs: number): boolean {
  if (lastActivityMs === null) {
    return false;
  }

  return nowMs - lastActivityMs > ADMIN_IDLE_TIMEOUT_MS;
}

function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export function setLastActivityCookie(response: NextResponse, nowMs: number, request: Request): void {
  response.cookies.set({
    name: ADMIN_IDLE_COOKIE,
    value: String(nowMs),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: Math.floor(ADMIN_IDLE_TIMEOUT_MS / 1000),
  });
}

export function clearLastActivityCookie(response: NextResponse, request: Request): void {
  response.cookies.set({
    name: ADMIN_IDLE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdminPageSession(redirectTo: string): Promise<User> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildAdminLoginPath(redirectTo));
  }

  const cookieStore = await cookies();
  const lastActivityMs = readLastActivityMs(cookieStore);
  if (isIdleExpired(lastActivityMs, Date.now())) {
    redirect(buildSessionExpiredPath(redirectTo));
  }

  return user;
}

export async function redirectAuthenticatedAdmin(redirectTo: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(normalizeAdminRedirectTo(redirectTo));
  }
}

export async function withAdminApiAuth(
  request: Request,
  handler: (user: User) => Promise<NextResponse>
): Promise<NextResponse> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const nowMs = Date.now();
  const lastActivityMs = readLastActivityMs(cookieStore);

  if (isIdleExpired(lastActivityMs, nowMs)) {
    await supabase.auth.signOut();

    const expiredResponse = NextResponse.json(
      { error: "Session expired due to inactivity" },
      { status: 401 }
    );
    clearLastActivityCookie(expiredResponse, request);
    return expiredResponse;
  }

  const response = await handler(user);
  setLastActivityCookie(response, nowMs, request);
  return response;
}
