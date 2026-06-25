import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { CreatePostCard } from "./CreatePostCard";
import { PostCard } from "./PostCard";
import { Sidebar } from "./Sidebar";
import { api } from "../services/api";

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

export function ExplorePage({ cityFilter, onOpenModal, onUserClick }) {
    const { posts, loading, likePost, deletePost, createPost } = useData();
    const { user, token } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();
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
            showWarning("Please login to comment");
            return { success: false };
        }

        try {
            const response = await api.authPost(`/posts/${postId}/comment`, {
                content: commentText
            }, token);

            setLocalPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, comments_count: (post.comments_count || 0) + 1 }
                        : post
                )
            );

            showSuccess("Comment added!");
            return { success: true, data: response.data || response.comment };
        } catch (error) {
            console.error("Error posting comment:", error);
            showError("Failed to add comment");
            return { success: false };
        }
    };

    // Handle like
    const handleLike = async (postId) => {
        if (!token) {
            showWarning("Please login to like posts");
            return { success: false };
        }

        try {
            const result = await likePost(postId);

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
            showError("Failed to like post");
            return { success: false };
        }
    };

    // Handle delete - Just call the delete function, PostCard handles the modal
    const handleDelete = async (postId) => {
        try {
            await deletePost(postId);
            setLocalPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            showSuccess("Post deleted!");
        } catch (error) {
            console.error("Error deleting post:", error);
            showError("Failed to delete post");
        }
    };

    // Handle creating a new post
    const handleCreatePost = async (postData) => {
        try {
            const result = await createPost(postData);
            if (result && result.success && result.post) {
                showSuccess("Post created successfully!");

                const newPost = {
                    ...result.post,
                    user: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar || null,
                        profile_image: user.profile_image || null,
                    },
                    user_id: user.id,
                    city: result.post.city || { name: 'Unknown Location' },
                    media: result.post.media || [],
                    likes_count: 0,
                    comments_count: 0,
                    is_liked: false,
                    created_at: new Date().toISOString(),
                };

                setLocalPosts(prev => [newPost, ...prev]);
                return result;
            } else {
                showError(result?.message || "Failed to create post");
                return result;
            }
        } catch (error) {
            console.error("Error creating post:", error);
            showError("Failed to create post");
            return { success: false };
        }
    };

    // Update local posts when context posts change
    useEffect(() => {
        if (posts && posts.length > 0) {
            const processedPosts = posts.map(post => {
                let userData = post.user || post.author || {};
                if (typeof userData === 'number' || typeof userData === 'string') {
                    userData = { id: userData, name: 'User ' + userData };
                }
                if (!userData.name) {
                    userData.name = 'Anonymous User';
                }

                let mediaUrls = [];
                if (post.media && post.media.length > 0) {
                    mediaUrls = post.media.map(m => {
                        if (typeof m === 'string') return getImageUrl(m);
                        if (m.path) return getImageUrl(m.path);
                        if (m.url) return getImageUrl(m.url);
                        return null;
                    }).filter(Boolean);
                }

                if (post.image && !mediaUrls.length) {
                    mediaUrls = [getImageUrl(post.image)];
                }
                if (post.image_url && !mediaUrls.length) {
                    mediaUrls = [getImageUrl(post.image_url)];
                }

                return {
                    ...post,
                    user: {
                        ...userData,
                        avatar: userData.avatar ? getImageUrl(userData.avatar) : null,
                        profile_image: userData.profile_image ? getImageUrl(userData.profile_image) : null,
                    },
                    media: mediaUrls,
                    media_raw: post.media || post.images || [],
                    city: post.city || { name: 'Unknown Location' },
                    likes_count: post.likes_count || post.likes || 0,
                    comments_count: post.comments_count || post.comments || 0,
                    is_liked: post.is_liked || post.liked || false,
                };
            });
            setLocalPosts(processedPosts);
        } else {
            setLocalPosts([]);
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
                {user && <CreatePostCard onOpenModal={() => onOpenModal(handleCreatePost)} />}
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

export default ExplorePage;