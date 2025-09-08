import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../../../redux/thunks";
import Layout from "./AuthLayout";
import { showError, showSuccess } from "../../../helpers/Toast";
import { ButtonLoading } from "../../../helpers/loading/Loaders";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(60);
  const { authLoading } = useSelector((state) => state.ownerAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Timer countdown
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current filled
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle OTP paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 4);
    if (/^\d{1,4}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      for (let i = 0; i < 4; i++) {
        otp[i] = newOtp[i] || "";
        if (inputRefs.current[i]) inputRefs.current[i].value = newOtp[i] || "";
      }
      setOtp([...otp]);
      const nextIndex = Math.min(pasteData.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 4) {
      showError("Please enter the complete OTP.");
      return;
    }

    try {
      await dispatch(verifyOtp({ email, otp: fullOtp.trim() })).unwrap();
      navigate("/admin/reset-password", { state: { email } });
    } catch (err) {
      // showError("Something went wrong during OTP verification.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      return showError(
        "Email not found. Please go back and enter your email again."
      );
    }

    try {
      const result = await dispatch(sendOtp({ email, type: "Forgot" }));
      if (result?.meta?.requestStatus === "fulfilled") {
        showSuccess("OTP sent successfully.");
      } else {
        showError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      showError("Something went wrong while sending OTP.");
    }
  };
  return (
    <Layout>
      {timer === 0 && (
        <i
          className="bi bi-arrow-left-short fs-3 rounded-circle bg-light text-dark px-1"
          onClick={() => navigate(-1)}
          title="Go back"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: 10,
          }}
        />
      )}
      <div style={{ width: "100%", maxWidth: 350, textAlign: "center" }}>
        <h3 className="fw-bold mb-2">Verify Otp</h3>
        <p className="text-muted mb-4">
          A verification code has been sent to <strong>{email}</strong>
        </p>

        <div
          className="d-flex justify-content-between gap-2 mb-3"
          onPaste={handlePaste}
        >
          {[0, 1, 2, 3].map((index) => (
            <Form.Control
              key={index}
              type="text"
              maxLength={1}
              disabled={authLoading}
              ref={(el) => (inputRefs.current[index] = el)}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                width: 50,
                height: 50,
                fontSize: 24,
                textAlign: "center",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          ))}
        </div>

        {timer !== 0 && (
          <div className="text-muted mb-3">
            00:{String(timer).padStart(2, "0")} Sec
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-100 fw-semibold"
          disabled={authLoading || timer === 0}
          style={{
            height: "50px",
            background: "linear-gradient(to right, #27ae60, #2e51f3)",
            border: "none",
            borderRadius: "25px",
          }}
        >
          {authLoading ? <ButtonLoading color="white" /> : "Verify Code"}
        </Button>

        {timer === 0 && (
          <div className="mt-3">
            <span className="text-muted">Didn’t receive code? </span>
            <span
              style={{ color: "#007bff", cursor: "pointer" }}
              onClick={handleResend}
            >
              Re-send
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyOTP;
