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
    <div className="flex gap-1 rounded-full bg-white/60 p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
            lang === l.code ? "bg-coral text-white" : "text-gray-600"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
