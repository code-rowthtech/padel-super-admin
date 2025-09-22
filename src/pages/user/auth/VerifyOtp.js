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
  const [timerExpired, setTimerExpired] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, redirectTo, paymentState } = location.state || {};
  const { error, user, userAuthLoading, otp: otpData } = useSelector((state) => state?.userAuth);
  const dispatch = useDispatch();

  // टाइमर और timerExpired को localStorage से रिस्टोर करो
  useEffect(() => {
    const storedTimer = localStorage.getItem('otpTimer');
    const storedTimestamp = localStorage.getItem('otpTimestamp');
    const storedTimerExpired = localStorage.getItem('timerExpired');

    if (storedTimerExpired === 'true') {
      // अगर टाइमर पहले ही खत्म हो चुका है
      setTimerExpired(true);
      setTimer(0);
    } else if (storedTimer && storedTimestamp) {
      // टाइमर रिस्टोर करो अगर वह खत्म नहीं हुआ है
      const elapsed = Math.floor((Date.now() - parseInt(storedTimestamp)) / 1000);
      const remaining = Math.max(0, parseInt(storedTimer) - elapsed);
      setTimer(remaining);
      setTimerExpired(remaining === 0);
      if (remaining === 0) {
        localStorage.setItem('timerExpired', 'true');
        localStorage.removeItem('otpTimer');
        localStorage.removeItem('otpTimestamp');
        localStorage.removeItem('otp');
      }
    }
  }, []);

  // टाइमर काउंटडाउन और localStorage में अपडेट
  useEffect(() => {
    if (timerExpired) return; // टाइमर खत्म होने पर काउंटडाउन न चलाएं

    const countdown = setInterval(() => {
      setTimer((prev) => {
        const newTimer = prev > 0 ? prev - 1 : 0;
        localStorage.setItem('otpTimer', newTimer.toString());
        if (newTimer === 0) {
          setTimerExpired(true);
          localStorage.setItem('timerExpired', 'true');
          localStorage.removeItem('otpTimer');
          localStorage.removeItem('otpTimestamp');
          localStorage.removeItem('otp');
        }
        return newTimer;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [timerExpired]);

  // OTP रिस्पॉन्स आने पर localStorage में स्टोर
  useEffect(() => {
    if (otpData?.response) {
      localStorage.setItem('otp', otpData.response);
      localStorage.setItem('otpTimestamp', Date.now().toString());
      localStorage.setItem('otpTimer', timer.toString());
      localStorage.setItem('timerExpired', 'false');
    }
  }, [otpData?.response, timer]);

  // सक्सेस पर रीडायरेक्ट और localStorage क्लियर
  useEffect(() => {
    if (user?.status === "200") {
      localStorage.removeItem('otp');
      localStorage.removeItem('otpTimer');
      localStorage.removeItem('otpTimestamp');
      localStorage.removeItem('timerExpired');
      if (redirectTo && paymentState) {
        navigate(redirectTo, { state: paymentState });
      } else if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/home');
      }
      dispatch(resetAuth());
    }
  }, [user?.status, navigate, dispatch, redirectTo, paymentState]);

  // एरर आने पर OTP फील्ड्स क्लियर
  useEffect(() => {
    if (error) {
      setShowAlert(true);
      setOtp(['', '', '', '']);
      const alertTimer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(alertTimer);
    }
  }, [error]);

  const handleChange = (index, value, event) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      } else if (!value && index > 0 && event?.key === 'Backspace') {
        document.getElementById(`otp-${index - 1}`).focus();
      }

      // API कॉल केवल जब सभी फील्ड भरे हों
      if (newOtp.every((digit) => digit !== '')) {
        const otpValue = Number(newOtp.join(''));
        dispatch(verifyOtp({ otp: otpValue, phoneNumber: phone }))
          .unwrap()
          .then((res) => {
            if (res?.status == 200) {
              dispatch(loginUserNumber({ phoneNumber: phone }));
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleResend = () => {
    dispatch(sendOtp({ phoneNumber: phone, countryCode: '+91', type: 'Signup' }));
    setTimer(60);
    setTimerExpired(false);
    localStorage.setItem('otpTimer', '60');
    localStorage.setItem('otpTimestamp', Date.now().toString());
    localStorage.setItem('timerExpired', 'false');
    setOtp(['', '', '', '']);
  };

  return (
    <div className="auth-wrapper h-100" style={{ backgroundColor: "#F8F8F8", overflow: "hidden" }}>
      <Container fluid className="h-lg-100 p-0">
        <Row className="g-0 h-lg-100">
          <Col
            md={12}
            lg={6}
            xs={12}
            style={{
              backgroundColor: '#F8F8F8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div className="w-100 h-50 text-center" style={{ maxWidth: '400px' }}>
              <h2 className="welcome-heading mb-2" style={{ fontSize: '24px', fontWeight: '600' }}>
                WELCOME BACK
              </h2>
              <div style={{ marginBottom: 30, color: '#666' }}>
                A verification code has been sent to <strong>+91*****{phone?.slice(5)}</strong>
              </div>

              {/* OTP दिखाओ Redux से या localStorage से */}
              {timer > 0 && (otpData?.response || localStorage.getItem('otp')) && (
                <Alert variant="info" className="py-1" style={{ marginBottom: '20px' }}>
                  Your OTP is: {otpData?.response || localStorage.getItem('otp')}
                </Alert>
              )}

              <div
                className="mb-3"
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
                      disabled={userAuthLoading}
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
              {showAlert && (
                <p className='m-0 mb-0' style={{ marginBottom: 0, color: 'red', fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>
                  {error}
                </p>
              )}

              {/* Timer या Re-send */}
              {!timerExpired ? (
                <div style={{ marginTop: 20, marginBottom: 20, color: '#555', fontWeight: '500' }}>
                  00:{String(timer).padStart(2, '0')} Sec
                </div>
              ) : (
                <div style={{ marginTop: 0 }}>
                  <span style={{ color: '#777' }}>Didn’t receive code? </span>
                  <span
                    onClick={handleResend}
                    style={{ color: '#007bff', cursor: 'pointer' }}
                  >
                    Re-send
                  </span>
                </div>
              )}
            </div>
          </Col>

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