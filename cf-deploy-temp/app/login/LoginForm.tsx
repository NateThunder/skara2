"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client";
import { missingSupabaseEnvMessage } from "@/app/lib/supabase/env";

type LoginFormProps = {
  redirectTo: string;
  initialError: string | null;
};

export function LoginForm({ redirectTo, initialError }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      setErrorMessage(missingSupabaseEnvMessage);
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <section className="login-card" aria-labelledby="login-title">
      <p className="login-eyebrow">Admin access</p>
      <h1 id="login-title" className="login-title">
        Sign in to dashboard
      </h1>
      <p className="login-subtitle">
        Use your Supabase Auth email/password account to access analytics and content editing.
      </p>

      <form className="login-form" onSubmit={onSubmit}>
        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {initialError ? <p className="login-error">{initialError}</p> : null}
        {errorMessage ? <p className="login-error">{errorMessage}</p> : null}

        <button type="submit" className="login-submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="login-meta">
        Need to set up an account? Create a user in Supabase Auth, then sign in here.
      </p>
      <Link href="/" className="login-link">
        Back to website
      </Link>
    </section>
  );
}

