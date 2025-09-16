import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form, Alert, Collapse, Container } from 'react-bootstrap';
import { authImg } from '../../../assets/files';
import { showError, showSuccess, showInfo } from '../../../helpers/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserNumber, sendOtp, verifyOtp } from '../../../redux/user/auth/authThunk';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetAuth } from '../../../redux/user/auth/authSlice';
import { ButtonLoading, DataLoading, Loading } from '../../../helpers/loading/Loaders';

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
      } else if (redirectTo) {
        navigate(redirectTo);
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

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
      else if (!value && index > 0 && event?.key === 'Backspace') {
        document.getElementById(`otp-${index - 1}`).focus();
      }
      else if (index === 3 && value && newOtp.every(digit => digit)) {
        const otpValue = Number(newOtp.join(''));
        dispatch(verifyOtp({ otp: otpValue, phoneNumber: phone }))
          .unwrap()
          .then((res) => {
            if (res?.status == 200) {
              dispatch(loginUserNumber({ phoneNumber: phone }));
            }
          });
      }
    }
  };

  useEffect(() => {
    if (error) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="auth-wrapper h-100" style={{ backgroundColor: "#F8F8F8", overflow: "hidden" }}>
      <Container fluid className="h-lg-100 p-0">
        <Row className="g-0 h-lg-100 ">      {/* Left Panel */}
          <Col
            md={12}
            lg={6}
            xs={12}
            style={{
              backgroundColor: '#F8F8F8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', // Center content vertically
              alignItems: 'center', // Center content horizontally
            }}
          >
            <div className="w-100 h-50 text-center   " style={{ maxWidth: '400px' }}>
              <Collapse in={showAlert}>
                <div style={{ marginBottom: '20px' }}>
                  <Alert
                    variant="danger"
                    style={{
                      width: '100%',
                      maxWidth: 390,
                      margin: '0 auto',
                    }}
                  >
                    {error}
                  </Alert>
                </div>
              </Collapse>

              <h2 className="welcome-heading mb-2" style={{ fontSize: '24px', fontWeight: '600' }}>
                WELCOME BACK
              </h2>
              <div style={{ marginBottom: 30, color: '#666' }}>
                A verification code has been sent to <strong>+91*****{phone?.slice(5)}</strong>
              </div>

              {timer > 0 && store?.otp?.response && (
                <Alert variant="info" className="py-1" style={{ marginBottom: '20px' }}>
                  Your OTP is: {store?.otp?.response}
                </Alert>
              )}

              <div
                className={`mb-3`}
                style={{ display: 'flex', justifyContent: 'space-evenly', gap: 6 }}
              >
                {userAuthLoading ? <DataLoading /> :
                  otp.map((digit, index) => (
                    <Form.Control
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      className='opt-input'
                      disabled={timer === 0 || userAuthLoading}
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
                  ))

                }
              </div>

              {/* Timer */}
              <div style={{ marginTop: 20, marginBottom: 20, color: '#555', fontWeight: '500' }}>
                {timer !== 0 && <>00:{String(timer).padStart(2, '0')} Sec</>}
              </div>

              {/* Re-send */}
              {timer === 0 && (
                <div style={{ marginTop: 15 }}>
                  <span style={{ color: '#777' }}>Didn’t receive code? </span>
                  <span
                    onClick={() => {
                      dispatch(sendOtp({ phoneNumber: phone, countryCode: '+91', type: 'Signup' }));
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
      </Container>
    </div>
  );
};

export default VerifyOTP;