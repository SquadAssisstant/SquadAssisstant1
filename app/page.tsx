"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [brainStatus, setBrainStatus] = useState<string>("(checking...)");

  useEffect(() => {
    // 1) Check if logged in
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // 2) Check brain endpoint from the main page
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  // If NOT logged in, show a simple landing with a login button.
  if (!userEmail) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>SquadAssistant</h1>
          <Link href="/login">Log in</Link>
        </header>

        <hr style={{ margin: "16px 0" }} />

        <h2>Welcome</h2>
        <p>
          You’re not signed in yet. Please <Link href="/login">log in</Link> to use the assistant.
        </p>

        <hr style={{ margin: "16px 0" }} />

        <h3>Brain connectivity</h3>
        <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{brainStatus}</p>
      </div>
    );
  }

  // If logged in, show the app (chat) + status + logout
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          ✅ <span className="ml-2">Signed in as {userEmail}</span>
        </li>
        <li className="text-l">
          🧠 <span className="ml-2">Brain status: {brainStatus}</span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>SquadAssistant</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>Signed in as {userEmail}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      <hr style={{ margin: "16px 0" }} />

      <ChatWindow
        endpoint="api/chat"
        emoji="🧠"
        placeholder="Ask me about Last War..."
        emptyStateComponent={InfoCard}
      />
    </div>
  );
}
