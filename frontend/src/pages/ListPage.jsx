import ShopCard from "../components/shops/ShopCard";
import FloatingSearchBar from "../components/search/FloatingSearchBar";
import ShopSortBar from "../components/shops/ShopSortBar";
import SidebarShopSearch from "../components/shops/SidebarShopSearch";
import { ShopListSkeleton } from "../components/ui/LoadingSkeleton";
import { useSearch } from "../context/SearchContext";
import { useShopDiscovery } from "../hooks/useShopDiscovery";
import { useFavorites } from "../hooks/useFavorites";

export default function ListPage() {
  const { filters, shopNameFilter, setShopNameFilter, handleSortChange } = useSearch();
  const {
    search,
    displayedShops,
    sortedShops,
    subtitle,
    emptyHint,
    showLoading,
    loading,
    error,
    locationQuery,
  } = useShopDiscovery();
  const { isFavorite, toggleFavorite } = useFavorites();
  return (
    <div className="min-h-0 flex-1 bg-gradient-to-b from-boba-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-4">
        <FloatingSearchBar variant="inline" />

        <div className="mt-6">
          <h1 className="font-display text-2xl font-bold">Boba shops</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>

        {search.mode === "area" && loading && locationQuery && (
          <p className="mt-4 text-sm text-boba-600 dark:text-boba-400">
            Finding boba near {locationQuery}…
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        {sortedShops.length > 0 && (
          <div className="mt-6 space-y-4">
            <SidebarShopSearch
              value={shopNameFilter}
              onChange={setShopNameFilter}
              matchCount={displayedShops.length}
              totalCount={sortedShops.length}
            />
            <ShopSortBar value={filters.sort} onChange={handleSortChange} />
          </div>
        )}

        {showLoading ? (
          <div className="mt-8">
            <ShopListSkeleton count={6} />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  showDistance
                  isFavorite={isFavorite(shop.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            {!displayedShops.length && !loading && (
              <p className="mt-12 text-center text-gray-500">{emptyHint}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
