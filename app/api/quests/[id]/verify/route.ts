import { NextResponse } from "next/server";
import { readSessionId } from "@/lib/session";
import { completeQuest, getActiveQuestSet, getQuestById, questBelongsToSession, setQuestVerification } from "@/lib/db";
import { verifyQuestPhoto } from "@/lib/verifyQuest";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = await readSessionId();
  if (!sessionId) return NextResponse.json({ error: "no session" }, { status: 401 });

  const owns = await questBelongsToSession(id, sessionId);
  if (!owns) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const imageDataUrl = String(body.imageDataUrl ?? "");
  const lang: "en" | "ru" = body.lang === "ru" ? "ru" : "en";

  if (!imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "invalid image" }, { status: 400 });
  }

  await completeQuest(id);
  const quest = await getQuestById(id);
  if (!quest) return NextResponse.json({ error: "quest missing" }, { status: 404 });

  try {
    const verdict = await verifyQuestPhoto({
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty,
      imageDataUrl,
      lang,
    });

    await setQuestVerification(id, {
      proof_photo_url: imageDataUrl,
      verification_status: verdict.status,
      reward_points: verdict.points,
      verification_note: verdict.note,
    });

    const active = await getActiveQuestSet(sessionId);
    return NextResponse.json({ active, verdict });
  } catch (error) {
    const message = (error as Error).message || "verification failed";

    await setQuestVerification(id, {
      proof_photo_url: imageDataUrl,
      verification_status: "rejected",
      reward_points: 0,
      verification_note: `Verification error: ${message}`,
    });

    const active = await getActiveQuestSet(sessionId);
    return NextResponse.json({ active, error: message }, { status: 200 });
  }
}
