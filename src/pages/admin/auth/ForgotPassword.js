import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "../../../redux/thunks";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import Layout from "./AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state) => state.ownerAuth);
  const emailOtp = useSelector((state) => state.ownerAuth);

  useEffect(() => {
    if (emailOtp?.error) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [emailOtp?.error]);

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      await dispatch(sendOtp({ email, type: "Forgot" }))
        .unwrap()
        .then((res) => {
          if (res.status === "200") {
            navigate("/admin/verify-otp", { state: { email } });
          }
        });
    } catch (error) {
      setApiError(
        error || "Failed to send verification code. Please try again."
      );
    }
  };

  return (
    <Layout>
      <div className="w-md-50 w-sm-100">
        <h2 className="welcome-heading">FORGOT PASSWORD</h2>
        <p
          className="text-muted"
          style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400" }}
        >
          Please enter your email address{" "}
        </p>
        {emailError && (
          <span className="text-danger p-0 m-0">{emailError}</span>
        )}
        {/* 
        {apiError && (
          <Alert variant="danger" className="p-0 px-1">
            {apiError}
          </Alert>
        )} */}
        {emailOtp?.error && showAlert && (
          <Alert variant="danger" className="p-1 px-1">
            {emailOtp?.error?.slice(0, 30)}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate className="small">
          <Form.Group className="mb-3">
            <Form.Label
              style={{
                fontSize: "14px",
                fontFamily: "Poppins",
                fontWeight: "500",
                color: "black",
              }}
            >
              Email
              {/* <span className="text-danger fs-5">*</span> */}
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!emailError}
              required
              className="shadow-none form-control"
              style={{ borderRadius: "8px", height: "50px", boxShadow: "none" }}
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100 shadow fw-semibold mt-3"
            style={{
              height: "50px",
              background: "linear-gradient(to right, #27ae60, #2e51f3)",
              border: "none",
              borderRadius: "25px",
              boxShadow: "0px 4px 10px 0px #1A237E40",
            }}
          >
            {authLoading ? (
              <ButtonLoading color="white" />
            ) : (
              "Send Verification Code"
            )}
          </Button>

          {/* <div className="text-center mt-3">
            <small>Don’t have an account? </small>
            <Link to="/admin/sign-up" className="text-primary fw-semibold">
              Sign up for free!
            </Link>
          </div> */}
          <p
            className="mt-4 text-center "
            style={{
              fontSize: "12px",
              fontFamily: "Poppins",
              fontWeight: "500",
            }}
          >
            Back to Login
            <Link
              to="/admin/login"
              className="fw-bold text-decoration-none ms-2"
              style={{
                color: "#3f51b5",
                fontSize: "12px",
                fontFamily: "Poppins",
                fontWeight: "500",
              }}
            >
              Log In!
            </Link>
          </p>
        </Form>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
