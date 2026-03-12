import { LoginForm } from "@/app/login/LoginForm";
import { normalizeAdminRedirectTo, redirectAuthenticatedAdmin } from "@/app/lib/admin/auth";
import { missingSupabaseEnvMessage } from "@/app/lib/supabase/env";

type LoginPageProps = {
  searchParams?: Promise<{
    redirectTo?: string | string[];
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const redirectParam = Array.isArray(params.redirectTo) ? params.redirectTo[0] : params.redirectTo;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const redirectTo = normalizeAdminRedirectTo(redirectParam);
  const initialError =
    errorParam === "missing-env"
      ? missingSupabaseEnvMessage
      : errorParam === "session-expired"
        ? "Your admin session expired after 20 minutes of inactivity. Please sign in again."
        : null;

  if (errorParam !== "session-expired") {
    await redirectAuthenticatedAdmin(redirectTo);
  }

  return (
    <main className="login-page">
      <LoginForm redirectTo={redirectTo} initialError={initialError} />
    </main>
  );
}
