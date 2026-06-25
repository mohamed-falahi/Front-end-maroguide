import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { PostCard } from "./PostCard";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = "http://127.0.0.1:8000";

export function CityPage({ cityId }) {
    const { cities } = useData();
    const { user, token } = useAuth();
    const city = cities.find(c => c.id == cityId);
    const [filter, setFilter] = useState("All Posts");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        if (path.startsWith('/storage/')) {
            return `${API_BASE_URL}${path}`;
        }
        return `${API_BASE_URL}/storage/${path}`;
    };

    const FILTERS = ["All Posts", "food", "beach", "museum", "culture", "show", "nature"];

    const getCategoryId = (filterName) => {
        const categoryMap = {
            "All Posts": null,
            "food": 1,
            "beach": 2,
            "museum": 3,
            "culture": 4,
            "show": 5,
            "nature": 6
        };
        return categoryMap[filterName];
    };

    useEffect(() => {
        if (cityId) {
            fetchPosts();
        }
    }, [cityId, filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const categoryId = getCategoryId(filter);
            let url = `/posts?city_id=${cityId}`;
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }

            const data = await api.get(url);
            const postsData = data.data || data.posts || data;
            setPosts(Array.isArray(postsData) ? postsData : []);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            if (response && response.success === true && response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error("Error fetching comments:", error);
            return [];
        }
    };

    const handleLike = async (postId) => {
        if (!token) {
            alert("Please login to like posts");
            return { success: false };
        }

        try {
            await api.authPost(`/posts/${postId}/like`, {}, token);
            return { success: true };
        } catch (error) {
            console.error("Error liking post:", error);
            return { success: false };
        }
    };

    const handleComment = async (postId, commentText) => {
        if (!token) {
            alert("Please login to comment");
            return { success: false };
        }

        try {
            await api.authPost(`/posts/${postId}/comment`, {
                content: commentText
            }, token);
            return { success: true };
        } catch (error) {
            console.error("Error posting comment:", error);
            return { success: false };
        }
    };

    const handleDelete = async (postId) => {
        if (!user || user.id !== posts.find(p => p.id === postId)?.user_id) {
            alert("You can only delete your own posts");
            return;
        }

        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await api.authDelete(`/posts/${postId}`, token);
                setPosts(posts.filter(p => p.id !== postId));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            }
        }
    };

    const cityImage = city?.image ? getImageUrl(city.image) : null;

    // SVG Icons
    const Icons = {
        Users: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        Star: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        Location: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
        Landmark: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        Garden: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
            </svg>
        ),
        Mosque: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <path d="M7 17l5 2.5 5-2.5" />
            </svg>
        ),
        Balloon: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M12 14v6" />
                <path d="M8 20h8" />
            </svg>
        ),
        Spa: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M10 10h4" />
            </svg>
        ),
        Camel: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14h16" />
                <path d="M8 10v4" />
                <path d="M16 10v4" />
                <path d="M6 18h12" />
                <path d="M8 18l-2 4" />
                <path d="M16 18l2 4" />
                <path d="M12 4v6" />
                <path d="M8 8h8" />
            </svg>
        ),
        Tea: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6h12v10a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V6z" />
                <path d="M18 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
                <line x1="8" y1="4" x2="16" y2="4" />
            </svg>
        ),
        Camera: () => (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),
    };

    return (
        <>
            <style>{`
                .city-page-cover {
                    position: relative;
                    height: 320px;
                    overflow: hidden;
                    background: #1a1a1a;
                }

                .city-page-cover img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }

                .city-page-cover:hover img {
                    transform: scale(1.05);
                }

                .city-page-cover .overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 100%);
                }

                .city-page-cover .content {
                    position: absolute;
                    bottom: 40px;
                    left: 48px;
                    color: white;
                    z-index: 2;
                }

                .city-page-cover .city-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 48px;
                    font-weight: 700;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }

                .city-page-cover .city-stats {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    font-size: 14px;
                }

                .city-page-cover .city-stats span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(8px);
                    padding: 6px 16px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .city-page-cover .city-stats svg {
                    stroke: rgba(255,255,255,0.8);
                }

                .city-page-layout {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 24px 16px;
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 24px;
                }

                .filter-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .filter-tab {
                    padding: 8px 20px;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    background: var(--surface);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-tab:hover {
                    background: var(--sand);
                    border-color: var(--primary);
                }

                .filter-tab.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .posts-masonry {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .posts-masonry .post-card {
                    margin-bottom: 0;
                }

                .side-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 16px;
                }

                .side-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .exp-card {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--sand);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    gap: 12px;
                }

                .exp-card:hover {
                    background: var(--primary-light);
                    transform: translateX(4px);
                }

                .exp-card .exp-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: var(--surface);
                    border-radius: 8px;
                    flex-shrink: 0;
                    color: var(--primary);
                }

                .exp-card .exp-icon svg {
                    stroke: var(--primary);
                }

                .exp-card .exp-info {
                    flex: 1;
                }

                .exp-card .exp-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text);
                }

                .exp-card .exp-sub {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .view-more-btn {
                    display: block;
                    width: 100%;
                    text-align: center;
                    padding: 10px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text);
                    background: none;
                    cursor: pointer;
                    margin-top: 4px;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                    font-family: 'DM Sans', sans-serif;
                }

                .view-more-btn:hover {
                    background: var(--sand);
                    border-color: var(--primary);
                }

                .loading-state {
                    text-align: center;
                    padding: 60px;
                    color: var(--text-muted);
                    font-size: 16px;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--surface);
                    border-radius: 16px;
                    border: 1px solid var(--border);
                }

                .empty-state .empty-icon {
                    color: var(--text-muted);
                    margin-bottom: 12px;
                }

                .empty-state .empty-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 4px;
                }

                .empty-state .empty-sub {
                    color: var(--text-muted);
                    font-size: 14px;
                }

                .spot-rating {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #f59e0b;
                    font-size: 12px;
                }

                .spot-rating svg {
                    fill: #f59e0b;
                    stroke: #f59e0b;
                    width: 14px;
                    height: 14px;
                }

                @media (max-width: 768px) {
                    .city-page-cover {
                        height: 220px;
                    }

                    .city-page-cover .city-name {
                        font-size: 28px;
                    }

                    .city-page-cover .content {
                        left: 20px;
                        bottom: 20px;
                    }

                    .city-page-cover .city-stats {
                        gap: 8px;
                    }

                    .city-page-cover .city-stats span {
                        font-size: 12px;
                        padding: 4px 12px;
                    }

                    .city-page-layout {
                        grid-template-columns: 1fr;
                        padding: 16px;
                    }

                    .posts-masonry {
                        grid-template-columns: 1fr;
                    }

                    .filter-tabs {
                        gap: 6px;
                    }

                    .filter-tab {
                        padding: 6px 14px;
                        font-size: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .city-page-cover .city-name {
                        font-size: 22px;
                    }
                }
            `}</style>

            <div className="city-page-cover">
                <img
                    src={cityImage || "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80"}
                    alt={city?.name || "City"}
                />
                <div className="overlay" />
                <div className="content">
                    <div className="city-name">{city?.name || "City"}</div>
                    <div className="city-stats">
                        <span>
                            <Icons.Users />
                            {city?.visitors_count || "4.2k"} Visitors
                        </span>
                        <span>
                            <Icons.Star />
                            {city?.rating || "4.8"} Rating
                        </span>
                        {city?.region && (
                            <span>
                                <Icons.Location />
                                {city.region}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="city-page-layout">
                <div>
                    <div className="filter-tabs">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                className={`filter-tab ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === "All Posts" ? "All Posts" : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <Icons.Camera />
                            </div>
                            <div className="empty-title">No posts yet</div>
                            <div className="empty-sub">
                                {filter === "All Posts"
                                    ? `Be the first to share your experience in ${city?.name || "this city"}!`
                                    : `No ${filter} posts in ${city?.name} yet.`}
                            </div>
                        </div>
                    ) : (
                        <div className="posts-masonry">
                            {posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={handleLike}
                                    onComment={handleComment}
                                    onDelete={handleDelete}
                                    onFetchComments={fetchComments}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="side-card">
                        <div className="side-title">
                            <Icons.Landmark />
                            Top Rated Spots
                        </div>
                        {[
                            { name: "Jemaa el-Fnaa", desc: "4.8 (240 reviews)", icon: <Icons.Landmark /> },
                            { name: "Bahia Palace", desc: "4.7 (180 reviews)", icon: <Icons.Landmark /> },
                            { name: "Majorelle Garden", desc: "4.6 (320 reviews)", icon: <Icons.Garden /> },
                            { name: "Koutoubia Mosque", desc: "4.9 (150 reviews)", icon: <Icons.Mosque /> }
                        ].map((spot, i) => (
                            <div key={spot.name} className="exp-card">
                                <div className="exp-icon">{spot.icon}</div>
                                <div className="exp-info">
                                    <div className="exp-name">{spot.name}</div>
                                    <div className="spot-rating">
                                        <Icons.Star />
                                        {spot.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="view-more-btn">View All Spots</button>
                    </div>

                    <div className="side-card">
                        <div className="side-title">
                            <Icons.Camel />
                            Must-Try Experiences
                        </div>
                        {[
                            { name: "Hot Air Balloon", desc: "Atlas Mountain views", icon: <Icons.Balloon /> },
                            { name: "Traditional Hammam", desc: "Moroccan spa ritual", icon: <Icons.Spa /> },
                            { name: "Camel Trekking", desc: "Desert adventure", icon: <Icons.Camel /> },
                            { name: "Tea Ceremony", desc: "Authentic mint tea", icon: <Icons.Tea /> }
                        ].map(exp => (
                            <div key={exp.name} className="exp-card">
                                <div className="exp-icon">{exp.icon}</div>
                                <div className="exp-info">
                                    <div className="exp-name">{exp.name}</div>
                                    <div className="exp-sub">{exp.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}