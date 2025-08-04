import React, { useState } from 'react';
import { Row, Col, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authImg } from '../../../assets/files';
import { Link, useNavigate } from 'react-router-dom';
import { signupOwner } from '../../../redux/thunks';
import { useDispatch, useSelector } from 'react-redux';
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
  const { authLoading } = useSelector((state) => state.ownerAuth)

  const capitalizeFirst = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const validate = () => {
    const newErrors = {};
    const name = form.name.trim();

    if (!name) newErrors.name = 'Please enter your name';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!form.phoneNumber) newErrors.phoneNumber = 'Please enter your phone number';
    else if (!/^\d{10}$/.test(form.phoneNumber)) newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    if (!form.email.trim()) newErrors.email = 'Please enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Please create your password';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let val = value;

    if (name === 'name') {
      val = capitalizeFirst(val.replace(/[^\p{L}\p{N} ]+/gu, ''));
    }

    if (name === 'phoneNumber') {
      val = val.replace(/\D/g, '').slice(0, 10);
    }

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
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
        setErrors({ api: err || 'Signup failed. Try again.' });
      } finally {
      }
    }
  };

  return (
    <Layout>
      <div className='w-50'>
        <h2 className="fw-bold mb-3">WELCOME</h2>
        <p className="text-muted mb-4">Please enter your details to sign up.</p>
        {errors.api && <Alert variant="danger" className="p-0 px-1">{errors.api}</Alert>}

        <Form onSubmit={handleSubmit} noValidate className='small'>
          <Form.Group controlId="name" className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              disabled={authLoading}
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
              disabled={authLoading}
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
              disabled={authLoading}
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
                disabled={authLoading}
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
                disabled={authLoading}
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
          <Button
            type="submit"
            disabled={authLoading}
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
            {authLoading ? 'Creating Account...' : 'Create Account'}
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
