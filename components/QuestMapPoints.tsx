"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Quest, QuestPin } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

const QuestMapInner = dynamic(() => import("@/components/QuestMapInner"), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-white/5" />,
});

const DEFAULT_CENTER: [number, number] = [43.238949, 76.889709];

function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function gisUrl(lat: number, lng: number) {
  return `https://2gis.com/geo/${lng},${lat}`;
}

function questPinsFingerprint(pins: QuestPin[] | undefined) {
  return (pins ?? []).map((p) => `${p.id}:${p.lat}:${p.lng}:${p.label ?? ""}`).join("|");
}

export default function QuestMapPoints({
  quest,
  lang,
  location,
  saving,
  onSave,
}: {
  quest: Quest;
  lang: Lang;
  location: string;
  saving: boolean;
  onSave: (questId: string, pins: QuestPin[]) => Promise<boolean>;
}) {
  const t = T[lang];
  const [pins, setPins] = useState<QuestPin[]>(quest.map_points ?? []);
  const [status, setStatus] = useState("");
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const pinsLenRef = useRef(pins.length);
  const hasLocationCenterRef = useRef(false);
  const mapPointsFingerprint = useMemo(() => questPinsFingerprint(quest.map_points), [quest.map_points]);
  const hasQuestDestination = (quest.map_points ?? []).length > 0;

  useEffect(() => {
    setPins(quest.map_points ?? []);
  }, [quest.id, mapPointsFingerprint]);

  useEffect(() => {
    pinsLenRef.current = pins.length;
  }, [pins]);

  useEffect(() => {
    const questPin = pins.find((p) => p.label);
    if (questPin) {
      setCenter([questPin.lat, questPin.lng]);
      return;
    }
    if (pins.length) {
      setCenter([pins[pins.length - 1].lat, pins[pins.length - 1].lng]);
    }
  }, [pins]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        if (pinsLenRef.current === 0 && !hasLocationCenterRef.current) setCenter(p);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const query = location.trim();
    if (!query || hasQuestDestination) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { lat?: number; lng?: number };
        if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return;
        hasLocationCenterRef.current = true;
        setCenter([data.lat!, data.lng!]);
      } catch {}
    })();
    return () => controller.abort();
  }, [location, hasQuestDestination]);

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
    const pin = pins.find((p) => p.id === id);
    if (pin?.label) return;
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
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        setCenter(p);
        await addPoint(p[0], p[1]);
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

      <QuestMapInner pins={pins} center={center} userPosition={userPosition} onAdd={addPoint} />

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={addMyLocation}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 disabled:opacity-50"
        >
          {saving ? t.pointsSaving : t.useMyLocation}
        </button>
        {userPosition && (
          <button
            type="button"
            onClick={() => setCenter(userPosition)}
            className="rounded-lg border border-sky-300/40 px-3 py-1.5 text-xs font-semibold text-sky-200"
          >
            {t.centerOnMe}
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] text-white/55">{t.pointsHint}</p>
      {status && <p className="mt-1 text-[11px] text-white/70">{status}</p>}

      {pins.length > 0 && (
        <div className="mt-2 space-y-2">
          {pins.map((p, i) => (
            <div
              key={p.id}
              className={`rounded-md border px-2 py-2 text-[11px] ${
                p.label ? "border-amber-300/35 bg-amber-400/10" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white/90">
                    {p.label ? `${t.questDestination}: ${p.label}` : `#${i + 1}`}
                  </p>
                  <p className="mt-0.5 text-white/60">
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <a
                    href={googleMapsUrl(p.lat, p.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-white/20 px-2 py-0.5 font-semibold text-sky-200 hover:bg-white/5"
                  >
                    {t.openGoogleMaps}
                  </a>
                  <a
                    href={gisUrl(p.lat, p.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-white/20 px-2 py-0.5 font-semibold text-emerald-200 hover:bg-white/5"
                  >
                    {t.open2Gis}
                  </a>
                  {!p.label && (
                    <button
                      type="button"
                      onClick={() => removePoint(p.id)}
                      className="rounded border border-white/15 px-2 py-0.5 font-semibold text-white/55 hover:bg-white/5"
                    >
                      {t.removePoint}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

