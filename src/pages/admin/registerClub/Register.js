import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { registerClubBG } from '../../../assets/files';

function Register() {
    const navigate = useNavigate();

    const greenCheckIcon = (
        <span
            className="rounded-circle d-flex justify-content-center align-items-center me-3 flex-shrink-0"
            style={{
                backgroundColor: '#E5F1D8',
                color: '#7CBA3D',
                width: '40px',
                height: '40px'
            }}
        >
            <i className="bi bi-check fs-4"></i>
        </span>
    );

    return (
        <div className="min-vh-100 d-flex align-items-center py-5" style={{ backgroundColor: '#fff', overflow: 'hidden' }}>
            <Container>
                <Row className="align-items-center justify-content-center g-5 position-relative">
                    {/* Left Column */}
                    <Col lg={7} md={12} className="position-relative z-1">
                        <div className="pe-lg-4">
                            <h1 className="fw-bold text-primary mb-2">Welcome</h1>
                            <h3 className="fw-semibold mb-4">The Good Club Owners!</h3>
                            <p className="text-muted fs-6 mb-4">
                                Bring your court online and connect with thousands of padel players through our app. <br/>
                                We make it simple to manage bookings, increase visibility, and grow your <br/> business – all in one place.
                            </p>

                            <ul className="list-unstyled mb-4">
                                <li className="mb-3 d-flex align-items-start">
                                    {greenCheckIcon}
                                    <div>
                                        <strong className="d-block mb-1">Real-Time Bookings</strong>
                                        <small className="text-muted fw-medium">Let players book your court instantly</small>
                                    </div>
                                </li>
                                <li className="mb-3 d-flex align-items-start">
                                    {greenCheckIcon}
                                    <div>
                                        <strong className="d-block mb-1">Boost Revenue</strong>
                                        <small className="text-muted fw-medium">Fill empty slots, promote offers, and track earnings</small>
                                    </div>
                                </li>
                                <li className="mb-3 d-flex align-items-start">
                                    {greenCheckIcon}
                                    <div>
                                        <strong className="d-block mb-1">Business Dashboard</strong>
                                        <small className="text-muted fw-medium">Manage schedules, pricing, and availability</small>
                                    </div>
                                </li>
                            </ul>

                            <p className="text-muted mb-4 small">
                                Join our network of padel court owners and make your facility the go-to place for <br /> players in your city.
                            </p>

                            <Button
                                variant="success"
                                className="px-4 py-2 fw-semibold"
                                onClick={() => navigate('/admin/register-club')}
                            >
                                Get Started Now
                            </Button>
                        </div>
                    </Col>

                    {/* Right Column - Image */}
                    <Col lg={5} md={12} className="position-relative text-center">
                        <div
                            className="position-absolute d-none d-lg-block"
                            style={{ right: '-9em', top: '-22.5em', zIndex: 0 }}
                        >
                            <img
                                src={registerClubBG}
                                alt="Padel Player"
                                // className="img-fluid"
                                style={{ maxHeight: '800px', objectFit: 'contain' }}
                            />
                        </div>
                        {/* Fallback for smaller devices */}
                        <div className="d-lg-none mt-4">
                            <img
                                src={registerClubBG}
                                alt="Padel Player"
                                className="img-fluid"
                                style={{ maxHeight: '500px', objectFit: 'contain' }}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Register;
