import { useCallback, useMemo, useState } from "react";
import BobaMap from "../components/map/BobaMap";
import FloatingSearchBar from "../components/search/FloatingSearchBar";
import FilterModal from "../components/search/FilterModal";
import ShopCard from "../components/shops/ShopCard";
import ShopSortBar from "../components/shops/ShopSortBar";
import SidebarShopSearch from "../components/shops/SidebarShopSearch";
import ShopPreviewCard from "../components/shops/ShopPreviewCard";
import MobileDrawer from "../components/layout/MobileDrawer";
import { ShopListSkeleton } from "../components/ui/LoadingSkeleton";
import { useGeolocation } from "../hooks/useGeolocation";
import { useShops } from "../hooks/useShops";
import { useFavorites } from "../hooks/useFavorites";

const DEFAULT_FILTERS = {
  sort: "best_match",
  minRating: null,
  openNow: false,
  price: "",
  maxDistance: null,
  radius: 8047,
};

export default function HomePage() {
  const { position, loading: geoLoading } = useGeolocation();
  const [search, setSearch] = useState({
    mode: "nearby",
    location: null,
    geocoded: null,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [areaCenter, setAreaCenter] = useState(null);
  const [searchContext, setSearchContext] = useState(null);
  const [shopNameFilter, setShopNameFilter] = useState("");

  const locationQuery = search.mode === "area" ? search.location : null;
  const geocodedQuery = search.mode === "area" ? search.geocoded : null;

  const canFetch =
    search.mode === "nearby" ? !geoLoading && !!position : !!locationQuery;

  const handleAreaGeocoded = useCallback((geo) => {
    setAreaCenter(geo);
    if (geo) {
      setSearchContext({
        lat: geo.lat,
        lng: geo.lng,
        label: geo.label,
        source: "area",
      });
    }
  }, []);

  const { shops, loading, error, refetch } = useShops({
    position,
    filters,
    searchMode: search.mode,
    locationQuery,
    geocodedQuery,
    searchContext,
    enabled: canFetch,
    onAreaGeocoded: handleAreaGeocoded,
  });

  const activeMapCenter = areaCenter || searchContext;
  const mapCenter = activeMapCenter
    ? { lat: activeMapCenter.lat, lng: activeMapCenter.lng }
    : position;

  const { isFavorite, toggleFavorite } = useFavorites();

  const handleSearch = useCallback((payload) => {
    setSearch(payload);
    setSelectedShop(null);
    setShopNameFilter("");
    if (payload.mode === "nearby") {
      setAreaCenter(null);
      setSearchContext(null);
    } else if (payload.mode === "area" && payload.geocoded) {
      setAreaCenter(payload.geocoded);
      setSearchContext({
        lat: payload.geocoded.lat,
        lng: payload.geocoded.lng,
        label: payload.geocoded.label,
        source: "area",
      });
    }
  }, []);

  const sortedShops = useMemo(() => {
    const list = [...shops];
    if (filters.sort === "distance") {
      list.sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));
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

  const handleSortChange = useCallback((sort) => {
    setFilters((f) => ({ ...f, sort }));
  }, []);

  const emptyHint =
    search.mode === "area" && !locationQuery
      ? "Enter a city or ZIP above, then press Go."
      : shopNameFilter.trim() && sortedShops.length > 0
        ? "No shops match that name in this list."
        : "No boba shops found. Try another area or clear filters.";

  const sidebarSubtitle = searchContext?.label
    ? `Boba near ${searchContext.label}`
    : position
      ? "Boba near your location"
      : "Enable location or search a city";

  const showListLoading =
    !error && (loading || (geoLoading && search.mode === "nearby"));

  const shopList = (
    <>
      {sortedShops.length > 0 && (
        <>
          <SidebarShopSearch
            value={shopNameFilter}
            onChange={setShopNameFilter}
            matchCount={displayedShops.length}
            totalCount={sortedShops.length}
          />
          <ShopSortBar value={filters.sort} onChange={handleSortChange} />
        </>
      )}

      {showListLoading ? (
        <ShopListSkeleton count={3} />
      ) : (
        <div className="grid max-h-[calc(100vh-11rem)] gap-4 overflow-y-auto pr-1">
          {displayedShops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              compact
              showDistance
              isFavorite={isFavorite(shop.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={setSelectedShop}
            />
          ))}
          {!displayedShops.length && !loading && (
            <p className="text-center text-gray-500">{emptyHint}</p>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
      <FloatingSearchBar onSearch={handleSearch} onOpenFilters={() => setFilterOpen(true)} />

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      <div className="absolute inset-0">
        <BobaMap
          shops={sortedShops}
          center={mapCenter}
          userPosition={position}
          flyZoom={activeMapCenter ? 11 : 13}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
        />
      </div>

      {selectedShop && (
        <div className="absolute bottom-24 left-4 right-4 z-20 mx-auto max-w-md md:bottom-8 md:left-auto md:right-8">
          <ShopPreviewCard
            shop={selectedShop}
            isFavorite={isFavorite(selectedShop.id)}
            onToggleFavorite={toggleFavorite}
            onClose={() => setSelectedShop(null)}
          />
        </div>
      )}

      <aside className="absolute right-0 top-0 z-10 hidden h-full w-96 overflow-hidden border-l border-boba-200/50 bg-white/95 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 md:block">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Nearby boba</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{sidebarSubtitle}</p>
          </div>
          <button type="button" onClick={refetch} className="btn-ghost text-sm">
            Refresh
          </button>
        </div>

        {search.mode === "area" && loading && locationQuery && (
          <p className="mb-3 text-sm text-boba-600 dark:text-boba-400">
            Finding boba near {locationQuery}…
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        {shopList}
      </aside>

      <MobileDrawer open={drawerOpen} onToggle={() => setDrawerOpen((o) => !o)}>
        <p className="mb-2 text-xs text-gray-500">{sidebarSubtitle}</p>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {shopList}
      </MobileDrawer>
    </div>
  );
}

