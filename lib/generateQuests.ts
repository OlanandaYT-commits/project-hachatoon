import { randomUUID } from "crypto";
import { Agent, CursorAgentError } from "@cursor/sdk";
import type { GeneratedQuest, Cadence, Difficulty, QuestPin } from "@/lib/db";
import { FALLBACK_QUESTS } from "@/data/fallbackQuests";
import { geocodeQuery } from "@/lib/geocode";

const CADENCES: Cadence[] = ["daily", "weekly", "monthly"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function validate(raw: unknown): GeneratedQuest[] {
  if (!Array.isArray(raw) || raw.length !== 3) throw new Error("expected 3 quests");
  const quests = raw.map((q) => {
    const item = q as Record<string, unknown>;
    const cadence = String(item.cadence) as Cadence;
    const difficulty = String(item.difficulty) as Difficulty;
    if (!item.title || !item.description) throw new Error("missing fields");
    if (!CADENCES.includes(cadence)) throw new Error("bad cadence");
    if (!DIFFICULTIES.includes(difficulty)) throw new Error("bad difficulty");
    const place_name = item.place_name ? String(item.place_name).trim() : undefined;
    return {
      title: String(item.title),
      description: String(item.description),
      cadence,
      difficulty,
      ...(place_name ? { place_name } : {}),
    };
  });
  const seen = new Set(quests.map((q) => q.cadence));
  if (seen.size !== 3) throw new Error("cadences must be daily, weekly, monthly");
  return quests;
}

const PERSONA = `You are "Sunny" — the user's hyper-energetic best friend who refuses to let them waste their summer.
You are a little chaotic, a lot caring, allergic to boring. You believe summer is finite and every weekend is precious.
You hype the user up, dare them, and make quests sound like the best idea they'll have all week.
Write quest titles and descriptions in YOUR voice: punchy, warm, slightly unhinged, never corporate. Use second person ("you").`;

function extractJsonObject(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  throw new Error("no json object in response");
}

async function callCursor(
  location: string,
  interests: string[],
  past: string[],
  lang: "en" | "ru"
): Promise<GeneratedQuest[]> {
  const key = process.env.CURSOR_API_KEY;
  if (!key) throw new Error("no CURSOR_API_KEY");

  const avoid = past.length ? `Do not repeat these already completed quests: ${past.join("; ")}.` : "";
  const langLine = lang === "ru" ? "Write all titles and descriptions in Russian." : "Write all titles and descriptions in English.";

  const prompt = `The user is in "${location}" and is into: ${interests.join(", ")}.
Generate exactly 3 specific, adventurous summer quests (not generic chores). One with cadence "daily", one "weekly", one "monthly".
Each quest needs a difficulty of "easy", "medium", or "hard" (roughly matching daily/weekly/monthly effort).
Make them concrete and tied to the location and interests, and lean into "summer won't last forever" urgency. ${avoid}
${langLine}
For each quest include "place_name": a specific real place in or near "${location}" where the user should go (park, viewpoint, market, trailhead, etc.).
Return JSON with this exact shape: {"quests":[{"title":"...","description":"...","cadence":"daily","difficulty":"easy","place_name":"..."}, ...]}
The "cadence" and "difficulty" values MUST stay in English exactly as shown.`;

  const run = await Agent.prompt(`${PERSONA}\n\n${prompt}`, {
    apiKey: key,
    model: { id: "composer-2.5" },
    local: { cwd: process.cwd() },
  });

  if (run.status !== "finished") {
    throw new Error(`cursor run failed with status: ${run.status}`);
  }
  const text = String(run.result ?? "");
  if (!text) throw new Error("empty Cursor response");
  const parsed = JSON.parse(extractJsonObject(text));
  return validate(parsed.quests);
}

const OFFSETS: [number, number][] = [
  [0, 0.012],
  [0.009, -0.008],
  [-0.01, 0.006],
];

async function attachMapPoints(location: string, quests: GeneratedQuest[]): Promise<GeneratedQuest[]> {
  const base = (await geocodeQuery(location)) ?? { lat: 43.238949, lng: 76.889709 };
  const out: GeneratedQuest[] = [];

  for (let i = 0; i < quests.length; i++) {
    const q = quests[i];
    const label = q.place_name?.trim() || q.title;
    let lat = base.lat + OFFSETS[i][0];
    let lng = base.lng + OFFSETS[i][1];

    if (q.place_name) {
      const geo = await geocodeQuery(`${q.place_name}, ${location}`);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    const pin: QuestPin = { id: randomUUID(), lat, lng, label };
    out.push({ ...q, map_points: [pin] });
  }

  return out;
}

export async function generateQuests(
  location: string,
  interests: string[],
  past: string[],
  lang: "en" | "ru" = "en"
): Promise<{ quests: GeneratedQuest[]; source: "ai" | "fallback" }> {
  try {
    const raw = await callCursor(location, interests, past, lang);
    const quests = await attachMapPoints(location, raw);
    return { quests, source: "ai" };
  } catch (err) {
    if (err instanceof CursorAgentError) {
      console.warn("[generateQuests] cursor startup error, fallback:", err.message);
    } else {
      console.warn("[generateQuests] fallback:", (err as Error).message);
    }
    const quests = await attachMapPoints(location, FALLBACK_QUESTS[lang]);
    return { quests, source: "fallback" };
  }
}
