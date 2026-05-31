import { NextResponse } from "next/server";
import { geocodeQuery } from "@/lib/geocode";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });

  const result = await geocodeQuery(q);
  if (!result) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(result);
}
