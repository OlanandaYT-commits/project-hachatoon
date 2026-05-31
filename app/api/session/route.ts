import { NextResponse } from "next/server";
import { getOrCreateSessionId, setSessionCookie } from "@/lib/session";
import { ensureSession, getSession, getActiveQuestSet } from "@/lib/db";

export async function GET() {
  const { sessionId, isNew } = await getOrCreateSessionId();
  await ensureSession(sessionId);
  const session = await getSession(sessionId);
  const active = await getActiveQuestSet(sessionId);
  const res = NextResponse.json({
    location: session?.location ?? null,
    interests: session?.interests ?? [],
    active,
  });
  if (isNew) setSessionCookie(res, sessionId);
  return res;
}
