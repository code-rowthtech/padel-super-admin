import { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginOwner } from '../../../redux/thunks';
import { useDispatch } from 'react-redux';
import Layout from './AuthLayout';
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Invalid email format';

    if (!formData.password) errs.password = 'Password is required';
    // else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';

    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      await dispatch(loginOwner(payload)).unwrap();
      navigate('/admin/dashboard'); // Adjust the route after login
    } catch (err) {
      setApiError(err?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className='d-flex flex-column align-items-center justify-content-center'>
        <h2 style={{ fontWeight: 'bold', fontSize: '28px', marginBottom: '10px' }}>WELCOME BACK</h2>
        <p style={{ marginBottom: '30px', color: '#555' }}>
          Welcome back! Please enter your details.
        </p>

        <Form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <Form.Group controlId="formEmail" className="mb-3 position-relative">
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              style={{ paddingRight: '40px', borderRadius: '8px' }}
            />
            <FaEnvelope
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#aaa',
              }}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group controlId="formPassword" className="mb-3 position-relative">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              style={{ paddingRight: '40px', borderRadius: '8px' }}
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
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          {/* Options Row */}
          <div className="d-flex justify-content-between align-items-center mb-3 small">
            <Form.Check
              type="checkbox"
              name="remember"
              label="Remember me"
              checked={formData.remember}
              onChange={handleChange}
            />
            <Link to="/admin/forgot-password" style={{ textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {apiError && <p className="text-danger text-center mb-3">{apiError}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
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
            {loading ? <Spinner animation="border" size="sm" /> : 'Sign in'}
          </Button>
        </Form>

        {/* Sign Up Link */}
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          Don’t have an account?{' '}
          <Link to="/admin/sign-up" style={{ color: '#3f51b5', fontWeight: 'bold', textDecoration: 'none' }}>
            Sign up for free!
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default LoginPage;
