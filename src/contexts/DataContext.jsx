import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within DataProvider");
    return context;
}

export function DataProvider({ children }) {
    const { token, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userPosts, setUserPosts] = useState([]);

    const fetchCities = useCallback(async () => {
        try {
            const data = await api.get("/cities");
            setCities(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching cities:", err);
            setCities([]);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await api.get("/categories");
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setCategories([]);
        }
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const data = await api.get("/posts");
            const postsData = data?.data || data || [];
            setPosts(Array.isArray(postsData) ? postsData : []);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setPosts([]);
        }
    }, []);

    // IMPORTANT: Fix this function to properly fetch user posts
    const fetchUserPosts = useCallback(async (userId) => {
        if (!userId) {
            console.log("No userId provided to fetchUserPosts");
            return [];
        }

        try {
            console.log("🔄 Fetching posts for user:", userId);
            const data = await api.get(`/users/${userId}/posts`);
            console.log("📦 Raw user posts data:", data);

            let postsData = [];

            // Your backend returns: { success: true, posts: { data: [...] } }
            // The posts are inside posts.data because of pagination
            if (data && data.success && data.posts) {
                // If posts is paginated with Laravel's pagination
                if (data.posts && data.posts.data && Array.isArray(data.posts.data)) {
                    postsData = data.posts.data;
                    console.log("✅ Found posts in posts.data:", postsData.length);
                }
                // If posts is an array directly
                else if (Array.isArray(data.posts)) {
                    postsData = data.posts;
                    console.log("✅ Found posts directly in posts:", postsData.length);
                }
            }
            // Fallback: try to find any array in the response
            else if (data && typeof data === 'object') {
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        postsData = data[key];
                        console.log(`✅ Found posts array in property: ${key}`);
                        break;
                    }
                }
            }

            console.log("✅ Processed user posts:", postsData);
            console.log("📊 Posts count:", postsData.length);

            setUserPosts(Array.isArray(postsData) ? postsData : []);
            return Array.isArray(postsData) ? postsData : [];
        } catch (err) {
            console.error("❌ Error fetching user posts:", err);
            setUserPosts([]);
            return [];
        }
    }, []);

    const fetchUserStats = useCallback(async (userId) => {
        if (!userId) return null;
        try {
            const data = await api.get(`/users/${userId}/profile`);
            console.log("📊 Stats response:", data);

            // Your backend returns: { success: true, user: { ... } }
            if (data && data.success && data.user) {
                const userData = data.user;
                return {
                    followers_count: userData.followers_count || 0,
                    following_count: userData.following_count || 0,
                    posts_count: userData.posts_count || 0
                };
            }
            return null;
        } catch (err) {
            console.error("Error fetching user stats:", err);
            return null;
        }
    }, []);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchCities(),
                fetchCategories(),
                fetchPosts()
            ]);

            if (user?.id) {
                console.log("Loading user posts for:", user.id);
                await fetchUserPosts(user.id);
            }
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Failed to load some data. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    }, [fetchCities, fetchCategories, fetchPosts, fetchUserPosts, user]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    useEffect(() => {
        if (user?.id) {
            console.log("User changed, fetching posts for:", user.id);
            fetchUserPosts(user.id);
        }
    }, [user, fetchUserPosts]);

    const createPost = async (postData) => {
        const formData = new FormData();
        formData.append("city_id", postData.city_id);
        formData.append("category_id", postData.category_id);
        formData.append("content", postData.content);
        if (postData.media) {
            postData.media.forEach(file => formData.append("media[]", file));
        }

        try {
            console.log("Creating post with data:", postData);
            const data = await api.authPostFormData("/posts", formData, token);
            console.log("Create post response:", data);

            const newPost = data?.data ?? data?.post ?? data;
            if (newPost?.id) {
                // Add to all posts
                setPosts(prev => {
                    const prevArray = Array.isArray(prev) ? prev : [];
                    return [newPost, ...prevArray];
                });

                // Add to user posts if it belongs to current user
                if (newPost.user_id === user?.id || newPost.user?.id === user?.id) {
                    setUserPosts(prev => {
                        const prevArray = Array.isArray(prev) ? prev : [];
                        return [newPost, ...prevArray];
                    });
                    console.log("Added post to userPosts");
                }

                return { success: true, data: newPost };
            } else {
                await fetchPosts();
                if (user?.id) {
                    await fetchUserPosts(user.id);
                }
                return { success: true };
            }
        } catch (error) {
            console.error("Error creating post:", error);
            return { success: false, error: error.message || "Failed to create post" };
        }
    };

    const deletePost = async (postId) => {
        try {
            await api.authDelete(`/posts/${postId}`, token);
            setPosts(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.filter(p => p.id !== postId);
            });
            setUserPosts(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.filter(p => p.id !== postId);
            });
            return { success: true };
        } catch (error) {
            console.error("Error deleting post:", error);
            return { success: false, error: error.message || "Failed to delete post" };
        }
    };

    const likePost = async (postId) => {
        try {
            const data = await api.authPost(`/posts/${postId}/like`, {}, token);
            const updatePost = (post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes_count: data?.likes_count ?? (post.likes_count || 0) + (data?.liked ? 1 : -1),
                        liked: data?.liked ?? !post.liked
                    };
                }
                return post;
            };

            setPosts(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.map(updatePost);
            });
            setUserPosts(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.map(updatePost);
            });
            return { success: true };
        } catch (error) {
            console.error("Error liking post:", error);
            return { success: false, error: error.message || "Failed to like post" };
        }
    };

    const commentOnPost = async (postId, content) => {
        try {
            const data = await api.authPost(`/posts/${postId}/comment`, { content }, token);
            const newComment = data?.data ?? data?.comment ?? data;

            const updatePost = (post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...(post.comments || []), newComment],
                        comments_count: (post.comments_count || 0) + 1
                    };
                }
                return post;
            };

            setPosts(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.map(updatePost);
            });
            setUserPosts(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return prevArray.map(updatePost);
            });
            return { success: true, data: newComment };
        } catch (error) {
            console.error("Error commenting on post:", error);
            return { success: false, error: error.message || "Failed to post comment" };
        }
    };

    const updateUserProfile = async (data) => {
        try {
            const response = await api.authPut("/user/profile", data, token);
            console.log("📝 Profile update response:", response);

            // Your backend returns: { success: true, message: "...", user: {...} }
            if (response && response.success) {
                return response;
            }
            return { success: false, message: response?.message || "Failed to update profile" };
        } catch (error) {
            console.error("Error updating profile:", error);
            return { success: false, error: error.message };
        }
    };

    const uploadAvatar = async (file) => {
        try {
            const formData = new FormData();
            formData.append("avatar", file);
            const response = await api.authPostFormData("/user/avatar", formData, token);
            console.log("🖼️ Avatar upload response:", response);

            // Your backend returns: { success: true, message: "...", avatar_url: "..." }
            if (response && response.success) {
                return response;
            }
            return { success: false, message: response?.message || "Failed to upload avatar" };
        } catch (error) {
            console.error("Error uploading avatar:", error);
            return { success: false, error: error.message };
        }
    };
    const uploadCover = async (file) => {
        try {
            const formData = new FormData();
            formData.append("cover_image", file); // Note: the field name is 'cover_image'
            const response = await api.authPostFormData("/user/cover", formData, token);
            console.log("🖼️ Cover upload response:", response);

            // Your backend returns: { success: true, message: "...", cover_url: "..." }
            if (response && response.success) {
                return response;
            }
            return { success: false, message: response?.message || "Failed to upload cover" };
        } catch (error) {
            console.error("Error uploading cover:", error);
            return { success: false, error: error.message };
        }
    };
    const getCurrentUser = async () => {
        try {
            const data = await api.authGet("/user", token);
            console.log("Current user response:", data);

            // Your backend returns: { success: true, user: { ... } }
            if (data && data.success && data.user) {
                return data.user;
            }
            return data || null;
        } catch (error) {
            console.error("Error fetching current user:", error);
            return null;
        }
    };

    return (
        <DataContext.Provider value={{
            posts: Array.isArray(posts) ? posts : [],
            userPosts: Array.isArray(userPosts) ? userPosts : [],
            cities: Array.isArray(cities) ? cities : [],
            categories: Array.isArray(categories) ? categories : [],
            loading,
            error,
            createPost,
            deletePost,
            likePost,
            commentOnPost,
            refreshPosts: fetchPosts,
            refreshUserPosts: fetchUserPosts,
            fetchUserStats,
            updateUserProfile,
            uploadAvatar,
            uploadCover,
            getCurrentUser
        }}>
            {children}
        </DataContext.Provider>
    );
}