import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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

export function PostCard({ post, onLike, onComment, onDelete, onDeleteComment, onFetchComments }) {
    const { user } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();
    const navigate = useNavigate();
    const [liked, setLiked] = useState(post.liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const initials = (name) =>
        name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

    const formatDate = (d) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        });
    };

    const handleUserClick = (userId) => {
        if (userId) {
            navigate(`/user/${userId}`);
        }
    };

    const handleLike = async () => {
        setLiked(v => !v);
        setLikesCount(v => liked ? v - 1 : v + 1);
        const result = await onLike(post.id);
        if (!result.success) {
            setLiked(v => !v);
            setLikesCount(v => liked ? v + 1 : v - 1);
            showError(result.error || "Failed to like post");
        }
    };

    const handleToggleComments = async () => {
        const opening = !showComments;
        setShowComments(opening);
        if (opening && onFetchComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const fresh = await onFetchComments(post.id);
                setComments(fresh || []);
            } catch {
                showError("Failed to load comments");
            } finally {
                setLoadingComments(false);
            }
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        const result = await onComment(post.id, commentText);
        setSubmittingComment(false);
        if (result.success) {
            const newComment = result.comment ?? {
                id: Date.now(),
                content: commentText,
                user: user,
                created_at: new Date().toISOString(),
            };
            setComments(prev => [...prev, newComment]);
            setCommentsCount(v => v + 1);
            setCommentText("");
            showSuccess("Comment added!");
        } else {
            showError(result.error || "Failed to post comment");
        }
    };

    const handleDeleteComment = async (commentId) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentsCount(v => v - 1);
        if (onDeleteComment) {
            const result = await onDeleteComment(post.id, commentId);
            if (!result.success) {
                showError(result.error || "Failed to delete comment");
                const fresh = onFetchComments ? await onFetchComments(post.id) : [];
                setComments(fresh);
                setCommentsCount(fresh.length);
            } else {
                showSuccess("Comment deleted!");
            }
        }
    };

    const handleDeleteClick = () => {
        if (!user) {
            showWarning("Please login to delete posts");
            return;
        }
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        if (onDelete) {
            try {
                await onDelete(post.id);
                showSuccess("Post deleted!");
            } catch (error) {
                showError("Failed to delete post");
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const isOwner = user && (user.id === post.user_id || user.id === post.user?.id);

    const btnBase = {
        display: "flex", alignItems: "center", gap: 5,
        padding: "6px 10px", border: "none", background: "transparent",
        borderRadius: 8, fontSize: 13, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s, color 0.15s"
    };

    const getPostImage = () => {
        if (post.media && post.media.length > 0) {
            if (post.media[0].startsWith('http://') || post.media[0].startsWith('https://')) {
                return post.media[0];
            }
            return getImageUrl(post.media[0]);
        }
        return null;
    };

    const postImage = getPostImage();

    return (
        <>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="delete-modal-overlay" onClick={(e) => e.target === e.currentTarget && cancelDelete()}>
                    <div className="delete-modal">
                        <h3>Delete Post?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-cancel" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="delete-modal-confirm" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="post-card">
                {/* ── Header ── */}
                <div className="post-header">
                    <div
                        style={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: "var(--sand)", color: "var(--primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 600, flexShrink: 0,
                            overflow: "hidden",
                            cursor: "pointer"
                        }}
                        onClick={() => handleUserClick(post.user_id || post.user?.id)}
                    >
                        {post.user?.avatar ? (
                            <img
                                src={getImageUrl(post.user.avatar)}
                                alt={post.user.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    e.target.parentElement.textContent = initials(post.user?.name || "A");
                                }}
                            />
                        ) : (
                            initials(post.user?.name || "A")
                        )}
                    </div>

                    <div className="post-author-info">
                        <div
                            className="post-author-name"
                            style={{
                                cursor: "pointer",
                                fontWeight: 600,
                                color: "var(--text)"
                            }}
                            onClick={() => handleUserClick(post.user_id || post.user?.id)}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text)"}
                        >
                            {post.user?.name || "Anonymous"}
                        </div>
                        <div className="post-location">
                            <i className="ti ti-map-pin" style={{ fontSize: 11 }} aria-hidden="true" />
                            {post.city?.name || "Morocco"}
                        </div>
                    </div>

                    {isOwner && (
                        <button
                            onClick={handleDeleteClick}
                            aria-label="Delete post"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "28px",
                                height: "28px",
                                background: "transparent",
                                color: "#9ca3af",
                                border: "none",
                                borderRadius: "50%",
                                fontSize: "16px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fee2e2";
                                e.currentTarget.style.color = "#dc2626";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#9ca3af";
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* ── Image ── */}
                {postImage && !imageError && (
                    <div style={{ padding: "0 0 8px 0" }}>
                        <img
                            src={postImage}
                            alt={post.content || "Post image"}
                            className="post-image"
                            onError={(e) => {
                                console.error("Image failed to load:", postImage);
                                setImageError(true);
                                e.target.style.display = "none";
                            }}
                            loading="lazy"
                        />
                    </div>
                )}

                {/* ── Action row ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px 6px", borderTop: "1px solid var(--border)" }}>
                    <button
                        onClick={handleLike}
                        aria-label="Like"
                        style={{ ...btnBase, color: liked ? "var(--primary)" : "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--sand)"; e.currentTarget.style.color = "var(--primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = liked ? "var(--primary)" : "var(--text-muted)"; }}
                    >
                        <i className="ti ti-heart" style={{ fontSize: 17 }} aria-hidden="true" />
                        <span>{likesCount}</span>
                    </button>

                    <button
                        onClick={handleToggleComments}
                        aria-label="Comments"
                        style={{ ...btnBase, color: showComments ? "var(--primary)" : "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--sand)"; e.currentTarget.style.color = "var(--primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = showComments ? "var(--primary)" : "var(--text-muted)"; }}
                    >
                        <i className="ti ti-message-circle" style={{ fontSize: 17 }} aria-hidden="true" />
                        <span>{commentsCount}</span>
                    </button>

                    <button
                        aria-label="Share"
                        style={{ ...btnBase, color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--sand)"; e.currentTarget.style.color = "var(--primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                        <i className="ti ti-share" style={{ fontSize: 17 }} aria-hidden="true" />
                    </button>
                </div>

                {/* ── Caption ── */}
                <div className="post-caption">
                    <strong
                        style={{ cursor: "pointer" }}
                        onClick={() => handleUserClick(post.user_id || post.user?.id)}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                    >
                        {post.user?.name}
                    </strong>{" "}
                    {post.content}{" "}
                    {post.tags && <span className="post-tags">{post.tags}</span>}
                </div>
                <div className="post-time">{formatDate(post.created_at)}</div>

                {/* ── Comments section ── */}
                {showComments && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px" }}>
                        {loadingComments ? (
                            <div style={{ textAlign: "center", padding: 12, fontSize: 13, color: "var(--text-muted)" }}>
                                Loading comments...
                            </div>
                        ) : comments.length === 0 ? (
                            <div style={{
                                textAlign: "center", padding: 12, fontSize: 13,
                                color: "var(--text-muted)", background: "var(--sand)", borderRadius: 10
                            }}>
                                No comments yet. Be the first!
                            </div>
                        ) : (
                            <div style={{ marginBottom: 12, maxHeight: 300, overflowY: "auto" }}>
                                {comments.map((c, idx) => {
                                    const isMyComment = user && (c.user?.id === user.id || c.user_id === user.id);
                                    return (
                                        <div key={c.id || idx} style={{
                                            display: "flex", gap: 8, padding: "8px 0",
                                            borderBottom: idx < comments.length - 1 ? "1px solid var(--border)" : "none"
                                        }}>
                                            <div
                                                style={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    background: "var(--sand)", color: "var(--primary)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                                                    overflow: "hidden",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => handleUserClick(c.user_id || c.user?.id)}
                                            >
                                                {c.user?.avatar ? (
                                                    <img
                                                        src={getImageUrl(c.user.avatar)}
                                                        alt={c.user.name}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover"
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = "none";
                                                            e.target.parentElement.textContent = initials(c.user?.name || "A");
                                                        }}
                                                    />
                                                ) : (
                                                    initials(c.user?.name || "A")
                                                )}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                        color: "var(--text)",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => handleUserClick(c.user_id || c.user?.id)}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text)"}
                                                >
                                                    {c.user?.name || "Anonymous"}
                                                </div>
                                                <div style={{ fontSize: 13, color: "var(--text)", marginTop: 2, lineHeight: 1.4 }}>
                                                    {c.content}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                        {formatDate(c.created_at)}
                                                    </span>
                                                    {isMyComment && (
                                                        <button
                                                            onClick={() => handleDeleteComment(c.id)}
                                                            aria-label="Delete comment"
                                                            style={{
                                                                display: "flex", alignItems: "center", gap: 3,
                                                                fontSize: 11, color: "var(--text-muted)",
                                                                background: "none", border: "none",
                                                                cursor: "pointer", padding: 0,
                                                                fontFamily: "'DM Sans', sans-serif",
                                                                transition: "color 0.15s"
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                                                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                                                        >
                                                            <i className="ti ti-trash" style={{ fontSize: 12 }} aria-hidden="true" />
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {user && (
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                                <div
                                    style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: "var(--sand)", color: "var(--primary)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 11, fontWeight: 600, flexShrink: 0,
                                        overflow: "hidden",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={getImageUrl(user.avatar)}
                                            alt={user.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover"
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = "none";
                                                e.target.parentElement.textContent = initials(user.name);
                                            }}
                                        />
                                    ) : (
                                        initials(user.name)
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && !submittingComment && handleComment()}
                                    placeholder="Write a comment..."
                                    style={{
                                        flex: 1, padding: "8px 14px",
                                        border: "1px solid var(--border)", borderRadius: 20,
                                        fontSize: 13, background: "var(--sand)",
                                        color: "var(--text)", outline: "none",
                                        fontFamily: "'DM Sans', sans-serif"
                                    }}
                                />
                                <button
                                    onClick={handleComment}
                                    disabled={!commentText.trim() || submittingComment}
                                    style={{
                                        padding: "7px 16px",
                                        background: commentText.trim() ? "var(--primary)" : "var(--border)",
                                        color: commentText.trim() ? "#fff" : "var(--text-muted)",
                                        border: "none", borderRadius: 20,
                                        fontSize: 13, fontWeight: 600,
                                        cursor: commentText.trim() ? "pointer" : "not-allowed",
                                        fontFamily: "'DM Sans', sans-serif",
                                        transition: "background 0.15s"
                                    }}
                                >
                                    {submittingComment ? "..." : "Post"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .post-card {
                    background: white;
                    border-radius: 16px;
                    margin-bottom: 16px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    border: 1px solid #f0f0f0;
                    overflow: hidden;
                }

                .post-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                }

                .post-author-info {
                    flex: 1;
                    min-width: 0;
                }

                .post-author-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .post-location {
                    font-size: 12px;
                    color: #6b6a67;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .post-image {
                    width: 100%;
                    max-height: 500px;
                    object-fit: cover;
                }

                .post-caption {
                    padding: 4px 16px 2px;
                    font-size: 14px;
                    color: #1a1a1a;
                    line-height: 1.5;
                }

                .post-tags {
                    color: var(--primary);
                    font-weight: 500;
                }

                .post-time {
                    padding: 0 16px 8px;
                    font-size: 12px;
                    color: #6b6a67;
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
                    padding: 28px 32px;
                    max-width: 380px;
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
                    margin-bottom: 4px;
                    color: #1a1917;
                }

                .delete-modal p {
                    color: #6b6a67;
                    margin-bottom: 20px;
                    font-size: 14px;
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
            `}</style>
        </>
    );
}

export default PostCard;