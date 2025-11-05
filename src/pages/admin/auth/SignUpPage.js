import React, { useEffect, useState } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authImg } from "../../../assets/files";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signupOwner } from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./AuthLayout";
import { ButtonLoading } from "../../../helpers/loading/Loaders";

const SignUpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { authLoading } = useSelector((state) => state.ownerAuth);

  const capitalizeFirst = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const validate = () => {
    const newErrors = {};
    const name = form.name.trim();

    if (!name) newErrors.name = "Please enter your name";
    else if (name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!form.phoneNumber)
      newErrors.phoneNumber = "Please enter your phone number";
    else if (!/^\+91 [6-9]\d{9}$/.test(form.phoneNumber))
      newErrors.phoneNumber = "Enter a valid 10-digit phone number starting with 6-9";

    if (!form.email.trim()) newErrors.email = "Please enter your email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Please create your password";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "name") {
      val = capitalizeFirst(val.replace(/[^\p{L}\p{N} ]+/gu, ""));
    }

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/[^0-9]/g, ""); // Only digits

    if (input.length === 0) {
      setForm(prev => ({ ...prev, phoneNumber: "" }));
      return;
    }

    // First digit must be 6-9
    if (!/^[6-9]/.test(input)) {
      return; // Ignore if first digit is not 6-9
    }

    // Limit to 10 digits
    if (input.length > 10) {
      input = input.slice(0, 10);
    }

    setForm(prev => ({
      ...prev,
      phoneNumber: `+91 ${input}`,
    }));

    if (errors.phoneNumber) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.phoneNumber;
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const payload = {
          name: form.name,
          phoneNumber: form.phoneNumber.replace('+91 ', ''),
          email: form.email,
          password: form.password,
        };
        await dispatch(signupOwner(payload)).unwrap();
        navigate("/admin/login");
      } catch (err) {
        setErrors({ api: err || "Signup failed. Try again." });
      }
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
      <div className="w-md-50 w-sm-100">
        <h2 className="mb-1" style={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "34px",
        }}>WELCOME</h2>
        <p className="text-muted mb-3" style={{
          fontFamily: "Poppins",
          fontWeight: 400,
          fontSize: "14px",
          paddingTop: "12px",
        }}>Please enter your details to sign up.</p>

        <Form onSubmit={handleSubmit} noValidate className="small">
          <span className="p-1 text-danger small d-block">{errors.api}</span>

          {/* Name */}
          <Form.Group controlId="name" className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              disabled={authLoading}
              onChange={handleChange}
              isInvalid={!!errors.name}
              style={{
                paddingRight: "40px",
                borderRadius: "8px",
                height: "50px",
                boxShadow:"none"
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Phone Number */}
          <Form.Group controlId="phoneNumber" className="mb-2">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter 10-digit phone number"
              value={form.phoneNumber.replace('+91 ', '')}
              disabled={authLoading}
              onChange={handlePhoneChange}
              isInvalid={!!errors.phoneNumber}
              style={{
                paddingRight: "40px",
                borderRadius: "8px",
                height: "50px",
                boxShadow:"none"
              }}
              maxLength={10}
              autoComplete="tel"
              inputMode="numeric"
            />
          
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Email */}
          <Form.Group controlId="email" className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              disabled={authLoading}
              onChange={handleChange}
              isInvalid={!!errors.email}
              style={{
                paddingRight: "40px",
                borderRadius: "8px",
                height: "50px",
                boxShadow:"none"
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group controlId="password" className="mb-2">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="******"
                value={form.password}
                disabled={authLoading}
                onChange={handleChange}
                isInvalid={!!errors.password}
                style={{
                  paddingRight: "40px",
                  borderRadius: "8px 0px 0px 8px",
                  height: "50px",
                  boxShadow:"none"
                }}
              />
              <Button
                variant="outline-secondary border"
                type="button"
                style={{ borderRadius: "0px 8px 8px 0px",boxShadow:"none" }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={form.password.length === 0}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="******"
                value={form.confirmPassword}
                disabled={authLoading}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                style={{
                  paddingRight: "40px",
                  borderRadius: "8px 0px 0px 8px",
                  height: "50px",
                  boxShadow:"none"
                }}
              />
              <Button
                variant="outline-secondary border"
                type="button"
                style={{ borderRadius: "0px 8px 8px 0px",boxShadow:"none" }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={form.confirmPassword.length === 0}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

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
              boxShadow:"none"
            }}
          >
            {authLoading ? (
              <ButtonLoading color="white" size={12} />
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <p style={{ fontSize: "14px" }}>
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="fw-bold"
              style={{ color: "#3f51b5" }}
            >
              Login!
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;