"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChatWindow } from "@/components/ChatWindow";

const GUEST_KEY = "SA_GUEST";

export default function HomePage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [brainStatus, setBrainStatus] = useState<string>("(not checked yet)");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Guest flag
    try {
      setIsGuest(sessionStorage.getItem(GUEST_KEY) === "1");
    } catch {}

    // Auth status
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);

      // If a real session appears, clear guest mode
      if (session?.user) {
        try {
          sessionStorage.removeItem(GUEST_KEY);
        } catch {}
        setIsGuest(false);
      }

      router.refresh();
    });

    // Brain endpoint check
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));

    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    try {
      sessionStorage.removeItem(GUEST_KEY);
    } catch {}
    setIsGuest(false);
    router.replace("/");
    router.refresh();
  }

  function continueAsGuest() {
    try {
      sessionStorage.setItem(GUEST_KEY, "1");
    } catch {}
    setIsGuest(true);

    alert(
      "Guest mode enabled.\n\nAll actions are usable but user input will NOT be saved.\nSession ends when the tab is refreshed/closed, or when the browser closes."
    );
  }

  const isLoggedIn = !!userEmail;

  return (
    <div style={{ maxWidth: 980, margin: "32px auto", padding: 16 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>SquadAssistant</div>

        {isLoggedIn ? (
          <button onClick={logout} style={{ padding: "8px 12px" }}>
            Log out
          </button>
        ) : (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {isGuest ? "Guest mode" : "Not signed in"}
          </div>
        )}
      </div>

      {/* Guest notice banner */}
      {isGuest && !isLoggedIn && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.35,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Guest mode</div>
          <div>
            All actions are usable, but <b>user input will not be saved</b>.
            <br />
            Session ends when the tab is refreshed/closed or the browser closes.
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.1)" }} />

      {/* Brain status */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Brain connectivity</div>
        <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0 }}>{brainStatus}</pre>
      </div>

      <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.1)" }} />

      {/* Chat */}
      <div style={{ position: "relative", marginTop: 18 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <ChatWindow
            endpoint="api/chat"
            emoji="🤖"
            placeholder="Ask me about Last War..."
            emptyStateComponent={
              <div style={{ opacity: 0.75 }}>
                {isLoggedIn
                  ? `Signed in as ${userEmail}`
                  : isGuest
                  ? "Guest mode (not saved)"
                  : "Sign up, log in, or continue as guest below."}
              </div>
            }
          />
        </div>

        {/* Bottom actions */}
        {!isLoggedIn && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              justifyContent: "center",
              position: "relative",
              zIndex: 9999,
              pointerEvents: "auto",
              flexWrap: "wrap",
            }}
          >
            <Link href="/login?mode=signup">
              <button style={{ padding: "10px 14px", minWidth: 160 }}>Sign up</button>
            </Link>

            <Link href="/login?mode=login">
              <button style={{ padding: "10px 14px", minWidth: 160 }}>Log in</button>
            </Link>

            <button onClick={continueAsGuest} style={{ padding: "10px 14px", minWidth: 160 }}>
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
