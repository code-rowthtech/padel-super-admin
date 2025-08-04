import React from 'react';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container fluid className="h-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="text-center">
                <Col className="d-flex flex-column align-items-center">
                    <i className="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>

                    <h1 className="display-4 fw-bold text-dark">Oops! Page not found.</h1>
                    <p className="text-muted mb-4">
                        The page you're looking for doesn't exist or was moved.
                    </p>
                    <Button style={{ backgroundColor: '#3dbe64ff' }} size="lg" className='d-flex align-items-center' onClick={() => navigate(-1)}>
                        <i class="bi bi-arrow-left-short fw-bold fs-3"></i> Go Back
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;
