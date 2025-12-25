import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key);

  const { searchParams } = new URL(req.url);
  const squad_type = searchParams.get("squad_type"); // tank/air/missile

  let query = supabase.from("heroes").select("id,slug,name,squad_type,role,rarity,release_order");

  if (squad_type) query = query.eq("squad_type", squad_type);

  const { data, error } = await query.order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
