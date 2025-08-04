import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authImg } from '../../../assets/files';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import { logo } from '../../../assets/files';
const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate phone
        const cleanedPhone = phone.replace(/\D/g, '').slice(0, 10);

        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
            setError('Please enter a valid 10-digit Indian phone number');
            return;
        }

        try {
            setLoading(true);

            // ✅ Replace this with your real API call
            const response = await fakeSendOtpApi(phone);

            if (response.success) {
                // Save phone (if needed) and redirect
                localStorage.setItem('otpPhone', phone); // Optional: persist
                navigate('/verify-otp');
            } else {
                setError('Failed to send OTP. Try again.');
            }
        } catch (err) {
            setError('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    // Mock API
    const fakeSendOtpApi = (phone) => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 1000); // Simulate success
        });
    };

    return (
        <div className="auth-wrapper">
            <Container fluid className="vh-100 p-0">
                <Link to="/home" style={{ textDecoration: 'none' }} className="text-white navbar-brand position-absolute">
                    <img src={logo} alt="Logo" style={{ width: "120px" }} />
                </Link>
                <Row className="g-0 h-100">
                    {/* Left Form */}
                    <Col
                        xs={12}
                        md={6}
                        className="d-flex flex-column justify-content-center align-items-center px-5"
                    >
                        <div className="w-100" style={{ maxWidth: '400px' }}>
                            <h2 className="fw-bold mb-2">WELCOME BACK</h2>
                            <p className="text-muted mb-4">Welcome back! Please enter your details.</p>

                            <Form onSubmit={handleSubmit}>
                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form.Group className="mb-3" controlId="formPhone">
                                    <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter your Phone"
                                        className="rounded shadow-sm"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    style={{
                                        backgroundColor: '#4CAF50',
                                    }}
                                    type="submit"
                                    className="w-100 rounded-pill py-2 fw-semibold"
                                    disabled={loading}
                                >
                                    {loading ? <ButtonLoading size="sm" animation="border" /> : 'Get OTP'}
                                </Button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">Didn’t receive the code? </small>
                                    <a href="#" className="text-primary text-decoration-none fw-semibold">
                                        Re-send
                                    </a>
                                </div>
                            </Form>
                        </div>
                    </Col>

                    {/* Right Image */}
                    <Col
                        md={6}
                        className="d-none d-md-block"
                        style={{
                            backgroundImage: `url(${authImg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'revert-layer',
                        }}
                    />
                </Row>
            </Container>
        </div>
    );
};

export default LoginPage;
