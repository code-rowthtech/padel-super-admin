import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginOwner } from '../../../redux/thunks';
import Layout from './AuthLayout';
import { ButtonLoading } from '../../../helpers/loading/Loaders';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading } = useSelector((state) => state.ownerAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Please enter your Email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      errs.password = 'Please enter your Password';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Clear specific field error on user input
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await dispatch(loginOwner({ email: formData.email, password: formData.password })).unwrap();
      navigate('/admin/register');
      // navigate('/admin/dashboard');
    } catch (err) {
      setApiError(err || 'Login failed. Try again.');
    }
  };

  return (
    <Layout>
      <div className="w-50">
        <h2 className="fw-bold fs-4 mb-2">WELCOME BACK</h2>
        <p className="text-muted mb-4">Welcome back! Please enter your details.</p>
        {apiError && <Alert variant="danger" className="p-0 px-1 small">{apiError}</Alert>}

        <Form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <Form.Group controlId="formEmail" className="mb-3 position-relative">
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              disabled={authLoading}
              onChange={handleChange}
              isInvalid={!!errors.email}
              style={{ paddingRight: '40px', borderRadius: '8px' }}
            />
            {!errors.email && <FaEnvelope
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#aaa',
              }}
            />}
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
              disabled={authLoading}
              isInvalid={!!errors.password}
              style={{ paddingRight: '40px', borderRadius: '8px' }}
            />
            {!errors.password && <div
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
            </div>}
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          {/* Remember & Forgot */}
          <div className="d-flex justify-content-between align-items-center mb-3 small">
            <Form.Check
              type="checkbox"
              name="remember"
              label="Remember me"
              checked={formData.remember}
              onChange={handleChange}
              disabled={authLoading}
            />
            <Link to="/admin/forgot-password" className="text-decoration-none">
              Forgot password?
            </Link>
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={authLoading}
            className="w-100 fw-semibold"
            style={{
              padding: '12px',
              borderRadius: '30px',
              background: 'linear-gradient(to right, #4caf50, #3f51b5)',
              border: 'none',
              fontSize: '16px',
            }}
          >
            {authLoading ? <ButtonLoading /> : 'Sign in'}
          </Button>
        </Form>

        {/* Sign Up */}
        <p className="mt-4 text-center small">
          Don’t have an account?{' '}
          <Link to="/admin/sign-up" className="fw-bold text-decoration-none" style={{ color: '#3f51b5' }}>
            Sign up for free!
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default LoginPage;
