import { NextResponse } from "next/server";
import { getOrCreateSessionId, setSessionCookie } from "@/lib/session";
import { upsertSession, getCompletedTitles, createQuestSetWithQuests } from "@/lib/db";
import { generateQuests } from "@/lib/generateQuests";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const location = String(body.location ?? "").trim();
  const interests: string[] = Array.isArray(body.interests)
    ? body.interests.map((i: unknown) => String(i).trim()).filter(Boolean)
    : String(body.interests ?? "")
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
  const lang: "en" | "ru" = body.lang === "ru" ? "ru" : "en";

  if (!location || interests.length === 0) {
    return NextResponse.json({ error: "location and interests are required" }, { status: 400 });
  }

  const { sessionId, isNew } = await getOrCreateSessionId();
  await upsertSession(sessionId, location, interests);
  const past = await getCompletedTitles(sessionId);
  const { quests, source } = await generateQuests(location, interests, past, lang);
  const active = await createQuestSetWithQuests(sessionId, source, quests);

  const res = NextResponse.json(active);
  if (isNew) setSessionCookie(res, sessionId);
  return res;
}
