"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { QuestPin } from "@/lib/db";

function ClickCapture({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function QuestMapInner({
  pins,
  center,
  userPosition,
  onAdd,
}: {
  pins: QuestPin[];
  center: [number, number];
  userPosition: [number, number] | null;
  onAdd: (lat: number, lng: number) => void;
}) {
  const key = useMemo(() => `${center[0]}:${center[1]}`, [center]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <MapContainer key={key} center={center} zoom={13} style={{ height: 220, width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onAdd={onAdd} />
        {userPosition && (
          <CircleMarker
            center={userPosition}
            radius={8}
            pathOptions={{ color: "#38bdf8", fillColor: "#0ea5e9", fillOpacity: 0.9, weight: 2 }}
          />
        )}
        {pins.map((pin) => (
          <CircleMarker
            key={pin.id}
            center={[pin.lat, pin.lng]}
            radius={7}
            pathOptions={{ color: "#ff5e62", fillColor: "#ff3cac", fillOpacity: 0.9, weight: 2 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
