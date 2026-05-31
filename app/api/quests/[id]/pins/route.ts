import { NextResponse } from "next/server";
import { getActiveQuestSet, questBelongsToSession, setQuestPins, type QuestPin } from "@/lib/db";
import { readSessionId } from "@/lib/session";

function normalizePins(raw: unknown): QuestPin[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => p as Partial<QuestPin>)
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => {
      const label = typeof p.label === "string" ? p.label.trim() : "";
      return {
        id: String(p.id ?? crypto.randomUUID()),
        lat: Number(p.lat),
        lng: Number(p.lng),
        ...(label ? { label } : {}),
      };
    })
    .slice(0, 12);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await readSessionId();
  if (!sessionId) return NextResponse.json({ error: "no session" }, { status: 401 });

  const owns = await questBelongsToSession(id, sessionId);
  if (!owns) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const pins = normalizePins(body.pins);

  const quest = await setQuestPins(id, pins);
  if (!quest) return NextResponse.json({ error: "save failed" }, { status: 500 });

  const active = await getActiveQuestSet(sessionId);
  return NextResponse.json({ active });
}
