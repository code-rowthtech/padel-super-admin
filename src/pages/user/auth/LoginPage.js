import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authImg } from "../../../assets/files";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { logo } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, sendOtp } from "../../../redux/user/auth/authThunk";
import { resetAuth } from "../../../redux/user/auth/authSlice";
const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const { error, user, otp, userAuthLoading } = useSelector(
    (state) => state?.userAuth
  );
  const [showAlert, setShowAlert] = useState(false);
  //   const store = useSelector((state) => state?.userAuth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/\D/g, "").slice(0, 10);
    dispatch(
      sendOtp({ phoneNumber: cleanedPhone, countryCode: "+91", type: "Signup" })
    )
      .unwrap()
      .then(() => {
        navigate("/verify-otp", { state: { phone } });
        dispatch(resetAuth());
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
    <div className="auth-wrapper">
      <Container fluid className="vh-100 p-0">
        <Link
          to="/home"
          style={{ textDecoration: "none" }}
          className="text-white navbar-brand position-absolute"
        >
          <img src={logo} alt="Logo" style={{ width: "120px" }} />
        </Link>
        <Row className="g-0 h-100">
          {/* Left Form */}
          <Col
            xs={12}
            md={6}
            className="d-flex flex-column justify-content-center align-items-center px-5"
          >
            <div className="w-100" style={{ maxWidth: "400px" }}>
              <h2 className="fw-bold mb-2">WELCOME BACK</h2>
              <p className="text-muted mb-4">
                Welcome back! Please enter your details.
              </p>

              <Form onSubmit={handleSubmit}>
                {showAlert && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label className="fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your Phone"
                    className="rounded form-control py-2"
                    value={phone}
                    minLength={10}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  style={{
                    backgroundColor: "#4CAF50",
                  }}
                  type="submit"
                  className="w-100 rounded-pill border-0 py-2 fw-semibold"
                  disabled={userAuthLoading}
                >
                  {userAuthLoading ? (
                    <ButtonLoading size="sm" animation="border" />
                  ) : (
                    "Get OTP"
                  )}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Didn’t receive the code?{" "}
                  </small>
                  <a
                    href="#"
                    className="text-primary text-decoration-none fw-semibold"
                  >
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
              backgroundSize: "cover",
              backgroundPosition: "revert-layer",
            }}
          />
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
