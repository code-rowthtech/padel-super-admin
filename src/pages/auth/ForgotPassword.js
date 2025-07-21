import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { authImg } from '../../assets/files';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // call your API here
    navigate('/verify-otp');
  };

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        <Col
          xs={12}
          md={6}
          className="d-flex flex-column justify-content-center align-items-center px-5"
        >
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <h2 className="fw-bold">FORGOT PASSWORD</h2>
            <p className="text-muted">Please enter your login detail to sign in</p>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 fw-semibold"
                style={{
                  background: 'linear-gradient(to right, #27ae60, #2e51f3)',
                  border: 'none',
                  borderRadius: '25px',
                }}
              >
                Verification Code
              </Button>
              <div className="text-center mt-3">
                <small>Don’t have an account? </small>
                <a href="/signup" className="text-primary fw-semibold">Sign up to free!</a>
              </div>
            </Form>
          </div>
        </Col>

        <Col
          md={6}
          className="d-none d-md-block"
          style={{
            backgroundImage: `url(${authImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </Row>
    </Container>
  );
};

export default ForgotPassword;
