import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const API_BASE_URL = "http://127.0.0.1:8000";

export function MessagesPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        conversations,
        messages,
        currentConversation,
        loading,
        sending,
        fetchMessages,
        sendMessage,
        markAsRead,
        clearConversation,
        getConversationUser,
        initialize
    } = useMessages();
    const { showError } = useToast();
    const [messageInput, setMessageInput] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [conversationMessages, setConversationMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

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

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    useEffect(() => {
        if (!userId) {
            setSelectedUser(null);
            setConversationMessages([]);
            setError(null);
            return;
        }

        let isMounted = true;

        const loadMessages = async () => {
            if (!isMounted) return;

            setLoadingMessages(true);
            setError(null);

            try {
                console.log('Loading messages for user:', userId);

                // Get messages for this conversation
                const conversationMsgs = await fetchMessages(userId);

                console.log('Received messages:', conversationMsgs);

                if (isMounted) {
                    setConversationMessages(conversationMsgs || []);
                }

                // Mark messages as read
                await markAsRead(userId);

                // Find the user
                const conversationUser = getConversationUser(userId);
                if (conversationUser && isMounted) {
                    setSelectedUser(conversationUser);
                } else if (isMounted) {
                    try {
                        const response = await api.get(`/users/${userId}`);
                        if (response && response.user && isMounted) {
                            setSelectedUser(response.user);
                        } else if (isMounted) {
                            setSelectedUser({
                                id: parseInt(userId),
                                name: `User ${userId}`,
                                avatar: null,
                                bio: 'Traveler'
                            });
                        }
                    } catch (err) {
                        console.error('Error fetching user:', err);
                        if (isMounted) {
                            setSelectedUser({
                                id: parseInt(userId),
                                name: `User ${userId}`,
                                avatar: null,
                                bio: 'Traveler'
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading messages:', err);
                if (isMounted) {
                    setError('Failed to load messages');
                }
            } finally {
                if (isMounted) {
                    setLoadingMessages(false);
                }
            }
        };

        loadMessages();

        return () => {
            isMounted = false;
        };
    }, [userId, fetchMessages, markAsRead, getConversationUser]);
    // Update conversation messages when messages change (for new messages)
    useEffect(() => {
        if (!userId || !messages.length) return;

        // Filter messages for this conversation
        const filteredMessages = messages.filter(msg =>
            (msg.sender_id === user?.id && msg.receiver_id === parseInt(userId)) ||
            (msg.sender_id === parseInt(userId) && msg.receiver_id === user?.id)
        );

        // Sort by created_at
        const sortedMessages = [...filteredMessages].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        setConversationMessages(sortedMessages);
    }, [messages, userId, user?.id]);

    // Scroll to bottom when conversationMessages change
    useEffect(() => {
        if (conversationMessages.length > 0) {
            scrollToBottom();
        }
    }, [conversationMessages, scrollToBottom]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;
        if (sending) return;

        const sentMessage = await sendMessage(selectedUser.id, messageInput.trim());
        if (sentMessage) {
            setMessageInput('');
            scrollToBottom();
        }
    };

    const handleSelectConversation = (conversation) => {
        navigate(`/messages/${conversation.user_id}`);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.created_at);
            const dateKey = date.toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });
        return groups;
    };

    if (loading && !conversations.length) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading messages...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <p style={{ color: '#dc2626', fontSize: '18px' }}>⚠️ {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '8px 20px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="messages-container">
            <style>{`
                .messages-container {
                    display: flex;
                    height: calc(100vh - 70px);
                    background: #f8f7f4;
                    font-family: 'DM Sans', sans-serif;
                    overflow: hidden;
                    position: relative;
                }
                .conversations-sidebar {
                    width: 320px;
                    min-width: 320px;
                    background: white;
                    border-right: 1px solid #eaeaea;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .conversations-header {
                    padding: 20px;
                    border-bottom: 1px solid #eaeaea;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }
                .conversations-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                }
                .back-to-messages {
                    background: none;
                    border: none;
                    color: #6b6a67;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 4px 8px;
                    transition: color 0.2s;
                }
                .back-to-messages:hover {
                    color: #1a1a1a;
                }
                .conversations-list {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                .conversations-list::-webkit-scrollbar {
                    width: 4px;
                }
                .conversations-list::-webkit-scrollbar-track {
                    background: transparent;
                }
                .conversations-list::-webkit-scrollbar-thumb {
                    background: #d1d1d1;
                    border-radius: 4px;
                }
                .conversation-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    cursor: pointer;
                    border-bottom: 1px solid #f1f0ed;
                    transition: all 0.15s ease;
                    min-height: 72px;
                }
                .conversation-item:hover {
                    background: #f8f7f4;
                }
                .conversation-item.active {
                    background: rgba(184, 134, 11, 0.08);
                    border-left: 3px solid #b8860b;
                }
                .conversation-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #f1f0ed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .conversation-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .conversation-info {
                    flex: 1;
                    min-width: 0;
                }
                .conversation-name {
                    font-weight: 600;
                    font-size: 14px;
                    color: #1a1a1a;
                    margin-bottom: 2px;
                }
                .conversation-last-message {
                    font-size: 13px;
                    color: #6b6a67;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .conversation-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 4px;
                    flex-shrink: 0;
                }
                .conversation-time {
                    font-size: 11px;
                    color: #8c8c8c;
                    white-space: nowrap;
                }
                .unread-badge {
                    background: #dc2626;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 12px;
                    min-width: 20px;
                    text-align: center;
                }
                .no-conversations {
                    padding: 40px 20px;
                    text-align: center;
                    color: #6b6a67;
                }
                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                    height: 100%;
                    min-width: 0;
                }
                .chat-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid #eaeaea;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    flex-shrink: 0;
                }
                .chat-header-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: #f1f0ed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .chat-header-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .chat-header-name {
                    font-weight: 600;
                    font-size: 15px;
                    color: #1a1a1a;
                }
                .chat-header-status {
                    font-size: 12px;
                    color: #6b6a67;
                }
                .chat-messages {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: #fafafa;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .chat-messages::-webkit-scrollbar {
                    width: 4px;
                }
                .chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-messages::-webkit-scrollbar-thumb {
                    background: #d1d1d1;
                    border-radius: 4px;
                }
                .message-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .message-date-divider {
                    text-align: center;
                    font-size: 12px;
                    color: #8c8c8c;
                    padding: 12px 0;
                }
                .message {
                    max-width: 70%;
                    padding: 10px 14px;
                    border-radius: 12px;
                    font-size: 14px;
                    line-height: 1.5;
                    word-wrap: break-word;
                    animation: messageIn 0.2s ease;
                }
                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .message.sent {
                    align-self: flex-end;
                    background: #b8860b;
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                .message.received {
                    align-self: flex-start;
                    background: #f1f0ed;
                    color: #1a1a1a;
                    border-bottom-left-radius: 4px;
                }
                .message-time {
                    font-size: 10px;
                    opacity: 0.7;
                    margin-top: 4px;
                    display: block;
                }
                .message.sent .message-time {
                    text-align: right;
                }
                .message.read-status {
                    font-size: 10px;
                    margin-left: 4px;
                }
                .message.failed {
                    border: 1px solid #dc2626 !important;
                }
                .message.sending {
                    opacity: 0.7;
                }
                .no-messages {
                    text-align: center;
                    color: #6b6a67;
                    padding: 40px;
                    margin: auto;
                }
                .chat-input-area {
                    padding: 16px 24px;
                    border-top: 1px solid #eaeaea;
                    background: white;
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                    flex-shrink: 0;
                }
                .chat-input {
                    flex: 1;
                    padding: 10px 16px;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    font-size: 14px;
                    font-family: 'DM Sans', sans-serif;
                    resize: none;
                    outline: none;
                    transition: border-color 0.2s;
                    max-height: 100px;
                    min-height: 42px;
                    line-height: 1.5;
                    color: #1a1a1a;
                    background: #fafafa;
                }
                .chat-input:focus {
                    border-color: #b8860b;
                    background: white;
                }
                .chat-input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .chat-input::placeholder {
                    color: #8c8c8c;
                }
                .send-btn {
                    padding: 10px 24px;
                    background: #b8860b;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: 'DM Sans', sans-serif;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .send-btn:hover:not(:disabled) {
                    background: #a0750a;
                    transform: scale(1.02);
                }
                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                @media (max-width: 768px) {
                    .messages-container {
                        flex-direction: column;
                        height: calc(100vh - 70px);
                    }
                    .conversations-sidebar {
                        width: 100%;
                        min-width: unset;
                        max-height: 45vh;
                        border-right: none;
                        border-bottom: 1px solid #eaeaea;
                        height: auto;
                    }
                    .conversations-header {
                        padding: 14px 16px;
                    }
                    .conversations-header h2 {
                        font-size: 16px;
                    }
                    .chat-area {
                        height: 55vh;
                        flex: 1;
                    }
                    .chat-header {
                        padding: 12px 16px;
                    }
                    .chat-messages {
                        padding: 16px;
                    }
                    .chat-input-area {
                        padding: 12px 16px;
                    }
                    .message {
                        max-width: 85%;
                        font-size: 13px;
                    }
                    .conversation-item {
                        padding: 12px 16px;
                        min-height: 60px;
                    }
                }
                @media (max-width: 480px) {
                    .messages-container {
                        height: calc(100vh - 60px);
                    }
                    .conversations-sidebar {
                        max-height: 35vh;
                    }
                    .chat-area {
                        height: 65vh;
                    }
                    .chat-header-name {
                        font-size: 13px;
                    }
                    .send-btn {
                        padding: 8px 16px;
                        font-size: 13px;
                        height: 38px;
                    }
                    .chat-input {
                        font-size: 13px;
                        min-height: 38px;
                    }
                }
                .empty-chat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #6b6a67;
                    padding: 40px;
                    text-align: center;
                }
                .empty-chat-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                .empty-chat-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                }
                .empty-chat-subtitle {
                    font-size: 14px;
                    color: #6b6a67;
                }
            `}</style>

            {/* Conversations List */}
            <div className="conversations-sidebar">
                <div className="conversations-header">
                    <h2>💬 Messages</h2>
                    <button
                        className="back-to-messages"
                        onClick={() => navigate('/')}
                    >
                        ← Back
                    </button>
                </div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
                            <p>No conversations yet</p>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>
                                Start messaging with other travelers!
                            </p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.user_id}
                                className={`conversation-item ${currentConversation === conv.user_id ? 'active' : ''}`}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <div className="conversation-avatar">
                                    {conv.user?.avatar ? (
                                        <img src={getImageUrl(conv.user.avatar)} alt={conv.user.name} />
                                    ) : (
                                        <span style={{ fontSize: '18px' }}>👤</span>
                                    )}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-name">{conv.user?.name || 'Unknown User'}</div>
                                    <div className="conversation-last-message">
                                        {conv.last_message || 'No messages yet'}
                                    </div>
                                </div>
                                <div className="conversation-meta">
                                    <div className="conversation-time">
                                        {conv.last_message_time && formatTime(conv.last_message_time)}
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <div className="unread-badge">{conv.unread_count}</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-avatar">
                                {selectedUser.avatar ? (
                                    <img src={getImageUrl(selectedUser.avatar)} alt={selectedUser.name} />
                                ) : (
                                    <span style={{ fontSize: '16px' }}>👤</span>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="chat-header-name">{selectedUser.name}</div>
                                <div className="chat-header-status">
                                    {loadingMessages ? 'Loading...' : 'Online'}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/profile/${selectedUser.id}`)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b6a67',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    padding: '4px 8px',
                                    whiteSpace: 'nowrap',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#1a1a1a'}
                                onMouseLeave={(e) => e.target.style.color = '#6b6a67'}
                            >
                                View Profile
                            </button>
                        </div>

                        <div className="chat-messages" id="chatMessages">
                            {loadingMessages ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    Loading messages...
                                </div>
                            ) : conversationMessages.length === 0 ? (
                                <div className="no-messages">
                                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>💬</p>
                                    <p>No messages yet</p>
                                    <p style={{ fontSize: '13px', marginTop: '4px', color: '#6b6a67' }}>
                                        Send a message to start the conversation!
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupMessagesByDate(conversationMessages)).map(([date, msgs]) => (
                                    <div key={date} className="message-group">
                                        <div className="message-date-divider">
                                            {new Date(date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        {msgs.map((msg, idx) => (
                                            <div
                                                key={msg.id || idx}
                                                className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'} ${msg.failed ? 'failed' : ''} ${msg.temp ? 'sending' : ''}`}
                                            >
                                                {msg.content}
                                                {msg.failed && (
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: '#dc2626',
                                                        display: 'block',
                                                        marginTop: '4px'
                                                    }}>
                                                        ⚠️ Failed to send
                                                    </span>
                                                )}
                                                {msg.temp && !msg.failed && (
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: '#6b6a67',
                                                        display: 'block',
                                                        marginTop: '4px'
                                                    }}>
                                                        Sending...
                                                    </span>
                                                )}
                                                <span className="message-time">
                                                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    {msg.sender_id === user?.id && !msg.failed && (
                                                        <span className="read-status">
                                                            {msg.read ? ' ✓✓' : ' ✓'}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <textarea
                                ref={inputRef}
                                className="chat-input"
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                disabled={sending}
                                rows={1}
                            />
                            <button
                                type="submit"
                                className="send-btn"
                                disabled={!messageInput.trim() || sending}
                            >
                                {sending ? '...' : 'Send'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="empty-chat">
                        <div className="empty-chat-icon">💬</div>
                        <div className="empty-chat-title">Select a conversation</div>
                        <div className="empty-chat-subtitle">Choose a conversation from the sidebar to start messaging</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPage;