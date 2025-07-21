import React, { useState } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authImg } from '../../assets/files';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Row style={{ minHeight: '100vh', margin: 0 }}>
      {/* Left Panel */}
      <Col
        md={6}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px' }}>WELCOME</h2>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            Welcome! Please enter your details.
          </p>

          <Form>
            <Form.Group controlId="name" style={{ marginBottom: '15px' }}>
              <Form.Label style={{ fontWeight: '500' }}>Name</Form.Label>
              <Form.Control type="text" placeholder="Enter your name" />
            </Form.Group>

            <Form.Group controlId="phone" style={{ marginBottom: '15px' }}>
              <Form.Label style={{ fontWeight: '500' }}>Phone Number</Form.Label>
              <Form.Control type="text" placeholder="Enter your number" />
            </Form.Group>

            <Form.Group controlId="email" style={{ marginBottom: '15px' }}>
              <Form.Label style={{ fontWeight: '500' }}>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" />
            </Form.Group>

            <Form.Group controlId="password" style={{ marginBottom: '15px' }}>
              <Form.Label style={{ fontWeight: '500' }}>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="confirmPassword" style={{ marginBottom: '25px' }}>
              <Form.Label style={{ fontWeight: '500' }}>Confirm Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#28a745',
                border: 'none',
                fontWeight: '500',
                padding: '10px',
                borderRadius: '30px',
                fontSize: '16px',
              }}
            >
              Create Account
            </Button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <span style={{ color: '#888' }}>Don’t have an account? </span>
              <a href="#" style={{ color: '#007bff', fontWeight: '500' }}>
                Sign in to free!
              </a>
            </div>
          </Form>
        </div>
      </Col>

      {/* Right Panel */}
      <Col
        md={6}
        className="d-none d-md-block"
        style={{
          backgroundImage: `url(${authImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'revert-layer',
        }}
      />
    </Row>
  );
};

export default SignUpPage;
