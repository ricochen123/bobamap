import { useCallback, useEffect, useRef, useState } from "react";
import { geocodeLocation } from "../services/geocodeService";
import { shopService } from "../services/shopService";

export function useShops({
  position,
  filters,
  searchMode = "nearby",
  locationQuery,
  geocodedQuery = null,
  searchContext = null,
  enabled = true,
  onAreaGeocoded,
  locationRefreshKey = 0,
}) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchGenerationRef = useRef(0);

  const searchContextRef = useRef(searchContext);
  searchContextRef.current = searchContext;

  const nearbyCoords =
    position ??
    (searchContext?.source === "gps"
      ? { lat: searchContext.lat, lng: searchContext.lng }
      : null);

  const fetchShops = useCallback(
    async ({ force = false } = {}) => {
      if (!force && !enabled) {
        return;
      }

      const ctx = searchContextRef.current;
      const coords =
        position ??
        (ctx?.source === "gps" ? { lat: ctx.lat, lng: ctx.lng } : null);

      const hasAreaTarget = !!(locationQuery || geocodedQuery);
      if (searchMode === "area" && !hasAreaTarget) {
        setShops([]);
        setError(null);
        setLoading(false);
        if (!ctx) {
          onAreaGeocoded?.(null);
        }
        return;
      }
      if (searchMode === "nearby" && !coords) {
        setLoading(false);
        return;
      }

      const generation = ++fetchGenerationRef.current;
      setLoading(true);
      setError(null);

      try {
        const params = {
          radius: filters.radius || 8047,
          open_now: filters.openNow || undefined,
          price: filters.price || undefined,
          min_rating: filters.minRating > 0 ? filters.minRating : undefined,
          max_distance: filters.maxDistance || undefined,
          sort: filters.sort || "best_match",
          page_size: 50,
        };

        let distanceRef = coords;

        if (searchMode === "area" && hasAreaTarget) {
          const geo =
            geocodedQuery ??
            (ctx
              ? { lat: ctx.lat, lng: ctx.lng, label: ctx.label }
              : null) ??
            (locationQuery ? await geocodeLocation(locationQuery) : null);

          if (!geo) {
            setShops([]);
            onAreaGeocoded?.(null);
            setError(
              "Could not find that city or ZIP. Try a full city and state, or a 5-digit ZIP."
            );
            return;
          }

          onAreaGeocoded?.(geo);
          params.lat = geo.lat;
          params.lng = geo.lng;
          distanceRef = geo;
        } else if (coords) {
          params.lat = coords.lat;
          params.lng = coords.lng;
          if (searchMode === "nearby") {
            onAreaGeocoded?.(null);
          }
        }

        if (distanceRef) {
          params.ref_lat = distanceRef.lat;
          params.ref_lng = distanceRef.lng;
        } else if (searchMode === "area") {
          params.location = locationQuery;
          delete params.lat;
          delete params.lng;
        }

        const data = await shopService.search(params);
        if (generation !== fetchGenerationRef.current) return;

        setShops(data.results || []);

        if (searchMode === "area" && (data.results?.length ?? 0) === 0) {
          const label = locationQuery || geocodedQuery?.label || "that area";
          setError(`No boba shops found near ${label}. Try a larger city or wider filters.`);
        }
      } catch (err) {
        if (generation !== fetchGenerationRef.current) return;
        setError(err.response?.data?.detail || err.message || "Failed to load shops");
        setShops([]);
      } finally {
        if (generation === fetchGenerationRef.current) {
          setLoading(false);
        }
      }
    },
    [
      position,
      searchContext?.lat,
      searchContext?.lng,
      searchContext?.source,
      filters,
      searchMode,
      locationQuery,
      geocodedQuery,
      enabled,
      onAreaGeocoded,
    ]
  );

  const refetch = useCallback(() => fetchShops({ force: true }), [fetchShops]);

  useEffect(() => {
    if (searchMode !== "nearby" || !nearbyCoords) return;
    fetchShops({ force: true });
  }, [
    fetchShops,
    searchMode,
    nearbyCoords?.lat,
    nearbyCoords?.lng,
    locationRefreshKey,
  ]);

  useEffect(() => {
    if (searchMode !== "area") return;
    if (!locationQuery && !geocodedQuery) return;
    fetchShops({ force: true });
  }, [
    fetchShops,
    searchMode,
    locationQuery,
    geocodedQuery?.lat,
    geocodedQuery?.lng,
    locationRefreshKey,
  ]);

  return { shops, loading, error, refetch };
}
