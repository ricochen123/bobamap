import { useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "best_match", label: "Best match" },
  { value: "rating", label: "Highest rated" },
  { value: "distance", label: "Closest" },
];

const PRICE_OPTIONS = ["", "1", "2", "3", "4"];

export default function FilterModal({ open, onClose, filters, onApply }) {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  if (!open) return null;

  const apply = () => {
    onApply(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:rounded-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Filters</h2>
          <button type="button" onClick={onClose} className="btn-ghost rounded-full">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Sort by</legend>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocal((l) => ({ ...l, sort: opt.value }))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    local.sort === opt.value
                      ? "bg-boba-500 text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Minimum rating</legend>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={local.minRating || 0}
              onChange={(e) => setLocal((l) => ({ ...l, minRating: parseFloat(e.target.value) || null }))}
              className="w-full accent-boba-500"
            />
            <p className="text-sm text-gray-500">{local.minRating ? `${local.minRating}+ stars` : "Any"}</p>
          </fieldset>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!local.openNow}
              onChange={(e) => setLocal((l) => ({ ...l, openNow: e.target.checked }))}
              className="h-5 w-5 rounded accent-boba-500"
            />
            <span className="font-medium">Open now</span>
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Price</legend>
            <div className="flex gap-2">
              {PRICE_OPTIONS.map((p, i) => (
                <button
                  key={p || "any"}
                  type="button"
                  onClick={() => setLocal((l) => ({ ...l, price: p }))}
                  className={`rounded-full px-4 py-2 text-sm ${
                    local.price === p ? "bg-boba-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {p ? "$".repeat(parseInt(p, 10)) : "Any"}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Max distance (miles)</legend>
            <select
              value={local.maxDistance || ""}
              onChange={(e) =>
                setLocal((l) => ({ ...l, maxDistance: e.target.value ? Number(e.target.value) : null }))
              }
              className="input-field"
            >
              <option value="">Any</option>
              <option value="1609">1 mi</option>
              <option value="4828">3 mi</option>
              <option value="8047">5 mi</option>
              <option value="16093">10 mi</option>
            </select>
          </fieldset>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1"
            onClick={() => {
              setLocal({
                sort: "best_match",
                minRating: null,
                openNow: false,
                price: "",
                maxDistance: null,
                radius: 8047,
              });
            }}
          >
            Reset
          </button>
          <button type="button" className="btn-primary flex-1" onClick={apply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
