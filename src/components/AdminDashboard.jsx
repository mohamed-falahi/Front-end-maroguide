import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { api } from "../services/api";

const API_BASE_URL = "http://127.0.0.1:8000";

// Global cache for admin data
let adminCache = {
    stats: null,
    users: null,
    posts: null,
    cities: null,
    categories: null,
    loaded: false,
    userId: null,
    lastFetch: null
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
    <div className="admin-loading-skeleton">
        <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-user"></div>
        </div>
        <div className="skeleton-tabs">
            <div className="skeleton-tab"></div>
            <div className="skeleton-tab"></div>
            <div className="skeleton-tab"></div>
            <div className="skeleton-tab"></div>
            <div className="skeleton-tab"></div>
        </div>
        <div className="skeleton-stats">
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
        </div>
        <div className="skeleton-chart">
            <div className="skeleton-chart-title"></div>
            <div className="skeleton-chart-bar"></div>
            <div className="skeleton-chart-bar"></div>
            <div className="skeleton-chart-bar"></div>
        </div>
    </div>
);

// Mock data for fallback
const MOCK_DATA = {
    stats: {
        total_users: 0,
        total_posts: 0,
        total_comments: 0,
        total_likes: 0,
        total_messages: 0,
        posts_by_city: [],
        posts_by_category: [],
        users_by_role: [{ role: 'user', total: 0 }],
    },
    users: [],
    posts: [],
    cities: [],
    categories: [],
};

