import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { MOCK_CITIES } from "../constants/mockData";
import { useLocation, useNavigate } from "react-router-dom";

export function NavBar({
    page,
    setPage,
    cityFilter,
    setCityFilter,
    categoryFilter,
    setCategoryFilter,
    onAuthClick,
    onProfileClick,
    onExploreClick,
    onAdminClick
}) {
    const { user, logout } = useAuth();
    const { cities, categories } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [cityOpen, setCityOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const cityList = [{ id: "all", name: "All Cities" }, ...(cities.length ? cities : MOCK_CITIES)];
    const categoryList = [{ id: "all", name: "All Categories" }, ...(categories.length ? categories : [])];

    // Check if we're on a user profile page
    const isUserProfile = location.pathname.startsWith('/user/');
    const isProfilePage = page === "profile" || isUserProfile;

    const handleCitySelect = (cityId) => {
        setCityFilter(cityId);
        setCityOpen(false);
        if (cityId !== "all") {
            setPage("city");
        } else if (categoryFilter === "all") {
            setPage("explore");
        }
    };

    const handleCategorySelect = (categoryId) => {
        setCategoryFilter(categoryId);
        setCategoryOpen(false);
        if (categoryId !== "all") {
            setPage("category");
        } else if (cityFilter === "all") {
            setPage("explore");
        }
    };

    const handleProfileClick = () => {
        if (onProfileClick) {
            onProfileClick();
        } else if (user) {
            setPage("profile");
        }
    };

    const handleExploreClick = () => {
        if (onExploreClick) {
            onExploreClick();
        } else {
            setPage("explore");
            setCityFilter("all");
            setCategoryFilter("all");
        }
    };

    const handleAdminClick = () => {
        if (onAdminClick) {
            onAdminClick();
        } else {
            setPage("admin");
        }
    };

    const handleMessagesClick = () => {
        navigate('/messages');
    };

    return (
        <nav className="navbar">
            <div className="logo-section" onClick={handleExploreClick}>
                <img src="/image/logo.png" alt="Maroguide" className="logo-image" />
            </div>

            <div className="search-container">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Discover Morocco..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="nav-links">
                <button
                    className={`nav-link ${page === "explore" ? "active" : ""}`}
                    onClick={handleExploreClick}
                >
                    Explore
                </button>

                {user && (
                    <button
                        className={`nav-link ${isProfilePage ? "active" : ""}`}
                        onClick={handleProfileClick}
                    >
                        Profile
                    </button>
                )}

                {/* Admin Link - Only visible to admin users */}
                {user?.role === 'admin' && (
                    <button
                        className={`nav-link ${page === "admin" ? "active" : ""}`}
                        onClick={handleAdminClick}
                    >
                        Admin
                    </button>
                )}

                {/* City Dropdown */}
                <div className="dropdown-wrapper">
                    <button
                        className={`dropdown-btn ${cityFilter !== "all" ? "active-filter" : ""}`}
                        onClick={() => setCityOpen(!cityOpen)}
                    >
                        <svg className="dropdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{cityList.find(c => c.id === cityFilter)?.name || "All Cities"}</span>
                        <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6"></path>
                        </svg>
                    </button>

                    {cityOpen && (
                        <div className="dropdown-menu">
                            {cityList.map(city => (
                                <button
                                    key={city.id}
                                    className={`dropdown-item ${cityFilter === city.id ? "selected" : ""}`}
                                    onClick={() => handleCitySelect(city.id)}
                                >
                                    {city.name}
                                    {cityFilter === city.id && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5"></path>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Dropdown */}
                {categories.length > 0 && (
                    <div className="dropdown-wrapper">
                        <button
                            className={`dropdown-btn ${categoryFilter !== "all" ? "active-filter" : ""}`}
                            onClick={() => setCategoryOpen(!categoryOpen)}
                        >
                            <svg className="dropdown-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="8" height="8" rx="2"></rect>
                                <rect x="13" y="3" width="8" height="8" rx="2"></rect>
                                <rect x="3" y="13" width="8" height="8" rx="2"></rect>
                                <rect x="13" y="13" width="8" height="8" rx="2"></rect>
                            </svg>
                            <span>{categoryList.find(c => c.id === categoryFilter)?.name || "All Categories"}</span>
                            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6"></path>
                            </svg>
                        </button>

                        {categoryOpen && (
                            <div className="dropdown-menu">
                                {categoryList.map(category => (
                                    <button
                                        key={category.id}
                                        className={`dropdown-item ${categoryFilter === category.id ? "selected" : ""}`}
                                        onClick={() => handleCategorySelect(category.id)}
                                    >
                                        {category.name}
                                        {categoryFilter === category.id && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 6L9 17l-5-5"></path>
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="user-section">
                {user ? (
                    <>
                        {/* Messages Button */}
                        <button
                            className="icon-button messages-btn"
                            onClick={handleMessagesClick}
                            aria-label="Messages"
                            title="Messages"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>

                        <span className="user-name">{user.name}</span>

                        <button className="icon-button" onClick={logout} aria-label="Logout" title="Logout">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </>
                ) : (
                    <button className="login-btn" onClick={onAuthClick}>
                        Sign In
                    </button>
                )}
            </div>

            <style jsx>{`
                .navbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #eaeaea;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    gap: 16px;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .logo-image {
                    height: 50px;
                    width: auto;
                }

                .search-container {
                    flex: 1;
                    max-width: 400px;
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #8c8c8c;
                }

                .search-input {
                    width: 100%;
                    padding: 10px 16px 10px 42px;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    background: #fafafa;
                    transition: all 0.2s ease;
                    color: #1a1a1a;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #b8860b;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
                }

                .search-input::placeholder {
                    color: #8c8c8c;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .nav-link {
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #4a4a4a;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    white-space: nowrap;
                }

                .nav-link:hover {
                    background: #f5f5f5;
                    color: #1a1a1a;
                }

                .nav-link.active {
                    color: #b8860b;
                    background: rgba(184, 134, 11, 0.1);
                }

                .dropdown-wrapper {
                    position: relative;
                }

                .dropdown-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #4a4a4a;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    white-space: nowrap;
                }

                .dropdown-btn:hover {
                    background: #f5f5f5;
                }

                .dropdown-btn.active-filter {
                    color: #b8860b;
                    background: rgba(184, 134, 11, 0.1);
                }

                .dropdown-icon {
                    color: #8c8c8c;
                }

                .dropdown-arrow {
                    transition: transform 0.2s ease;
                }

                .dropdown-btn:hover .dropdown-arrow {
                    transform: rotate(180deg);
                }

                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    min-width: 200px;
                    background: white;
                    border: 1px solid #eaeaea;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    z-index: 200;
                    animation: dropDown 0.15s ease;
                }

                @keyframes dropDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 10px 16px;
                    font-size: 14px;
                    color: #4a4a4a;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    text-align: left;
                }

                .dropdown-item:hover {
                    background: #fafafa;
                    color: #b8860b;
                }

                .dropdown-item.selected {
                    color: #b8860b;
                    font-weight: 500;
                }

                /* User Section */
                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .messages-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 38px;
                    height: 38px;
                    background: transparent;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #4a4a4a;
                    position: relative;
                }

                .messages-btn:hover {
                    background: #f5f5f5;
                    color: #b8860b;
                }

                .user-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1a1a1a;
                    margin: 0 4px;
                }

                .icon-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #4a4a4a;
                }

                .icon-button:hover {
                    background: #f5f5f5;
                    color: #b8860b;
                }

                .login-btn {
                    padding: 8px 20px;
                    background: #b8860b;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    transition: background 0.2s;
                }

                .login-btn:hover {
                    background: #a0750a;
                }

                @media (max-width: 1024px) {
                    .navbar {
                        padding: 0 20px;
                    }
                    
                    .search-container {
                        max-width: 260px;
                    }
                    
                    .nav-link, .dropdown-btn {
                        padding: 6px 10px;
                        font-size: 13px;
                    }

                    .user-name {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .search-container {
                        display: none;
                    }
                    
                    .nav-links {
                        gap: 2px;
                    }

                    .nav-link, .dropdown-btn {
                        padding: 6px 8px;
                        font-size: 12px;
                    }

                    .dropdown-btn span:not(.dropdown-icon) {
                        display: none;
                    }

                    .user-name {
                        display: none;
                    }
                }
            `}</style>
        </nav>
    );
}