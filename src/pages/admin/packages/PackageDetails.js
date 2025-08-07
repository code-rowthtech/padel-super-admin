import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PackageDetails = () => {
  const navigate = useNavigate();

  const initialFormState = {
    packageName: "",
    numberOfSlots: "",
    validity: "",
    price: "",
    description: "",
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.packageName.trim()) newErrors.packageName = "Required";
    if (!formData.numberOfSlots.trim()) newErrors.numberOfSlots = "Required";
    else if (isNaN(formData.numberOfSlots))
      newErrors.numberOfSlots = "Must be number";
    if (!formData.validity.trim()) newErrors.validity = "Required";
    if (!formData.price.trim()) newErrors.price = "Required";
    else if (isNaN(formData.price)) newErrors.price = "Must be number";
    if (!formData.description.trim()) newErrors.description = "Required";
    return newErrors;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Submitted:", formData);
    resetForm();
    navigate(-1);
  };

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
                isInvalid={!!errors.price}
                className="border-1"
              />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={8} className="d-flex align-items-center">
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

              {/* Professional Toggle Switch */}
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
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="px-4 py-2"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
                backgroundColor: "#22c55e",
                border: "none",
              }}
            >
              Confirm
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default PackageDetails;