export function AdminDashboard() {
    const { token, user } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(MOCK_DATA.stats);
    const [users, setUsers] = useState(MOCK_DATA.users);
    const [posts, setPosts] = useState(MOCK_DATA.posts);
    const [cities, setCities] = useState(MOCK_DATA.cities);
    const [categories, setCategories] = useState(MOCK_DATA.categories);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState("");
    const [showCityModal, setShowCityModal] = useState(false);
    const [editingCity, setEditingCity] = useState(null);
    const [cityForm, setCityForm] = useState({
        name: '',
        region: '',
    });
    const [cityImageFile, setCityImageFile] = useState(null);
    const [cityImagePreview, setCityImagePreview] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
    });
    const [showUserDeleteModal, setShowUserDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const dataLoadedRef = useRef(false);
    const previousUserId = useRef(null);

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

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.authGet("/admin/stats", token);
            if (response) {
                adminCache.stats = response;
                setStats(response);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [token]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.authGet("/admin/users", token);
            if (response) {
                adminCache.users = response;
                setUsers(response);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, [token]);

    const fetchPosts = useCallback(async () => {
        try {
            const response = await api.authGet("/admin/posts", token);
            if (response) {
                adminCache.posts = response;
                setPosts(response);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }, [token]);

    const fetchCities = useCallback(async () => {
        try {
            const response = await api.authGet("/admin/cities", token);
            if (response && response.success) {
                adminCache.cities = response.data;
                setCities(response.data);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    }, [token]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get("/categories");
            let categoriesData = [];
            if (Array.isArray(response)) {
                categoriesData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                categoriesData = response.data;
            } else if (response && response.success && response.data && Array.isArray(response.data)) {
                categoriesData = response.data;
            }

            if (categoriesData.length > 0) {
                adminCache.categories = categoriesData;
                setCategories(categoriesData);
            } else {
                // Try admin endpoint
                const adminResponse = await api.authGet("/admin/categories", token);
                if (adminResponse && adminResponse.success && adminResponse.data) {
                    adminCache.categories = adminResponse.data;
                    setCategories(adminResponse.data);
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, [token]);

    const loadData = useCallback(async () => {
        const currentUserId = user?.id || null;

        // If no user, clear cache and set loading to false
        if (!user) {
            adminCache.loaded = false;
            adminCache.userId = null;
            setLoading(false);
            return;
        }

        // If user changed, reset cache
        if (adminCache.userId !== currentUserId) {
            console.log('User changed, resetting admin cache');
            adminCache.loaded = false;
            adminCache.userId = currentUserId;
            adminCache.stats = null;
            adminCache.users = null;
            adminCache.posts = null;
            adminCache.cities = null;
            adminCache.categories = null;
        }

        // If cache has data and is recent (within 5 minutes), use it
        const cacheAge = adminCache.lastFetch ? Date.now() - adminCache.lastFetch : Infinity;
        if (adminCache.loaded && adminCache.stats && adminCache.users &&
            cacheAge < 300000) { // 5 minutes cache
            console.log('Using cached admin data');
            setStats(adminCache.stats);
            setUsers(adminCache.users || []);
            setPosts(adminCache.posts || []);
            setCities(adminCache.cities || []);
            setCategories(adminCache.categories || []);
            setLoading(false);
            return;
        }

        // Load fresh data
        console.log('Loading fresh admin data...');
        setLoading(true);

        try {
            const fetchPromises = [
                fetchStats(),
                fetchUsers(),
                fetchPosts(),
                fetchCities(),
                fetchCategories()
            ];

            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Data fetch timed out, showing available data");
                    resolve();
                }, 3000);
            });

            await Promise.race([Promise.all(fetchPromises), timeoutPromise]);

            adminCache.loaded = true;
            adminCache.lastFetch = Date.now();
            adminCache.userId = currentUserId;

        } catch (error) {
            console.error("Error loading admin data:", error);
        } finally {
            setLoading(false);
        }
    }, [user, fetchStats, fetchUsers, fetchPosts, fetchCities, fetchCategories]);

    useEffect(() => {
        loadData();
    }, [loadData, user?.id]);

    const deletePost = async (postId) => {
        try {
            const response = await api.authDelete(`/admin/posts/${postId}`, token);
            if (response && response.success) {
                showSuccess("Post deleted successfully");
                setPosts(prev => prev.filter(p => p.id !== postId));
                adminCache.posts = adminCache.posts?.filter(p => p.id !== postId) || [];
                setShowDeleteModal(false);
                setItemToDelete(null);
                await fetchStats();
                adminCache.stats = stats;
            } else {
                showError(response?.message || "Failed to delete post");
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            showError("An error occurred");
        }
    };

    const deleteCity = async (cityId) => {
        try {
            const response = await api.authDelete(`/admin/cities/${cityId}`, token);
            if (response && response.success) {
                showSuccess("City deleted successfully");
                setCities(prev => prev.filter(c => c.id !== cityId));
                adminCache.cities = adminCache.cities?.filter(c => c.id !== cityId) || [];
                setShowDeleteModal(false);
                setItemToDelete(null);
                await fetchStats();
                await fetchCities();
            } else {
                showError(response?.message || "Failed to delete city");
            }
        } catch (error) {
            console.error("Error deleting city:", error);
            showError("An error occurred");
        }
    };

    const deleteCategory = async (categoryId) => {
        try {
            const response = await api.authDelete(`/admin/categories/${categoryId}`, token);
            if (response && response.success) {
                showSuccess("Category deleted successfully");
                setCategories(prev => prev.filter(c => c.id !== categoryId));
                adminCache.categories = adminCache.categories?.filter(c => c.id !== categoryId) || [];
                setShowDeleteModal(false);
                setItemToDelete(null);
                await fetchStats();
                await fetchCategories();
            } else {
                showError(response?.message || "Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            showError("An error occurred");
        }
    };

    const handleDelete = () => {
        if (deleteType === "post") {
            deletePost(itemToDelete.id);
        } else if (deleteType === "city") {
            deleteCity(itemToDelete.id);
        } else if (deleteType === "category") {
            deleteCategory(itemToDelete.id);
        }
    };

    // City Modal Functions
    const openCityModal = (city = null) => {
        if (city) {
            setEditingCity(city);
            setCityForm({
                name: city.name,
                region: city.region || '',
            });
            if (city.image) {
                setCityImagePreview(getImageUrl(city.image));
            } else {
                setCityImagePreview(null);
            }
            setCityImageFile(null);
        } else {
            setEditingCity(null);
            setCityForm({
                name: '',
                region: '',
            });
            setCityImagePreview(null);
            setCityImageFile(null);
        }
        setShowCityModal(true);
    };

    const closeCityModal = () => {
        setShowCityModal(false);
        setEditingCity(null);
        setCityForm({ name: '', region: '' });
        setCityImageFile(null);
        setCityImagePreview(null);
        setSubmitting(false);
    };

    const handleCityImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCityImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setCityImagePreview(previewUrl);
    };

    const handleCitySubmit = async (e) => {
        e.preventDefault();
        if (!cityForm.name.trim()) {
            showError("City name is required");
            return;
        }

        setSubmitting(true);
        try {
            let response;
            const formData = new FormData();
            formData.append('name', cityForm.name);
            formData.append('region', cityForm.region || '');

            if (cityImageFile) {
                formData.append('image', cityImageFile);
            }

            if (editingCity) {
                formData.append('_method', 'PUT');
                response = await api.authPostFormData(`/admin/cities/${editingCity.id}`, formData, token);
            } else {
                response = await api.authPostFormData('/admin/cities', formData, token);
            }

            if (response && response.success) {
                showSuccess(editingCity ? "City updated successfully" : "City created successfully");
                closeCityModal();
                await fetchCities();
                await fetchStats();
                adminCache.lastFetch = null; // Invalidate cache to refresh
            } else {
                const errorMsg = response?.errors ? Object.values(response.errors).flat().join(" ") : response?.message || "Failed to save city";
                showError(errorMsg);
            }
        } catch (error) {
            console.error("Error saving city:", error);
            showError(error.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    // Category Modal Functions
    const openCategoryModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name,
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({
                name: '',
            });
        }
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: '' });
        setSubmitting(false);
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (!categoryForm.name.trim()) {
            showError("Category name is required");
            return;
        }

        setSubmitting(true);
        try {
            let response;
            if (editingCategory) {
                response = await api.authPut(`/admin/categories/${editingCategory.id}`, {
                    name: categoryForm.name
                }, token);
            } else {
                response = await api.authPost('/admin/categories', {
                    name: categoryForm.name
                }, token);
            }

            if (response && response.success) {
                showSuccess(editingCategory ? "Category updated successfully" : "Category created successfully");
                closeCategoryModal();
                await fetchCategories();
                await fetchStats();
                adminCache.lastFetch = null; // Invalidate cache to refresh
            } else {
                const errorMsg = response?.errors
                    ? Object.values(response.errors).flat().join(" ")
                    : response?.message || "Failed to save category";
                showError(errorMsg);
            }
        } catch (error) {
            console.error("Error saving category:", error);
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const msg = errorData.errors
                    ? Object.values(errorData.errors).flat().join(" ")
                    : errorData.message || error.message;
                showError(msg);
            } else {
                showError(error.message || "An error occurred");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUserClick = (user) => {
        setUserToDelete(user);
        setShowUserDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await api.authDelete(`/admin/users/${userToDelete.id}`, token);
            if (response && response.success) {
                showSuccess(`User "${userToDelete.name}" deleted successfully`);
                setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
                adminCache.users = adminCache.users?.filter(u => u.id !== userToDelete.id) || [];
                await fetchStats();
                adminCache.stats = stats;
                setShowUserDeleteModal(false);
                setUserToDelete(null);
            } else {
                showError(response?.message || "Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            showError(error.message || "An error occurred");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPosts = posts.filter(post =>
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCities = cities.filter(city =>
        city.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.region?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCategories = Array.isArray(categories)
        ? categories.filter(category =>
            category.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    // SVG Icons
    const Icons = {
        Users: () => (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        Posts: () => (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        Comments: () => (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        Likes: () => (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
        Messages: () => (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        Search: () => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        Delete: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        ),
        Close: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
        Dashboard: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
        User: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        FileText: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        Location: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
        Edit: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
        Plus: () => (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
        City: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22h20" />
                <path d="M4 22V8l4-4 4 4v14" />
                <path d="M16 22V14l4-4 4 4v8" />
                <path d="M8 14h.01" />
                <path d="M12 14h.01" />
                <path d="M16 14h.01" />
            </svg>
        ),
        Tag: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
        ),
        Image: () => (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        ),
        Category: () => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="stat-card-icon" style={{ color }}>
                <Icon />
            </div>
            <div className="stat-card-content">
                <div className="stat-card-value">{value}</div>
                <div className="stat-card-title">{title}</div>
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="admin-overview">
            <div className="stats-grid">
                <StatCard
                    title="Total Users"
                    value={stats.total_users || 0}
                    icon={Icons.Users}
                    color="#3b82f6"
                />
                <StatCard
                    title="Total Posts"
                    value={stats.total_posts || 0}
                    icon={Icons.Posts}
                    color="#10b981"
                />
                <StatCard
                    title="Total Comments"
                    value={stats.total_comments || 0}
                    icon={Icons.Comments}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Total Likes"
                    value={stats.total_likes || 0}
                    icon={Icons.Likes}
                    color="#ef4444"
                />
                <StatCard
                    title="Total Messages"
                    value={stats.total_messages || 0}
                    icon={Icons.Messages}
                    color="#f59e0b"
                />
            </div>

            {stats.users_by_role && stats.users_by_role.length > 0 && (
                <div className="admin-chart-section">
                    <h3>Users by Role</h3>
                    <div className="role-chart">
                        {stats.users_by_role.map((role, index) => (
                            <div key={index} className="role-bar">
                                <div className="role-bar-label">{role.role || 'user'}</div>
                                <div className="role-bar-track">
                                    <div
                                        className="role-bar-fill"
                                        style={{
                                            width: `${(role.total / (stats.total_users || 1)) * 100}%`,
                                            background: index === 0 ? '#dc2626' : '#3b82f6'
                                        }}
                                    />
                                </div>
                                <div className="role-bar-value">{role.total}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.posts_by_city && stats.posts_by_city.length > 0 && (
                <div className="admin-chart-section">
                    <h3>Posts by City</h3>
                    <div className="city-chart-grid">
                        {stats.posts_by_city.map((city, index) => (
                            <div key={index} className="city-chart-item">
                                <span className="city-name">
                                    <Icons.Location />
                                    {city.city}
                                </span>
                                <span className="city-count">{city.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.posts_by_category && stats.posts_by_category.length > 0 && (
                <div className="admin-chart-section">
                    <h3>Posts by Category</h3>
                    <div className="category-chart-grid">
                        {stats.posts_by_category.map((category, index) => (
                            <div key={index} className="category-chart-item">
                                <span className="category-name">
                                    <Icons.Tag />
                                    {category.category}
                                </span>
                                <span className="category-count">{category.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderUsers = () => {
        return (
            <>
                <div className="admin-table-container">
                    <div className="admin-table-header">
                        <h3>
                            <Icons.User />
                            Users
                        </h3>
                        <div className="admin-search-wrapper">
                            <Icons.Search />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="admin-search-input"
                            />
                        </div>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="admin-empty-state">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <span>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="admin-btn admin-btn-danger"
                                                onClick={() => handleDeleteUserClick(user)}
                                            >
                                                <Icons.Delete />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* User Delete Confirmation Modal */}
                {showUserDeleteModal && userToDelete && (
                    <div className="delete-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowUserDeleteModal(false)}>
                        <div className="delete-modal">
                            <h3>Confirm Delete User</h3>
                            <p>
                                Are you sure you want to delete user <strong>"{userToDelete.name}"</strong>?
                                <br /><br />
                                This action will permanently remove:
                                <br />
                                • All posts by this user
                                <br />
                                • All comments by this user
                                <br />
                                • All likes by this user
                                <br />
                                • Their profile avatar and cover image
                                <br /><br />
                                <span style={{ color: "#dc2626", fontWeight: "600" }}>This action cannot be undone!</span>
                            </p>
                            <div className="delete-modal-actions">
                                <button className="delete-modal-cancel" onClick={() => setShowUserDeleteModal(false)}>
                                    Cancel
                                </button>
                                <button className="delete-modal-confirm" onClick={confirmDeleteUser}>
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderPosts = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h3>
                    <Icons.FileText />
                    Posts
                </h3>
                <div className="admin-search-wrapper">
                    <Icons.Search />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Content</th>
                        <th>Author</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPosts.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="admin-empty-state">
                                No posts found
                            </td>
                        </tr>
                    ) : (
                        filteredPosts.map(post => (
                            <tr key={post.id}>
                                <td>
                                    <div className="admin-post-content">
                                        <span>{post.content?.substring(0, 80)}{post.content?.length > 80 ? "..." : ""}</span>
                                    </div>
                                </td>
                                <td>{post.user?.name || "Unknown"}</td>
                                <td>
                                    <button
                                        className="admin-btn admin-btn-danger"
                                        onClick={() => {
                                            setItemToDelete(post);
                                            setDeleteType("post");
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        <Icons.Delete />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderCities = () => (
        <div className="admin-table-container">
            <div className="admin-table-header">
                <h3>
                    <Icons.City />
                    Cities ({cities.length})
                </h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div className="admin-search-wrapper">
                        <Icons.Search />
                        <input
                            type="text"
                            placeholder="Search cities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => openCityModal()}
                    >
                        <Icons.Plus />
                        Add City
                    </button>
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Region</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCities.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="admin-empty-state">
                                No cities found
                            </td>
                        </tr>
                    ) : (
                        filteredCities.map(city => (
                            <tr key={city.id}>
                                <td>#{city.id}</td>
                                <td>
                                    {city.image ? (
                                        <img
                                            src={getImageUrl(city.image)}
                                            alt={city.name}
                                            className="city-table-image"
                                        />
                                    ) : (
                                        <span className="text-muted">No image</span>
                                    )}
                                </td>
                                <td>
                                    <div className="admin-city-cell">
                                        <span className="city-name-display">{city.name}</span>
                                    </div>
                                </td>
                                <td>
                                    {city.region ? (
                                        <span className="region-badge">{city.region}</span>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>
                                <td>{formatDate(city.created_at)}</td>
                                <td>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            className="admin-btn admin-btn-edit"
                                            onClick={() => openCityModal(city)}
                                        >
                                            <Icons.Edit />
                                            Edit
                                        </button>
                                        <button
                                            className="admin-btn admin-btn-danger"
                                            onClick={() => {
                                                setItemToDelete(city);
                                                setDeleteType("city");
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <Icons.Delete />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderCategories = () => {
        return (
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3>
                        <Icons.Category />
                        Categories ({categories.length})
                    </h3>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <div className="admin-search-wrapper">
                            <Icons.Search />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="admin-search-input"
                            />
                        </div>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => openCategoryModal()}
                        >
                            <Icons.Plus />
                            Add Category
                        </button>
                    </div>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Posts</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="admin-empty-state">
                                    No categories found
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map(category => {
                                const postCount = stats.posts_by_category?.find(c => c.category === category.name)?.total || 0;
                                return (
                                    <tr key={category.id}>
                                        <td>#{category.id}</td>
                                        <td>
                                            <div className="admin-category-cell">
                                                <span className="category-name-display">{category.name}</span>
                                            </div>
                                        </td>
                                        <td>{postCount}</td>
                                        <td>{formatDate(category.created_at)}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    className="admin-btn admin-btn-edit"
                                                    onClick={() => openCategoryModal(category)}
                                                >
                                                    <Icons.Edit />
                                                    Edit
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn-danger"
                                                    onClick={() => {
                                                        setItemToDelete(category);
                                                        setDeleteType("category");
                                                        setShowDeleteModal(true);
                                                    }}
                                                >
                                                    <Icons.Delete />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    // Show loading skeleton while loading
    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <>
            <style>{`
                .admin-dashboard {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 16px;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .admin-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a1917;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .admin-header span {
                    color: #6b6a67;
                    font-size: 14px;
                }

                .admin-tabs {
                    display: flex;
                    gap: 8px;
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: 24px;
                    padding-bottom: 8px;
                    flex-wrap: wrap;
                }

                .admin-tab {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 20px;
                    border: none;
                    background: none;
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b6a67;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .admin-tab:hover {
                    background: #f3f4f6;
                    color: #1a1917;
                }

                .admin-tab.active {
                    background: #dc2626;
                    color: white;
                }

                /* Loading Skeleton Styles */
                .admin-loading-skeleton {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 16px;
                }

                .skeleton-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .skeleton-title {
                    width: 200px;
                    height: 32px;
                    background: #e5e7eb;
                    border-radius: 8px;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-user {
                    width: 150px;
                    height: 20px;
                    background: #e5e7eb;
                    border-radius: 8px;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 8px;
                }

                .skeleton-tab {
                    width: 80px;
                    height: 36px;
                    background: #e5e7eb;
                    border-radius: 8px;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .skeleton-stat {
                    height: 80px;
                    background: #e5e7eb;
                    border-radius: 12px;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-chart {
                    background: white;
                    border-radius: 12px;
                    padding: 20px 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .skeleton-chart-title {
                    width: 150px;
                    height: 20px;
                    background: #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-chart-bar {
                    height: 12px;
                    background: #e5e7eb;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-chart-bar:nth-child(2) { width: 80%; }
                .skeleton-chart-bar:nth-child(3) { width: 60%; }
                .skeleton-chart-bar:nth-child(4) { width: 40%; }

                @keyframes shimmer {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: white;
                    padding: 20px 24px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .stat-card-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #f8fafc;
                }

                .stat-card-content {
                    flex: 1;
                }

                .stat-card-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a1917;
                }

                .stat-card-title {
                    font-size: 13px;
                    color: #6b6a67;
                    margin-top: 2px;
                }

                .admin-chart-section {
                    background: white;
                    border-radius: 12px;
                    padding: 20px 24px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .admin-chart-section h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1917;
                    margin-bottom: 16px;
                }

                .role-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .role-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .role-bar-label {
                    min-width: 60px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #4b5563;
                    text-transform: capitalize;
                }

                .role-bar-track {
                    flex: 1;
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .role-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .role-bar-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1917;
                    min-width: 30px;
                    text-align: right;
                }

                .city-chart-grid, .category-chart-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 8px;
                }

                .city-chart-item, .category-chart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 14px;
                    background: #f8fafc;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .city-chart-item:hover, .category-chart-item:hover {
                    background: #f1f5f9;
                }

                .city-name, .category-name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #4b5563;
                }

                .city-name svg, .category-name svg {
                    width: 16px;
                    height: 16px;
                    color: #6b6a67;
                }

                .city-count, .category-count {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1917;
                }

                .admin-table-container {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    overflow: auto;
                }

                .admin-table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .admin-table-header h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1917;
                }

                .admin-search-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 0 12px;
                    transition: border-color 0.2s;
                }

                .admin-search-wrapper:focus-within {
                    border-color: #dc2626;
                    background: white;
                }

                .admin-search-wrapper svg {
                    color: #6b6a67;
                }

                .admin-search-input {
                    padding: 8px 0;
                    border: none;
                    background: transparent;
                    font-size: 14px;
                    outline: none;
                    min-width: 200px;
                    color: #1a1917;
                }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .admin-table th {
                    text-align: left;
                    padding: 12px 12px;
                    background: #f8fafc;
                    font-weight: 600;
                    color: #4b5563;
                    border-bottom: 2px solid #e5e7eb;
                }

                .admin-table td {
                    padding: 12px 12px;
                    border-bottom: 1px solid #f3f4f6;
                    color: #1a1917;
                }

                .admin-table tr:hover td {
                    background: #f8fafc;
                }

                .admin-empty-state {
                    text-align: center;
                    padding: 40px;
                    color: #6b6a67;
                }

                .admin-user-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .admin-post-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .admin-city-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .admin-category-cell {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .city-name-display {
                    font-weight: 500;
                    color: #1a1917;
                }

                .category-name-display {
                    font-weight: 500;
                    color: #1a1917;
                }

                .city-table-image {
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    object-fit: cover;
                }

                .region-badge {
                    padding: 2px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    background: #e5e7eb;
                    color: #4b5563;
                }

                .text-muted {
                    color: #6b6a67;
                }

                .role-badge {
                    padding: 3px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .role-admin {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .role-user {
                    background: #dbeafe;
                    color: #3b82f6;
                }

                .admin-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .admin-btn-danger {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .admin-btn-danger:hover {
                    background: #fecaca;
                }

                .admin-btn-edit {
                    background: #dbeafe;
                    color: #3b82f6;
                }

                .admin-btn-edit:hover {
                    background: #bfdbfe;
                }

                .admin-btn-primary {
                    background: #dc2626;
                    color: white;
                }

                .admin-btn-primary:hover {
                    background: #b91c1c;
                }

                .admin-loading {
                    text-align: center;
                    padding: 60px;
                    color: #6b6a67;
                    font-size: 16px;
                }

                .delete-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .delete-modal {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 400px;
                    width: 90%;
                    animation: modalSlideIn 0.3s ease;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .delete-modal h3 {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #1a1917;
                }

                .delete-modal p {
                    color: #6b6a67;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }

                .delete-modal-actions {
                    display: flex;
                    gap: 8px;
                }

                .delete-modal-actions button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .delete-modal-cancel {
                    background: #f3f4f6;
                    color: #4b5563;
                }

                .delete-modal-cancel:hover {
                    background: #e5e7eb;
                }

                .delete-modal-confirm {
                    background: #dc2626;
                    color: white;
                }

                .delete-modal-confirm:hover {
                    background: #b91c1c;
                }

                /* City Modal */
                .city-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .city-modal {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    width: 90%;
                    animation: modalSlideIn 0.3s ease;
                }

                .city-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .city-modal-header h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1a1917;
                }

                .city-modal-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b6a67;
                    padding: 4px;
                }

                .city-modal-close:hover {
                    color: #1a1917;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #4b5563;
                    margin-bottom: 4px;
                }

                .form-group input {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                    outline: none;
                }

                .form-group input:focus {
                    border-color: #dc2626;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }

                .form-group input:disabled {
                    background: #f3f4f6;
                    cursor: not-allowed;
                }

                .city-image-preview {
                    width: 120px;
                    height: 120px;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 8px;
                    border: 1px solid #e5e7eb;
                }

                .city-image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .city-image-input {
                    display: block;
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    cursor: pointer;
                }

                .city-image-input:hover {
                    border-color: #dc2626;
                }

                .form-hint {
                    display: block;
                    font-size: 11px;
                    color: #6b6a67;
                    margin-top: 4px;
                }

                .city-modal-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 20px;
                }

                .city-modal-actions button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .city-modal-cancel {
                    background: #f3f4f6;
                    color: #4b5563;
                }

                .city-modal-cancel:hover {
                    background: #e5e7eb;
                }

                .city-modal-submit {
                    background: #dc2626;
                    color: white;
                }

                .city-modal-submit:hover {
                    background: #b91c1c;
                }

                .city-modal-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Category Modal */
                .category-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .category-modal {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    width: 90%;
                    animation: modalSlideIn 0.3s ease;
                }

                .category-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .category-modal-header h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: #1a1917;
                }

                .category-modal-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b6a67;
                    padding: 4px;
                }

                .category-modal-close:hover {
                    color: #1a1917;
                }

                .category-modal-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 20px;
                }

                .category-modal-actions button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .category-modal-cancel {
                    background: #f3f4f6;
                    color: #4b5563;
                }

                .category-modal-cancel:hover {
                    background: #e5e7eb;
                }

                .category-modal-submit {
                    background: #dc2626;
                    color: white;
                }

                .category-modal-submit:hover {
                    background: #b91c1c;
                }

                .category-modal-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .admin-table {
                        font-size: 12px;
                    }

                    .admin-table th,
                    .admin-table td {
                        padding: 8px;
                    }

                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .admin-tabs {
                        flex-wrap: wrap;
                    }

                    .city-chart-grid, .category-chart-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-table-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .admin-search-wrapper {
                        width: 100%;
                    }

                    .admin-search-input {
                        width: 100%;
                        min-width: auto;
                    }

                    .city-image-preview {
                        width: 80px;
                        height: 80px;
                    }
                }
            `}</style>

            <div className="admin-dashboard">
                <div className="admin-header">
                    <h1>
                        <Icons.Dashboard />
                        Admin Dashboard
                    </h1>
                    <span>Logged in as {user?.name}</span>
                </div>

                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("overview");
                            setSearchQuery("");
                        }}
                    >
                        <Icons.Dashboard />
                        Overview
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("users");
                            setSearchQuery("");
                        }}
                    >
                        <Icons.User />
                        Users ({users.length})
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "posts" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("posts");
                            setSearchQuery("");
                        }}
                    >
                        <Icons.FileText />
                        Posts ({posts.length})
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "cities" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("cities");
                            setSearchQuery("");
                        }}
                    >
                        <Icons.City />
                        Cities ({cities.length})
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "categories" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("categories");
                            setSearchQuery("");
                        }}
                    >
                        <Icons.Category />
                        Categories ({categories.length})
                    </button>
                </div>

                {activeTab === "overview" && renderOverview()}
                {activeTab === "users" && renderUsers()}
                {activeTab === "posts" && renderPosts()}
                {activeTab === "cities" && renderCities()}
                {activeTab === "categories" && renderCategories()}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="delete-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
                    <div className="delete-modal">
                        <h3>Confirm Delete</h3>
                        <p>
                            Are you sure you want to delete this {deleteType}?
                            {deleteType === "city" && " This will remove the city from the database."}
                            {deleteType === "category" && " This will remove the category from the database."}
                            {deleteType === "post" && " This action cannot be undone."}
                        </p>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button className="delete-modal-confirm" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* City Modal - Create/Edit */}
            {showCityModal && (
                <div className="city-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeCityModal()}>
                    <div className="city-modal">
                        <div className="city-modal-header">
                            <h3>{editingCity ? 'Edit City' : 'Add New City'}</h3>
                            <button className="city-modal-close" onClick={closeCityModal}>
                                <Icons.Close />
                            </button>
                        </div>
                        <form onSubmit={handleCitySubmit}>
                            <div className="form-group">
                                <label>City Name *</label>
                                <input
                                    type="text"
                                    value={cityForm.name}
                                    onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                                    placeholder="Enter city name"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>Region</label>
                                <input
                                    type="text"
                                    value={cityForm.region}
                                    onChange={(e) => setCityForm({ ...cityForm, region: e.target.value })}
                                    placeholder="Enter region (e.g., Marrakech-Safi)"
                                    disabled={submitting}
                                />
                            </div>
                            <div className="form-group">
                                <label>City Image</label>
                                {cityImagePreview && (
                                    <div className="city-image-preview">
                                        <img src={cityImagePreview} alt="City preview" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCityImageChange}
                                    disabled={submitting}
                                    className="city-image-input"
                                />
                                <small className="form-hint">Upload a city image (JPG, PNG, GIF, WEBP - max 5MB)</small>
                            </div>
                            <div className="city-modal-actions">
                                <button type="button" className="city-modal-cancel" onClick={closeCityModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="city-modal-submit" disabled={submitting}>
                                    {submitting ? "Saving..." : editingCity ? "Update City" : "Create City"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal - Create/Edit */}
            {showCategoryModal && (
                <div className="category-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeCategoryModal()}>
                    <div className="category-modal">
                        <div className="category-modal-header">
                            <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button className="category-modal-close" onClick={closeCategoryModal}>
                                <Icons.Close />
                            </button>
                        </div>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="Enter category name"
                                    required
                                    disabled={submitting}
                                />
                                {editingCategory && (
                                    <small style={{ display: "block", marginTop: "4px", color: "#6b6a67" }}>
                                        Editing: {editingCategory.name} (ID: {editingCategory.id})
                                    </small>
                                )}
                            </div>
                            <div className="category-modal-actions">
                                <button type="button" className="category-modal-cancel" onClick={closeCategoryModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="category-modal-submit" disabled={submitting}>
                                    {submitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;