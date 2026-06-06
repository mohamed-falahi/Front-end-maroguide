import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { MOCK_CATEGORIES, MOCK_CITIES } from "../constants/mockData";

export function PostModal({ onClose, onSubmit }) {
    const { cities, categories } = useData();
    const [content, setContent] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!content || !selectedCity || !selectedCategory) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);
        const result = await onSubmit({
            content,
            city_id: selectedCity,
            category_id: selectedCategory,
            media: mediaFiles
        });
        setLoading(false);

        if (result.success) {
            onClose();
            setContent("");
            setSelectedCity("");
            setSelectedCategory("");
            setMediaFiles([]);
        } else {
            alert(result.error || "Failed to create post");
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setMediaFiles(prev => [...prev, ...files]);
    };

    const categoryList = categories.length ? categories : MOCK_CATEGORIES;
    const cityList = cities.length ? cities : MOCK_CITIES;

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-title">Create New Post</div>
                <div className="upload-zone" onClick={() => document.getElementById("fileInput").click()}>
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">Click to upload photos<br />or drag and drop your travel memories</div>
                    {mediaFiles.length > 0 && <div>{mediaFiles.length} file(s) selected</div>}
                </div>
                <input id="fileInput" type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />

                <label className="modal-label">Caption</label>
                <textarea className="modal-textarea" placeholder="Tell your travel story..." value={content} onChange={(e) => setContent(e.target.value)} />

                <label className="modal-label">Category</label>
                <div className="tag-group">
                    {categoryList.map(cat => (
                        <button
                            key={cat.id}
                            className={`tag-chip ${selectedCategory === cat.id ? "selected" : ""}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="modal-row">
                    <div>
                        <label className="modal-label">Location</label>
                        <select className="modal-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                            <option value="">Select city</option>
                            {cityList.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="modal-label">Visibility</label>
                        <select className="modal-select">
                            <option>🌍 Public</option>
                            <option>🔒 Private</option>
                            <option>👥 Followers</option>
                        </select>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Posting..." : "▶ Post Story"}
                    </button>
                </div>
            </div>
        </div>
    );
}