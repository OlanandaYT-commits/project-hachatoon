"use client";

import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { QuestPin } from "@/lib/db";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  onAdd,
}: {
  pins: QuestPin[];
  center: [number, number];
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
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} />
        ))}
      </MapContainer>
    </div>
  );
}
