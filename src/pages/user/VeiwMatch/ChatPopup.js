import React, { useEffect, useState, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { getUserFromSession } from '../../../helpers/api/apiCore';
import config from '../../../config';
import io from 'socket.io-client';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import sendSound from '../../../assets/images/pixel_10_notification.mp3';

const SOCKET_URL = `${config.API_URL}/match`;

const ChatPopup = ({ showChat, setShowChat, chatMessage, setChatMessage, matchId, playerNames, setUnreadCount }) => {
    const User = getUserFromSession();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [stickyDate, setStickyDate] = useState('');
    const [showStickyDate, setShowStickyDate] = useState(false);
    const stickyDateTimeoutRef = useRef(null);



    const playSendSound = () => {
        const audio = new Audio(sendSound);
        audio.volume = 0.5;
        audio.play().catch(err => console.log("Send sound failed:", err));
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (showChat && messages.length > 0) {
            scrollToBottom();
        }
    }, [showChat]);

    useEffect(() => {
        if (showChat && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length, showChat]);

    useEffect(() => {
        if (showChat && User?._id && matchId) {
            setLoading(true);
            const loadingTimeout = setTimeout(() => {
                setLoading(false);
            }, 3000);

            socketRef.current = io(SOCKET_URL, {
                auth: { userId: User._id },
                transports: ['websocket'],
                reconnection: true
            });
            socketRef.current.on('connect', () => {
            });
            socketRef.current.on('connectionSuccess', (data) => {
                socketRef.current.emit('joinMatch', matchId);
            });
            socketRef.current.on('joinedMatch', (data) => {
                socketRef.current.emit('getMessages', { matchId, isChatOpen: true });
                socketRef.current.emit('getUnreadCount', { matchId });
            });
            socketRef.current.on('messagesReceived', (data) => {
                setMessages(data.messages || []);
                clearTimeout(loadingTimeout);
                setLoading(false);
                socketRef.current.emit('markMessageRead', { matchId });
                setTimeout(() => scrollToBottom(), 100);
            });
            socketRef.current.on('newMessage', (data) => {
                setMessages((prev) => [...prev, data]);
                console.log(data.senderId?._id === User._id, 'data.senderId?._id === User._id');
                if (data.senderId?._id === User._id) {
                    playSendSound();
                }
                socketRef.current.emit('markMessageRead', { matchId });
                socketRef.current.emit('getMessages', { matchId, isChatOpen: true });
            });

            socketRef.current.on('error', (error) => {
                console.error('❌ Socket error:', error);
            });
            return () => {
                clearTimeout(loadingTimeout);
                if (socketRef.current) {
                    socketRef.current.emit('markMessageRead', { matchId });
                    socketRef.current.disconnect();
                }
            };
        }
    }, [showChat, User?._id, matchId, SOCKET_URL]);

    useEffect(() => {
        if (socketRef.current && !showChat) {
            socketRef.current.emit('getMessages', { matchId, isChatOpen: false });
            socketRef.current.emit('getUnreadCount', { matchId });
        }
    }, [!showChat, matchId])

    const handleSendMessage = () => {
        if (chatMessage.trim() && socketRef.current) {
            const messageData = {
                matchId,
                message: chatMessage.trim(),
            };
            socketRef.current.emit('sendMessage', messageData);
            setChatMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '40px';
                textareaRef.current.blur();
                setTimeout(() => textareaRef.current?.focus(), 50);
            }
        }
    };

    const getDateLabel = (dateString) => {
        const msgDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        msgDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);

        if (msgDate.getTime() === today.getTime()) return 'Today';
        if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
        return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const shouldShowDateSeparator = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        const currentDate = new Date(currentMsg.createdAt).toDateString();
        const prevDate = new Date(prevMsg.createdAt).toDateString();
        return currentDate !== prevDate;
    };

    if (!showChat) return;

    return (
        <div
            style={{
                position: 'fixed',
                top: window.innerWidth >= 768 ? 'auto' : 0,
                bottom: window.innerWidth >= 768 ? '20px' : 0,
                left: window.innerWidth >= 768 ? 'auto' : 0,
                right: window.innerWidth >= 768 ? '20px' : 0,
                width: window.innerWidth >= 768 ? '400px' : '100%',
                height: window.innerWidth >= 768 ? '600px' : '100dvh',
                maxHeight: window.innerWidth >= 768 ? '600px' : '100dvh',
                backgroundColor: '#fff',
                borderRadius: window.innerWidth >= 768 ? '12px' : 0,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: '#F5F5F5', flexShrink: 0 }}>
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center d-md-none"
                        style={{ width: 36, height: 36 }}
                        onClick={() => setShowChat(false)}
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, backgroundColor: '#4b94f3ff', minWidth: 40 }}>
                        <i className="bi bi-people-fill" style={{ fontSize: '20px', color: '#fff' }} />
                    </div>
                    <div>
                        <h6 className="mb-0 custom-heading-use" style={{ fontFamily: 'Poppins' }}>Padel Squad - Open Match</h6>
                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>{playerNames || 'Loading...'}</p>
                    </div>
                </div>
                <button
                    className="btn btn-light rounded-circle p-2 d-none d-md-flex align-items-center justify-content-center"
                    style={{ width: 36, height: 36 }}
                    onClick={() => setShowChat(false)}
                >
                    <i className="bi bi-x-lg" />
                </button>
            </div>

            {/* Sticky Date Header */}
            {showStickyDate && (
                <div style={{
                    position: 'absolute',
                    top: '75px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    backgroundColor: '#E5E7EB',
                    color: '#6B7280',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    pointerEvents: 'none'
                }}>
                    {stickyDate}
                </div>
            )}

            {/* Chat Messages Area */}
            <div
                ref={chatContainerRef}
                style={{ flex: '1 1 auto', overflowY: 'auto', backgroundColor: '#FAFAFA', WebkitOverflowScrolling: 'touch', padding: '12px' }}
                onScroll={(e) => {
                    const container = e.target;
                    if (container.scrollTop > 50) {
                        const visibleMessages = messages.filter((msg, index) => {
                            const msgElement = container.children[index];
                            if (msgElement) {
                                const rect = msgElement.getBoundingClientRect();
                                const containerRect = container.getBoundingClientRect();
                                return rect.top >= containerRect.top && rect.top <= containerRect.top + 100;
                            }
                            return false;
                        });

                        if (visibleMessages.length > 0) {
                            const currentDate = getDateLabel(visibleMessages[0].createdAt);
                            setStickyDate(currentDate);
                            setShowStickyDate(true);

                            if (stickyDateTimeoutRef.current) {
                                clearTimeout(stickyDateTimeoutRef.current);
                            }
                            stickyDateTimeoutRef.current = setTimeout(() => {
                                setShowStickyDate(false);
                            }, 2000);
                        }
                    } else {
                        setShowStickyDate(false);
                        if (stickyDateTimeoutRef.current) {
                            clearTimeout(stickyDateTimeoutRef.current);
                        }
                    }
                }}
            >
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <ButtonLoading />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <p style={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Poppins' }}>No messages yet. Start the conversation!</p>
                    </div>
                ) : messages?.map((msg, index) => {
                    const isCurrentUser = msg.senderId?._id === User._id;
                    const userName = msg.senderId?.name || 'Unknown';
                    const nameParts = userName.trim().split(/\s+/);
                    const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[1][0] : nameParts[0]?.[0] || '?';
                    const teamColor = msg.senderTeam === 'teamA' ? '#3DBE64' : '#1F41BB';
                    const teamLabel = msg.senderTeam === 'teamA' ? 'Team A' : 'Team B';
                    const showDateSeparator = shouldShowDateSeparator(msg, messages[index - 1]);

                    return (
                        <React.Fragment key={msg._id || index}>
                            {showDateSeparator && (
                                <div className="d-flex justify-content-center mb-3 mt-2">
                                    <span style={{
                                        backgroundColor: '#E5E7EB',
                                        color: '#6B7280',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 500
                                    }}>
                                        {getDateLabel(msg.createdAt)}
                                    </span>
                                </div>
                            )}
                            <div className="mb-3">

                                <div className={`d-flex align-items-start gap-2 ${isCurrentUser ? 'justify-content-end' : ''}`}>

                                    {/* Avatar - Only for other users */}
                                    {!isCurrentUser && (
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 32,
                                                height: 32,
                                                minWidth: 32,
                                                maxWidth: 32,
                                                maxHeight: 32,
                                                backgroundColor: msg.senderId?.profilePic ? 'transparent' : teamColor,
                                                color: '#fff',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}
                                        >
                                            {msg.senderId?.profilePic ? (
                                                <img src={msg.senderId.profilePic} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                            ) : (
                                                initials.toUpperCase()
                                            )}
                                        </div>
                                    )}

                                    {/* RIGHT / LEFT bubble wrapper */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            width: '100%',
                                            alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                                        }}
                                    >

                                        {/* Username + Team */}
                                        <div
                                            className={`d-flex align-items-center gap-2 mb-1 ${isCurrentUser ? 'justify-content-end' : ''}`}
                                            style={{ width: '100%' }}
                                        >
                                            <p
                                                className="mb-0"
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#6B7280',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {isCurrentUser ? 'You' : userName}
                                            </p>

                                        </div>

                                        {/* MESSAGE BUBBLE */}
                                        <div
                                            style={{
                                                backgroundColor: isCurrentUser ? teamColor : '#fff',
                                                padding: '8px 12px',
                                                borderRadius: isCurrentUser
                                                    ? '10px 0px 10px 10px'
                                                    : '0px 10px 10px 10px',
                                                display: 'inline-block',
                                                maxWidth: '250px',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: '13px',
                                                    color: isCurrentUser ? '#fff' : '#374151'
                                                }}
                                            >
                                                {msg.message}
                                            </p>
                                        </div>

                                        {/* Seen + Time */}
                                        <div
                                            className={`d-flex align-items-center gap-1 mt-1 ${isCurrentUser ? 'justify-content-end' : ''}`}
                                            style={{ width: '100%' }}
                                        >
                                            {isCurrentUser && msg.readBy && msg.readBy.length > 0 && (
                                                <p className="mb-0" style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                                    Seen by {msg.readBy.map(r => r.name).join(', ')}
                                                </p>
                                            )}

                                            <p className="mb-0 text-nowrap" style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </React.Fragment>
                    );
                })}
                {!loading && <div ref={messagesEndRef} />}
            </div>

            {/* Input Area */}
            <div className="p-3 border-top" style={{ backgroundColor: '#fff', flexShrink: 0 }}>
                <div className="d-flex gap-2">
                    <textarea
                        ref={textareaRef}
                        className="form-control"
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => {
                            let v = e.target.value;
                            v = v.trimStart().replace(/\s+/g, ' ');
                            if (v.length > 0) {
                                v = v.charAt(0).toUpperCase() + v.slice(1);
                            }
                            setChatMessage(v);
                        }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && chatMessage.trim()) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        rows={1}
                        style={{
                            borderRadius: '20px',
                            border: '1px solid #E5E7EB',
                            padding: '10px 16px',
                            fontSize: '16px',
                            fontFamily: 'Poppins',
                            boxShadow: 'none',
                            resize: 'none',
                            overflow: 'hidden',
                            minHeight: '40px',
                            maxHeight: '120px',
                            WebkitAppearance: 'none',
                            WebkitUserSelect: 'text',
                            userSelect: 'text',
                            touchAction: 'manipulation'
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                    />
                    <button
                        className="btn rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: 40,
                            height: 40,
                            background: chatMessage.trim() ? 'linear-gradient(180deg, #0034E4 0%, #001B76 100%)' : '#E5E7EB',
                            border: 'none',
                            color: 'white'
                        }}
                        disabled={!chatMessage.trim()}
                        onClick={handleSendMessage}
                    >
                        <i className="bi bi-send-fill" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
