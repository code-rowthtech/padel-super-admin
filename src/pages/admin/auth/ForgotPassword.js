import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../../redux/thunks';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import Layout from './AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state) => state.ownerAuth)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(sendOtp({ email, type: 'Forgot' }));
      if (result?.meta?.requestStatus === 'fulfilled') {
        navigate('/verify-otp', { state: { email } });
      } else {
        alert('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
    }
  };

  return (
    <Layout>
      <div className='d-flex flex-column align-items-center justify-content-center'>
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
            {authLoading ? <ButtonLoading /> : 'Send Verification Code'}
          </Button>
          <div className="text-center mt-3">
            <small>Don’t have an account? </small>
            <Link to="/admin/sign-up" className="text-primary fw-semibold">Sign up for free!</Link>
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
