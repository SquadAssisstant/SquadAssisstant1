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

  // Simple guest flag (client-only)
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Restore guest mode after refresh (optional)
    try {
      const g = sessionStorage.getItem("SA_GUEST");
      setIsGuest(g === "1");
    } catch {}

    // 1) Read current auth user
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // Keep UI in sync if auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        // If you log in, turn off guest mode
        try {
          sessionStorage.removeItem("SA_GUEST");
        } catch {}
        setIsGuest(false);
      }
      router.refresh();
    });

    // 2) Check brain endpoint
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function loginWithGoogle() {
    try {
      setLoadingAuth(true);

      // IMPORTANT: This starts OAuth immediately from the main page.
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
    try {
      sessionStorage.setItem("SA_GUEST", "1");
    } catch {}
    setIsGuest(true);
  }

  async function logout() {
    await supabase.auth.signOut();

    // Make it obvious to the user that they're logged out
    try {
      sessionStorage.removeItem("SA_GUEST");
    } catch {}
    setIsGuest(false);

    // Force UI refresh + return home
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

      {/* Chat */}
      <div style={{ marginTop: 18 }}>
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

      {/* Buttons BELOW the chat bubble, only when logged out */}
      {!isLoggedIn && (
        <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "center" }}>
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
  );
}
