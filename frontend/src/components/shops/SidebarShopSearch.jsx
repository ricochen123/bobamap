export default function SidebarShopSearch({ value, onChange, matchCount, totalCount }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 rounded-xl border border-boba-200/80 bg-boba-50/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        <span className="text-sm" aria-hidden>
          🏪
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter by shop name…"
          className="flex-1 bg-transparent text-sm outline-none dark:text-white"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="Clear filter"
          >
            ✕
          </button>
        )}
      </div>
      {value.trim() && totalCount > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {matchCount === 0
            ? "No matches in this list — clear filter to see all shops"
            : `Showing ${matchCount} of ${totalCount} shops`}
        </p>
      )}
    </div>
  );
}
