import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import BobaIcon from "../ui/BobaIcon";
import { MoonIcon, SunIcon } from "../ui/ThemeIcons";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const onMap = location.pathname === "/";
  const onList = location.pathname === "/list";

  const viewLinkClass = (active) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-boba-500 text-white"
        : "text-gray-600 hover:bg-boba-50 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-boba-200/60 bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex max-w-[100rem] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold sm:text-xl">
            <BobaIcon className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <span className="hidden bg-gradient-to-r from-boba-600 to-taro-600 bg-clip-text text-transparent sm:inline">
              BobaMap
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 rounded-lg bg-boba-50/80 p-0.5 dark:bg-gray-900/80">
            <Link to="/" className={viewLinkClass(onMap)}>
              Map
            </Link>
            <Link to="/list" className={viewLinkClass(onList)}>
              List
            </Link>
          </nav>
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={toggle}
            className="btn-ghost rounded-full p-2"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {!user && (
            <Link to="/register" className="btn-primary hidden text-sm sm:inline-flex">
              Sign up
            </Link>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
