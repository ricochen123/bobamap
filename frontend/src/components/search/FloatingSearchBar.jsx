import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { suggestLocations } from "../../services/geocodeService";

const MODES = [
  { id: "nearby", label: "Near me" },
  { id: "area", label: "City / ZIP" },
];

const SEARCH_HINTS = {
  nearby: "Using your location…",
  area: "City, state or ZIP code",
};

export default function FloatingSearchBar({ onSearch, onOpenFilters }) {
  const [mode, setMode] = useState("nearby");
  const [query, setQuery] = useState("");
  const debouncedSuggest = useDebounce(query, 300);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const blurTimerRef = useRef(null);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const emit = (loc, m, geocoded = null) => {
    onSearchRef.current?.({
      mode: m,
      location: loc ?? null,
      geocoded: geocoded ?? null,
    });
  };

  useEffect(() => {
    if (mode === "nearby") {
      onSearchRef.current?.({ mode: "nearby", location: null, geocoded: null });
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "area") {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }

    const q = debouncedSuggest.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestOpen(false);
      setHighlightIndex(-1);
      return;
    }

    let cancelled = false;
    setSuggestLoading(true);

    suggestLocations(q)
      .then((items) => {
        if (cancelled) return;
        setSuggestions(items);
        setSuggestOpen(items.length > 0);
        setHighlightIndex(-1);
      })
      .finally(() => {
        if (!cancelled) setSuggestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, debouncedSuggest]);

  useEffect(() => () => clearTimeout(blurTimerRef.current), []);

  const closeSuggestions = () => {
    setSuggestOpen(false);
    setHighlightIndex(-1);
  };

  const selectSuggestion = (item) => {
    setQuery(item.label);
    setSuggestions([]);
    closeSuggestions();
    emit(item.label, "area", {
      lat: item.lat,
      lng: item.lng,
      label: item.label,
    });
  };

  const handleModeChange = (next) => {
    setMode(next);
    setSuggestions([]);
    closeSuggestions();
    setQuery("");
    if (next === "nearby") {
      emit(null, "nearby");
    } else {
      emit(null, "area");
    }
  };

  const submitArea = () => {
    const trimmed = query.trim();
    if (mode === "area" && trimmed) {
      closeSuggestions();
      emit(trimmed, "area", null);
    }
  };

  const handleInputBlur = () => {
    blurTimerRef.current = setTimeout(() => closeSuggestions(), 150);
  };

  const handleInputFocus = () => {
    clearTimeout(blurTimerRef.current);
    if (mode === "area" && suggestions.length > 0) setSuggestOpen(true);
  };

  const handleAreaKeyDown = (e) => {
    if (e.key === "Escape") {
      closeSuggestions();
      return;
    }

    if (!suggestOpen || suggestions.length === 0) {
      if (e.key === "Enter") submitArea();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        selectSuggestion(suggestions[highlightIndex]);
      } else {
        submitArea();
      }
    }
  };

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-4 z-20 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-xl space-y-2">
        <div className="card flex gap-1 p-1 shadow-lg">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                mode === m.id
                  ? "bg-boba-500 text-white"
                  : "text-gray-600 hover:bg-boba-50 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex flex-1 flex-col">
            <div className="card flex items-center gap-2 px-4 py-2 shadow-lg">
              <span className="text-lg">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (mode === "area") handleAreaKeyDown(e);
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={SEARCH_HINTS[mode]}
                disabled={mode === "nearby"}
                autoComplete="off"
                role={mode === "area" ? "combobox" : undefined}
                aria-expanded={mode === "area" ? suggestOpen : undefined}
                className="flex-1 bg-transparent text-sm outline-none disabled:opacity-60 dark:text-white"
              />
              {mode === "area" && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={submitArea}
                  disabled={!query.trim()}
                  className="rounded-lg bg-boba-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Go
                </button>
              )}
            </div>

            {mode === "area" && suggestOpen && (
              <ul
                role="listbox"
                className="card absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto p-1 shadow-lg"
              >
                {suggestLoading && suggestions.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-gray-500">Searching…</li>
                ) : (
                  suggestions.map((item, i) => (
                    <li key={item.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === highlightIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(item)}
                        onMouseEnter={() => setHighlightIndex(i)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          i === highlightIndex
                            ? "bg-boba-100 dark:bg-boba-900/40"
                            : "hover:bg-boba-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenFilters}
            className="card flex h-12 w-12 shrink-0 items-center justify-center shadow-lg"
            aria-label="Open filters"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}
