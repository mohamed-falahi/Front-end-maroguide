import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function PostCard({ post, onLike, onComment, onDelete, onFetchComments }) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
    const [comments, setComments] = useState(post.comments || []);
    const [loadingComments, setLoadingComments] = useState(false);

    const handleLike = async () => {
        const result = await onLike(post.id);
        if (result.success) {
            setLiked(!liked);
            setLikesCount(prev => liked ? prev - 1 : prev + 1);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        const result = await onComment(post.id, commentText);
        if (result.success) {
            if (onFetchComments) {
                setLoadingComments(true);
                const freshComments = await onFetchComments(post.id);
                setComments(freshComments);
                setCommentsCount(freshComments.length);
                setLoadingComments(false);
            } else {
                const newComment = {
                    id: Date.now(),
                    content: commentText,
                    user: user,
                    created_at: new Date().toISOString()
                };
                setComments([...comments, newComment]);
                setCommentsCount(prev => prev + 1);
            }
            setCommentText("");
        }
    };

    const toggleComments = async () => {
        console.log("=== TOGGLE COMMENTS CALLED ===");
        console.log("Current showComments:", showComments);
        console.log("onFetchComments exists?", !!onFetchComments);
        console.log("Post ID:", post.id);

        setShowComments(!showComments);

        if (!showComments && onFetchComments) {
            console.log("Condition met! Fetching comments...");
            setLoadingComments(true);
            try {
                const freshComments = await onFetchComments(post.id);
                console.log("Comments received from onFetchComments:", freshComments);
                console.log("Comments array length:", freshComments?.length);
                console.log("First comment:", freshComments?.[0]);

                setComments(freshComments || []);
                setCommentsCount(freshComments?.length || 0);
            } catch (error) {
                console.error("Error in toggleComments:", error);
            } finally {
                setLoadingComments(false);
            }
        } else {
            console.log("Condition NOT met. showComments:", showComments, "onFetchComments exists:", !!onFetchComments);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="avatar" style={{ background: "#f0e0d0", fontSize: "18px" }}>👤</div>
                <div className="post-author-info">
                    <div className="post-author-name">{post.user?.name || post.author || "Anonymous"}</div>
                    <div className="post-location">📍 {post.city?.name || post.role || "Morocco"}</div>
                </div>
                {user && (user.id === post.user_id) && (
                    <button className="post-more" onClick={() => onDelete && onDelete(post.id)}>🗑️</button>
                )}
            </div>
            {post.media && post.media[0] && <img src={post.media[0]} alt="" className="post-image" />}
            <div className="post-actions">
                <button className={`post-action-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
                    {liked ? "❤️" : "🤍"} {likesCount}
                </button>
                <button className="post-action-btn" onClick={toggleComments}>
                    💬 {commentsCount}
                </button>
                <button className="post-action-btn">↗</button>
                <button className={`bookmark-btn`} onClick={() => setBookmarked(v => !v)}>
                    {bookmarked ? "🔖" : "📄"}
                </button>
            </div>
            <div className="post-caption">
                <strong>{post.user?.name || post.author}</strong>{" "}{post.content}{" "}
                <span className="post-tags">{post.tags}</span>
            </div>
            <div className="post-time">{formatDate(post.created_at)}</div>

            {showComments && (
                <div style={{ padding: "0 16px 16px" }}>
                    {loadingComments ? (
                        <div style={{ textAlign: "center", padding: "12px", color: "var(--text-muted)" }}>
                            Loading comments...
                        </div>
                    ) : comments.length > 0 ? (
                        <div style={{ marginBottom: "12px", maxHeight: "300px", overflowY: "auto" }}>
                            {comments.map((comment, idx) => (
                                <div key={comment.id || idx} style={{
                                    padding: "8px 0",
                                    borderBottom: idx < comments.length - 1 ? "1px solid var(--border)" : "none"
                                }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                        <div style={{ fontSize: "14px", minWidth: "24px" }}>👤</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: "12px", marginBottom: "2px" }}>
                                                {comment.user?.name || comment.user || "Anonymous"}
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text)", marginBottom: "4px" }}>
                                                {comment.content}
                                            </div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                                                {formatDate(comment.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: "12px",
                            padding: "12px",
                            background: "var(--sand)",
                            borderRadius: "12px",
                            marginBottom: "12px"
                        }}>
                            No comments yet. Be the first to comment!
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                border: "1px solid var(--border)",
                                borderRadius: "20px",
                                outline: "none",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "13px"
                            }}
                            onKeyPress={(e) => e.key === "Enter" && handleComment()}
                        />
                        <button
                            onClick={handleComment}
                            style={{
                                padding: "8px 16px",
                                background: commentText.trim() ? "var(--primary)" : "var(--border)",
                                color: commentText.trim() ? "white" : "var(--text-muted)",
                                border: "none",
                                borderRadius: "20px",
                                cursor: commentText.trim() ? "pointer" : "not-allowed",
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 500,
                                fontSize: "13px",
                                transition: "all 0.2s"
                            }}
                            disabled={!commentText.trim()}
                        >
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}