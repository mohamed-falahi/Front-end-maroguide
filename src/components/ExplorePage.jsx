import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { CreatePostCard } from "./CreatePostCard";
import { PostCard } from "./PostCard";
import { Sidebar } from "./Sidebar";
import { api } from "../services/api";

// Add API base URL and helper function
const API_BASE_URL = "http://127.0.0.1:8000";

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

export function ExplorePage({ cityFilter, onOpenModal }) {
    const { posts, loading, likePost, deletePost } = useData();
    const { user, token } = useAuth();
    const [localPosts, setLocalPosts] = useState([]);
    const [localLoading, setLocalLoading] = useState(true);

    // Fetch comments for a specific post
    const fetchComments = async (postId) => {
        try {
            console.log("Fetching comments for explore post:", postId);
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

    // Handle comment submission
    const handleComment = async (postId, commentText) => {
        if (!token) {
            alert("Please login to comment");
            return { success: false };
        }

        try {
            const response = await api.authPost(`/posts/${postId}/comment`, {
                content: commentText
            }, token);

            // Update the post's comment count in local state
            setLocalPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, comments_count: (post.comments_count || 0) + 1 }
                        : post
                )
            );

            return { success: true, data: response.data || response.comment };
        } catch (error) {
            console.error("Error posting comment:", error);
            return { success: false };
        }
    };

    // Handle like
    const handleLike = async (postId) => {
        if (!token) {
            alert("Please login to like posts");
            return { success: false };
        }

        try {
            const result = await likePost(postId);

            // Update local state to reflect like
            setLocalPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            likes_count: (post.likes_count || 0) + 1,
                            is_liked: true,
                            liked: true
                        }
                        : post
                )
            );

            return result;
        } catch (error) {
            console.error("Error liking post:", error);
            return { success: false };
        }
    };

    // Handle delete
    const handleDelete = async (postId) => {
        if (!user) {
            alert("Please login to delete posts");
            return;
        }

        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deletePost(postId);
                setLocalPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            }
        }
    };

    // Update local posts when context posts change
    useEffect(() => {
        if (posts && posts.length > 0) {
            // Process posts to ensure media URLs are correct
            const processedPosts = posts.map(post => ({
                ...post,
                media: post.media && post.media.length > 0
                    ? post.media.map(m => getImageUrl(m))
                    : [],
                // If media is stored as JSON string, parse it
                media_raw: post.media_raw || post.media,
                user: post.user ? {
                    ...post.user,
                    avatar: post.user.avatar ? getImageUrl(post.user.avatar) : null
                } : null,
                city: post.city || null
            }));
            setLocalPosts(processedPosts);
        }
        setLocalLoading(loading.posts === undefined ? loading : false);
    }, [posts, loading]);

    const filteredPosts = cityFilter === "all"
        ? localPosts
        : localPosts.filter(p => p.city_id === parseInt(cityFilter) || p.city_id == cityFilter);

    const cityName = (cityFilter !== "all" && filteredPosts[0]?.city?.name) || "";

    if (localLoading) {
        return <div style={{ textAlign: "center", padding: "40px" }}>Loading posts...</div>;
    }

    return (
        <div className="page-layout">
            <div className="main-col">
                {cityFilter !== "all" && cityName && (
                    <div style={{ marginBottom: "12px", padding: "10px 14px", background: "var(--primary-light)", borderRadius: "10px", fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                        📍 Showing posts from {cityName}
                    </div>
                )}
                {user && <CreatePostCard onOpenModal={onOpenModal} />}
                {filteredPosts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        No posts found. Be the first to share! 📸
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={handleLike}
                            onComment={handleComment}
                            onDelete={handleDelete}
                            onFetchComments={fetchComments}
                        />
                    ))
                )}
            </div>
            <Sidebar />
        </div>
    );
}