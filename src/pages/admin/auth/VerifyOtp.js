import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { authImg } from '../../../assets/files';
import { useLocation, useNavigate } from 'react-router-dom';
import { showError } from '../../../helpers/Toast';
import { useDispatch } from 'react-redux';
import { verifyOtp } from '../../../redux/thunks';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(120);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      showError('Please enter the complete OTP.');
      return;
    }

    try {
      const result = await dispatch(
        verifyOtp({ email, otp: fullOtp.trim() })
      );
      console.log({ result })
      if (result?.meta?.requestStatus === 'fulfilled') {
        navigate('/reset-password');
      } 
    } catch (err) {
      showError('Something went wrong during OTP verification.');
    }
  };

  return (
    <Row style={{ height: '100vh', margin: 0 }}>
      {/* Left Panel */}
      <Col md={6} className="d-flex justify-content-center align-items-center bg-white px-4">
        <div style={{ width: '100%', maxWidth: 350, textAlign: 'center' }}>
          <h3 className="fw-bold mb-2">Verify Otp</h3>
          <p className="text-muted mb-4">
            A verification code has been sent to <strong>{email}</strong>
          </p>

          <div className="d-flex justify-content-between gap-2 mb-3">
            {otp.map((digit, index) => (
              <Form.Control
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                style={{
                  width: 50,
                  height: 50,
                  fontSize: 24,
                  textAlign: 'center',
                  borderRadius: 8,
                  border: '1px solid #ccc',
                }}
              />
            ))}
          </div>

          {timer !== 0 && (
            <div className="text-muted mb-3">00:{String(timer).padStart(2, '0')} Sec</div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-100 fw-semibold"
            style={{
              background: 'linear-gradient(to right, #27ae60, #2e51f3)',
              border: 'none',
              borderRadius: '25px',
            }}
          >
            Verify Code
          </Button>

          {timer === 0 && (
            <div className="mt-3">
              <span className="text-muted">Didn’t receive code? </span>
              <span style={{ color: '#007bff', cursor: 'pointer' }}>Re-send</span>
            </div>
          )}
        </div>
      </Col>

      {/* Right Panel */}
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
  );
};

export default VerifyOTP;
