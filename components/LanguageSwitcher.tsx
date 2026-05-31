"use client";

import { LANGS, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="glass-card flex gap-1 rounded-full p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition sm:px-3 sm:text-xs ${
            lang === l.code ? "bg-white text-black" : "text-white/70 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
