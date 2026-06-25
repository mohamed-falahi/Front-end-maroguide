import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const API_BASE_URL = "http://127.0.0.1:8000";

// Global cache outside component - persists across re-renders
let cache = {
    users: null,
    cities: null,
    loaded: false,
    userId: null
};

export function Sidebar() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cities, categories } = useData();
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [trendingCities, setTrendingCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState({});

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

    // Fetch suggested users (travelers)
    const fetchSuggestedUsers = async () => {
        try {
            console.log('Fetching suggested users...');
            const response = await api.get('/users');
            console.log('Users response:', response);

            let users = [];
            if (response && response.success && response.users) {
                users = response.users;
            } else if (Array.isArray(response)) {
                users = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                users = response.data;
            }

            // Filter out current user and limit to 4
            const filtered = users.filter(u => u.id !== user?.id);
            const result = filtered.slice(0, 4);

            // Save to cache
            cache.users = result;
            return result;
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to mock data if API fails
            const fallback = [
                { id: 1, name: 'Layla Bennani', bio: 'Cultural Photographer', avatar: null },
                { id: 2, name: 'Karim Zeroual', bio: 'Mountain Guide', avatar: null },
                { id: 3, name: 'Sofia Tazi', bio: 'Foodie Explorer', avatar: null },
            ];
            cache.users = fallback;
            return fallback;
        }
    };

    // Fetch trending cities with real images
    const fetchTrendingCities = async () => {
        try {
            console.log('Fetching trending cities...');
            const response = await api.get('/cities');
            console.log('Cities response:', response);

            let citiesData = [];
            if (response && response.success && response.cities) {
                citiesData = response.cities;
            } else if (Array.isArray(response)) {
                citiesData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                citiesData = response.data;
            }

            // Add images and trip counts
            const citiesWithImages = citiesData.map((city) => {
                let imageUrl = null;

                if (city.image) {
                    imageUrl = getImageUrl(city.image);
                } else if (city.cover_image) {
                    imageUrl = getImageUrl(city.cover_image);
                } else if (city.avatar) {
                    imageUrl = getImageUrl(city.avatar);
                } else if (city.image_url) {
                    imageUrl = getImageUrl(city.image_url);
                } else if (city.photo) {
                    imageUrl = getImageUrl(city.photo);
                } else if (city.picture) {
                    imageUrl = getImageUrl(city.picture);
                } else {
                    imageUrl = getDefaultCityImage(city.name);
                }

                return {
                    ...city,
                    image: imageUrl,
                    trips: `${Math.floor(Math.random() * 5000) + 1000}+ active trips`
                };
            });

            const result = citiesWithImages.slice(0, 4);
            cache.cities = result;
            return result;
        } catch (error) {
            console.error('Error fetching cities:', error);
            const fallback = [
                {
                    id: 1,
                    name: 'Marrakech',
                    image: 'https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80',
                    trips: '4.2k active trips'
                },
                {
                    id: 2,
                    name: 'Chefchaouen',
                    image: 'https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80',
                    trips: '3.8k active trips'
                },
                {
                    id: 3,
                    name: 'Merzouga',
                    image: 'https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80',
                    trips: '2.9k active trips'
                },
            ];
            cache.cities = fallback;
            return fallback;
        }
    };

    // Get default image based on city name
    const getDefaultCityImage = (cityName) => {
        const cityImages = {
            'Marrakech': 'https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80',
            'Marrakesh': 'https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80',
            'Chefchaouen': 'https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80',
            'Merzouga': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80',
            'Fes': 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
            'Fez': 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
            'Casablanca': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
            'Essaouira': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
            'Tangier': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
            'Tanger': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80',
            'Agadir': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
            'Ouarzazate': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80',
            'Meknes': 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80',
            'Rabat': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
        };

        const normalizedName = cityName?.toLowerCase() || '';
        for (const [key, value] of Object.entries(cityImages)) {
            if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
                return value;
            }
        }

        return 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80';
    };

    // Handle follow user
    const handleFollow = async (userId) => {
        if (!user) {
            alert('Please login to follow users');
            return;
        }

        try {
            setFollowing(prev => ({ ...prev, [userId]: true }));
            const token = localStorage.getItem('token');
            const response = await api.authPost(`/users/${userId}/follow`, {}, token);

            if (response && response.success) {
                setSuggestedUsers(prev =>
                    prev.map(u =>
                        u.id === userId
                            ? { ...u, is_following: !u.is_following }
                            : u
                    )
                );
            }
        } catch (error) {
            console.error('Error following user:', error);
            setFollowing(prev => ({ ...prev, [userId]: false }));
        }
    };

    // Navigate to user profile
    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
    };

    // Navigate to city page
    const handleCityClick = (cityId) => {
        navigate(`/?city=${cityId}`);
    };

    // Load data - ONLY ONCE
    useEffect(() => {
        const loadData = async () => {
            const currentUserId = user?.id || null;

            // If no user, clear cache and set loading to false
            if (!user) {
                cache.loaded = false;
                cache.userId = null;
                setLoading(false);
                return;
            }

            // If user changed, reset cache
            if (cache.userId !== currentUserId) {
                console.log('User changed, resetting cache');
                cache.loaded = false;
                cache.userId = currentUserId;
            }

            // If cache has data, use it
            if (cache.loaded && cache.users && cache.cities) {
                console.log('Using cached data');
                setSuggestedUsers(cache.users);
                setTrendingCities(cache.cities);
                setLoading(false);
                return;
            }

            // Load fresh data
            console.log('Loading fresh data...');
            setLoading(true);

            try {
                const [users, cities] = await Promise.all([
                    fetchSuggestedUsers(),
                    fetchTrendingCities()
                ]);

                setSuggestedUsers(users);
                setTrendingCities(cities);
                cache.loaded = true;
            } catch (error) {
                console.error('Error loading sidebar data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id]); // Only depend on user.id, not the whole user object

    if (loading) {
        return (
            <div className="side-col">
                <div className="side-card" style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ color: '#6b6a67' }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="side-col">
            {/* Suggested Travelers */}
            <div className="side-card">
                <div className="side-title">Suggested Travelers</div>
                {suggestedUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#6b6a67' }}>
                        No travelers found
                    </div>
                ) : (
                    suggestedUsers.map(t => (
                        <div key={t.id} className="traveler-item">
                            <div
                                className="avatar"
                                onClick={() => handleUserClick(t.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {t.avatar ? (
                                    <img
                                        src={getImageUrl(t.avatar)}
                                        alt={t.name}
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '20px' }}>👤</span>
                                )}
                            </div>
                            <div
                                className="traveler-info"
                                onClick={() => handleUserClick(t.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="traveler-name">{t.name}</div>
                                <div className="traveler-role">{t.bio || 'Traveler'}</div>
                            </div>
                            <button
                                className={`follow-btn ${t.is_following ? 'following' : ''}`}
                                onClick={() => handleFollow(t.id)}
                                disabled={following[t.id]}
                            >
                                {t.is_following ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))
                )}
                {suggestedUsers.length > 0 && (
                    <span
                        className="view-more-link"
                        onClick={() => navigate('/users')}
                        style={{ cursor: 'pointer' }}
                    >
                        View More Travelers
                    </span>
                )}
            </div>

            {/* Trending Destinations */}
            <div className="side-card">
                <div className="side-title">Trending Destinations</div>
                {trendingCities.length > 0 && (
                    <>
                        <div
                            className="dest-main"
                            onClick={() => handleCityClick(trendingCities[0].id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {trendingCities[0].image ? (
                                <img
                                    src={trendingCities[0].image}
                                    alt={trendingCities[0].name}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80';
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6b6a67'
                                }}>
                                    📍 {trendingCities[0].name}
                                </div>
                            )}
                            <div className="dest-overlay">
                                <div className="dest-name">{trendingCities[0].name}</div>
                                <div className="dest-trips">{trendingCities[0].trips}</div>
                            </div>
                        </div>
                        <div className="dest-grid">
                            {trendingCities.slice(1).map(d => (
                                <div
                                    key={d.id}
                                    className="dest-small"
                                    onClick={() => handleCityClick(d.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {d.image ? (
                                        <img
                                            src={d.image}
                                            alt={d.name}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80';
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: '#e5e7eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#6b6a67',
                                            fontSize: '12px'
                                        }}>
                                            📍
                                        </div>
                                    )}
                                    <div className="dest-overlay">
                                        <div className="dest-name">{d.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .side-col {
                    width: 280px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .side-card {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    border: 1px solid #f0f0f0;
                }
                .side-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 14px;
                }
                .traveler-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #f8f7f4;
                }
                .traveler-item:last-child {
                    border-bottom: none;
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #f1f0ed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .traveler-info {
                    flex: 1;
                    cursor: pointer;
                }
                .traveler-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                .traveler-role {
                    font-size: 12px;
                    color: #6b6a67;
                }
                .follow-btn {
                    padding: 4px 14px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .follow-btn:hover:not(:disabled) {
                    background: #b91c1c;
                    transform: scale(1.02);
                }
                .follow-btn.following {
                    background: #e5e7eb;
                    color: #1a1a1a;
                }
                .follow-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .view-more-link {
                    display: block;
                    text-align: center;
                    font-size: 13px;
                    color: #b8860b;
                    margin-top: 10px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .view-more-link:hover {
                    text-decoration: underline;
                }
                .dest-main {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    height: 140px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .dest-main:hover {
                    transform: scale(1.02);
                }
                .dest-main img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .dest-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 16px;
                    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
                }
                .dest-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                }
                .dest-trips {
                    font-size: 12px;
                    color: rgba(255,255,255,0.8);
                }
                .dest-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .dest-small {
                    position: relative;
                    border-radius: 10px;
                    overflow: hidden;
                    height: 80px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .dest-small:hover {
                    transform: scale(1.05);
                }
                .dest-small img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .dest-small .dest-overlay {
                    padding: 10px;
                }
                .dest-small .dest-name {
                    font-size: 13px;
                }
                @media (max-width: 1024px) {
                    .side-col {
                        width: 240px;
                    }
                }
                @media (max-width: 768px) {
                    .side-col {
                        width: 100%;
                        margin-top: 16px;
                    }
                }
            `}</style>
        </div>
    );
}