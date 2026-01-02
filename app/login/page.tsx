export const dynamic = "force-dynamic";
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If you were using search params for anything, this keeps it safe:
  useEffect(() => {
    const error = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");
    if (error || errorDesc) setMsg(`${error ?? ""} ${errorDesc ?? ""}`.trim());
  }, [searchParams]);

  async function signInWithGoogle() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setMsg(error.message);
    setLoading(false);
  }

  async function continueAsGuest() {
    alert(
      "Guest mode: all actions are usable, but your data will NOT be saved. Session ends when this tab is refreshed, closed, or the browser closes."
    );
    router.push("/"); // stays on main chat page
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, opacity: 0.8 }}>
          Brain connectivity:
        </div>
        <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {"{ ok: true, where: \"/api/brain/heroes\" }"}
        </pre>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40 }}>
        <button onClick={signInWithGoogle} disabled={loading} style={{ padding: 12 }}>
          Log in
        </button>

        <button onClick={continueAsGuest} style={{ padding: 12 }}>
          Continue as Guest
        </button>

        <Link href="/" style={{ padding: 12 }}>
          Back
        </Link>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p style={{ padding: 16 }}>Loading login…</p>}>
      <LoginInner />
    </Suspense>
  );
}
