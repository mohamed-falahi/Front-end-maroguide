import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { PostCard } from "./PostCard";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function CityPage({ cityId }) {
    const { cities } = useData();
    const { user, token } = useAuth();
    const city = cities.find(c => c.id == cityId);
    const [filter, setFilter] = useState("All Posts");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // THIS FUNCTION MUST EXIST
    const fetchComments = async (postId) => {
        try {
            console.log("Fetching comments for post ID:", postId);
            const response = await api.get(`/posts/${postId}/comments`);
            console.log("API Response:", response);

            if (response && response.success === true && response.data) {
                console.log("Found comments:", response.data.length);
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

    return (
        <div>
            <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                <img
                    src={city?.image_url || "/api/placeholder/1200/400"}
                    alt={city?.name || "City"}
                    className="city-cover"
                    style={{ filter: "brightness(0.85)", width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", bottom: "20px", left: "24px", color: "white" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px", fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                        {city?.name || "City"}
                    </div>
                    <div style={{ display: "flex", gap: "20px", marginTop: "6px", fontSize: "13px", opacity: .9 }}>
                        <span>👥 {city?.visitors_count || "4.2k"} Visitors</span>
                        <span>⭐ {city?.rating || "4.8"} Rating</span>
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
                                {f === "All Posts" ? "All Posts" : f}
                            </button>
                        ))}
                    </div>

                    <div className="posts-masonry">
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                Loading posts...
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                No posts yet for {filter === "All Posts" ? "this city" : filter} in {city?.name}
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={handleLike}
                                    onComment={handleComment}
                                    onDelete={handleDelete}
                                    onFetchComments={fetchComments}  // MAKE SURE THIS LINE EXISTS
                                />
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <div className="side-card">
                        <div className="side-title">Top Rated Spots</div>
                        <button
                            className="view-more-link"
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "center",
                                padding: "8px",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                color: "var(--text)",
                                background: "none",
                                cursor: "pointer",
                                marginTop: "4px",
                                fontSize: "12px",
                                fontWeight: 500
                            }}
                        >
                            View All Spots
                        </button>
                    </div>

                    <div className="side-card">
                        <div className="side-title">Must-Try Experiences</div>
                        {["Hot Air Balloon", "Traditional Hammam", "Camel Trekking", "Tea Ceremony"].map(exp => (
                            <div key={exp} className="exp-card">
                                <div>
                                    <div className="exp-name">{exp}</div>
                                    <div className="exp-sub">Atlas Mountain views</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}