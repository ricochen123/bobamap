import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { favoriteService } from "../services/favoriteService";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const data = await favoriteService.list();
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = (yelpId) => favorites.some((f) => f.yelp_id === yelpId);

  const toggleFavorite = async (shop) => {
    if (!user) return { needsAuth: true };
    const yelpId = shop.id;
    if (isFavorite(yelpId)) {
      await favoriteService.removeByYelpId(yelpId);
      setFavorites((prev) => prev.filter((f) => f.yelp_id !== yelpId));
    } else {
      const added = await favoriteService.add(shop);
      setFavorites((prev) => [...prev, added]);
    }
    return { needsAuth: false };
  };

  return { favorites, loading, isFavorite, toggleFavorite, reload: load };
}
