import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["tank", "air", "missile"]);

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ squad: string }> }
) {
  // Next 15 treats params as async; await works even if it’s not truly a Promise at runtime
  const { squad } = await ctx.params;
  const squadKey = (squad || "").toLowerCase();

  if (!ALLOWED.has(squadKey)) {
    return NextResponse.json(
      { ok: false, error: "Invalid squad. Use tank, air, or missile." },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "app",
      "api",
      "brain",
      "truths",
      "heroes",
      squadKey,
      "baseUR.json"
    );

    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({ ok: true, squad: squadKey, data });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        squad: squadKey,
        error: "Failed to load squad data",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
