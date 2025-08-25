export type Place = {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
  url?: string;
};

export async function findPopularPlaces(
  lat: number,
  lon: number,
  query: string
): Promise<Place[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return [];

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("location", `${lat},${lon}`);
  url.searchParams.set("radius", "8000"); // ~8km
  url.searchParams.set("key", key);

  const resp = await fetch(url.toString());
  if (!resp.ok) return [];
  const data = (await resp.json()) as {
    results?: {
      place_id: string;
      name: string;
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
    }[];
  };
  const results = data.results || [];
  return results.slice(0, 5).map((r) => ({
    id: r.place_id,
    name: r.name,
    address: r.formatted_address,
    lat: r.geometry?.location?.lat,
    lon: r.geometry?.location?.lng,
    url: r.place_id
      ? `https://www.google.com/maps/place/?q=place_id:${r.place_id}`
      : undefined,
  }));
}
