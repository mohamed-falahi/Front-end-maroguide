import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { MOCK_CITIES } from "../constants/mockData";

export function NavBar({
    page,
    setPage,
    cityFilter,
    setCityFilter,
    categoryFilter,
    setCategoryFilter,
    onAuthClick,
    onProfileClick // Add this new prop
}) {
    const { user, logout } = useAuth();
    const { cities, categories } = useData();
    const [cityOpen, setCityOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const cityList = [{ id: "all", name: "All Cities" }, ...(cities.length ? cities : MOCK_CITIES)];
    const categoryList = [{ id: "all", name: "All Categories" }, ...(categories.length ? categories : [])];

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
            // Fallback: if onProfileClick is not provided, navigate to profile page
            setPage("profile");
        }
    };

    return (
        <nav className="navbar">
            <div className="logo-section" onClick={() => {
                setPage("explore");
                setCityFilter("all");
                setCategoryFilter("all");
            }}>
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
                    onClick={() => {
                        setPage("explore");
                        setCityFilter("all");
                        setCategoryFilter("all");
                    }}
                >
                    Explore
                </button>

                {user && (
                    <button
                        className={`nav-link ${page === "profile" ? "active" : ""}`}
                        onClick={handleProfileClick}
                    >
                        Profile
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
                        <span className="user-name">{user.name}</span>
                        <button className="icon-button" onClick={logout} aria-label="Logout">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </>
                ) : (
                    <button className="icon-button" onClick={onAuthClick} aria-label="Login">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
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
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }

                .logo-image {
                    height: 50px;
                    width: auto;
                }

                .logo-text {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                    letter-spacing: -0.3px;
                }

                .search-container {
                    flex: 1;
                    max-width: 400px;
                    position: relative;
                    margin: 0 24px;
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
                }

                .search-input:focus {
                    outline: none;
                    border-color: #b8860b;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 8px;
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
                    gap: 8px;
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
                    z-index: 100;
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

                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .user-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1a1a1a;
                }

                .icon-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: #fafafa;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #4a4a4a;
                }

                .icon-button:hover {
                    background: #f0f0f0;
                    color: #b8860b;
                }

                @media (max-width: 1024px) {
                    .navbar {
                        padding: 0 20px;
                    }
                    
                    .search-container {
                        max-width: 300px;
                    }
                    
                    .nav-link, .dropdown-btn {
                        padding: 6px 12px;
                        font-size: 13px;
                    }
                }

                @media (max-width: 768px) {
                    .search-container {
                        display: none;
                    }
                    
                    .logo-text {
                        display: none;
                    }
                }
            `}</style>
        </nav>
    );
}