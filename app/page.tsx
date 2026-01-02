"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

import { ChatWindow } from "@/components/ChatWindow";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [brainStatus, setBrainStatus] = useState<string>("(checking...)");
  const [guestMode, setGuestMode] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Read guest flag (session-only)
  useEffect(() => {
    setGuestMode(sessionStorage.getItem("guest_mode") === "1");
  }, []);

  // Check auth + brain
  useEffect(() => {
    // Auth
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // Brain ping
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));
  }, []);

  // If user is logged in, guest mode should be off
  useEffect(() => {
    if (userEmail) {
      sessionStorage.removeItem("guest_mode");
      setGuestMode(false);
    }
  }, [userEmail]);

  async function logout() {
    setLoadingAuth(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setLoadingAuth(false);
    // force UI refresh
    window.location.href = "/";
  }

  function continueAsGuest() {
    alert(
      "Guest mode: all actions are usable, but nothing will be saved. Session ends if you refresh, close the tab, or close the browser."
    );
    sessionStorage.setItem("guest_mode", "1");
    setGuestMode(true);
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      {/* Top bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>SquadAssistant</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {userEmail ? (
            <>
              <span style={{ fontSize: 14, opacity: 0.8 }}>Signed in as {userEmail}</span>
              <button onClick={logout} disabled={loadingAuth} style={{ padding: 10 }}>
                Log out
              </button>
            </>
          ) : null}
        </div>
      </header>

      <div style={{ marginTop: 12, marginBottom: 12, fontSize: 13, opacity: 0.8 }}>
        <div>Brain connectivity</div>
        <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{brainStatus}</pre>
      </div>

      {/* Guest banner */}
      {guestMode && !userEmail ? (
        <div
          style={{
            margin: "12px 0",
            padding: 12,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "rgba(255, 230, 160, 0.25)",
            fontSize: 14,
          }}
        >
          <strong>Guest mode:</strong> all actions are usable, but nothing will be saved.
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Session ends if you refresh, close the tab, or close the browser.
          </div>
        </div>
      ) : null}

      {/* Chat ALWAYS visible */}
      <div style={{ marginTop: 10 }}>
        <ChatWindow
          endpoint="/api/chat"
          emoji="🤖"
          placeholder="Ask me about Last War…"
          emptyStateComponent={
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              {userEmail
                ? "You’re signed in. Ask away."
                : guestMode
                ? "You’re in guest mode. Ask away (nothing saved)."
                : "You’re not signed in. You can still chat, or log in to save later."}
            </div>
          }
        />
      </div>

      {/* Bottom actions under chat */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
        {!userEmail ? (
          <>
            <Link href="/login" style={{ padding: 10 }}>
              Sign up / Log in
            </Link>

            <button onClick={continueAsGuest} style={{ padding: 10 }}>
              Continue as Guest
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
