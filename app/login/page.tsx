"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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

    setLoading(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Log in</h1>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        style={{ width: "100%", padding: 12, marginBottom: 14 }}
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
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
