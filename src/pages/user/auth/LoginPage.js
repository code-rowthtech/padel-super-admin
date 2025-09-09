import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authImg } from '../../../assets/files';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import { logo } from '../../../assets/files';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, sendOtp } from '../../../redux/user/auth/authThunk';
import { resetAuth } from '../../../redux/user/auth/authSlice';
const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const { error, user, otp, userAuthLoading } = useSelector((state) => state?.userAuth)
    const [showAlert, setShowAlert] = useState(false);
    const store = useSelector((state) => state?.userAuth)
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedPhone = phone.replace(/\D/g, '').slice(0, 10);
        dispatch(sendOtp({ phoneNumber: cleanedPhone, countryCode: "+91", type: "Signup" })).unwrap().then(() => {
            navigate('/verify-otp', { state: { phone } });
            dispatch(resetAuth())

        })
    };

    useEffect(() => {
        if (error) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="auth-wrapper" style={{ backgroundColor: "#F8F8F8", height: "100vh", overflow: "hidden" }}>
            <Container fluid className="h-lg-100 p-0">
                <Row className="g-0 h-lg-100  ">
                    {/* Left Form */}
                    <Col
                        xs={12}
                        lg={6}
                        className="d-flex flex-column  justify-content-lg-center align-items-center px-3 px-md-5"
                    >
                        <div className="w-100 h-25  " style={{ maxWidth: '400px' }}>
                            <h2 className="welcome-heading mb-2">WELCOME BACK</h2>
                            <p className="text-muted mb-4" style={{ fontSize: "14px", fontWeight: "400", fontFamily: "Poppins", color: "#636364" }}>Welcome back! Please enter your details.</p>

                            <Form onSubmit={handleSubmit} className='w-100'>
                                {showAlert && <Alert variant="danger">{error}</Alert>}


                                <Form.Group className="mb-3" controlId="formPhone">
                                    <Form.Label className="" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter your Phone"
                                        className=" form-control  py-md-3"
                                        style={{ borderRadius: "15px", fontSize: "14px", fontWeight: "400", fontFamily: "Poppins", color: "#636364", boxShadow: '0px 3px 10px 0px #00000040' }}
                                        value={phone}
                                        minLength={10}
                                        maxLength={10}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^[6-9][0-9]{0,9}$/.test(value)) {
                                                setPhone(value);
                                            }
                                        }}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type='submit'
                                    className="w-100 text-white border-0 py-md-3 rounded-pill"
                                    disabled={userAuthLoading}
                                    style={{ backgroundColor: '#4CAF50', fontSize: "16px", fontWeight: "600", fontFamily: "Poppins", color: "white", boxShadow: '0px 3px 10px 0px #00000040' }}
                                >
                                    {userAuthLoading ? <ButtonLoading /> : 'Get OTP'}
                                </Button>

                            </Form>
                        </div>
                    </Col>

                    {/* Right Image */}
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

export default LoginPage;
