"use client";

import { useEffect, useState } from "react";
import type { ActiveQuestSet, Quest } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";
import QuestForm from "@/components/QuestForm";
import QuestCard from "@/components/QuestCard";
import ProgressCounter from "@/components/ProgressCounter";
import ShareCard from "@/components/ShareCard";
import SummerCountdown from "@/components/SummerCountdown";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [active, setActive] = useState<ActiveQuestSet | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [shareQuests, setShareQuests] = useState<Quest[] | null>(null);

  const t = T[lang];

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored === "en" || stored === "ru") setLang(stored);

    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.location) setLocation(d.location);
        if (Array.isArray(d.interests)) setInterests(d.interests.join(", "));
        if (d.active) setActive(d.active);
        else setShowForm(true);
      })
      .catch(() => setShowForm(true))
      .finally(() => setLoading(false));
  }, []);

  function changeLang(l: Lang) {
    setLang(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  }

  async function handleGenerate(loc: string, ints: string) {
    setGenerating(true);
    setError("");
    setShareQuests(null);
    try {
      const res = await fetch("/api/quests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: loc, interests: ints, lang }),
      });
      if (!res.ok) throw new Error("generation failed");
      const data: ActiveQuestSet = await res.json();
      setLocation(loc);
      setInterests(ints);
      setActive(data);
      setShowForm(false);
    } catch {
      setError(t.genError);
    } finally {
      setGenerating(false);
    }
  }

  async function handleComplete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/quests/${id}/complete`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const data: ActiveQuestSet = await res.json();
      setActive(data);
    } catch {
      setError(t.saveError);
    } finally {
      setBusyId(null);
    }
  }

  async function openShare() {
    const res = await fetch("/api/quests/summary");
    const data = await res.json();
    setShareQuests(data.completed ?? []);
  }

  const done = active ? active.quests.filter((q) => q.completed_at).length : 0;
  const total = active ? active.quests.length : 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Summer Quests ☀️</h1>
          <p className="mt-0.5 text-sm text-gray-600">{t.tagline}</p>
        </div>
        <LanguageSwitcher lang={lang} onChange={changeLang} />
      </header>

      <SummerCountdown lang={lang} />

      {loading && <p className="text-center text-gray-500">{t.loading}</p>}

      {!loading && (showForm || !active) && (
        <section className="rounded-3xl bg-white/40 p-5 backdrop-blur">
          <QuestForm
            lang={lang}
            initialLocation={location}
            initialInterests={interests}
            loading={generating}
            onSubmit={handleGenerate}
          />
          {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
        </section>
      )}

      {!loading && active && !showForm && (
        <section className="space-y-4">
          {active.source === "fallback" && (
            <div className="rounded-xl bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-800">
              {t.fallbackBanner}
            </div>
          )}

          <ProgressCounter lang={lang} done={done} total={total} />

          <div className="space-y-3">
            {active.quests.map((q) => (
              <QuestCard key={q.id} lang={lang} quest={q} onComplete={handleComplete} busy={busyId === q.id} />
            ))}
          </div>

          {error && <p className="text-center text-sm text-rose-600">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 rounded-xl border border-gray-300 bg-white/70 py-3 font-semibold text-gray-700 active:scale-[0.98]"
            >
              {t.newQuests}
            </button>
            <button
              onClick={openShare}
              disabled={done === 0}
              className="flex-1 rounded-xl bg-skydark py-3 font-bold text-white active:scale-[0.98] disabled:opacity-50"
            >
              {t.shareStreak}
            </button>
          </div>

          {shareQuests && <ShareCard lang={lang} location={location} quests={shareQuests} />}
        </section>
      )}
    </main>
  );
}
