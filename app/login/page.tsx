"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Read OAuth errors from the URL without useSearchParams (avoids Next build/Suspense issues)
  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const err = qs.get("error");
      const desc = qs.get("error_description");
      if (err || desc) setMsg(`${err ?? ""} ${desc ?? ""}`.trim());
    } catch {
      // ignore
    }
  }, []);

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
    setMsg(error ? error.message : "Signup OK. Now sign in.");
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

    router.push("/");
  }

  function continueAsGuest() {
    alert(
      "Guest mode: all actions are usable, but nothing will be saved. Session ends if you refresh, close the tab, or close the browser."
    );

    sessionStorage.setItem("guest_mode", "1");
    router.push("/");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Login</h1>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        style={{ width: "100%", padding: 12, marginBottom: 12 }}
      >
        Continue with Google
      </button>

      <div style={{ display: "grid", gap: 8 }}>
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

        <button onClick={signUpEmail} disabled={loading} style={{ padding: 12 }}>
          Sign up (email + password)
        </button>

        <button onClick={signInEmail} disabled={loading} style={{ padding: 12 }}>
          Sign in (email + password)
        </button>

        <button onClick={continueAsGuest} style={{ padding: 12 }}>
          Continue as Guest
        </button>

        {msg && <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{msg}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <Link href="/">Back</Link>
          <Link href="/login">Reload</Link>
        </div>
      </div>
    </div>
  );
}
