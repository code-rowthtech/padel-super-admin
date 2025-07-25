import React, { useState } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authImg } from '../../../assets/files';
import { Link, useNavigate } from 'react-router-dom';
import { signupOwner } from '../../../redux/thunks';
import { useDispatch } from 'react-redux';
import Layout from './AuthLayout';

const SignUpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phoneNumber)) newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit phone number to 10 digits
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/\D/g, ''); // remove non-digits
      if (numericValue.length <= 10) {
        setForm({ ...form, [name]: numericValue });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmitting(true);
      try {
        const payload = {
          name: form.name,
          phoneNumber: form.phoneNumber,
          email: form.email,
          password: form.password,
        };
        await dispatch(signupOwner(payload)).unwrap();
        navigate('/admin/login');
      } catch (err) {
        setErrors({ api: err?.message || 'Signup failed. Try again.' });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Layout>
      <div className='d-flex flex-column align-items-center justify-content-center'>
        <h2 className="fw-bold mb-3">WELCOME</h2>
        <p className="text-muted mb-4">Please enter your details to sign up.</p>

        <Form onSubmit={handleSubmit} noValidate className='small'>
          <Form.Group controlId="name" className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="phoneNumber" className="mb-2">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              placeholder="Enter 10-digit phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              isInvalid={!!errors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="email" className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="password" className="mb-2">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="******"
                value={form.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="******"
                value={form.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {errors.api && (
            <p className="text-danger mb-3 text-center">{errors.api}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
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
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <p style={{ fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/admin/login" className="fw-bold" style={{ color: '#3f51b5' }}>
              Login!
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;
