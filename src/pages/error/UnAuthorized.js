import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="h-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="text-center">
        <Col>
          <div className="mb-4">
            <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '5rem' }}></i>
          </div>
          <h1 className="display-5 fw-bold text-dark">401 - Unauthorized</h1>
          <p className="text-muted mb-4">
            You don’t have permission to access this page.<br />Please log in to continue.
          </p>
          {/* <Button variant="primary" onClick={() => navigate('/login')}>
            🔐 Go to Login
          </Button> */}
          <Button style={{ backgroundColor: '#3dbe64ff' }} size="lg" onClick={() => navigate(-1)}>
            ⬅ Go Back
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Unauthorized;
