import { useState, useEffect } from "react";
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
import { AdminDashboard } from "./components/AdminDashboard";
import { MessageProvider } from "./contexts/MessageContext";
import MessagesPage from "./components/MessagesPage";

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

  const isUserProfile = location.pathname.startsWith('/user/');

  // Check URL parameters for city filter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cityId = searchParams.get('city');
    const categoryId = searchParams.get('category');

    if (cityId) {
      setCityFilter(cityId);
      setPage("city");
    } else if (categoryId) {
      setCategoryFilter(categoryId);
      setPage("category");
    } else if (location.pathname === '/') {
      setPage("explore");
      setCityFilter("all");
      setCategoryFilter("all");
    }
  }, [location]);

  const handleCityChange = (cityId) => {
    setCityFilter(cityId);
    setCategoryFilter("all");
    if (cityId !== "all") {
      setPage("city");
      navigate(`/?city=${cityId}`);
    } else {
      setPage("explore");
      navigate("/");
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCategoryFilter(categoryId);
    setCityFilter("all");
    if (categoryId !== "all") {
      setPage("category");
      navigate(`/?category=${categoryId}`);
    } else {
      setPage("explore");
      navigate("/");
    }
  };

  const handleNavigateToUser = (userId) => {
    navigate(`/user/${userId}`);
    setPage("profile");
  };

  const handleProfileClick = () => {
    if (user) {
      navigate(`/user/${user.id}`);
      setPage("profile");
    }
  };

  const handleExploreClick = () => {
    setPage("explore");
    setCityFilter("all");
    setCategoryFilter("all");
    navigate("/");
  };

  const handleAdminClick = () => {
    setPage("admin");
    navigate("/admin");
  };

  return (
    <>
      <style>{css}</style>
      <NavBar
        page={page}
        setPage={setPage}
        cityFilter={cityFilter}
        setCityFilter={handleCityChange}
        categoryFilter={categoryFilter}
        setCategoryFilter={handleCategoryChange}
        onAuthClick={() => setShowAuthModal(true)}
        onProfileClick={handleProfileClick}
        onExploreClick={handleExploreClick}
        onAdminClick={handleAdminClick}
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
            navigate("/");
          }}
        />
      )}

      {!isUserProfile && page === "admin" && <AdminDashboard />}

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
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <MessageProvider>
            <Router>
              <Routes>
                <Route path="/*" element={<AppContent />} />
                <Route path="/user/:userId" element={<AppContent />} />
                <Route path="/messages/:userId?" element={<MessagesPage />} />
                <Route path="/profile/:userId?" element={<UserProfilePage />} />
              </Routes>
            </Router>
          </MessageProvider>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}