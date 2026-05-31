"use client";

import { useMemo, useState } from "react";
import type { Quest } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

export default function ProofUpload({
  quest,
  lang,
  busy,
  onVerify,
}: {
  quest: Quest;
  lang: Lang;
  busy: boolean;
  onVerify: (questId: string, imageDataUrl: string) => Promise<void>;
}) {
  const t = T[lang];
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const canVerify = useMemo(() => {
    return !busy && !!imageDataUrl && quest.verification_status !== "approved";
  }, [busy, imageDataUrl, quest.verification_status]);

  async function pickFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result ?? ""));
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  if (!quest.completed_at) return null;

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3">
      {quest.verification_status === "approved" ? (
        <p className="text-xs font-bold text-green-300">{t.verifiedApproved(quest.reward_points ?? 0)}</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/85">
              {t.choosePhoto}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </label>
            <button
              disabled={!canVerify}
              onClick={() => onVerify(quest.id, imageDataUrl)}
              className="rounded-lg bg-white/15 px-3 py-2 text-xs font-black text-white transition disabled:opacity-45"
            >
              {busy ? t.verifyingNow : t.verifyNow}
            </button>
          </div>

          {fileName && <p className="mt-2 text-xs text-white/60">{t.photoSelected}: {fileName}</p>}
          {quest.verification_status === "rejected" && (
            <p className="mt-2 text-xs font-semibold text-rose-300">{quest.verification_note || t.verifiedRejected}</p>
          )}
        </>
      )}
    </div>
  );
}
