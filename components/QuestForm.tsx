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
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">{t.whereLabel}</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t.wherePlaceholder}
          className="w-full rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-gray-900 outline-none focus:border-skydark"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">{t.interestsLabel}</label>
        <input
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder={t.interestsPlaceholder}
          className="w-full rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-gray-900 outline-none focus:border-skydark"
        />
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-gradient-to-r from-coral to-coraldark py-3 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? t.generating : t.generate}
      </button>
    </form>
  );
}
