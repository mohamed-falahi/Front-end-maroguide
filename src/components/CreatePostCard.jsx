import { useAuth } from "../contexts/AuthContext";

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

export function CreatePostCard({ onOpenModal }) {
    const { user } = useAuth();

    return (
        <div className="create-post-card">
            <div className="create-post-input-row">
                <div className="avatar" style={{ overflow: "hidden" }}>
                    {user?.avatar ? (
                        <img
                            src={getImageUrl(user.avatar)}
                            alt={user.name || "User"}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%"
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = '<i class="fas fa-user" style="font-size: 20px;"></i>';
                            }}
                        />
                    ) : (
                        <i className="fas fa-user" style={{ fontSize: 20 }} />
                    )}
                </div>
                <div className="create-post-input" onClick={onOpenModal}>
                    Share your Moroccan journey...
                </div>
            </div>
            <div className="upload-zone" onClick={onOpenModal}>
                <div className="upload-icon">
                    <i className="fas fa-image" style={{ fontSize: 28 }} />
                </div>
                <div className="upload-text">
                    Click or drag to upload an image
                    <br />
                    <span style={{ fontSize: "11px" }}>IMAGES ONLY SUPPORTED</span>
                </div>
            </div>
            <div className="create-post-actions">
                <button className="action-btn">
                    <i className="fas fa-image" style={{ marginRight: "4px" }} />
                    Photo
                </button>
                <button className="action-btn">
                    <i className="fas fa-map-marker-alt" style={{ marginRight: "4px" }} />
                    Location
                </button>
                <button className="post-btn" onClick={onOpenModal}>
                    <i className="fas fa-paper-plane" style={{ marginRight: "4px" }} />
                    Post
                </button>
            </div>
        </div>
    );
}