import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { api } from "../services/api";

export function ProfilePage() {
    const { user, token, setUser } = useAuth();
    const { posts } = useData();
    const [activeTab, setActiveTab] = useState("posts");
    const [userPosts, setUserPosts] = useState([]);
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0,
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || "",
        bio: user?.bio || "Exploring the hidden gems of the Maghreb",
        avatar: user?.avatar || null,
        cover: user?.cover_image || "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
    });

    const [showEdit, setShowEdit] = useState(false);
    const [draft, setDraft] = useState({ ...profile });
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    useEffect(() => {
        if (user) {
            fetchUserPosts();
            fetchUserStats();
            setProfile({
                name: user.name || "",
                bio: user.bio || "Exploring the hidden gems of the Maghreb",
                avatar: user.avatar || null,
                cover: user.cover_image || "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
            });
        }
    }, [user, posts]);

    const fetchUserPosts = async () => {
        try {
            const userPostsData = posts.filter(p => p.user_id === user?.id);
            setUserPosts(userPostsData);
        } catch (error) {
            console.error("Error fetching user posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await api.get(`/users/${user?.id}/profile`);
            if (response.success) {
                setStats({
                    posts: userPosts.length,
                    followers: response.followers_count || 0,
                    following: response.following_count || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching user stats:", error);
            setStats({
                posts: userPosts.length,
                followers: 12400,
                following: 850,
            });
        }
    };

    const openEdit = () => {
        setDraft({ ...profile });
        setAvatarFile(null);
        setCoverFile(null);
        setShowEdit(true);
    };

    const closeEdit = () => setShowEdit(false);

    const saveEdit = async () => {
        setUploading(true);
        try {
            const profileResponse = await api.authPut("/user/profile", {
                name: draft.name,
                bio: draft.bio
            }, token);

            if (profileResponse.success) {
                if (avatarFile) {
                    const formData = new FormData();
                    formData.append("avatar", avatarFile);
                    await api.authPostFormData("/user/avatar", formData, token);
                }
                if (coverFile) {
                    const formData = new FormData();
                    formData.append("cover", coverFile);
                    await api.authPostFormData("/user/cover", formData, token);
                }

                const updatedUser = await api.authGet("/user", token);
                if (updatedUser) {
                    if (setUser) setUser(updatedUser);
                    setProfile({
                        name: updatedUser.name,
                        bio: updatedUser.bio || "",
                        avatar: updatedUser.avatar,
                        cover: updatedUser.cover_image,
                    });
                }
                setShowEdit(false);
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred");
        } finally {
            setUploading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setDraft((d) => ({ ...d, avatar: URL.createObjectURL(file) }));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverFile(file);
        setDraft((d) => ({ ...d, cover: URL.createObjectURL(file) }));
    };

    const TABS = [
        { id: "posts", label: "Posts", icon: "⊞" },

    ];

    const GRID_POSTS = userPosts.length > 0
        ? userPosts.map(post => ({
            img: post.media?.[0] || "https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80",
            loc: post.city?.name || "Morocco",
            caption: post.content?.substring(0, 60) || "Travel memories",
        }))
        : [
            { img: "https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=400&q=80", loc: "Chefchaouen", caption: "The blue pearl never ceases to amaze me. 💙" },
            { img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80", loc: "Hospitality", caption: "Hospitality that feels like home." },
            { img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80", loc: "Merzouga Nights", caption: "Sleeping under a million stars. 🌌" },
        ];

    const RECENT = (userPosts.length > 0 ? userPosts.slice(0, 3) : [
        { name: "Chefchaouen", sub: "The Blue Pearl", img: "https://images.unsplash.com/photo-1548019979-2f0f98b6f42e?w=100" },
        { name: "Marrakech", sub: "The Red City", img: "https://images.unsplash.com/photo-1597212618440-806262de5d7b?w=100" },
        { name: "Fès", sub: "The Imperial Soul", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=100" },
    ]).map(city => ({
        name: city.city?.name || city.name,
        sub: city.city?.subtitle || city.sub,
        img: city.city?.image || city.img,
    }));

    const renderTabContent = () => {
        switch (activeTab) {
            case "posts":
                return (
                    <div className="posts-grid">
                        {GRID_POSTS.map((post, i) => (
                            <div key={i} className="grid-post">
                                <img src={post.img} alt={post.loc} />
                                <div className="grid-post-overlay">
                                    <div className="grid-post-loc">{post.loc}</div>
                                    <div className="grid-post-caption">{post.caption}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case "routes":
                return (
                    <div className="tab-map-container">
                        <iframe
                            title="Routes Map"
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3537785.9!2d-6.5!3d31.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma"
                            width="100%"
                            height="420"
                            style={{ border: 0, borderRadius: "14px" }}
                            allowFullScreen
                            loading="lazy"
                        />
                        <div className="map-route-legend">
                            {["Marrakech → Merzouga", "Chefchaouen → Fès", "Casablanca → Essaouira"].map((route) => (
                                <div key={route} className="route-chip">
                                    🗺️ {route}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "reviews":
                return (
                    <div className="tab-map-container">
                        <iframe
                            title="Reviews Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.7!2d-7.9891!3d31.6306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8d96179e51%3A0x5950b6534f87adb8!2sBen%20Youssef%20Madrasa!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma"
                            width="100%"
                            height="340"
                            style={{ border: 0, borderRadius: "14px", marginBottom: "14px" }}
                            allowFullScreen
                            loading="lazy"
                        />
                        <div className="reviews-list">
                            {[
                                { place: "Ben Youssef Madrasa", rating: 5, text: "Un chef-d'œuvre architectural, les zelliges sont époustouflants." },
                                { place: "Jemaa el-Fna", rating: 5, text: "L'énergie de cette place la nuit est incomparable !" },
                                { place: "Jardins Majorelle", rating: 4, text: "Oasis de sérénité au cœur de Marrakech." },
                            ].map((review) => (
                                <div key={review.place} className="review-item">
                                    <div className="review-place">{review.place}</div>
                                    <div className="review-stars">{"⭐".repeat(review.rating)}</div>
                                    <div className="review-text">{review.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "saved":
                return (
                    <div className="tab-map-container">
                        <iframe
                            title="Saved Map"
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1768892.9!2d-5.8!3d33.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma"
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: "14px", marginBottom: "14px" }}
                            allowFullScreen
                            loading="lazy"
                        />
                        <div className="posts-grid">
                            {GRID_POSTS.slice(0, 3).map((post, i) => (
                                <div key={i} className="grid-post">
                                    <img src={post.img} alt={post.loc} />
                                    <div className="grid-post-overlay">
                                        <div className="grid-post-loc">{post.loc}</div>
                                        <div className="grid-post-caption">{post.caption}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "60px" }}>Loading profile...</div>;
    }

    if (!user) {
        return <div style={{ textAlign: "center", padding: "60px" }}><h2>Please login to view your profile</h2></div>;
    }

    return (
        <>
            <style>{`
        .profile-cover-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          border-radius: 0;
        }
        .profile-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .profile-cover-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.45) 100%);
        }
        .profile-body {
          background: var(--bg, #f8f7f4);
          padding: 0 16px 32px;
          max-width: 680px;
          margin: 0 auto;
        }
        .profile-avatar-row {
          display: flex;
          justify-content: center;
          margin-top: -54px;
          margin-bottom: 12px;
        }
        .profile-avatar-circle {
          z-index:99;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--surface, white);
          border: 4px solid var(--surface, white);
          box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.12), 0 4px 18px rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .profile-name {
          font-size: 20px;
          font-weight: 600;
          color: var(--text, #1a1917);
          margin-bottom: 4px;
          text-align: center;
        }
        .profile-bio {
          font-size: 14px;
          color: var(--text-muted, #6b6a67);
          margin-bottom: 14px;
          text-align: center;
        }
        .profile-stats {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 18px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--text, #1a1917);
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted, #6b6a67);
          letter-spacing: 0.5px;
        }
        .profile-btns {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          justify-content: center;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }
        .profile-follow-btn, .profile-update-btn {
          flex: 1;
          padding: 9px 0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .profile-follow-btn {
          background: #dc2626;
          color: #fff;
        }
        .profile-update-btn {
          background: white;
          color: #1a1917;
          border: 0.5px solid rgba(0,0,0,0.1);
        }
        .posts-tabs {
          display: flex;
          gap: 0;
          border-bottom: 0.5px solid rgba(0,0,0,0.1);
          margin-bottom: 18px;
        }
        .posts-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 4px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          color: #6b6a67;
          font-size: 12px;
        }
        .posts-tab.active {
          color: #dc2626;
          border-bottom-color: #dc2626;
        }
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }
        .grid-post {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 10px;
          cursor: pointer;
        }
        .grid-post img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.25s;
        }
        .grid-post:hover img {
          transform: scale(1.05);
        }
        .grid-post-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px 9px;
        }
        .grid-post:hover .grid-post-overlay {
          opacity: 1;
        }
        .grid-post-loc {
          font-size: 11px;
          color: #fff;
          font-weight: 600;
        }
        .grid-post-caption {
          font-size: 10px;
          color: rgba(255,255,255,0.85);
        }
        .tab-map-container {
          width: 100%;
        }
        .map-route-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .route-chip {
          background: white;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 13px;
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .review-item {
          background: white;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 16px;
          padding: 14px 16px;
        }
        .review-place {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .review-stars {
          font-size: 14px;
          margin-bottom: 6px;
        }
        .review-text {
          font-size: 13px;
          color: #6b6a67;
        }
        .profile-grid {
          margin-top: 8px;
        }
        .recently-card {
          background: white;
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 16px;
          padding: 16px;
        }
        .recently-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 0.5px solid rgba(0,0,0,0.1);
        }
        .recently-item:last-child {
          border-bottom: none;
        }
        .recently-thumb {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          object-fit: cover;
        }
        .recently-name {
          font-size: 14px;
          font-weight: 600;
        }
        .recently-sub {
          font-size: 12px;
          color: #6b6a67;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 1000;
        }
        @media (min-width: 540px) {
          .modal-backdrop {
            align-items: center;
            padding: 16px;
          }
        }
        .modal.edit-profile-modal {
          position: relative;
          background: white;
          border-radius: 22px 22px 0 0;
          padding: 24px 20px 32px;
          width: 100%;
          max-width: 480px;
          max-height: 92vh;
          overflow-y: auto;
        }
        @media (min-width: 540px) {
          .modal.edit-profile-modal {
            border-radius: 22px;
          }
        }
        .modal-close {
          position: absolute;
          top: 14px;
          right: 16px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }
        .modal-title {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 18px;
        }
        .edit-cover-preview {
          position: relative;
          width: 100%;
          height: 130px;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .edit-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .edit-cover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .edit-cover-preview:hover .edit-cover-overlay {
          opacity: 1;
        }
        .edit-avatar-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 18px;
        }
        .edit-avatar-circle {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #f1f0ed;
          border: 2px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
        }
        .edit-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .edit-avatar-circle:hover .edit-avatar-overlay {
          opacity: 1;
        }
        .modal-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 5px;
          color: #6b6a67;
        }
        .modal-input, .modal-textarea {
          width: 100%;
          background: #f8f7f4;
          border: 0.5px solid rgba(0,0,0,0.15);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          margin-bottom: 14px;
          outline: none;
        }
        .modal-input:focus, .modal-textarea:focus {
          border-color: #dc2626;
        }
        .modal-textarea {
          min-height: 80px;
          resize: vertical;
        }
        .modal-actions {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }
        .cancel-btn, .submit-btn {
          flex: 1;
          padding: 10px 0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }
        .cancel-btn {
          background: #f1f0ed;
          color: #6b6a67;
        }
        .submit-btn {
          background: #dc2626;
          color: #fff;
        }
      `}</style>

            <div className="profile-cover-wrapper">
                <img src={profile.cover} alt="cover" className="profile-cover-img" />
                <div className="profile-cover-gradient" />
            </div>

            <div className="profile-body">
                <div className="profile-avatar-row">
                    <div className="profile-avatar-circle">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt="avatar"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: "40px" }}>👤</span>
                        )}
                    </div>
                </div>

                <div className="profile-name">{profile.name}</div>
                <div className="profile-bio">{profile.bio}</div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-val">{stats.posts}</div>
                        <div className="stat-label">Posts</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-val">{stats.followers.toLocaleString()}</div>
                        <div className="stat-label">Followers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-val">{stats.following.toLocaleString()}</div>
                        <div className="stat-label">Following</div>
                    </div>
                </div>

                <div className="profile-btns">
                    <button className="profile-follow-btn">message</button>
                    <button className="profile-update-btn" onClick={openEdit}>
                        ✏️ Update
                    </button>
                </div>

                <div className="posts-tabs">
                    {TABS.map(({ id, label, icon }) => (
                        <button
                            key={id}
                            className={`posts-tab ${activeTab === id ? "active" : ""}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <span className="tab-icon">{icon}</span>
                            <span className="tab-label">{label}</span>
                        </button>
                    ))}
                </div>

                {renderTabContent()}

                <br />

                <div className="profile-grid">
                    <div className="recently-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                            <span>🕐</span>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text, #1a1917)" }}>
                                Recently Visited
                            </span>
                        </div>
                        {RECENT.map((city) => (
                            <div key={city.name} className="recently-item">
                                <img src={city.img} alt={city.name} className="recently-thumb" />
                                <div>
                                    <div className="recently-name">{city.name}</div>
                                    <div className="recently-sub">{city.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showEdit && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
                    <div className="modal edit-profile-modal">
                        <button className="modal-close" onClick={closeEdit}>✕</button>
                        <div className="modal-title">✏️ Edit Profile</div>

                        <div className="edit-cover-preview">
                            <img
                                src={draft.cover || "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=60"}
                                alt="cover preview"
                                className="edit-cover-img"
                            />
                            <label className="edit-cover-overlay" htmlFor="coverInput">📷 Change cover</label>
                            <input id="coverInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverChange} />
                        </div>

                        <div className="edit-avatar-row">
                            <div className="edit-avatar-circle">
                                {draft.avatar ? (
                                    <img src={draft.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                ) : (
                                    <span style={{ fontSize: "28px" }}>👤</span>
                                )}
                                <label className="edit-avatar-overlay" htmlFor="avatarInput">📷</label>
                                <input id="avatarInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b6a67" }}>Click to change photo</div>
                        </div>

                        <label className="modal-label">Name</label>
                        <input
                            className="modal-input"
                            value={draft.name}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                            placeholder="Your name"
                        />

                        <label className="modal-label">Bio</label>
                        <textarea
                            className="modal-textarea"
                            value={draft.bio}
                            onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                            placeholder="Tell your story..."
                        />

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeEdit} disabled={uploading}>Cancel</button>
                            <button className="submit-btn" onClick={saveEdit} disabled={uploading}>
                                {uploading ? "Saving..." : "💾 Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePage;