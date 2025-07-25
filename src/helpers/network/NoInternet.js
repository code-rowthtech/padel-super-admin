import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo } from "../../assets/files";
import {
    FaWifi,
    FaRedo,
    FaArrowLeft,
    FaBolt
} from "react-icons/fa";
import { MdOutlineWifiOff } from "react-icons/md";
import { Container, Row, Col, Button } from "react-bootstrap";

const NoInternet = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    useEffect(() => {
        const handleConnectionChange = () => {
            const newStatus = navigator.onLine;
            setIsOnline(newStatus);
            if (newStatus) {
                setTimeout(() => navigate(-1), 1500);
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
    const handleNavigate = () => {
        navigate(-1)
    };

    // Inline styles
    const styles = {
        container: {
            height: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        connectionGrid: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(20, 1fr)',
            gridTemplateRows: 'repeat(20, 1fr)',
            zIndex: 0,
            opacity: 0.6
        },
        gridNode: {
            border: '1px solid rgba(200, 200, 255, 0.1)',
            transition: 'all 0.3s ease'
        },
        activeGridNode: {
            background: 'rgba(100, 200, 255, 0.2)',
            boxShadow: '0 0 10px rgba(100, 200, 255, 0.5)'
        },
        statusContainer: {
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            textAlign: 'center',
            zIndex: 1,
            maxWidth: '500px',
            width: '90%'
        },
        signalIcon: {
            fontSize: '80px',
            marginBottom: '20px',
            color: '#dc3545'
        },
        onlineSignalIcon: {
            color: '#28a745'
        },
        logo: {
            maxWidth: '120px',
            marginBottom: '20px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '15px',
            color: '#343a40'
        },
        message: {
            color: '#6c757d',
            marginBottom: '30px',
            fontSize: '16px'
        },
        button: {
            borderRadius: '50px',
            padding: '12px 30px',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        offlineButton: {
            background: '#dc3545',
            borderColor: '#dc3545'
        },
        onlineButton: {
            background: '#28a745',
            borderColor: '#28a745'
        },
        statusIndicator: {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 15px',
            borderRadius: '50px',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            fontWeight: '500'
        },
        statusDot: {
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#dc3545'
        },
        onlineStatusDot: {
            background: '#28a745'
        },
        pulseAnimation: {
            animation: 'pulse 2s infinite'
        },
        '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' }
        }
    };

    return (
        <Container fluid style={styles.container}>
            {/* Animated grid background */}
            <div style={styles.connectionGrid}>
                {Array.from({ length: 400 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.gridNode,
                            ...(isOnline ? styles.activeGridNode : {})
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <Row className="justify-content-center">
                <Col style={styles.statusContainer}>
                    <div style={{
                        ...styles.signalIcon,
                        ...(isOnline ? styles.onlineSignalIcon : {}),
                        ...styles.pulseAnimation
                    }}>
                        {isOnline ? (
                            <FaWifi size={80} />
                        ) : (
                            <MdOutlineWifiOff size={80} />
                        )}
                    </div>

                    <Link to="/">
                        <img src={logo} alt="Logo" style={styles.logo} />
                    </Link>

                    <h1 style={styles.title}>
                        {isOnline ? 'Connection Restored!' : 'No Internet Connection'}
                    </h1>

                    <p style={styles.message}>
                        {isOnline
                            ? 'Your connection is back online. Redirecting you shortly...'
                            : 'Please check your network connection and try again.'}
                    </p>

                    <Button
                        style={{
                            ...styles.button,
                            ...(isOnline ? styles.onlineButton : styles.offlineButton)
                        }}
                        onClick={isOnline ? handleNavigate : handleRetry}
                        className={isOnline ? 'hover-scale' : ''}
                    >
                        {isOnline ? (
                            <>
                                <FaArrowLeft size={18} /> Continue Browsing
                            </>
                        ) : (
                            <>
                                <FaRedo size={18} /> Retry Connection
                            </>
                        )}
                    </Button>

                    {!isOnline && (
                        <div className="mt-4 text-muted">
                            <small>
                                <FaBolt className="me-2" />
                                Pro tip: Try turning WiFi off and on again
                            </small>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Status indicator */}
            <div style={styles.statusIndicator}>
                <span style={{
                    ...styles.statusDot,
                    ...(isOnline ? styles.onlineStatusDot : {})
                }} />
                {isOnline ? 'Online' : 'Offline'}
            </div>
        </Container>
    );
};

export default NoInternet;