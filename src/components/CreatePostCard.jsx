export function CreatePostCard({ onOpenModal }) {
    return (
        <div className="create-post-card">
            <div className="create-post-input-row">
                <div className="avatar">👤</div>
                <div className="create-post-input" onClick={onOpenModal}>Share your Moroccan journey...</div>
            </div>
            <div className="upload-zone" onClick={onOpenModal}>
                <div className="upload-icon">📷</div>
                <div className="upload-text">Click or drag to upload an image<br /><span style={{ fontSize: "11px" }}>IMAGES ONLY SUPPORTED</span></div>
            </div>
            <div className="create-post-actions">
                <button className="action-btn">🖼️ Photo</button>
                <button className="action-btn">📍 Location</button>
                <button className="post-btn" onClick={onOpenModal}>Post</button>
            </div>
        </div>
    );
}