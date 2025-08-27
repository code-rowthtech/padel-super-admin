import React, { useState, useEffect } from "react";
import { Modal, Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubOwner,
  signupOwner,
  updateSubOwner,
} from "../../../../redux/thunks";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";

const SubOwnerModal = ({ show, onHide, userData }) => {
  const dispatch = useDispatch();
  const { updateSubOwnerLoading } = useSelector((state) => state?.subOwner);
  const { authLoading } = useSelector((state) => state.ownerAuth);
  const owner = getOwnerFromSession();
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

  // Prefill form when editing
  useEffect(() => {
    if (userData?._id) {
      setForm({
        name: userData.name || "",
        phoneNumber: userData.phoneNumber || "",
        email: userData.email || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setForm({
        name: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
    setErrors({});
  }, [userData, show]);

  const capitalizeFirst = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const validate = () => {
    const newErrors = {};
    const name = form.name.trim();

    if (!name) newErrors.name = "Please enter name";
    else if (name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!form.phoneNumber) newErrors.phoneNumber = "Please enter phone number";
    else if (!/^\d{10}$/.test(form.phoneNumber))
      newErrors.phoneNumber = "Enter a valid 10-digit phone number";

    if (!form.email.trim()) newErrors.email = "Please enter email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!userData?._id || form.password) {
      if (!form.password) newErrors.password = "Please create password";
      else if (form.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (!form.confirmPassword)
        newErrors.confirmPassword = "Please confirm password";
      else if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "name") {
      val = capitalizeFirst(val.replace(/[^\p{L}\p{N} ]+/gu, ""));
    }
    if (name === "phoneNumber") {
      val = val.replace(/\D/g, "").slice(0, 10);
      if (val !== "" && !/^[6-9]/.test(val)) {
        return;
      }
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

  const handleClose = () => {
    setForm({
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    onHide();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        if (userData?._id) {
          const payload = {
            userId: userData._id,
            name: form.name,
            phoneNumber: form.phoneNumber,
            email: form.email,
            ...(form.password ? { password: form.password } : {}),
          };
          await dispatch(updateSubOwner(payload))
            .unwrap()
            .then(() => {
              dispatch(
                getSubOwner({ ownerId: owner?._id, page: 1, limit: 10 })
              );
              handleClose();
            });
        } else {
          const payload = {
            name: form.name,
            phoneNumber: form.phoneNumber,
            email: form.email,
            password: form.password,
            generatedBy: owner?._id,
          };
          await dispatch(signupOwner(payload))
            .unwrap()
            .then(() => {
              dispatch(
                getSubOwner({ ownerId: owner?._id, page: 1, limit: 10 })
              );
              handleClose();
            });
        }
      } catch (err) {
        setErrors({ api: err || "Action failed. Try again." });
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "20px",
          background: "none",
          border: "none",
          fontSize: "30px",
          cursor: "pointer",
          color: "red",
        }}
      >
        ×
      </button>
      <Modal.Header className="border-0" style={{ background: "#f9fafb" }}>
        <Modal.Title className="fw-bold fs-5">
          {userData?._id ? "Edit User" : "Add User"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-3">
        <Form onSubmit={handleSubmit} noValidate>
          {errors.api && (
            <div className="alert alert-danger py-2 small">{errors.api}</div>
          )}

          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
              placeholder="Enter full name"
              className="rounded-pill px-3 py-2"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Phone */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              isInvalid={!!errors.phoneNumber}
              placeholder="10-digit phone number"
              className="rounded-pill px-3 py-2"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="Enter email"
              className="rounded-pill px-3 py-2"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder={
                  userData?._id ? "Leave blank to keep unchanged" : "******"
                }
                className="rounded-start-pill px-3 py-2"
              />
              <InputGroup.Text
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
                className="rounded-end-pill bg-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                placeholder={
                  userData?._id ? "Leave blank to keep unchanged" : "******"
                }
                className="rounded-start-pill px-3 py-2"
              />
              <InputGroup.Text
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ cursor: "pointer" }}
                className="rounded-end-pill bg-white"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            disabled={authLoading || updateSubOwnerLoading}
            className="w-100 rounded-pill py-2 fw-semibold"
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              border: "none",
            }}
          >
            {authLoading || updateSubOwnerLoading ? (
              <ButtonLoading size={14} />
            ) : userData?._id ? (
              "Update User"
            ) : (
              "Add User"
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SubOwnerModal;
