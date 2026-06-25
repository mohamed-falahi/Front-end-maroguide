import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useToast } from "../contexts/ToastContext";

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

export function PostModal({ onClose, onSubmit }) {
    const { user } = useAuth();
    const { cities, categories } = useData();
    const { showError, showSuccess } = useToast();
    const [content, setContent] = useState("");
    const [cityId, setCityId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        console.log("📸 Images selected:", files.length, "files");
        files.forEach(file => {
            console.log(`  - ${file.name} (${file.size} bytes, ${file.type})`);
        });

        setImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && images.length === 0) {
            showError("Please add some content or images");
            return;
        }

        if (!cityId) {
            showError("Please select a city");
            return;
        }

        if (!categoryId) {
            showError("Please select a category");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('content', content.trim());
            formData.append('city_id', parseInt(cityId));
            formData.append('category_id', parseInt(categoryId));

            // TRY DIFFERENT FIELD NAMES FOR IMAGES
            // Some backends expect 'media[]', some expect 'images[]'
            images.forEach((image) => {
                // Try both formats - your backend might expect 'media' instead of 'images'
                formData.append('media[]', image);
                // Also keep images for compatibility
                formData.append('images[]', image);
            });

            console.log("📤 Submitting post with FormData");
            console.log("Content:", content.trim());
            console.log("City ID:", parseInt(cityId));
            console.log("Category ID:", parseInt(categoryId));
            console.log("Images count:", images.length);

            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File: ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            const result = await onSubmit(formData);
            console.log("📥 Submit result:", result);

            if (result && result.success) {
                showSuccess("Post created successfully!");
                setContent("");
                setCityId("");
                setCategoryId("");
                setImages([]);
                setImagePreviews([]);
                onClose();
            } else {
                const errorMsg = result?.message || result?.error || "Failed to create post";
                console.error("❌ Submit failed:", errorMsg);
                showError(errorMsg);
            }
        } catch (error) {
            console.error("❌ Error creating post:", error);
            showError(error.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal post-modal">
                <div className="modal-header">
                    <h2>Create Post</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="post-user-info">
                        {user?.avatar ? (
                            <img
                                src={getImageUrl(user.avatar)}
                                alt={user.name}
                                className="post-user-avatar"
                            />
                        ) : (
                            <div className="post-user-avatar-placeholder">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="post-user-name">{user?.name || 'Anonymous'}</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content *</label>
                        <textarea
                            className="modal-textarea"
                            placeholder="What's on your mind? Share your travel experience..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">City *</label>
                        <select
                            className="modal-select"
                            value={cityId}
                            onChange={(e) => setCityId(e.target.value)}
                            required
                        >
                            <option value="">Select a city</option>
                            {cities && cities.map(city => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select
                            className="modal-select"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories && categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Images</label>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="image-input"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="image-upload-label">
                                <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
                                <span>Click to upload images</span>
                                <span style={{ fontSize: 11, color: '#6b6a67', marginTop: 4 }}>
                                    {images.length > 0 ? `${images.length} image(s) selected` : 'JPG, PNG, GIF, WEBP'}
                                </span>
                            </label>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="image-previews">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="image-preview">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => removeImage(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Creating..." : "Post"}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .post-modal {
                    max-width: 500px;
                    width: 100%;
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 20px;
                    color: #1a1a1a;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6b6a67;
                    padding: 4px 8px;
                }
                .modal-close:hover {
                    color: #1a1a1a;
                }
                .post-user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .post-user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .post-user-avatar-placeholder {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #dc2626;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                }
                .post-user-name {
                    font-weight: 600;
                    font-size: 14px;
                    color: #1a1a1a;
                }
                .form-group {
                    margin-bottom: 12px;
                }
                .form-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #4b5563;
                    margin-bottom: 4px;
                }
                .modal-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    background: #fafafa;
                    resize: vertical;
                    min-height: 80px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .modal-textarea:focus {
                    border-color: #dc2626;
                    background: white;
                }
                .modal-select {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    background: #fafafa;
                    outline: none;
                    transition: border-color 0.2s;
                    color: #1a1a1a;
                }
                .modal-select:focus {
                    border-color: #dc2626;
                    background: white;
                }
                .image-upload-area {
                    border: 2px dashed #e0e0e0;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.2s;
                    background: #fafafa;
                }
                .image-upload-area:hover {
                    border-color: #dc2626;
                }
                .image-input {
                    display: none;
                }
                .image-upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    color: #6b6a67;
                    font-size: 14px;
                }
                .image-previews {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-top: 12px;
                }
                .image-preview {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #e0e0e0;
                }
                .image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .remove-image {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    transition: background 0.2s;
                }
                .remove-image:hover {
                    background: rgba(0,0,0,0.8);
                }
                .modal-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }
                .cancel-btn, .submit-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'DM Sans', sans-serif;
                }
                .cancel-btn {
                    background: #f3f4f6;
                    color: #4b5563;
                }
                .cancel-btn:hover {
                    background: #e5e7eb;
                }
                .submit-btn {
                    background: #dc2626;
                    color: white;
                }
                .submit-btn:hover:not(:disabled) {
                    background: #b91c1c;
                }
                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default PostModal;