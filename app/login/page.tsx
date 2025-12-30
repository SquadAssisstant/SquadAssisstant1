"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [brainStatus, setBrainStatus] = useState<string>("(not checked yet)");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refreshAuth() {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email ?? null);
    setAuthChecked(true);
  }

  useEffect(() => {
    // 1) Initial auth check
    refreshAuth();

    // 2) Keep UI synced if auth changes in another tab / after oauth callback
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setAuthChecked(true);
    });

    // 3) Brain check
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    setBusy(true);
    setMsg(null);

    try {
      // Force Supabase to remove session
      await supabase.auth.signOut();

      // Immediately update UI so it *visibly* logs out
      setUserEmail(null);

      // Belt-and-suspenders: re-check in case the SDK needed a moment
      await refreshAuth();

      setMsg("Logged out.");
    } catch (e: any) {
      setMsg(`Logout error: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>SquadAssistant</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {!authChecked ? (
            <span style={{ fontSize: 14 }}>Checking login…</span>
          ) : userEmail ? (
            <>
              <span style={{ fontSize: 14 }}>Signed in as {userEmail}</span>
              <button onClick={logout} disabled={busy}>
                {busy ? "Logging out…" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/guest">Continue as Guest</Link>
            </>
          )}
        </div>
      </header>

      {msg && (
        <p style={{ marginTop: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {msg}
        </p>
      )}

      <hr style={{ margin: "16px 0" }} />

      <h2>Brain connectivity</h2>
      <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{brainStatus}</p>

      <hr style={{ margin: "16px 0" }} />

      <p style={{ opacity: 0.9 }}>
        If you’re logged out, you’ll see “Log in” and “Continue as Guest” above.
      </p>
    </div>
  );
}
