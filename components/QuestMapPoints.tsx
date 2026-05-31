"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Quest, QuestPin } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

const QuestMapInner = dynamic(() => import("@/components/QuestMapInner"), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-white/5" />,
});

const DEFAULT_CENTER: [number, number] = [43.238949, 76.889709];

export default function QuestMapPoints({
  quest,
  lang,
  saving,
  onSave,
}: {
  quest: Quest;
  lang: Lang;
  saving: boolean;
  onSave: (questId: string, pins: QuestPin[]) => Promise<boolean>;
}) {
  const t = T[lang];
  const [pins, setPins] = useState<QuestPin[]>(quest.map_points ?? []);
  const [status, setStatus] = useState("");
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);

  useEffect(() => {
    setPins(quest.map_points ?? []);
  }, [quest.map_points]);

  useEffect(() => {
    if (pins.length) {
      setCenter([pins[pins.length - 1].lat, pins[pins.length - 1].lng]);
    }
  }, [pins]);

  const pointsText = useMemo(() => `${pins.length}/12`, [pins.length]);

  async function persist(nextPins: QuestPin[]) {
    setPins(nextPins);
    const ok = await onSave(quest.id, nextPins);
    setStatus(ok ? t.pointsSaved : t.pointsSaveFailed);
  }

  async function addPoint(lat: number, lng: number) {
    if (pins.length >= 12) return;
    const next = [...pins, { id: crypto.randomUUID(), lat, lng }];
    await persist(next);
  }

  async function removePoint(id: string) {
    const next = pins.filter((p) => p.id !== id);
    await persist(next);
  }

  function addMyLocation() {
    if (!navigator.geolocation) {
      setStatus(t.pointsSaveFailed);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        await addPoint(pos.coords.latitude, pos.coords.longitude);
      },
      () => setStatus(t.pointsSaveFailed),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-white/85">{t.mapTitle}</p>
        <span className="text-[11px] font-semibold text-white/55">{pointsText}</span>
      </div>

      <QuestMapInner pins={pins} center={center} onAdd={addPoint} />

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={addMyLocation}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 disabled:opacity-50"
        >
          {saving ? t.pointsSaving : t.useMyLocation}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-white/55">{t.pointsHint}</p>
      {status && <p className="mt-1 text-[11px] text-white/70">{status}</p>}

      {pins.length > 0 && (
        <div className="mt-2 space-y-1">
          {pins.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => removePoint(p.id)}
              className="block w-full rounded-md border border-white/10 px-2 py-1 text-left text-[11px] text-white/70 hover:bg-white/5"
            >
              #{i + 1}: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
