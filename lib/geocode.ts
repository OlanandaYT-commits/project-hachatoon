export type GeoResult = { lat: number; lng: number; displayName?: string };

type NominatimResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
  class?: string;
  type?: string;
  category?: string;
  addresstype?: string;
};

type PlaceRule = { query: RegExp; target: RegExp };

const PLACE_RULES: PlaceRule[] = [
  { query: /(кафе|кофейн|coffee|cafe)/i, target: /(cafe|coffee_shop)/ },
  { query: /(ресторан|restaurant|bistro)/i, target: /(restaurant|fast_food|food_court)/ },
  { query: /(бар|паб|bar|pub)/i, target: /(bar|pub|biergarten|nightclub)/ },
  { query: /(музе|museum)/i, target: /(museum|gallery|arts_centre)/ },
  { query: /(галере|gallery|искусств|art)/i, target: /(gallery|arts_centre|museum|art)/ },
  { query: /(парк|park|garden|сквер)/i, target: /(park|garden|nature_reserve)/ },
  { query: /(кино|cinema|театр|theatre|театр)/i, target: /(cinema|theatre)/ },
  { query: /(mall|трц|торгов|shopping)/i, target: /(mall|supermarket|department_store)/ },
  { query: /(отель|hotel|гостиниц)/i, target: /(hotel|hostel|guest_house)/ },
];

function pickBestMatch(query: string, data: NominatimResult[]): NominatimResult | null {
  if (!data.length) return null;
  const q = query.toLowerCase();
  const tokens = q.split(/[\s,.-]+/).filter((t) => t.length >= 3);
  const homeHints = /(house|residential|apartments|building|house_number|residence|dormitory|flat|квартира|дом)/;
  const poiHints = /(amenity|tourism|leisure|shop|historic|attraction|place_of_worship|office)/;
  const matchedRules = PLACE_RULES.filter((r) => r.query.test(query));

  let best = data[0];
  let bestScore = -Infinity;

  for (const item of data) {
    const hay = `${item.display_name ?? ""} ${item.class ?? ""} ${item.type ?? ""} ${item.category ?? ""} ${item.addresstype ?? ""}`.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (hay.includes(token)) score += token.length >= 6 ? 2 : 1;
    }
    if (tokens.length && hay.includes(tokens[0])) score += 2;
    if (poiHints.test(hay)) score += 6;
    if (homeHints.test(hay)) score -= 18;
    if (item.class === "building" || item.addresstype === "house_number") score -= 10;
    if (matchedRules.length) {
      const matched = matchedRules.some((rule) => rule.target.test(hay));
      if (matched) score += 18;
      else score -= 6;
    }
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }

  return best;
}

export async function geocodeQuery(query: string): Promise<GeoResult | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "SummerNOW/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimResult[];
    const best = pickBestMatch(q, data);
    if (!best?.lat || !best?.lon) return null;
    const lat = Number(best.lat);
    const lng = Number(best.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, displayName: best.display_name };
  } catch {
    return null;
  }
}
