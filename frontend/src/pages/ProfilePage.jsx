import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopCard from "../components/shops/ShopCard";
import { ShopListSkeleton } from "../components/ui/LoadingSkeleton";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { favorites, loading, isFavorite, toggleFavorite, reload } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <ShopListSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in p-6">
      <div className="card mb-8 bg-gradient-to-r from-boba-100 to-taro-400/20 p-6 dark:from-gray-900">
        <h1 className="font-display text-2xl font-bold">Hi, {user.username} 🧋</h1>
        <p className="text-gray-600 dark:text-gray-400">{user.email || "No email set"}</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Your favorites</h2>
        <button type="button" onClick={reload} className="btn-ghost text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <ShopListSkeleton />
      ) : favorites.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <p>No favorites yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Explore the map
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((fav) => {
            const shop = {
              id: fav.yelp_id,
              name: fav.shop_name,
              image_url: fav.shop_image_url,
              rating: fav.shop_rating,
              address: fav.shop_address,
              latitude: fav.latitude,
              longitude: fav.longitude,
            };
            return (
              <ShopCard
                key={fav.id}
                shop={shop}
                isFavorite={isFavorite(fav.yelp_id)}
                onToggleFavorite={toggleFavorite}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
