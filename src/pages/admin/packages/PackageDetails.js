import React, { useState, useMemo } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createPackage, updatePackage } from "../../../redux/thunks";
import { ButtonLoading } from "../../../helpers/loading/Loaders";

const PackageDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  // Memoized initial form state
  const initialFormState = useMemo(
    () => ({
      packageName: state?.packageName || "",
      numberOfSlots: state?.numberOfSlots?.toString() || "",
      validity: state?.validity || "",
      price: state?.price?.toString() || "",
      description: state?.description || "",
      isActive: state?.isActive ?? true,
    }),
    [state]
  );

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form fields
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    const trimAndCheck = (field, msg) => {
      const value = formData[field];
      if (!String(value || "").trim()) {
        newErrors[field] = msg;
      }
    };

    trimAndCheck("packageName", "Please enter package name");
    trimAndCheck("numberOfSlots", "Please enter number of slots");
    if (formData.numberOfSlots && isNaN(Number(formData.numberOfSlots))) {
      newErrors.numberOfSlots = "Slot must be a number";
    }

    trimAndCheck("validity", "Please enter validity");
    trimAndCheck("price", "Please enter price");
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a number";
    }

    trimAndCheck("description", "Please enter description");

    return newErrors;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (state?._id) {
        await dispatch(updatePackage({ ...formData, _id: state._id })).unwrap();
      } else {
        await dispatch(createPackage(formData)).unwrap();
      }
      resetForm();
      navigate(-1);
    } catch (err) {
      console.error("Package save failed:", err);
      setErrors((prev) => ({
        ...prev,
        submit:
          err?.message || "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  function numbersOnly(e) {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete", // control keys
    ];
    // Block everything except digits and allowed control keys
    if (
      !allowedKeys.includes(e.key) &&
      !/^\d$/.test(e.key) // allow only 0–9 digits
    ) {
      e.preventDefault();
    }
  }
  return (
    <Container
      fluid
      className="py-4"
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        maxWidth: "1200px",
      }}
    >
      {/* Header */}
      <Row className="mb-4 justify-content-between align-items-center">
        <Col xs="auto">
          <h3 className="fw-bold mb-0" style={{ color: "#0f172a" }}>
            Packages
          </h3>
        </Col>
        <Col xs="auto">
          <Button
            variant="link"
            className="p-0 text-primary"
            onClick={() => navigate(-1)}
            style={{
              fontSize: "16px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>Back
          </Button>
        </Col>
      </Row>

      {/* Form */}
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Control
                placeholder="Package Name"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                isInvalid={!!errors.packageName}
                className="border-1"
              />
              <Form.Control.Feedback type="invalid">
                {errors.packageName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Control
                placeholder="Number of Slots/Hrs"
                name="numberOfSlots"
                value={formData.numberOfSlots}
                onChange={handleChange}
                onKeyDown={(e) => {
                  numbersOnly(e);
                }}
                isInvalid={!!errors.numberOfSlots}
                className="border-1"
              />
              <Form.Control.Feedback type="invalid">
                {errors.numberOfSlots}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Control
                placeholder="Validity (e.g. 30 days)"
                name="validity"
                value={formData.validity}
                onChange={handleChange}
                onKeyDown={(e) => {
                  numbersOnly(e);
                }}
                isInvalid={!!errors.validity}
                className="border-1"
              />
              <Form.Control.Feedback type="invalid">
                {errors.validity}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-3 mt-3">
          <Col md={4}>
            <Form.Group>
              <Form.Control
                placeholder="Price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onKeyDown={(e) => {
                  numbersOnly(e);
                }}
                isInvalid={!!errors.price}
                className="border-1"
              />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={8} className="d-flex align-items-center">
            {/* Status Toggle */}
            <div className="d-flex align-items-center">
              <span
                className="me-3"
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Status:
              </span>

              <div
                onClick={() =>
                  setFormData((p) => ({ ...p, isActive: !p.isActive }))
                }
                style={{
                  position: "relative",
                  width: "60px",
                  height: "30px",
                  borderRadius: "15px",
                  backgroundColor: formData.isActive ? "#22c55e" : "#e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginRight: "10px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: formData.isActive ? "33px" : "3px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease",
                  }}
                ></div>
              </div>

              <span
                style={{
                  color: formData.isActive ? "#22c55e" : "#64748b",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </Col>
        </Row>

        <Row className="g-3 mt-3">
          <Col md={12}>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!errors.description}
                style={{ resize: "none" }}
                className="border-1"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {errors.submit && (
          <div className="text-danger mt-2">{errors.submit}</div>
        )}

        <Row className="mt-4 justify-content-end">
          <Col xs="auto">
            <Button
              variant="outline-secondary"
              onClick={() => {
                resetForm();
                navigate(-1);
              }}
              className="me-3 px-4 py-2"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              type="submit"
              className="px-4 py-2"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
                backgroundColor: "#22c55e",
                border: "none",
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ButtonLoading size={15} />
              ) : state?._id ? (
                "Update"
              ) : (
                "Confirm"
              )}
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default PackageDetails;
