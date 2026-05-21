import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import BobaIcon from "../ui/BobaIcon";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const onMap = location.pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-boba-200/60 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80 ${
        onMap ? "md:bg-transparent md:border-transparent" : ""
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <BobaIcon className="h-8 w-8 shrink-0" />
          <span className="bg-gradient-to-r from-boba-600 to-taro-600 bg-clip-text text-transparent">
            BobaMap
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggle}
            className="btn-ghost rounded-full p-2"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="btn-ghost text-sm">
                {user.username}
              </Link>
              <button type="button" onClick={logout} className="btn-ghost text-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary hidden text-sm sm:inline-flex">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
