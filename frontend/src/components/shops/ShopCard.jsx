import { Link } from "react-router-dom";
import FavoriteButton from "../ui/FavoriteButton";
import LazyImage from "../ui/LazyImage";
import { formatDistance, formatPrice, formatRating } from "../../utils/format";

export default function ShopCard({
  shop,
  isFavorite,
  onToggleFavorite,
  onSelect,
  selected = false,
  compact = false,
  showDistance = false,
}) {
  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-boba-100 dark:bg-gray-800">
        <LazyImage
          src={shop.image_url}
          alt={shop.name}
          className="h-full w-full transition duration-300 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <FavoriteButton shop={shop} isFavorite={isFavorite} onToggle={onToggleFavorite} />
        </div>
        {shop.is_open_now === true && (
          <span className="absolute bottom-2 left-2 rounded-full bg-matcha-500 px-2 py-0.5 text-xs font-semibold text-white">
            Open
          </span>
        )}
        {shop.is_open_now === false && (
          <span className="absolute bottom-2 left-2 rounded-full bg-gray-600 px-2 py-0.5 text-xs font-semibold text-white">
            Closed
          </span>
        )}
      </div>
      <div className={`p-4 ${compact ? "p-3" : ""}`}>
        <h3 className="font-display font-semibold text-gray-900 line-clamp-1 dark:text-white">
          {shop.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-boba-600 dark:text-boba-400">
            ★ {formatRating(shop.rating)}
          </span>
          <span>({shop.review_count || 0})</span>
          {shop.price && <span>{formatPrice(shop.price)}</span>}
        </div>
        {shop.distance != null && (
          <p
            className={`mt-1 text-sm ${
              showDistance
                ? "font-medium text-boba-600 dark:text-boba-400"
                : "text-gray-500"
            }`}
          >
            {formatDistance(shop.distance)}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-500">{shop.address}</p>
      </div>
    </>
  );

  const className = `group card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg animate-fade-in ${
    selected ? "ring-2 ring-boba-500 ring-offset-2 shadow-lg dark:ring-offset-gray-950" : ""
  }`;

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(shop)} className={`${className} w-full text-left`}>
        {content}
      </button>
    );
  }

  return (
    <Link to={`/shop/${shop.id}`} className={className}>
      {content}
    </Link>
  );
}
