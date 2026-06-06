import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { PostCard } from "./PostCard";
import { Sidebar } from "./Sidebar";

export function CategoryPage({ categoryId, onBack }) {
    const { posts, categories, likePost, commentOnPost, deletePost } = useData();
    const [filter, setFilter] = useState("all");

    const category = categories.find(c => c.id == categoryId);

    // Filter posts by category
    const filteredPosts = posts.filter(post => post.category_id == categoryId);

    // Get unique categories for filter tabs
    const uniqueCategories = categories || [];

    return (
        <div className="page-layout">
            <div className="main-col">
                {/* Back button */}
                <button
                    onClick={onBack}
                    style={{
                        marginBottom: "16px",
                        padding: "8px 16px",
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "20px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        color: "var(--text)"
                    }}
                >
                    ← Back to Explore
                </button>

                {/* Category header */}
                <div style={{
                    marginBottom: "20px",
                    padding: "16px",
                    background: "var(--primary-light)",
                    borderRadius: "16px",
                    border: "1px solid var(--border)"
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--primary)",
                        marginBottom: "8px",
                        fontSize: "24px"
                    }}>
                        #{category?.name}
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"} in this category
                    </p>
                </div>

                {/* Posts */}
                {filteredPosts.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "var(--text-muted)",
                        background: "var(--bg-card)",
                        borderRadius: "16px",
                        border: "1px solid var(--border)"
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
                        <h3 style={{ marginBottom: "8px" }}>No posts yet</h3>
                        <p>Be the first to share a {category?.name} experience in Morocco!</p>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={likePost}
                            onComment={commentOnPost}
                            onDelete={deletePost}
                        />
                    ))
                )}
            </div>
            <Sidebar />
        </div>
    );
}