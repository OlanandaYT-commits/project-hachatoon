"use client";

import type { Quest } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

const difficultyStyle: Record<string, string> = {
  easy: "text-green-300 bg-green-500/15",
  medium: "text-amber-300 bg-amber-500/15",
  hard: "text-fuchsia-300 bg-fuchsia-500/15",
};

export default function QuestCard({
  lang,
  quest,
  onComplete,
  busy,
}: {
  lang: Lang;
  quest: Quest;
  onComplete: (id: string) => void;
  busy: boolean;
}) {
  const t = T[lang];
  const done = Boolean(quest.completed_at);

  return (
    <button
      onClick={() => !done && !busy && onComplete(quest.id)}
      disabled={done || busy}
      className={`glass-card w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.98] sm:p-5 ${
        done
          ? "border-green-400/45 bg-green-500/10"
          : "border-white/10 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
            {t.cadence[quest.cadence]}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${difficultyStyle[quest.difficulty]}`}>
            {t.difficulty[quest.difficulty]}
          </span>
        </div>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-black ${
            done ? "border-green-400 bg-green-500 text-white" : "border-white/35 text-transparent"
          }`}
        >
          ?
        </span>
      </div>

      <h3 className={`mt-3 text-base font-black sm:text-lg ${done ? "text-white/60 line-through" : "text-white"}`}>
        {quest.title}
      </h3>
      <p className={`mt-1 text-sm leading-relaxed ${done ? "text-white/45" : "text-white/70"}`}>{quest.description}</p>
    </button>
  );
}
