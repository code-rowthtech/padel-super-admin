import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector } from 'react-redux';

const TokenExpire = ({ isTokenExpired }) => {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setShow(isTokenExpired);
    }, [isTokenExpired]);

    const handleRedirect = () => {
        setShow(false);
        localStorage.removeItem('user_padel');
        navigate('/');
    };

    return (
        <Modal
            show={show}
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header>
                <Modal.Title>Session Expired</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Your session has expired due to an invalid or expired token. Please log in again to continue.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleRedirect}>
                    Go to Homepage
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TokenExpire;