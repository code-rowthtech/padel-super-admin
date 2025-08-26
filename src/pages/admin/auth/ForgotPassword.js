import React, { useState } from "react";
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state) => state.ownerAuth);

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
      await dispatch(sendOtp({ email, type: "Forgot" })).unwrap();
      navigate("/admin/verify-otp", { state: { email } });
    } catch (error) {
      setApiError(
        error || "Failed to send verification code. Please try again."
      );
    }
  };

  return (
    <Layout>
      <div className="">
        <h2 className="fw-bold">FORGOT PASSWORD</h2>
        <p className="text-muted">Please enter your email address</p>

        {apiError && (
          <Alert variant="danger" className="p-0 px-1">
            {apiError}
          </Alert>
        )}
        {emailError && (
          <Alert variant="warning" className="p-0 px-1">
            {emailError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!emailError}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100 fw-semibold"
            style={{
              background: "linear-gradient(to right, #27ae60, #2e51f3)",
              border: "none",
              borderRadius: "25px",
            }}
          >
            {authLoading ? (
              <ButtonLoading color="white" />
            ) : (
              "Send Verification Code"
            )}
          </Button>

          <div className="text-center mt-3">
            <small>Don’t have an account? </small>
            <Link to="/admin/sign-up" className="text-primary fw-semibold">
              Sign up for free!
            </Link>
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
