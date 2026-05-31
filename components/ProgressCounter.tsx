"use client";

import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

export default function ProgressCounter({
  lang,
  done,
  total,
  points,
}: {
  lang: Lang;
  done: number;
  total: number;
  points: number;
}) {
  const t = T[lang];

  return (
    <div className="glass-card rounded-2xl p-4 text-center sm:p-5">
      <p className="text-sm font-bold text-white/85">{t.progress(done, total)}</p>
      <p className="mt-1 text-xs font-semibold text-emerald-300">{t.rewardPoints(points)}</p>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff7a18] via-[#ff5e62] to-[#ff3cac] transition-all duration-500"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
