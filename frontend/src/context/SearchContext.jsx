import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";

export const DEFAULT_FILTERS = {
  sort: "best_match",
  minRating: null,
  openNow: false,
  price: "",
  maxDistance: null,
  radius: 8047,
};

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const { position, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [locationRefreshKey, setLocationRefreshKey] = useState(0);

  const [search, setSearch] = useState({
    mode: "area",
    location: null,
    geocoded: null,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [shopNameFilter, setShopNameFilter] = useState("");
  const [searchContext, setSearchContext] = useState(null);
  const [areaCenter, setAreaCenter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mapFocusKey, setMapFocusKey] = useState(0);

  const bumpMapFocus = useCallback(() => {
    setMapFocusKey((k) => k + 1);
  }, []);

  const handleAreaGeocoded = useCallback(
    (geo) => {
      setAreaCenter(geo);
      if (geo) {
        setSearchContext({
          lat: geo.lat,
          lng: geo.lng,
          label: geo.label,
          source: "area",
        });
        bumpMapFocus();
      }
    },
    [bumpMapFocus]
  );

  const handleSearch = useCallback(
    (payload) => {
      setSearch({
        mode: payload.mode,
        location: payload.location ?? null,
        geocoded: payload.geocoded ?? null,
      });
      setShopNameFilter("");
      if (payload.mode === "nearby") {
        setAreaCenter(null);
        setSearchContext(null);
      } else if (payload.mode === "area") {
        if (payload.geocoded) {
          setAreaCenter(payload.geocoded);
          setSearchContext({
            lat: payload.geocoded.lat,
            lng: payload.geocoded.lng,
            label: payload.geocoded.label,
            source: "area",
          });
          setLocationRefreshKey((k) => k + 1);
          bumpMapFocus();
        } else {
          setAreaCenter(null);
          setSearchContext(null);
        }
      }
    },
    [bumpMapFocus]
  );

  const handleSortChange = useCallback((sort) => {
    setFilters((f) => ({ ...f, sort }));
  }, []);

  const useMyLocation = useCallback(async () => {
    setShopNameFilter("");
    setAreaCenter(null);
    setSearchContext(null);
    setSearch({ mode: "nearby", location: null, geocoded: null });

    const coords = await requestLocation();
    if (coords) {
      setSearchContext({
        lat: coords.lat,
        lng: coords.lng,
        label: "your location",
        source: "gps",
      });
      setLocationRefreshKey((k) => k + 1);
      bumpMapFocus();
    } else {
      setSearchContext(null);
    }
  }, [requestLocation, bumpMapFocus]);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      filters,
      setFilters,
      shopNameFilter,
      setShopNameFilter,
      searchContext,
      setSearchContext,
      areaCenter,
      setAreaCenter,
      handleSearch,
      handleAreaGeocoded,
      handleSortChange,
      position,
      geoError,
      geoLoading,
      useMyLocation,
      locationRefreshKey,
      filterOpen,
      setFilterOpen,
      mapFocusKey,
    }),
    [
      search,
      filters,
      shopNameFilter,
      searchContext,
      areaCenter,
      handleSearch,
      handleAreaGeocoded,
      handleSortChange,
      position,
      geoError,
      geoLoading,
      useMyLocation,
      locationRefreshKey,
      filterOpen,
      mapFocusKey,
    ]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
