"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Quest } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

export default function ShareCard({ lang, location, quests }: { lang: Lang; location: string | null; quests: Quest[] }) {
  const t = T[lang];
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  async function download() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = "summer-quests.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        ref={cardRef}
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff7a18] via-[#ff5e62] to-[#ff3cac] p-6 text-white shadow-[0_24px_60px_rgba(255,60,172,0.25)] sm:p-7"
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] opacity-90">{t.shareHeading}</p>
        {location && <p className="mt-1 text-base font-bold sm:text-lg">{location}</p>}
        <p className="mt-4 text-5xl font-black leading-none sm:text-6xl">{quests.length}</p>
        <p className="mt-1 text-sm font-bold opacity-90">{t.shareConquered}</p>

        <ul className="mt-5 space-y-1.5 sm:mt-6">
          {quests.slice(0, 6).map((q) => (
            <li key={q.id} className="flex items-start gap-2 text-sm font-semibold sm:text-[15px]">
              <span>?</span>
              <span>{q.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={download}
        disabled={saving || quests.length === 0}
        className="glass-card w-full rounded-2xl py-3 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? t.shareRendering : t.shareDownload}
      </button>
    </div>
  );
}
