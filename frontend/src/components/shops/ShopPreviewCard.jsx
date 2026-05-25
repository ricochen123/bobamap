import { Link } from "react-router-dom";
import FavoriteButton from "../ui/FavoriteButton";
import { formatDistance, formatPrice, formatRating } from "../../utils/format";

export default function ShopPreviewCard({ shop, isFavorite, onToggleFavorite, onClose }) {
  if (!shop) return null;

  const categories = shop.categories?.filter(Boolean).join(" · ");

  return (
    <div className="card animate-slide-up overflow-hidden shadow-xl">
      <div className="relative h-36 bg-boba-100 dark:bg-gray-800">
        {shop.image_url ? (
          <img src={shop.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-boba-200 to-taro-400/40" />
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full bg-black/50 px-2.5 py-1 text-sm text-white hover:bg-black/70"
          aria-label="Close"
        >
          ×
        </button>
        <div className="absolute bottom-2 right-2">
          <FavoriteButton shop={shop} isFavorite={isFavorite} onToggle={onToggleFavorite} />
        </div>
        {shop.is_open_now && (
          <span className="absolute bottom-2 left-2 rounded-full bg-matcha-500 px-2 py-0.5 text-xs font-semibold text-white">
            Open now
          </span>
        )}
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-4">
        <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">{shop.name}</h3>
        <p className="mt-1 text-sm text-boba-600 dark:text-boba-400">
          ★ {formatRating(shop.rating)} · {shop.review_count || 0} reviews
          {shop.price ? ` · ${formatPrice(shop.price)}` : ""}
          {shop.distance != null ? ` · ${formatDistance(shop.distance)}` : ""}
        </p>
        {categories && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{categories}</p>
        )}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{shop.address}</p>
        {shop.phone && (
          <p className="mt-1 text-sm">
            <a href={`tel:${shop.phone}`} className="text-boba-600 hover:underline dark:text-boba-400">
              {shop.phone}
            </a>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/shop/${shop.id}`} className="btn-primary flex-1 text-center text-sm">
            View details
          </Link>
          {shop.url && (
            <a
              href={shop.url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost border border-boba-300 text-sm dark:border-gray-600"
            >
              Yelp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
