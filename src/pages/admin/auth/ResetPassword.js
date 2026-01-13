import React from "react";
import { useState } from "react";
import { Form } from "react-bootstrap";
import { showError } from "../../../helpers/Toast";
import Layout from "./AuthLayout";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../../redux/thunks";
import PasswordInput from "../../../components/common/PasswordInput";
import LoadingButton from "../../../components/common/LoadingButton";
import { validatePassword, validatePasswordMatch } from "../../../utils/validation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { authLoading } = useSelector((state) => state.ownerAuth);

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const validate = () => {
    const newErrors = {};

    if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirm) {
      newErrors.confirm = "You need to confirm your new password.";
    }

    if (!validatePasswordMatch(password, confirm)) {
      newErrors.confirm = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(resetPassword({ email, password })).unwrap();
      navigate("/admin/login");
    } catch (err) {
      showError(err);
    }
  };

  return (
    <Layout>
      <div>
        <h2 className="welcome-heading">RESET PASSWORD</h2>
        <p className="text-muted" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "400" }}>
          Change Password! Please enter your details.
        </p>

        <Form onSubmit={handleSubmit}>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
            disabled={authLoading}
            required
          />

          <PasswordInput
            label="Confirm Password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((prev) => ({ ...prev, confirm: "" }));
            }}
            error={errors.confirm}
            disabled={authLoading}
            required
          />

          <LoadingButton
            type="submit"
            loading={authLoading}
            className="w-100 fw-semibold"
            style={{
              background: "#27ae60",
              border: "none",
              borderRadius: "25px"
            }}
          >
            Change Password
          </LoadingButton>
        </Form>
      </div>
    </Layout>
  );
};

export default ResetPassword;
