import React, { useEffect, useState, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { getUserFromSession } from '../../../helpers/api/apiCore';
import config from '../../../config';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.0.129:7600/match';

const ChatPopup = ({ showChat, setShowChat, chatMessage, setChatMessage, matchId }) => {
    const User = getUserFromSession();
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (showChat && User?._id && matchId) {
            socketRef.current = io(SOCKET_URL, {
                auth: { userId: User._id,  },
                transports: ['websocket'],
                reconnection: true
            });
            
            socketRef.current.on('connect', () => {
                console.log('✅ Match socket connected');
            });

            socketRef.current.on('connectionSuccess', (data) => {
                console.log('Match socket authenticated:', data);
            });

            socketRef.current.on('getMessages', (data) => {
                console.log('Received getMessages:', data);
                setMessages(data);
            });

            return () => {
                if (socketRef.current) {
                    console.log('Disconnecting socket');
                    socketRef.current.disconnect();
                }
            };
        }
    }, [showChat, User?._id, matchId]);

    const handleSendMessage = () => {
        if (chatMessage.trim() && socketRef.current) {
            const messageData = {
                matchId,
                message: chatMessage.trim(),
            };
            console.log('Emitting sendMessage:', messageData);
            socketRef.current.emit('sendMessage', messageData);
            setChatMessage('');
        }
    };

    if (!showChat) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: window.innerWidth >= 768 ? '20px' : 0,
                right: window.innerWidth >= 768 ? '20px' : 0,
                width: window.innerWidth >= 768 ? '400px' : '100%',
                height: window.innerWidth >= 768 ? '600px' : '100vh',
                backgroundColor: '#fff',
                borderRadius: window.innerWidth >= 768 ? '12px' : 0,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                zIndex: 1300,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: '#F5F5F5' }}>
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
                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>You,Sanjay,Shubham,Mohit</p>
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

            {/* Chat Messages Area */}
            <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#FAFAFA' }}>
                {messages.map((msg, index) => {
                    const isCurrentUser = msg.userId === User._id;
                    const nameParts = msg.userName?.trim().split(/\s+/) || [];
                    const initials = nameParts.length > 1 ? nameParts[0][0] + nameParts[1][0] : nameParts[0]?.[0] || '?';
                    
                    return (
                        <div key={index} className="mb-3">
                            <div className={`d-flex align-items-start gap-2 ${isCurrentUser ? 'justify-content-end' : ''}`}>
                                {!isCurrentUser && (
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#3DBE64', color: '#fff', fontSize: '12px', fontWeight: 600, minWidth: 32 }}>
                                        {initials.toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className={`d-flex align-items-center gap-2 mb-1 ${isCurrentUser ? 'justify-content-end' : ''}`}>
                                        {isCurrentUser && <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#1F41BB', color: '#fff' }}>You</span>}
                                        <p className="mb-0" style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>{isCurrentUser ? 'You' : msg.userName}</p>
                                        {!isCurrentUser && <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#3DBE64', color: '#fff' }}>Team</span>}
                                    </div>
                                    <div style={{ backgroundColor: isCurrentUser ? '#1F41BB' : '#fff', padding: '8px 12px', borderRadius: '12px', maxWidth: '250px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                        <p className="mb-0" style={{ fontSize: '13px', color: isCurrentUser ? '#fff' : '#374151' }}>{msg.message}</p>
                                    </div>
                                    <p className="mb-0 mt-1" style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                </div>
                                {isCurrentUser && (
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#1F41BB', color: '#fff', fontSize: '12px', fontWeight: 600, minWidth: 32 }}>
                                        {initials.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-top" style={{ backgroundColor: '#fff' }}>
                <div className="d-flex gap-2">
                    <textarea
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
                            fontSize: '14px',
                            fontFamily: 'Poppins',
                            boxShadow: 'none',
                            resize: 'none',
                            overflow: 'hidden',
                            minHeight: '40px',
                            maxHeight: '120px'
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
