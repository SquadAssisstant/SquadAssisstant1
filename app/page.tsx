"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChatWindow } from "@/components/ChatWindow";

export default function HomePage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [brainStatus, setBrainStatus] = useState<string>('(not checked yet)');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    try {
      setIsGuest(sessionStorage.getItem("SA_GUEST") === "1");
    } catch {}

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        try {
          sessionStorage.removeItem("SA_GUEST");
        } catch {}
        setIsGuest(false);
      }
      router.refresh();
    });

    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function loginWithGoogle() {
    // This alert is temporary for debugging.
    alert("Log in clicked");

    try {
      setLoadingAuth(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error(error);
        alert(error.message);
      }
    } finally {
      setLoadingAuth(false);
    }
  }

  function continueAsGuest() {
    alert("Continue as Guest clicked");

    try {
      sessionStorage.setItem("SA_GUEST", "1");
    } catch {}
    setIsGuest(true);
  }

  async function logout() {
    await supabase.auth.signOut();
    try {
      sessionStorage.removeItem("SA_GUEST");
    } catch {}
    setIsGuest(false);

    router.replace("/");
    router.refresh();
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
          <div style={{ fontSize: 12, opacity: 0.7 }}>Not signed in</div>
        )}
      </div>

      <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.1)" }} />

      {/* Brain status */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Brain connectivity</div>
        <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0 }}>{brainStatus}</pre>
      </div>

      <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.1)" }} />

      {/* IMPORTANT: This wrapper prevents ChatWindow overlays from blocking clicks */}
      <div style={{ position: "relative", marginTop: 18 }}>
        {/* Chat */}
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
                  ? "Guest mode (no account saved)"
                  : "Log in or continue as guest to start."}
              </div>
            }
          />
        </div>

        {/* Buttons BELOW the chat bubble, forced on top */}
        {!isLoggedIn && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 10,
              justifyContent: "center",
              position: "relative",
              zIndex: 9999, // <- key
              pointerEvents: "auto", // <- key
            }}
          >
            <button
              onClick={loginWithGoogle}
              disabled={loadingAuth}
              style={{ padding: "10px 14px", minWidth: 160 }}
            >
              {loadingAuth ? "Starting login..." : "Log in"}
            </button>

            <button onClick={continueAsGuest} style={{ padding: "10px 14px", minWidth: 160 }}>
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
