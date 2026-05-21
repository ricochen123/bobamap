const METERS_PER_MILE = 1609.344;

/** Format distance in miles (and feet when very close). Input is meters from API. */
export function formatDistance(meters) {
  if (meters == null) return "";
  const miles = meters / METERS_PER_MILE;
  if (miles < 0.1) {
    const feet = Math.round(meters * 3.28084);
    return `${feet} ft away`;
  }
  if (miles < 10) return `${miles.toFixed(1)} mi away`;
  return `${Math.round(miles)} mi away`;
}

export function formatPrice(price) {
  if (!price) return "—";
  return price;
}

export function formatRating(rating) {
  if (rating == null) return "—";
  return Number(rating).toFixed(1);
}

export function directionsUrl(lat, lng, name) {
  const q = encodeURIComponent(name || `${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${q}`;
}
