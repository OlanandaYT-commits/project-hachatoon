import { NextResponse } from "next/server";
import { readSessionId } from "@/lib/session";
import { getCompletedQuests, getSession } from "@/lib/db";

export async function GET() {
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ location: null, completed: [] });
  }
  const session = await getSession(sessionId);
  const completed = await getCompletedQuests(sessionId);
  return NextResponse.json({ location: session?.location ?? null, completed });
}
