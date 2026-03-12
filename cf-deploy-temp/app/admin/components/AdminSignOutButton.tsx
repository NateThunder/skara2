"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/client";

export function AdminSignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Redirect to login even if client setup fails.
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <button type="button" className="dash-btn dash-btn--danger" onClick={onClick} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}

