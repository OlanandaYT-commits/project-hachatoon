"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";
import { isSummerOver, weekendsLeft, timeLeft } from "@/lib/summer";

export default function SummerCountdown({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <div className="h-44 animate-pulse rounded-3xl bg-white/40" />;
  }

  if (isSummerOver(now)) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-coral to-skydark p-6 text-center text-white shadow-xl">
        <p className="text-lg font-bold">{t.summerOver}</p>
      </div>
    );
  }

  const left = timeLeft(now);
  const weekends = weekendsLeft(now);
  const units = [
    { v: left.days, l: t.days },
    { v: left.hours, l: t.hours },
    { v: left.mins, l: t.mins },
    { v: left.secs, l: t.secs },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-coral via-coraldark to-skydark p-6 text-center text-white shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-widest opacity-90">{t.countdownTitle}</p>
      <p className="mt-2 text-6xl font-black leading-none">{t.weekendsLeft(weekends)}</p>
      <p className="mt-1 text-sm font-semibold opacity-90">{t.weekendsLeftSub}</p>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {units.map((u, i) => (
          <div key={i} className="rounded-xl bg-white/15 py-2">
            <div className="text-xl font-black tabular-nums">{String(u.v).padStart(2, "0")}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
