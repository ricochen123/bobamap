import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function FavoriteButton({ shop, isFavorite, onToggle, className = "" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setBusy(true);
    try {
      await onToggle(shop);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110 dark:bg-gray-800/90 ${className}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <span className={`text-lg transition ${isFavorite ? "text-red-500" : "text-gray-400"}`}>
        {isFavorite ? "♥" : "♡"}
      </span>
    </button>
  );
}
