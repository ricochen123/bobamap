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
}) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchContextRef = useRef(searchContext);
  searchContextRef.current = searchContext;

  const fetchShops = useCallback(
    async ({ force = false } = {}) => {
      if (!force && !enabled) {
        return;
      }

      if (searchMode === "area" && !locationQuery) {
        setShops([]);
        setError(null);
        setLoading(false);
        if (!searchContextRef.current) {
          onAreaGeocoded?.(null);
        }
        return;
      }
      if (searchMode === "nearby" && !position) {
        setLoading(false);
        return;
      }

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

        let distanceRef = position;
        const ctx = searchContextRef.current;

        if (searchMode === "area" && locationQuery) {
          const geo =
            geocodedQuery ??
            (ctx
              ? { lat: ctx.lat, lng: ctx.lng, label: ctx.label }
              : null) ??
            (await geocodeLocation(locationQuery));

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
        } else if (position) {
          params.lat = position.lat;
          params.lng = position.lng;
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
        setShops(data.results || []);

        if (searchMode === "area" && (data.results?.length ?? 0) === 0) {
          setError(`No boba shops found near ${locationQuery}. Try a larger city or wider filters.`);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Failed to load shops");
        setShops([]);
      } finally {
        setLoading(false);
      }
    },
    [
      position,
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
    fetchShops();
  }, [fetchShops]);

  return { shops, loading, error, refetch };
}
