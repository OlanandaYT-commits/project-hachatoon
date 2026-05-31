import { randomUUID } from "crypto";
import { hasDb, supabase } from "./supabase";

export type Cadence = "daily" | "weekly" | "monthly";
export type Difficulty = "easy" | "medium" | "hard";
export type VerificationStatus = "pending" | "approved" | "rejected" | null;

export type GeneratedQuest = {
  title: string;
  description: string;
  cadence: Cadence;
  difficulty: Difficulty;
};

export type Quest = GeneratedQuest & {
  id: string;
  completed_at: string | null;
  proof_photo_url: string | null;
  verification_status: VerificationStatus;
  reward_points: number;
  verification_note: string | null;
};

export type ActiveQuestSet = {
  questSetId: string;
  source: "ai" | "fallback";
  quests: Quest[];
};

const mem = {
  sessions: new Map<string, { id: string; location: string | null; interests: string[] }>(),
  questSets: new Map<string, { id: string; sessionId: string; source: string; createdAt: number }>(),
  quests: new Map<string, Quest & { quest_set_id: string }>(),
};

function questSelect() {
  return "id, title, description, cadence, difficulty, completed_at, proof_photo_url, verification_status, reward_points, verification_note";
}

function normalizeQuest(q: Partial<Quest> & { id: string; title: string; description: string; cadence: Cadence; difficulty: Difficulty }): Quest {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    cadence: q.cadence,
    difficulty: q.difficulty,
    completed_at: q.completed_at ?? null,
    proof_photo_url: q.proof_photo_url ?? null,
    verification_status: (q.verification_status ?? null) as VerificationStatus,
    reward_points: q.reward_points ?? 0,
    verification_note: q.verification_note ?? null,
  };
}

export async function upsertSession(sessionId: string, location: string, interests: string[]) {
  if (!hasDb || !supabase) {
    mem.sessions.set(sessionId, { id: sessionId, location, interests });
    return;
  }
  await supabase.from("sessions").upsert({ id: sessionId, location, interests, updated_at: new Date().toISOString() });
}

export async function ensureSession(sessionId: string) {
  if (!hasDb || !supabase) {
    if (!mem.sessions.has(sessionId)) mem.sessions.set(sessionId, { id: sessionId, location: null, interests: [] });
    return;
  }
  await supabase.from("sessions").upsert({ id: sessionId }, { onConflict: "id", ignoreDuplicates: true });
}

export async function getSession(sessionId: string) {
  if (!hasDb || !supabase) return mem.sessions.get(sessionId) ?? null;
  const { data } = await supabase.from("sessions").select("id, location, interests").eq("id", sessionId).maybeSingle();
  return data;
}

async function getSetIds(sessionId: string): Promise<string[]> {
  if (!hasDb || !supabase) return [...mem.questSets.values()].filter((s) => s.sessionId === sessionId).map((s) => s.id);
  const { data } = await supabase.from("quest_sets").select("id").eq("session_id", sessionId);
  return (data ?? []).map((r) => r.id as string);
}

export async function getActiveQuestSet(sessionId: string): Promise<ActiveQuestSet | null> {
  if (!hasDb || !supabase) {
    const sets = [...mem.questSets.values()].filter((s) => s.sessionId === sessionId).sort((a, b) => b.createdAt - a.createdAt);
    if (!sets.length) return null;
    const set = sets[0];
    const quests = [...mem.quests.values()].filter((q) => q.quest_set_id === set.id).map((q) => normalizeQuest(q));
    return { questSetId: set.id, source: set.source as ActiveQuestSet["source"], quests };
  }

  const { data: setRow } = await supabase
    .from("quest_sets")
    .select("id, source")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!setRow) return null;

  const { data: quests } = await supabase.from("quests").select(questSelect()).eq("quest_set_id", setRow.id);
  return {
    questSetId: setRow.id,
    source: setRow.source as ActiveQuestSet["source"],
    quests: (quests ?? []).map((q) => normalizeQuest(q as any)),
  };
}

export async function getCompletedTitles(sessionId: string): Promise<string[]> {
  if (!hasDb || !supabase) {
    return [...mem.quests.values()]
      .filter((q) => mem.questSets.get(q.quest_set_id)?.sessionId === sessionId && q.completed_at)
      .map((q) => q.title)
      .slice(-10);
  }
  const setIds = await getSetIds(sessionId);
  if (!setIds.length) return [];
  const { data } = await supabase
    .from("quests")
    .select("title, completed_at")
    .in("quest_set_id", setIds)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(10);
  return (data ?? []).map((r) => r.title as string);
}

