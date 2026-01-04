import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["tank", "air", "missile"]);

type RouteContext = {
  params: {
    squad: string;
  };
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const squad = context.params.squad?.toLowerCase();

  if (!squad || !ALLOWED.has(squad)) {
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
      squad,
      "baseUR.json"
    );

    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);

    return NextResponse.json({
      ok: true,
      squad,
      data: json,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        squad,
        error: "Failed to load squad data",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
