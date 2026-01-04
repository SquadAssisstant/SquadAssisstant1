import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const squad = (url.searchParams.get("squad") || "").toLowerCase();

  if (!squad) {
    return NextResponse.json({
      ok: true,
      help: "Add ?squad=tank|air|missile or use /api/brain/heroes/tank (or /air /missile).",
      examples: [
        "/api/brain/heroes?squad=tank",
        "/api/brain/heroes/tank",
        "/api/brain/heroes/air",
        "/api/brain/heroes/missile",
      ],
    });
  }

  // Forward internally to the [squad] route behavior:
  // (We simply tell the client the right endpoint to use.)
  return NextResponse.redirect(`${url.origin}/api/brain/heroes/${squad}`, 307);
}
