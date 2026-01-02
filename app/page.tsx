"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  const [brainStatus, setBrainStatus] = useState<string>("(checking...)");

  useEffect(() => {
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>SquadAssistant</h1>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Auth disabled (dev mode)</div>
      </header>

      <div style={{ marginTop: 12, marginBottom: 12, fontSize: 13, opacity: 0.8 }}>
        <div>Brain connectivity</div>
        <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{brainStatus}</pre>
      </div>

      <div style={{ marginTop: 10 }}>
        <ChatWindow
          endpoint="/api/chat"
          emoji="🤖"
          placeholder="Ask me anything about Last War…"
          emptyStateComponent={
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Chat is live. This page is intentionally running with auth turned off so we can build the brain/truths first.
            </div>
          }
        />
      </div>

      <div style={{ marginTop: 14, fontSize: 13, opacity: 0.75, textAlign: "center" }}>
        Tip: If “Brain connectivity” shows <code>{"{ ok: true }"}</code>, your backend route is alive.
      </div>
    </div>
  );
}
