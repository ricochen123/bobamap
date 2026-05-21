const SORT_OPTIONS = [
  { value: "best_match", label: "Best match" },
  { value: "distance", label: "Closest" },
  { value: "rating", label: "Top rated" },
];

export default function ShopSortBar({ value, onChange }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      <span className="mr-1 self-center text-xs font-medium text-gray-500 dark:text-gray-400">Sort:</span>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            value === opt.value
              ? "bg-boba-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-boba-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
