import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { showError, showSuccess } from '../../../helpers/Toast';
import Layout from './AuthLayout';
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirm) {
      showSuccess('Password changed successfully!');
      // Navigate or call API here
    } else {
      showError('Passwords do not match');
    }
  };

  return (
    <Layout>
      <div className='d-flex flex-column align-items-center justify-content-center'>
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Confirm Password Field */}
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? 'text' : 'password'}
                placeholder="*********"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
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
            Change Password
          </Button>
        </Form>
      </div>
    </Layout>
  );
};

export default ResetPassword;
