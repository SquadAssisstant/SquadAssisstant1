"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GuestPage() {
  const [brainStatus, setBrainStatus] = useState<string>("(checking…)");

  useEffect(() => {
    fetch("/api/brain/heroes")
      .then((r) => r.json())
      .then((j) => setBrainStatus(JSON.stringify(j)))
      .catch((e) => setBrainStatus(`error: ${String(e)}`));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>SquadAssistant</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 14 }}>Guest mode</span>
          <Link href="/login">Log in</Link>
        </div>
      </header>

      <hr style={{ margin: "16px 0" }} />

      <h2>Brain connectivity</h2>
      <p
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {brainStatus}
      </p>

      <hr style={{ margin: "16px 0" }} />

      <p>
        You are using SquadAssistant as a guest.
        <br />
        No account. No data saved.
      </p>

      <p style={{ marginTop: 12 }}>
        <strong>Create an account</strong> if you want saved history,
        personalized squads, and future features.
      </p>
    </div>
  );
}
