import { Link } from "react-router-dom";
import FavoriteButton from "../ui/FavoriteButton";
import { formatDistance, formatRating } from "../../utils/format";

/** Compact card shown when a map pin is clicked */
export default function ShopPreviewCard({ shop, isFavorite, onToggleFavorite, onClose }) {
  if (!shop) return null;

  return (
    <div className="card animate-slide-up overflow-hidden shadow-xl">
      <div className="relative h-32 bg-boba-100 dark:bg-gray-800">
        {shop.image_url && (
          <img src={shop.image_url} alt="" className="h-full w-full object-cover" />
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-1 text-white text-sm"
        >
          ✕
        </button>
        <div className="absolute bottom-2 right-2">
          <FavoriteButton shop={shop} isFavorite={isFavorite} onToggle={onToggleFavorite} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-bold">{shop.name}</h3>
        <p className="text-sm text-boba-600 dark:text-boba-400">
          ★ {formatRating(shop.rating)} · {shop.review_count || 0} reviews
          {shop.distance != null && ` · ${formatDistance(shop.distance)}`}
        </p>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{shop.address}</p>
        <Link to={`/shop/${shop.id}`} className="btn-primary mt-4 block text-center text-sm">
          View details
        </Link>
      </div>
    </div>
  );
}
