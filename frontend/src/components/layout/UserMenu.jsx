import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Avatar({ name }) {
  const initial = (name?.[0] || "?").toUpperCase();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-boba-500 text-sm font-semibold text-white">
      {initial}
    </span>
  );
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-boba-50 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-boba-200 bg-boba-50 text-boba-600 dark:border-gray-600 dark:bg-gray-800 dark:text-boba-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <span className="hidden sm:inline">Log in</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-boba-50 dark:hover:bg-gray-800"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.username} />
        <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
          {user.username}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[60] mt-1 min-w-[10rem] rounded-xl border border-boba-200/80 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <Link
            to="/profile"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-boba-50 dark:hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-boba-50 dark:hover:bg-gray-800"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
