import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { showError } from '../../../helpers/Toast';
import Layout from './AuthLayout';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../redux/thunks';
import { ButtonLoading } from '../../../helpers/loading/Loaders';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { authLoading } = useSelector((state) => state.ownerAuth)

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const validate = () => {
    const newErrors = {};

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirm) {
      newErrors.confirm = 'You need to confirm your new password.';
    }

    if (password && confirm && password !== confirm) {
      newErrors.confirm = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(resetPassword({ email, password })).unwrap();
      navigate('/admin/login');
    } catch (err) {
      showError('Something went wrong during password reset.');
    }
  };

  return (
    <Layout>
      <div>
        <h2 className="fw-bold">RESET PASSWORD</h2>
        <p className="text-muted">Change Password! Please enter your details.</p>

        <Form onSubmit={handleSubmit}>
          {/* Password Field */}
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="*********"
                value={password}
                disabled={authLoading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: '' }));
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            {errors.password && <div className="text-danger mt-1">{errors.password}</div>}
          </Form.Group>

          {/* Confirm Password Field */}
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? 'text' : 'password'}
                placeholder="*********"
                value={confirm}
                disabled={authLoading}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((prev) => ({ ...prev, confirm: '' }));
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            {errors.confirm && <div className="text-danger mt-1">{errors.confirm}</div>}
          </Form.Group>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-100 fw-semibold"
            style={{
              background: '#27ae60',
              border: 'none',
              borderRadius: '25px',
            }}
          >
            {authLoading ? <ButtonLoading /> : 'Change Password'}
          </Button>
        </Form>
      </div>
    </Layout>
  );
};

export default ResetPassword;
