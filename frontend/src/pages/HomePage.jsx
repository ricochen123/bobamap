import { useEffect, useState } from "react";
import BobaMap from "../components/map/BobaMap";
import FloatingSearchBar from "../components/search/FloatingSearchBar";
import ShopCard from "../components/shops/ShopCard";
import ShopPreviewCard from "../components/shops/ShopPreviewCard";
import ShopSortBar from "../components/shops/ShopSortBar";
import SidebarShopSearch from "../components/shops/SidebarShopSearch";
import MobileDrawer from "../components/layout/MobileDrawer";
import { ShopListSkeleton } from "../components/ui/LoadingSkeleton";
import { US_MAP_CENTER, US_MAP_ZOOM } from "../constants/map";
import { useSearch } from "../context/SearchContext";
import { useShopDiscovery } from "../hooks/useShopDiscovery";
import { useFavorites } from "../hooks/useFavorites";

export default function HomePage() {
  const {
    filters,
    setFilters,
    shopNameFilter,
    setShopNameFilter,
    handleSortChange,
    areaCenter,
    searchContext,
    mapFocusKey,
  } = useSearch();

  const {
    search,
    position,
    displayedShops,
    sortedShops,
    subtitle,
    emptyHint,
    showLoading,
    loading,
    error,
    locationQuery,
  } = useShopDiscovery();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setSelectedShop(null);
  }, [mapFocusKey, search.location]);

  const activeMapCenter = areaCenter || searchContext;
  const mapCenter = activeMapCenter
    ? { lat: activeMapCenter.lat, lng: activeMapCenter.lng }
    : position
      ? { lat: position.lat, lng: position.lng }
      : US_MAP_CENTER;

  const mapZoom =
    activeMapCenter?.source === "gps" || (search.mode === "nearby" && position)
      ? 13
      : activeMapCenter
        ? 11
        : null;

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

      {showLoading ? (
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
              selected={selectedShop?.id === shop.id}
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
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <FloatingSearchBar />

      <div className="absolute inset-0">
        <BobaMap
          shops={sortedShops}
          center={mapCenter}
          userPosition={position}
          flyZoom={mapZoom}
          centerKey={mapFocusKey}
          selectedShop={selectedShop}
          onSelectShop={setSelectedShop}
        />
      </div>

      {selectedShop && (
        <div className="absolute bottom-24 left-4 right-4 z-20 mx-auto max-w-md md:bottom-8 md:left-4 md:right-auto md:max-w-sm">
          <ShopPreviewCard
            shop={selectedShop}
            isFavorite={isFavorite(selectedShop.id)}
            onToggleFavorite={toggleFavorite}
            onClose={() => setSelectedShop(null)}
          />
        </div>
      )}

      <aside className="absolute right-0 top-0 z-10 hidden h-full w-96 overflow-hidden border-l border-boba-200/50 bg-white/95 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 md:block">
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold">Nearby boba</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
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
        <p className="mb-2 text-xs text-gray-500">{subtitle}</p>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {shopList}
      </MobileDrawer>
    </div>
  );
}
