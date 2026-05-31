export type GeoResult = { lat: number; lng: number; displayName?: string };

export async function geocodeQuery(query: string): Promise<GeoResult | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "SummerNOW/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
    const first = data[0];
    if (!first?.lat || !first?.lon) return null;
    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, displayName: first.display_name };
  } catch {
    return null;
  }
}
