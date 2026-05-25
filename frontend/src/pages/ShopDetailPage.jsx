import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BobaIcon from "../components/ui/BobaIcon";
import FavoriteButton from "../components/ui/FavoriteButton";
import { ShopCardSkeleton } from "../components/ui/LoadingSkeleton";
import { useFavorites } from "../hooks/useFavorites";
import { shopService } from "../services/shopService";
import { directionsUrl, formatRating } from "../utils/format";
import { formatHours } from "../utils/hours";

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    shopService
      .getById(id)
      .then(setShop)
      .catch((e) => setError(e.response?.data?.detail || "Shop not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <ShopCardSkeleton />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-red-600">{error || "Not found"}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Back to map
        </Link>
      </div>
    );
  }

  const hours = formatHours(shop.hours);
  const hero = shop.photos?.[0] || shop.image_url;

  return (
    <article className="animate-fade-in pb-16">
      <div className="relative h-56 sm:h-72 md:h-96">
        {hero ? (
          <img src={hero} alt={shop.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-boba-200 to-taro-400">
            <BobaIcon className="h-24 w-24 opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Link to="/" className="mb-2 inline-block text-sm opacity-80 hover:opacity-100">
            ← Back
          </Link>
          <h1 className="font-display text-3xl font-bold">{shop.name}</h1>
          <p className="mt-1">
            ★ {formatRating(shop.rating)} · {shop.review_count} reviews · {shop.price || "—"}
          </p>
        </div>
        <div className="absolute right-4 top-4">
          <FavoriteButton
            shop={shop}
            isFavorite={isFavorite(shop.id)}
            onToggle={toggleFavorite}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 -mt-6">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">Info</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{shop.address}</p>
          {shop.phone && (
            <p className="mt-1">
              <a href={`tel:${shop.phone}`} className="text-boba-600 hover:underline">
                {shop.phone}
              </a>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {shop.latitude && (
              <a
                href={directionsUrl(shop.latitude, shop.longitude, shop.name)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Directions
              </a>
            )}
            {shop.url && (
              <a
                href={shop.url}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost border border-boba-300"
              >
                View on Yelp
              </a>
            )}
          </div>
        </section>

        {hours.length > 0 && (
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Hours</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between">
                  <span className="font-medium">{h.day}</span>
                  <span className="text-gray-500">{h.hours}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">Reviews</h2>
          {shop.reviews?.length ? (
            <ul className="mt-4 space-y-4">
              {shop.reviews.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800">
                  <p className="text-sm font-medium">
                    ★ {r.rating} · {r.user}
                  </p>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{r.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-gray-500">No reviews loaded.</p>
          )}
        </section>

      </div>
    </article>
  );
}
