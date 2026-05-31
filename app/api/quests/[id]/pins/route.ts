import { NextResponse } from "next/server";
import { getActiveQuestSet, getQuestById, questBelongsToSession, setQuestPins, type QuestPin } from "@/lib/db";
import { readSessionId } from "@/lib/session";

function normalizePins(raw: unknown): QuestPin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => p as Partial<QuestPin>)
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => ({
      id: String(p.id ?? crypto.randomUUID()),
      lat: Number(p.lat),
      lng: Number(p.lng),
    }))
    .slice(0, 12);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await readSessionId();
  if (sessionId) {
    const owns = await questBelongsToSession(id, sessionId);
    if (!owns) {
      const existing = await getQuestById(id);
      if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  } else {
    const existing = await getQuestById(id);
    if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const pins = normalizePins(body.pins);

  const quest = await setQuestPins(id, pins);
  if (!quest) return NextResponse.json({ error: "save failed" }, { status: 500 });

  const active = sessionId ? await getActiveQuestSet(sessionId) : null;
  return NextResponse.json({ active });
}
