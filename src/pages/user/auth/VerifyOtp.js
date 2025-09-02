import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { authImg } from '../../../assets/files';
import { showError, showSuccess, showInfo } from '../../../helpers/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserNumber, sendOtp, verifyOtp } from '../../../redux/user/auth/authThunk';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetAuth } from '../../../redux/user/auth/authSlice';
import { ButtonLoading, Loading } from '../../../helpers/loading/Loaders';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [showAlert, setShowAlert] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone;
  const { error, user, userAuthLoading } = useSelector((state) => state?.userAuth);
  const store = useSelector((state) => state?.userAuth);
  const dispatch = useDispatch();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  useEffect(() => {
    if (store?.user?.status === "200") {
      navigate('/home');
      dispatch(resetAuth());
    }
  }, [store?.user?.status, navigate, dispatch]);

  const handleChange = (index, value, event) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input if a digit is entered and not on the last field
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
      // Move focus to the previous input if the field is cleared and not on the first field
      else if (!value && index > 0 && event?.key === 'Backspace') {
        document.getElementById(`otp-${index - 1}`).focus();
      }
    }
  };

  const otpValue = Number(otp.join(''));

  const handleSubmit = () => {
    dispatch(verifyOtp({ otp: otpValue, phoneNumber: phone }))
      .unwrap()
      .then((res) => {
        if (res?.status == 200) {
          dispatch(loginUserNumber({ phoneNumber: phone }));
        }
      });
  };

  useEffect(() => {
    if (error) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Row style={{ height: '100vh', margin: 0 }}>
      {/* Left Panel */}
      <Col
        md={6}
        style={{
          backgroundColor: '#F8F8F8',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 30,
        }}
      >
        <div style={{ width: '100%', maxWidth: 350, textAlign: 'center' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: 10 }}>WELCOME BACK</h3>
          <p style={{ marginBottom: 25, color: '#666' }}>
            A verification code has been sent at <strong>+91••••••••••</strong>
          </p>
          {showAlert && <Alert variant="danger">{error}</Alert>}
          {timer > 0 && store?.otp?.response && (
            <Alert variant="info" className="py-1">
              Your OTP is: {store?.otp?.response}
            </Alert>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            {otp.map((digit, index) => (
              <Form.Control
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value, e)}
                onKeyDown={(e) => handleChange(index, e.target.value, e)}
                style={{
                  width: 50,
                  height: 50,
                  fontSize: 24,
                  textAlign: 'center',
                  borderRadius: 8,
                  boxShadow: ' 0px 1px 6.5px 0px #0000001F inset',

                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 15, marginBottom: 20, color: '#555' }}>
            {timer !== 0 && <>00:{String(timer).padStart(2, '0')} Sec</>}
          </div>

          <Button
            onClick={handleSubmit}
            style={{ backgroundColor: '#4CAF50', borderRadius: "15px", fontSize: "16px", fontWeight: "600", fontFamily: "Poppins", color: "#636364" }}
            className="w-100 text-white  border-0 py-3 "
          >
            {userAuthLoading ? <ButtonLoading /> : 'Verification Code'}
          </Button>

          {timer === 0 && (
            <div style={{ marginTop: 15 }}>
              <span style={{ color: '#777' }}>Didn’t receive code? </span>
              <span
                onClick={() => {
                  dispatch(sendOtp({ phoneNumber: phone, countryCode: "+91", type: "Signup" }));
                  setTimer(60);
                }}
                style={{ color: '#007bff', cursor: 'pointer' }}
              >
                Re-send
              </span>
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
          backgroundSize: 'contain',
          backgroundPosition: 'center',
        }}
      />
    </Row>
  );
};

export default VerifyOTP;