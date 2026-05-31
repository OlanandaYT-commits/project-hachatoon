"use client";

import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

export default function ProgressCounter({ lang, done, total }: { lang: Lang; done: number; total: number }) {
  const t = T[lang];
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-700">{t.progress(done, total)}</p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral to-skydark transition-all duration-500"
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
