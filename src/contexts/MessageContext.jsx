import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const MessageContext = createContext();

export function MessageProvider({ children }) {
    const { token, user } = useAuth();
    const { showError, showSuccess } = useToast();
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const hasInitialized = useRef(false);

    // Group messages by conversation
    const groupMessagesByConversation = useCallback((allMessages) => {
        const grouped = {};

        allMessages.forEach(msg => {
            const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;

            if (!grouped[otherUserId]) {
                grouped[otherUserId] = {
                    user_id: otherUserId,
                    user: msg.sender_id === user?.id ? msg.receiver : msg.sender,
                    messages: [],
                    last_message: msg.content,
                    last_message_time: msg.created_at,
                    unread_count: 0
                };
            }

            grouped[otherUserId].messages.push(msg);

            if (new Date(msg.created_at) > new Date(grouped[otherUserId].last_message_time)) {
                grouped[otherUserId].last_message = msg.content;
                grouped[otherUserId].last_message_time = msg.created_at;
            }

            if (msg.receiver_id === user?.id && !msg.read) {
                grouped[otherUserId].unread_count++;
            }
        });

        return Object.values(grouped).sort((a, b) =>
            new Date(b.last_message_time) - new Date(a.last_message_time)
        );
    }, [user]);

    // Initialize - only run once
    const initialize = useCallback(async () => {
        if (hasInitialized.current) {
            console.log('Already initialized, skipping...');
            return;
        }

        if (!user) {
            console.log('No user, skipping initialization');
            return;
        }

        hasInitialized.current = true;
        setLoading(true);

        try {
            console.log('Initializing messages...');
            const response = await api.authGet('/messages', token);
            console.log('Messages loaded:', response?.length || 0, 'messages');

            let messagesData = [];
            if (Array.isArray(response)) {
                messagesData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                messagesData = response.data;
            } else if (response && response.messages && Array.isArray(response.messages)) {
                messagesData = response.messages;
            }

            setMessages(messagesData);
            const grouped = groupMessagesByConversation(messagesData);
            setConversations(grouped);

        } catch (error) {
            console.error('Error loading messages:', error);
            showError('Failed to load messages');
            // Set empty arrays to prevent further errors
            setMessages([]);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [user, token, showError, groupMessagesByConversation]);

    // Auto-initialize when user is present
    useEffect(() => {
        if (user && !hasInitialized.current) {
            initialize();
        }
    }, [user, initialize]);

    // Get messages for a specific conversation - FIXED
    const fetchMessages = useCallback(async (userId) => {
        if (!user) {
            console.log('No user, cannot fetch messages');
            return [];
        }

        if (!userId) {
            console.log('No userId provided');
            return [];
        }

        try {
            console.log('Fetching messages for conversation with user:', userId);

            // If messages are not loaded yet, wait for them
            if (messages.length === 0 && !loading) {
                console.log('Messages not loaded yet, initializing...');
                await initialize();
            }

            // Filter messages for this conversation
            const conversationMessages = messages.filter(msg =>
                (msg.sender_id === user.id && msg.receiver_id === parseInt(userId)) ||
                (msg.sender_id === parseInt(userId) && msg.receiver_id === user.id)
            );

            console.log('Found', conversationMessages.length, 'messages for this conversation');

            const sortedMessages = [...conversationMessages].sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            );

            setCurrentConversation(parseInt(userId));
            return sortedMessages;

        } catch (error) {
            console.error('Error fetching conversation messages:', error);
            showError('Failed to load messages');
            return [];
        }
    }, [user, messages, loading, initialize, showError]);

    // Send a message
    const sendMessage = useCallback(async (receiverId, content) => {
        if (!user) {
            showError('Please login to send messages');
            return null;
        }
        if (!content || !content.trim()) {
            showError('Message cannot be empty');
            return null;
        }

        setSending(true);

        const tempMessage = {
            id: Date.now() + Math.random(),
            sender_id: user.id,
            receiver_id: parseInt(receiverId),
            content: content.trim(),
            created_at: new Date().toISOString(),
            read: false,
            temp: true,
            sender: user,
            receiver: { id: parseInt(receiverId) }
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const postData = {
                receiver_id: parseInt(receiverId),
                content: content.trim()
            };

            console.log('Sending message:', postData);

            const response = await api.authPost('/messages', postData, token);

            if (response && response.id) {
                const realMessage = {
                    ...response,
                    temp: false,
                    sender: response.sender || user,
                    receiver: response.receiver || { id: parseInt(receiverId) }
                };

                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === tempMessage.id ? realMessage : msg
                    )
                );

                // Update conversations
                setConversations(prev => {
                    const existing = prev.find(c => c.user_id === parseInt(receiverId));
                    if (existing) {
                        return prev.map(c =>
                            c.user_id === parseInt(receiverId)
                                ? {
                                    ...c,
                                    last_message: content.trim(),
                                    last_message_time: new Date().toISOString()
                                }
                                : c
                        );
                    }
                    // Add new conversation
                    const newConv = {
                        user_id: parseInt(receiverId),
                        user: { id: parseInt(receiverId), name: 'User ' + receiverId },
                        messages: [realMessage],
                        last_message: content.trim(),
                        last_message_time: new Date().toISOString(),
                        unread_count: 0
                    };
                    return [newConv, ...prev];
                });

                showSuccess('Message sent!');
                return realMessage;
            } else {
                showError(response?.message || 'Failed to send message');
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === tempMessage.id
                            ? { ...msg, temp: false, failed: true }
                            : msg
                    )
                );
                return null;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showError(error.message || 'Failed to send message');
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, temp: false, failed: true }
                        : msg
                )
            );
            return null;
        } finally {
            setSending(false);
        }
    }, [user, token, showError, showSuccess]);

    // Mark messages as read
    const markAsRead = useCallback(async (senderId) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.sender_id === parseInt(senderId) &&
                    msg.receiver_id === user?.id &&
                    !msg.read
                    ? { ...msg, read: true }
                    : msg
            )
        );

        setConversations(prev =>
            prev.map(c =>
                c.user_id === parseInt(senderId)
                    ? { ...c, unread_count: 0 }
                    : c
            )
        );
    }, [user]);

    // Clear current conversation
    const clearConversation = useCallback(() => {
        setCurrentConversation(null);
    }, []);

    // Get user details for a conversation
    const getConversationUser = useCallback((userId) => {
        const conversation = conversations.find(c => c.user_id === parseInt(userId));
        return conversation ? conversation.user : null;
    }, [conversations]);

    // Reset state (for logout)
    const reset = useCallback(() => {
        hasInitialized.current = false;
        setConversations([]);
        setMessages([]);
        setCurrentConversation(null);
    }, []);

    return (
        <MessageContext.Provider
            value={{
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
                reset,
                initialize,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
}