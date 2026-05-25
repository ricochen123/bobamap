import { useMemo } from "react";
import { useSearch } from "../context/SearchContext";
import { useShops } from "./useShops";

export function useShopDiscovery() {
  const {
    search,
    filters,
    shopNameFilter,
    searchContext,
    handleAreaGeocoded,
    position,
    geoLoading,
    locationRefreshKey,
  } = useSearch();

  const locationQuery = search.mode === "area" ? search.location : null;
  const geocodedQuery = search.mode === "area" ? search.geocoded : null;

  const hasNearbyCoords =
    !!position || (searchContext?.source === "gps" && searchContext?.lat != null);

  const canFetch =
    search.mode === "nearby" ? hasNearbyCoords : !!(locationQuery || geocodedQuery);

  const { shops, loading, error, refetch } = useShops({
    position,
    filters,
    searchMode: search.mode,
    locationQuery,
    geocodedQuery,
    searchContext,
    enabled: canFetch,
    onAreaGeocoded: handleAreaGeocoded,
    locationRefreshKey,
  });

  const sortedShops = useMemo(() => {
    const list = [...shops];
    if (filters.sort === "distance") {
      list.sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
      );
    } else if (filters.sort === "rating") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return list;
  }, [shops, filters.sort]);

  const displayedShops = useMemo(() => {
    const q = shopNameFilter.trim().toLowerCase();
    if (!q) return sortedShops;
    return sortedShops.filter((s) => s.name?.toLowerCase().includes(q));
  }, [sortedShops, shopNameFilter]);

  const subtitle = searchContext?.label
    ? `Boba near ${searchContext.label}`
    : "Use My Location or search a city / ZIP";

  const emptyHint =
    search.mode === "nearby" && !position
      ? "Tap Near me to find boba around you."
      : search.mode === "area" && !locationQuery && !geocodedQuery
        ? "Pick a city or ZIP from the suggestions."
        : shopNameFilter.trim() && sortedShops.length > 0
          ? "No shops match that name in this list."
          : "No boba shops found. Try another area or clear filters.";

  const showLoading = !error && (loading || (geoLoading && search.mode === "nearby"));

  return {
    search,
    position,
    geoLoading,
    shops,
    loading,
    error,
    refetch,
    sortedShops,
    displayedShops,
    subtitle,
    emptyHint,
    showLoading,
    locationQuery,
  };
}
