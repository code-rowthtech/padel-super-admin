import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../../assets/files";

const NoInternet = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    useEffect(() => {
        const handleConnectionChange = () => {
            const newStatus = navigator.onLine;
            setIsOnline(newStatus);
            if (newStatus) {
                setTimeout(() => navigate(-1), 1500); // Return to previous page after 1.5s
            }
        };

        window.addEventListener('online', handleConnectionChange);
        window.addEventListener('offline', handleConnectionChange);

        return () => {
            window.removeEventListener('online', handleConnectionChange);
            window.removeEventListener('offline', handleConnectionChange);
        };
    }, [navigate]);

    const handleRetry = () => {
        if (navigator.onLine) {
            navigate(-1);
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="no-internet-page">
            {/* Futuristic background elements */}
            <div className="connection-grid">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} className={`grid-node ${isOnline ? 'active' : ''}`}></div>
                ))}
            </div>

            {/* Main content */}
            <div className="connection-status">
                <div className="status-icon">
                    <div className={`signal ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? (
                            <>
                                <div className="signal-bar"></div>
                                <div className="signal-bar"></div>
                                <div className="signal-bar"></div>
                                <div className="signal-bar"></div>
                            </>
                        ) : (
                            <div className="disconnected"></div>
                        )}
                    </div>
                </div>

                <div className="status-content">
                    <Link to="/" className="logo">
                        <img src={logo} alt="Logo" />
                    </Link>

                    <h1 className="status-title">
                        {isOnline ? 'Connection Restored' : 'Connection Lost'}
                    </h1>

                    <p className="status-message">
                        {isOnline
                            ? 'Your network connection has been reestablished. Redirecting you back...'
                            : 'Unable to connect to the network. Please check your internet connection.'}
                    </p>

                    <button 
                        onClick={handleRetry}
                        className={`retry-btn ${isOnline ? 'online' : 'offline'}`}
                    >
                        {isOnline ? 'Continue Browsing' : 'Retry Connection'}
                    </button>
                </div>
            </div>

            {/* Network status indicator */}
            <div className="network-status">
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                {isOnline ? 'Online' : 'Offline'}
            </div>
        </div>
    );
};

export default NoInternet;