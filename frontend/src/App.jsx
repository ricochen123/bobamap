import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import FilterModal from "./components/search/FilterModal";
import { SearchProvider, useSearch } from "./context/SearchContext";
import HomePage from "./pages/HomePage";
import ListPage from "./pages/ListPage";
import ShopDetailPage from "./pages/ShopDetailPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function AppFilters() {
  const { filterOpen, setFilterOpen, filters, setFilters } = useSearch();
  return (
    <FilterModal
      open={filterOpen}
      onClose={() => setFilterOpen(false)}
      filters={filters}
      onApply={setFilters}
    />
  );
}

export default function App() {
  return (
    <SearchProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <AppFilters />
        <main className="flex min-h-0 flex-1 flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/shop/:id" element={<ShopDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </SearchProvider>
  );
}
