import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { ToastProvider } from "./contexts/ToastContext";
import { NavBar } from "./components/NavBar";
import { ExplorePage } from "./components/ExplorePage";
import UserProfilePage from './components/UserProfilePage';
import { CityPage } from "./components/CityPage";
import { CategoryPage } from "./components/CategoryPage";
import { PostModal } from "./components/PostModal";
import { AuthModal } from "./components/AuthModal";
import { css } from "./styles/globalStyles";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState("explore");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { createPost } = useData();

  // Check if we're on a user profile page
  const isUserProfile = location.pathname.startsWith('/user/');

  const handleCityChange = (cityId) => {
    setCityFilter(cityId);
    setCategoryFilter("all");
    if (cityId !== "all") {
      setPage("city");
    } else {
      setPage("explore");
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCategoryFilter(categoryId);
    setCityFilter("all");
    if (categoryId !== "all") {
      setPage("category");
    } else {
      setPage("explore");
    }
  };

  const handleNavigateToUser = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleProfileClick = () => {
    if (user) {
      navigate(`/user/${user.id}`);
    }
  };

  return (
    <div>
      <style>{css}</style>
      {/* Only one NavBar - outside the page rendering */}
      <NavBar
        page={page}
        setPage={setPage}
        cityFilter={cityFilter}
        setCityFilter={handleCityChange}
        categoryFilter={categoryFilter}
        setCategoryFilter={handleCategoryChange}
        onAuthClick={() => setShowAuthModal(true)}
        onProfileClick={handleProfileClick}
      />

      {!isUserProfile && page === "explore" && (
        <ExplorePage
          cityFilter={cityFilter}
          categoryFilter={categoryFilter}
          onOpenModal={() => user ? setShowPostModal(true) : setShowAuthModal(true)}
          onUserClick={handleNavigateToUser}
        />
      )}
      {!isUserProfile && page === "city" && <CityPage cityId={cityFilter} />}
      {!isUserProfile && page === "category" && (
        <CategoryPage
          categoryId={categoryFilter}
          onBack={() => {
            setPage("explore");
            setCategoryFilter("all");
          }}
        />
      )}

      {isUserProfile && <UserProfilePage />}

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
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<AppContent />} />
              <Route path="/user/:userId" element={<AppContent />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}