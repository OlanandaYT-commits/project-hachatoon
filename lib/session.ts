import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const COOKIE = "session_id";
const MAX_AGE = 60 * 60 * 24 * 90;

export async function readSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function getOrCreateSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const existing = await readSessionId();
  if (existing) return { sessionId: existing, isNew: false };
  return { sessionId: randomUUID(), isNew: true };
}

export function setSessionCookie(res: NextResponse, sessionId: string) {
  res.cookies.set(COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}
