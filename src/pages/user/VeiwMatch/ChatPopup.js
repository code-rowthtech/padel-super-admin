import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const ChatPopup = ({ showChat, setShowChat, chatMessage, setChatMessage }) => {
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
                        <FaArrowLeft />
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
                {/* Sanjay Message */}
                <div className="mb-3">
                    <div className="d-flex align-items-start gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#3DBE64', color: '#fff', fontSize: '12px', fontWeight: 600, minWidth: 32 }}>S</div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <p className="mb-0" style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Sanjay</p>
                                <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#3DBE64', color: '#fff' }}>Team A</span>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '12px', maxWidth: '250px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <p className="mb-0" style={{ fontSize: '13px', color: '#374151' }}>Hey everyone! Ready for the match?</p>
                            </div>
                            <p className="mb-0 mt-1" style={{ fontSize: '10px', color: '#9CA3AF' }}>10:30 AM</p>
                        </div>
                    </div>
                </div>

                {/* Shubham Message */}
                <div className="mb-3">
                    <div className="d-flex align-items-start gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#1F41BB', color: '#fff', fontSize: '12px', fontWeight: 600, minWidth: 32 }}>S</div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <p className="mb-0" style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Shubham</p>
                                <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#1F41BB', color: '#fff' }}>Team B</span>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '12px', maxWidth: '250px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <p className="mb-0" style={{ fontSize: '13px', color: '#374151' }}>Yes! Can't wait. What time should we reach?</p>
                            </div>
                            <p className="mb-0 mt-1" style={{ fontSize: '10px', color: '#9CA3AF' }}>10:32 AM</p>
                        </div>
                    </div>
                </div>

                {/* Mohit Message */}
                <div className="mb-3">
                    <div className="d-flex align-items-start gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#3DBE64', color: '#fff', fontSize: '12px', fontWeight: 600, minWidth: 32 }}>M</div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <p className="mb-0" style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Mohit</p>
                                <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#3DBE64', color: '#fff' }}>Team A</span>
                            </div>
                            <div style={{ backgroundColor: '#fff', padding: '8px 12px', borderRadius: '12px', maxWidth: '250px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                <p className="mb-0" style={{ fontSize: '13px', color: '#374151' }}>I'll be there 15 mins early. See you all!</p>
                            </div>
                            <p className="mb-0 mt-1" style={{ fontSize: '10px', color: '#9CA3AF' }}>10:35 AM</p>
                        </div>
                    </div>
                </div>

                {/* Your Message */}
                <div className="mb-3">
                    <div className="d-flex align-items-start gap-2 justify-content-end">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1 justify-content-end">
                                <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', backgroundColor: '#1F41BB', color: '#fff' }}>Team B</span>
                                <p className="mb-0" style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>You</p>
                            </div>
                            <div style={{ backgroundColor: '#0034E4', padding: '8px 12px', borderRadius: '12px', maxWidth: '250px' }}>
                                <p className="mb-0" style={{ fontSize: '13px', color: '#fff' }}>Perfect! Let's give our best today 💪</p>
                            </div>
                            <p className="mb-0 mt-1 text-end" style={{ fontSize: '10px', color: '#9CA3AF' }}>10:36 AM</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 border-top" style={{ backgroundColor: '#fff' }}>
                <div className="d-flex gap-2 align-items-center">
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
                                setChatMessage('');
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
                        // disabled={!chatMessage.trim()}
                        onClick={() => {
                            if (chatMessage.trim()) {
                                setChatMessage('');
                            }
                        }}
                    >
                        <i className="bi bi-send-fill" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
