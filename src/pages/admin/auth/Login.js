import { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { loginOwner } from "../../../redux/thunks";
import Layout from "./AuthLayout";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authLoading } = useSelector((state) => state.ownerAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = "Please enter your Email";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      errs.password = "Please enter your Password";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Clear specific field error on user input
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await dispatch(
        loginOwner({ email: formData.email, password: formData.password })
      ).unwrap();
      const ownerData = getOwnerFromSession();
      const shouldSkipRegister = ownerData?.hasCourt || ownerData?.generatedBy;

      // 3. Navigate based on fresh data
      navigate(shouldSkipRegister ? "/admin/dashboard" : "/admin/register");
    } catch (err) {
      setApiError(err || "Login failed. Try again.");
    }
  };

  const { pathname } = useLocation();
  console.log("Current pathname:", pathname);

  useEffect(() => {

    if (pathname === "/admin/login" || pathname === "/admin/sign-up") {
      localStorage.removeItem("clubFormData");
      sessionStorage.removeItem("registerId");
      console.log("Removed for login/signup");
    } else if (pathname === "/admin/dashboard") {
      localStorage.removeItem("clubFormData");
      console.log("Removed for dashboard");
    }
  }, [pathname]);

  return (
    <Layout>
      <div className="w-75 w-sm-100">
        <style>
          {`
            @media (max-width: 768px) {
              .login-container {
                width: 90% !important;
                max-width: 400px !important;
              }
              .form-control {
                padding: 12px 40px 12px 16px !important;
                font-size: 16px !important;
              }
              .btn {
                padding: 14px 12px !important;
                min-height: 48px !important;
              }
            }
          `}
        </style>
        <div className="login-container">
          <p
            className="mb-0"
            style={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "34px",
            }}
          >
            WELCOME BACK
          </p>
          <p
            className="text-muted mb-2"
            style={{
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
              paddingTop: "12px",
            }}
          >
            Welcome back! Please enter your details.
          </p>

          <Form onSubmit={handleLogin} noValidate className="small">
            {/* <span className="p-1 small text-danger">{apiError}</span> */}
            {/* Email */}
            <Form.Group
              controlId="formEmail"
              className="mb-3 position-relative"
            >
              <Form.Label className="fw-medium">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                disabled={authLoading}
                onChange={handleChange}
                isInvalid={!!errors.email}
                style={{
                  paddingRight: "40px",
                  borderRadius: "8px",
                  height: "50px",
                }}
              />
              {/* {!errors.email && (
                <FaEnvelope
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "75%",
                    transform: "translateY(-50%)",
                    color: "#aaa",
                  }}
                />
              )} */}
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password */}
            <Form.Group
              controlId="formPassword"
              className="mb-3 position-relative"
            >
              <Form.Label className="fw-medium">Password</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                disabled={authLoading}
                isInvalid={!!errors.password}
                style={{
                  paddingRight: "40px",
                  borderRadius: "8px",
                  height: "50px",
                }}
              />
              {!errors.password && (
                <div
                  onClick={togglePassword}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "73%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#aaa",
                  }}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Remember & Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-3 small">
              <Form.Check
                type="checkbox"
                name="remember"
                label="Remember me"
                checked={formData.remember}
                onChange={handleChange}
                disabled={authLoading}
                style={{ fontSize: "12px", fontWeight: "600", color: "000000", fontFamily: "Poppins", boxShadow: "none" }}
              />
              <Link
                to="/admin/forgot-password"
                className="text-decoration-none"
                style={{ fontSize: "12px", fontWeight: "600", color: "1F41BB", fontFamily: "Poppins" }}
              >
                Forgot password?
              </Link>
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={authLoading}
              className="w-100 fw-semibold shadow"
              style={{
                height: "50px",
                padding: "12px",
                borderRadius: "30px",
                background: "linear-gradient(to right, #4caf50, #3f51b5)",
                border: "none",
                fontSize: "16px",
              }}
            >
              {authLoading ? <ButtonLoading color={"white"} /> : "Sign in"}
            </Button>
          </Form>

          {/* Sign Up */}
          {/* <p className="mt-4 text-center small">
            Don't have an account?{" "}
            <Link
              to="/admin/sign-up"
              className="fw-bold text-decoration-none"
              style={{ color: "#3f51b5" }}
            >
              Sign up for free!
            </Link>
          </p> */}
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
