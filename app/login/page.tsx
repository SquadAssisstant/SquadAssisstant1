"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();

  const mode = useMemo(() => (params.get("mode") === "signup" ? "signup" : "login"), [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  async function signUpEmail() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? error.message : "Signup OK. Now sign in (or check email if confirmation is enabled).");

    setLoading(false);
  }

  async function signInEmail() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0 }}>{mode === "signup" ? "Sign up" : "Log in"}</h1>
        <Link href="/" style={{ fontSize: 13 }}>
          Back
        </Link>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <button onClick={signInWithGoogle} disabled={loading} style={{ padding: 12 }}>
          Continue with Google
        </button>

        <div style={{ opacity: 0.7, fontSize: 13, textAlign: "center" }}>or</div>

        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12 }}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12 }}
        />

        {mode === "signup" ? (
          <button onClick={signUpEmail} disabled={loading} style={{ padding: 12 }}>
            Sign up (email + password)
          </button>
        ) : (
          <button onClick={signInEmail} disabled={loading} style={{ padding: 12 }}>
            Log in (email + password)
          </button>
        )}

        <div style={{ fontSize: 13, opacity: 0.8 }}>
          {mode === "signup" ? (
            <>
              Already have an account? <Link href="/login?mode=login">Log in</Link>
            </>
          ) : (
            <>
              Need an account? <Link href="/login?mode=signup">Sign up</Link>
            </>
          )}
        </div>

        {msg && <div style={{ marginTop: 6, fontSize: 13 }}>{msg}</div>}
      </div>
    </div>
  );
}
