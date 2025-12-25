"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Supabase JS reads the URL hash/query and finalizes the session automatically.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
      } else {
        router.replace("/login");
      }
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Signing you in…</p>;
}
