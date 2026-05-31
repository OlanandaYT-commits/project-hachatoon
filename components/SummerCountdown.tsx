"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";
import { isSummerOver, weekendsLeft, timeLeft } from "@/lib/summer";

export default function SummerCountdown({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [now, setNow] = useState<Date | null>(null);
  const secRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!secRef.current) return;
    secRef.current.classList.remove("tick");
    secRef.current.offsetWidth;
    secRef.current.classList.add("tick");
  }, [now]);

  if (!now) {
    return <div className="glass-card h-52 animate-pulse rounded-3xl" />;
  }

  if (isSummerOver(now)) {
    return (
      <div className="glass-card rounded-3xl px-6 py-10 text-center">
        <p className="text-base font-bold text-white sm:text-lg">{t.summerOver}</p>
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
    <section className="glass-card overflow-hidden rounded-3xl px-4 py-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:px-6 sm:py-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55 sm:text-xs">{t.countdownTitle}</p>
      <p className="hero-glow grad-text mt-3 text-6xl font-black leading-none tracking-[-0.06em] sm:text-7xl md:text-8xl">
        {t.weekendsLeft(weekends)}
      </p>
      <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white sm:text-sm">{t.weekendsLeftSub}</p>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-5 sm:gap-3">
        {units.map((u, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 py-2 sm:py-2.5">
            <div className="text-lg font-black tabular-nums text-white sm:text-2xl">
              {i === 3 ? <span ref={secRef}>{String(u.v).padStart(2, "0")}</span> : String(u.v).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{u.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
