"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [brainStatus, setBrainStatus] = useState<string>("(not checked yet)");

  useEffect(() => {
    // 1) Check if logged in
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // 2) Check the brain endpoint from the UI
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>SquadAssistant</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {userEmail ? (
            <>
              <span style={{ fontSize: 14 }}>Signed in as {userEmail}</span>
              <button onClick={logout}>Log out</button>
            </>
          ) : (
            <Link href="/login">Log in</Link>
          )}
        </div>
      </header>

      <hr style={{ margin: "16px 0" }} />

      <h2>Brain connectivity</h2>
      <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        {brainStatus}
      </p>

      <hr style={{ margin: "16px 0" }} />

      <p>
        This confirms the UI, auth, and brain API are connected.
      </p>
    </div>
  );
}
