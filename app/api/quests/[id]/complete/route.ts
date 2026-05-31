import { NextResponse } from "next/server";
import { readSessionId } from "@/lib/session";
import { questBelongsToSession, completeQuest, getActiveQuestSet } from "@/lib/db";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "no session" }, { status: 401 });
  }
  const owns = await questBelongsToSession(id, sessionId);
  if (!owns) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await completeQuest(id);
  const active = await getActiveQuestSet(sessionId);
  return NextResponse.json(active);
}
