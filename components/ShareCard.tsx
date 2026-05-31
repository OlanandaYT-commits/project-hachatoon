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
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-coral via-coraldark to-skydark p-8 text-white shadow-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-widest opacity-90">{t.shareHeading}</p>
        {location && <p className="mt-1 text-lg font-bold">{location}</p>}
        <p className="mt-4 text-5xl font-black">{quests.length}</p>
        <p className="-mt-1 text-sm font-semibold opacity-90">{t.shareConquered}</p>
        <ul className="mt-6 space-y-2">
          {quests.slice(0, 6).map((q) => (
            <li key={q.id} className="flex items-start gap-2 text-sm font-medium">
              <span className="mt-0.5">✓</span>
              <span>{q.title}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest opacity-75">Summer Quests</p>
      </div>
      <button
        onClick={download}
        disabled={saving || quests.length === 0}
        className="w-full rounded-xl bg-gray-900 py-3 font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? t.shareRendering : t.shareDownload}
      </button>
    </div>
  );
}
