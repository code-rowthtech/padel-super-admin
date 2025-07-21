import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { authImg } from '../../assets/files';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login Data:', formData);
    // Add authentication logic here
  };

  return (
    <Container fluid style={{ height: '100vh', padding: 0 }}>
      <Row className="h-100">
        {/* Left Section */}
        <Col
          md={6}
          style={{
            padding: '40px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontWeight: 'bold', fontSize: '28px', marginBottom: '10px' }}>WELCOME BACK</h2>
          <p style={{ marginBottom: '30px', color: '#555' }}>
            Welcome back! Please enter your details.
          </p>

          <Form onSubmit={handleLogin}>
            {/* Email */}
            <Form.Group controlId="formEmail" style={{ marginBottom: '20px', position: 'relative' }}>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  paddingRight: '40px',
                  borderRadius: '8px',
                }}
              />
              <FaEnvelope style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            </Form.Group>

            {/* Password */}
            <Form.Group controlId="formPassword" style={{ marginBottom: '20px', position: 'relative' }}>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  paddingRight: '40px',
                  borderRadius: '8px',
                }}
              />
              <div
                onClick={togglePassword}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#aaa',
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </Form.Group>

            {/* Options Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <Form.Check
                type="checkbox"
                name="remember"
                label="Remember me"
                checked={formData.remember}
                onChange={handleChange}
              />
              <Link to="/forgot-password" style={{ fontSize: '14px', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '30px',
                background: 'linear-gradient(to right, #4caf50, #3f51b5)',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              Sign in
            </Button>
          </Form>

          {/* Sign Up Link */}
          <p style={{ marginTop: '20px', fontSize: '14px' }}>
            Don’t have an account?{' '}
            <Link to="/sign-up" style={{ color: '#3f51b5', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign up for free!
            </Link>
          </p>
        </Col>

        {/* Right Section */}
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
    </Container>
  );
};

export default LoginPage;
