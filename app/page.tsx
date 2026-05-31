"use client";

import { useEffect, useState } from "react";
import type { ActiveQuestSet, Quest, QuestPin } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";
import QuestForm from "@/components/QuestForm";
import QuestCard from "@/components/QuestCard";
import ProgressCounter from "@/components/ProgressCounter";
import ShareCard from "@/components/ShareCard";
import SummerCountdown from "@/components/SummerCountdown";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProofUpload from "@/components/ProofUpload";
import QuestMapPoints from "@/components/QuestMapPoints";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [savingPinsId, setSavingPinsId] = useState<string | null>(null);
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

  async function handleVerify(questId: string, imageDataUrl: string) {
    setVerifyingId(questId);
    setError("");
    try {
      const res = await fetch(`/api/quests/${questId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, lang }),
      });
      if (!res.ok) throw new Error("verify failed");
      const data = await res.json();
      if (data.active) setActive(data.active as ActiveQuestSet);
      if (data.error) setError(t.verificationFailed);
    } catch {
      setError(t.verificationFailed);
    } finally {
      setVerifyingId(null);
    }
  }

  async function handlePinsSave(questId: string, pins: QuestPin[]) {
    setSavingPinsId(questId);
    try {
      const res = await fetch(`/api/quests/${questId}/pins`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pins }),
      });
      if (!res.ok) throw new Error("pins failed");
      const data = await res.json();
      if (data.active) setActive(data.active as ActiveQuestSet);
      return true;
    } catch {
      return false;
    } finally {
      setSavingPinsId(null);
    }
  }

  const done = active ? active.quests.filter((q) => q.completed_at).length : 0;
  const total = active ? active.quests.length : 0;
  const points = active ? active.quests.reduce((sum, q) => sum + (q.reward_points ?? 0), 0) : 0;

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pb-10 pt-7 sm:px-6 md:gap-6 md:px-8 md:pt-9">
        <header className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 sm:rounded-3xl sm:px-5">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Summer NOW!</h1>
            <p className="mt-0.5 max-w-[260px] text-xs text-white/65 sm:max-w-full sm:text-sm">{t.tagline}</p>
          </div>
          <LanguageSwitcher lang={lang} onChange={changeLang} />
        </header>

        <SummerCountdown lang={lang} />

        {loading && <p className="text-center text-sm font-semibold text-white/70">{t.loading}</p>}

        {!loading && (showForm || !active) && (
          <section className="glass-card rounded-2xl p-4 sm:rounded-3xl sm:p-5">
            <QuestForm
              lang={lang}
              initialLocation={location}
              initialInterests={interests}
              loading={generating}
              onSubmit={handleGenerate}
            />
            {error && <p className="mt-3 text-center text-sm text-rose-300">{error}</p>}
          </section>
        )}

        {!loading && active && !showForm && (
          <section className="space-y-4 sm:space-y-5">
            {active.source === "fallback" && (
              <div className="rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2 text-center text-xs font-bold text-amber-200">
                {t.fallbackBanner}
              </div>
            )}

            <ProgressCounter lang={lang} done={done} total={total} points={points} />

            <div className="space-y-3 sm:space-y-4">
              {active.quests.map((q) => (
                <div key={q.id}>
                  <QuestCard lang={lang} quest={q} onComplete={handleComplete} busy={busyId === q.id} />
                  <QuestMapPoints
                    quest={q}
                    lang={lang}
                    location={location}
                    saving={savingPinsId === q.id}
                    onSave={handlePinsSave}
                  />
                  <ProofUpload
                    quest={q}
                    lang={lang}
                    busy={verifyingId === q.id}
                    onVerify={handleVerify}
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-center text-sm text-rose-300">{error}</p>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => setShowForm(true)}
                className="glass-card rounded-2xl py-3 text-sm font-bold text-white/90 transition active:scale-[0.98]"
              >
                {t.newQuests}
              </button>
              <button
                onClick={openShare}
                disabled={done === 0}
                className="cta-shimmer rounded-2xl py-3 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {t.shareStreak}
              </button>
            </div>

            {shareQuests && <ShareCard lang={lang} location={location} quests={shareQuests} />}
          </section>
        )}
      </div>
    </main>
  );
}
