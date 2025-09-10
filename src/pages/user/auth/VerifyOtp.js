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
  const { phone, redirectTo, paymentState } = location.state || {};
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
      if (redirectTo && paymentState) {
        navigate(redirectTo, { state: paymentState });
      } else {
        navigate('/home');
      }
      dispatch(resetAuth());
    }
  }, [store?.user?.status, navigate, dispatch, redirectTo, paymentState]);
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
    <Row className='mx-auto' style={{ height: '100vh', margin: 0 }}>
      {/* Left Panel */}
      <Col
        md={12}
        lg={6}
        xs={12}
        style={{
          backgroundColor: '#F8F8F8',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: "30px 0px",
        }}
      >
        <div className='p-4 p-md-0' style={{ width: '100%', maxWidth: 390, textAlign: 'center', position: "relative" }}>
          <h2 className="welcome-heading mb-2">WELCOME BACK</h2>
          <div style={{ marginBottom: 30, color: '#666' }}>
            A verification code has been sent to <strong>+91*****{phone?.slice(5)}</strong>
          </div>

          {/* Error Alert positioned absolutely */}
          {showAlert && (
            <Alert
              variant="danger"
              style={{
                position: "absolute",
                top: "-40px",   // adjust as needed
                left: 0,
                right: 0,
                margin: "auto",
                width: "100%",
                maxWidth: 390,
              }}
            >
              {error}
            </Alert>
          )}

          {/* OTP display (info alert) */}
          {timer > 0 && store?.otp?.response && (
            <Alert variant="info" className="py-1">
              Your OTP is: {store?.otp?.response}
            </Alert>
          )}

          {/* OTP Inputs */}
          <div className='mb-3' style={{ display: 'flex', justifyContent: 'space-evenly', gap: 6 }}>
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
                  borderRadius: '4px',
                  boxShadow: '0px 1px 6.5px 0px #0000001F inset',
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <div style={{ marginTop: 20, marginBottom: 20, color: '#555', fontWeight: "500" }}>
            {timer !== 0 && <>00:{String(timer).padStart(2, '0')} Sec</>}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#4CAF50',
              fontSize: "16px",
              fontWeight: "600",
              fontFamily: "Poppins",
              color: "#636364",
              boxShadow: ' 0px 4px 10px 0px #1A237E40',

            }}
            className="w-100 text-white rounded-pill border-0 py-md-3"
          >
            {userAuthLoading ? <ButtonLoading /> : 'Verification Code'}
          </Button>

          {/* Re-send */}
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
      <Col lg={6} className="d-none d-lg-block p-0">
        <img
          src={authImg}
          alt="Auth"
          className="img-fluid"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          loading="lazy"
        />
      </Col>
    </Row>
  );
};

export default VerifyOTP;