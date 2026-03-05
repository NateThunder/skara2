import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabaseEnv,
  missingSupabaseEnvMessage,
} from "@/app/lib/supabase/env";

const ADMIN_IDLE_COOKIE = "admin_last_activity";
const ADMIN_IDLE_TIMEOUT_MS = 20 * 60 * 1000;

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

function buildLoginRedirect(request: NextRequest, reason?: "session-expired") {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const redirectTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.searchParams.set("redirectTo", redirectTo);

  if (reason === "session-expired") {
    url.searchParams.set("error", "session-expired");
  }

  return NextResponse.redirect(url);
}

function readLastActivityMs(request: NextRequest): number | null {
  const rawValue = request.cookies.get(ADMIN_IDLE_COOKIE)?.value;
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isIdleExpired(lastActivityMs: number | null, nowMs: number): boolean {
  if (lastActivityMs === null) {
    return false;
  }

  return nowMs - lastActivityMs > ADMIN_IDLE_TIMEOUT_MS;
}

function setLastActivityCookie(response: NextResponse, nowMs: number, request: NextRequest) {
  response.cookies.set({
    name: ADMIN_IDLE_COOKIE,
    value: String(nowMs),
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: Math.floor(ADMIN_IDLE_TIMEOUT_MS / 1000),
  });
}

function clearLastActivityCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set({
    name: ADMIN_IDLE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 0,
  });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adminPath = isAdminPath(pathname);
  const adminApiPath = isAdminApiPath(pathname);
  const authPath = pathname === "/login";

  if (!adminPath && !adminApiPath && !authPath) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  let supabaseEnv: ReturnType<typeof getSupabaseEnv> | null = null;
  try {
    supabaseEnv = getSupabaseEnv();
  } catch {
    if (adminApiPath) {
      return NextResponse.json({ error: missingSupabaseEnvMessage }, { status: 500 });
    }

    if (adminPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "missing-env");
      return NextResponse.redirect(url);
    }

    if (authPath) {
      return response;
    }

    return response;
  }

  const supabase = createServerClient(supabaseEnv.supabaseUrl, supabaseEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({
          request,
        });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (adminApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (adminPath) {
      return buildLoginRedirect(request);
    }
  } else {
    const nowMs = Date.now();

    if (adminPath || adminApiPath) {
      const lastActivityMs = readLastActivityMs(request);

      if (isIdleExpired(lastActivityMs, nowMs)) {
        await supabase.auth.signOut();

        if (adminApiPath) {
          const expiredResponse = NextResponse.json({ error: "Session expired due to inactivity" }, { status: 401 });
          clearLastActivityCookie(expiredResponse, request);
          return expiredResponse;
        }

        const redirect = buildLoginRedirect(request, "session-expired");
        clearLastActivityCookie(redirect, request);
        return redirect;
      }

      setLastActivityCookie(response, nowMs, request);
    }

    if (authPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
