"use client";

import type { Quest } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

const difficultyStyle: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-rose-100 text-rose-700",
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
      className={`w-full text-left rounded-2xl border p-5 transition-all active:scale-[0.98] ${
        done
          ? "border-green-300 bg-green-50/80"
          : "border-white/70 bg-white/80 hover:bg-white hover:shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sky/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-skydark">
            {t.cadence[quest.cadence]}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${difficultyStyle[quest.difficulty]}`}>
            {t.difficulty[quest.difficulty]}
          </span>
        </div>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold ${
            done ? "border-green-500 bg-green-500 text-white" : "border-gray-300 text-transparent"
          }`}
        >
          ✓
        </span>
      </div>
      <h3 className={`mt-3 text-lg font-bold ${done ? "text-gray-500 line-through" : "text-gray-900"}`}>
        {quest.title}
      </h3>
      <p className={`mt-1 text-sm ${done ? "text-gray-400" : "text-gray-600"}`}>{quest.description}</p>
    </button>
  );
}
