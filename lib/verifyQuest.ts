import type { Difficulty } from "@/lib/db";

type VerifyInput = {
  title: string;
  description: string;
  difficulty: Difficulty;
  imageDataUrl: string;
  lang: "en" | "ru";
};

type VerifyOutput = {
  status: "approved" | "rejected";
  points: number;
  note: string;
};

type CursorCreateResponse = {
  agent?: { id?: string };
  run?: { id?: string };
};

type CursorRunResponse = {
  status?: string;
  text?: string;
  result?: string;
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("invalid image data");
  return { mimeType: match[1], base64Data: match[2] };
}

function extractJsonObject(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  throw new Error("no json object found");
}

function basePointsByDifficulty(diff: Difficulty): number {
  if (diff === "easy") return 10;
  if (diff === "medium") return 20;
  return 35;
}

export async function verifyQuestPhoto(input: VerifyInput): Promise<VerifyOutput> {
  const key = process.env.CURSOR_API_KEY;
  if (!key) throw new Error("CURSOR_API_KEY is missing");

  const { mimeType, base64Data } = parseDataUrl(input.imageDataUrl);
  const langLine = input.lang === "ru" ? "Respond in Russian." : "Respond in English.";

  const prompt = `You are a strict quest verifier.
Quest title: ${input.title}
Quest description: ${input.description}
Evaluate whether the attached photo is credible proof that this quest was actually done.
${langLine}
Return only JSON with fields:
{
  "status": "approved" | "rejected",
  "confidence": 0-100,
  "note": "short reason"
}
Be strict: approve only when the photo clearly supports completion.`;

  const auth = Buffer.from(`${key}:`).toString("base64");

  const createRes = await fetch("https://api.cursor.com/v1/agents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      prompt: {
        text: prompt,
        images: [{ data: base64Data, mimeType }],
      },
      mode: "agent",
    }),
  });

  if (!createRes.ok) {
    throw new Error(`cursor create failed: ${createRes.status}`);
  }

  const created = (await createRes.json()) as CursorCreateResponse;
  const agentId = created.agent?.id;
  const runId = created.run?.id;
  if (!agentId || !runId) throw new Error("cursor ids missing");

  let finalRun: CursorRunResponse | null = null;
  for (let i = 0; i < 25; i++) {
    const runRes = await fetch(`https://api.cursor.com/v1/agents/${agentId}/runs/${runId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!runRes.ok) throw new Error(`cursor run failed: ${runRes.status}`);
    const run = (await runRes.json()) as CursorRunResponse;
    const status = String(run.status ?? "").toUpperCase();
    if (status === "FINISHED" || status === "FAILED" || status === "CANCELLED") {
      finalRun = run;
      break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (!finalRun) throw new Error("cursor run timeout");
  const outputText = String(finalRun.text ?? finalRun.result ?? "");
  if (!outputText) throw new Error("empty cursor verification output");

  const parsed = JSON.parse(extractJsonObject(outputText)) as {
    status?: "approved" | "rejected";
    confidence?: number;
    note?: string;
  };

  const status = parsed.status === "approved" ? "approved" : "rejected";
  const confidence = Math.max(0, Math.min(100, Number(parsed.confidence ?? 0)));
  const note = String(parsed.note ?? "No explanation").slice(0, 300);

  const base = basePointsByDifficulty(input.difficulty);
  const points = status === "approved" ? Math.max(5, Math.round((base * confidence) / 100)) : 0;

  return { status, points, note };
}
