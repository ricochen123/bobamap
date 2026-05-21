const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export async function geocodeLocation(query) {
  const q = query?.trim();
  if (!q) return null;

  if (!TOKEN) {
    console.warn("Mapbox token not configured");
    return null;
  }

  const encoded = encodeURIComponent(q);
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
    `?access_token=${TOKEN}&limit=1&types=postcode,place,locality,neighborhood,address&country=us`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature?.center) return null;

  const [lng, lat] = feature.center;
  return {
    lat,
    lng,
    label: feature.place_name || q,
  };
}

export async function suggestLocations(query) {
  const q = query?.trim();
  if (!q || q.length < 2) return [];

  if (!TOKEN) {
    console.warn("Mapbox token not configured");
    return [];
  }

  const encoded = encodeURIComponent(q);
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
    `?access_token=${TOKEN}&autocomplete=true&limit=5` +
    `&types=postcode,place,locality,neighborhood&country=us`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.features ?? [])
    .filter((f) => f.center?.length === 2)
    .map((f) => {
      const [lng, lat] = f.center;
      return {
        id: f.id,
        label: f.place_name || q,
        lat,
        lng,
      };
    });
}
