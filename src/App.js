import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { NavBar } from "./components/NavBar";
import { ExplorePage } from "./components/ExplorePage";
import ProfilePage from './components/ProfilePage';
import { CityPage } from "./components/CityPage";
import { CategoryPage } from "./components/CategoryPage";
import { PostModal } from "./components/PostModal";
import { AuthModal } from "./components/AuthModal";
import { css } from "./styles/globalStyles";

function AppContent() {
  const [page, setPage] = useState("explore");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { createPost } = useData();

  const handleCityChange = (cityId) => {
    setCityFilter(cityId);
    setCategoryFilter("all"); // Reset category when city changes
    if (cityId !== "all") {
      setPage("city");
    } else {
      setPage("explore");
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCategoryFilter(categoryId);
    setCityFilter("all"); // Reset city when category changes
    if (categoryId !== "all") {
      setPage("category");
    } else {
      setPage("explore");
    }
  };

  return (
    <div>
      <style>{css}</style>
      <NavBar
        page={page}
        setPage={setPage}
        cityFilter={cityFilter}
        setCityFilter={handleCityChange}
        categoryFilter={categoryFilter}
        setCategoryFilter={handleCategoryChange}
        onAuthClick={() => setShowAuthModal(true)}
      />

      {page === "explore" && (
        <ExplorePage
          cityFilter={cityFilter}
          categoryFilter={categoryFilter}
          onOpenModal={() => user ? setShowPostModal(true) : setShowAuthModal(true)}
        />
      )}
      {page === "profile" && <ProfilePage />}
      {page === "city" && <CityPage cityId={cityFilter} />}
      {page === "category" && (
        <CategoryPage
          categoryId={categoryFilter}
          onBack={() => {
            setPage("explore");
            setCategoryFilter("all");
          }}
        />
      )}

      {showPostModal && (
        <PostModal
          onClose={() => setShowPostModal(false)}
          onSubmit={createPost}
        />
      )}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}