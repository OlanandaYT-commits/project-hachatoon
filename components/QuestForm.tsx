"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

export default function QuestForm({
  lang,
  initialLocation,
  initialInterests,
  loading,
  onSubmit,
}: {
  lang: Lang;
  initialLocation: string;
  initialInterests: string;
  loading: boolean;
  onSubmit: (location: string, interests: string) => void;
}) {
  const t = T[lang];
  const [location, setLocation] = useState(initialLocation);
  const [interests, setInterests] = useState(initialInterests);
  const canSubmit = location.trim() && interests.trim() && !loading;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(location.trim(), interests.trim());
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-white/85">{t.whereLabel}</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t.wherePlaceholder}
          className="h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#ff5e62] focus:ring-4 focus:ring-[#ff5e62]/20"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-white/85">{t.interestsLabel}</label>
        <input
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder={t.interestsPlaceholder}
          className="h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#ff5e62] focus:ring-4 focus:ring-[#ff5e62]/20"
        />
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="cta-shimmer h-12 w-full rounded-2xl text-sm font-black text-white shadow-[0_14px_34px_rgba(255,94,98,0.42)] transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? t.generating : t.generate}
      </button>
    </form>
  );
}
