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
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCities = useCallback(async () => {
        try {
            const data = await api.get("/cities");
            setCities(data);
        } catch (error) {
            console.error("Failed to fetch cities:", error);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await api.get("/categories");
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const data = await api.get("/posts");
            setPosts(data.data || data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        }
    }, []);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchCities(), fetchCategories(), fetchPosts()]);
        setLoading(false);
    }, [fetchCities, fetchCategories, fetchPosts]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const createPost = async (postData) => {
        const formData = new FormData();
        formData.append("city_id", postData.city_id);
        formData.append("category_id", postData.category_id);
        formData.append("content", postData.content);
        if (postData.media) {
            postData.media.forEach(file => formData.append("media[]", file));
        }

        try {
            const data = await api.authPostFormData("/posts", formData, token);
            if (data.data || data.post) {
                await fetchPosts();
                return { success: true };
            }
            return { success: false, error: data.message };
        } catch (error) {
            return { success: false, error: "Failed to create post" };
        }
    };

    const deletePost = async (postId) => {
        try {
            await api.authDelete(`/posts/${postId}`, token);
            await fetchPosts();
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    };

    const likePost = async (postId) => {
        try {
            await api.authPost(`/posts/${postId}/like`, {}, token);
            await fetchPosts();
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    };

    const commentOnPost = async (postId, content) => {
        try {
            await api.authPost(`/posts/${postId}/comment`, { content }, token);
            await fetchPosts();
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    };

    return (
        <DataContext.Provider value={{
            posts, cities, categories, loading,
            createPost, deletePost, likePost, commentOnPost
        }}>
            {children}
        </DataContext.Provider>
    );
}