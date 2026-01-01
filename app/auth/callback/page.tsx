"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // This reads the URL and finalizes the session
      const { data } = await supabase.auth.getSession();

      // Either way, go home. The home page will show logged-in state if successful.
      router.replace("/");
      router.refresh();
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Signing you in…</p>;
}