export async function createQuestSetWithQuests(sessionId: string, source: "ai" | "fallback", quests: GeneratedQuest[]): Promise<ActiveQuestSet> {
  if (!hasDb || !supabase) {
    const setId = randomUUID();
    mem.questSets.set(setId, { id: setId, sessionId, source, createdAt: Date.now() });
    const stored: Quest[] = quests.map((q) => {
      const id = randomUUID();
      const row = {
        ...q,
        id,
        completed_at: null,
        proof_photo_url: null,
        verification_status: null,
        reward_points: 0,
        verification_note: null,
        quest_set_id: setId,
      };
      mem.quests.set(id, row);
      return normalizeQuest(row);
    });
    return { questSetId: setId, source, quests: stored };
  }

  const { data: setRow, error: setErr } = await supabase.from("quest_sets").insert({ session_id: sessionId, source }).select("id").single();
  if (setErr || !setRow) throw new Error("failed to create quest set");

  const rows = quests.map((q) => ({
    ...q,
    quest_set_id: setRow.id,
    proof_photo_url: null,
    verification_status: null,
    reward_points: 0,
    verification_note: null,
  }));

  const { data: inserted, error: qErr } = await supabase.from("quests").insert(rows).select(questSelect());
  if (qErr) throw new Error("failed to insert quests");

  return {
    questSetId: setRow.id,
    source,
    quests: (inserted ?? []).map((q) => normalizeQuest(q as any)),
  };
}

export async function completeQuest(questId: string): Promise<Quest | null> {
  if (!hasDb || !supabase) {
    const q = mem.quests.get(questId);
    if (!q) return null;
    if (!q.completed_at) q.completed_at = new Date().toISOString();
    return normalizeQuest(q);
  }

  const { data } = await supabase
    .from("quests")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", questId)
    .is("completed_at", null)
    .select(questSelect())
    .maybeSingle();

  if (data) return normalizeQuest(data as any);
  const { data: existing } = await supabase.from("quests").select(questSelect()).eq("id", questId).maybeSingle();
  return existing ? normalizeQuest(existing as any) : null;
}

export async function getQuestById(questId: string): Promise<Quest | null> {
  if (!hasDb || !supabase) {
    const q = mem.quests.get(questId);
    return q ? normalizeQuest(q) : null;
  }
  const { data } = await supabase.from("quests").select(questSelect()).eq("id", questId).maybeSingle();
  return data ? normalizeQuest(data as any) : null;
}

export async function setQuestVerification(
  questId: string,
  payload: {
    proof_photo_url: string;
    verification_status: Exclude<VerificationStatus, null>;
    reward_points: number;
    verification_note: string;
  }
): Promise<Quest | null> {
  if (!hasDb || !supabase) {
    const q = mem.quests.get(questId);
    if (!q) return null;
    q.proof_photo_url = payload.proof_photo_url;
    q.verification_status = payload.verification_status;
    q.reward_points = payload.reward_points;
    q.verification_note = payload.verification_note;
    return normalizeQuest(q);
  }

  const { data, error } = await supabase
    .from("quests")
    .update(payload)
    .eq("id", questId)
    .select(questSelect())
    .maybeSingle();

  if (error || !data) return null;
  return normalizeQuest(data as any);
}

export async function getCompletedQuests(sessionId: string): Promise<Quest[]> {
  if (!hasDb || !supabase) {
    return [...mem.quests.values()]
      .filter((q) => mem.questSets.get(q.quest_set_id)?.sessionId === sessionId && q.completed_at)
      .sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1))
      .map((q) => normalizeQuest(q));
  }

  const setIds = await getSetIds(sessionId);
  if (!setIds.length) return [];

  const { data } = await supabase
    .from("quests")
    .select(questSelect())
    .in("quest_set_id", setIds)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  return (data ?? []).map((q) => normalizeQuest(q as any));
}

export async function questBelongsToSession(questId: string, sessionId: string): Promise<boolean> {
  if (!hasDb || !supabase) {
    const q = mem.quests.get(questId);
    if (!q) return false;
    return mem.questSets.get(q.quest_set_id)?.sessionId === sessionId;
  }

  const { data } = await supabase.from("quests").select("quest_set_id, quest_sets!inner(session_id)").eq("id", questId).maybeSingle();
  if (!data) return false;
  const rel = (data as { quest_sets?: { session_id?: string } }).quest_sets;
  return rel?.session_id === sessionId;
}
