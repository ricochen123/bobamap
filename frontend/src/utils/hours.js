export function formatHours(hours) {
  if (!hours?.length) return [];
  const h = hours[0];
  if (!h?.open) return [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return h.open.map((slot) => {
    const day = days[slot.day] || `Day ${slot.day}`;
    const start = String(slot.start || "").padStart(4, "0");
    const end = String(slot.end || "").padStart(4, "0");
    const fmt = (t) => `${t.slice(0, 2)}:${t.slice(2)}`;
    return { day, hours: `${fmt(start)} – ${fmt(end)}` };
  });
}
