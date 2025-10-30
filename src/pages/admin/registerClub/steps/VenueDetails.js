import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

const VenueDetails = ({ formData, onNext, updateFormData }) => {
  const [errors, setErrors] = useState({
    courtName: false,
    address: false,
    city: false,
    state: false,
    zip: false,
    courtCount: false,
    courtTypes: false,
    features: false,
    description: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const MAX_DESC = 500;

  // Validate form
  useEffect(() => {
    const isValid =
      formData.courtName &&
      formData.address &&
      formData.description &&
      formData.city &&
      formData.state &&
      formData.zip &&
      formData.courtCount &&
      (formData.courtTypes.indoor || formData.courtTypes.outdoor) &&
      Object.values(errors).every((error) => !error);
    setIsFormValid(isValid);
  }, [formData, errors]);

  const handleChange = (field, value) => {
    const newErrors = { ...errors };

    if (field === "courtName") {
      newErrors.courtName = value.trim() === "";
    } else if (field === "address") {
      newErrors.address = value.trim() === "";
    } else if (field === "city") {
      newErrors.city = value.trim() === "";
    } else if (field === "state") {
      newErrors.state = value.trim() === "";
    } else if (field === "zip") {
      newErrors.zip = !/^\d+$/.test(value.trim());
    } else if (field === "courtCount") {
      newErrors.courtCount = !/^\d+$/.test(value.trim());
    } else if (field === "description") {
      const len = value.length;
      newErrors.description = len > MAX_DESC || len === 0;
    }

    setErrors(newErrors);
    updateFormData({ [field]: value });
  };

  const toggleCheckbox = (section, key) => {
    const newValue = !formData[section][key];
    const newData = {
      [section]: {
        ...formData[section],
        [key]: newValue,
      },
    };

    if (section === "courtTypes") {
      const hasCourtType =
        newValue ||
        Object.entries(newData.courtTypes)
          .filter(([k]) => k !== key)
          .some(([_, v]) => v);
      setErrors((prev) => ({ ...prev, courtTypes: !hasCourtType }));
    }

    if (section === "features") {
      const hasFeature =
        newValue ||
        Object.entries(newData.features)
          .filter(([k]) => k !== key)
          .some(([_, v]) => v);
      setErrors((prev) => ({ ...prev, features: !hasFeature }));
    }

    updateFormData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) onNext();
  };

  const renderInput = (placeholder, fieldName, type = "text") => {
    const isTextField = type === "text" || type === "text-area";

    const handleTextChange = (e) => {
      let value = e.target.value;

      // Only for text fields
      if (isTextField && value.length > 0) {
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;

        // Capitalize first letter
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);

        // Restore cursor position
        setTimeout(() => {
          e.target.setSelectionRange(selectionStart, selectionEnd);
        }, 0);

        value = capitalized;
      }

      // For textarea: enforce max length
      if (type === "text-area" && value.length > MAX_DESC) {
        return;
      }

      handleChange(fieldName, value);
    };

    return (
      <div>
        {type === "text-area" ? (
          <div style={{ position: "relative" }}>
            <Form.Control
              as="textarea"
              placeholder={placeholder}
              value={formData[fieldName]}
              onChange={handleTextChange}
              isInvalid={!!errors[fieldName]}
              style={{
                height: "100px",
                borderRadius: "12px",
                border: `1px solid ${errors[fieldName] ? "#EF4444" : "#E5E7EB"}`,
                fontSize: "14px",
                resize: "vertical",
                paddingBottom: "20px",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                right: "12px",
                fontSize: "12px",
                color: formData.description.length > MAX_DESC ? "#EF4444" : "#6B7280",
                pointerEvents: "none",
              }}
            >
              {formData.description.length}/{MAX_DESC}
            </div>
          </div>
        ) : (
          <Form.Control
            type={type}
            placeholder={placeholder}
            value={formData[fieldName]}
            onChange={handleTextChange}
            isInvalid={errors[fieldName]}
            style={{
              height: "50px",
              borderRadius: "12px",
              border: `1px solid ${errors[fieldName] ? "#EF4444" : "#E5E7EB"}`,
              fontSize: "14px",
              backgroundColor: "#fff",
            }}
          />
        )}
        {errors[fieldName] && (
          <Form.Control.Feedback type="invalid" style={{ fontSize: "12px" }}>
            {fieldName === "zip" || fieldName === "courtCount"
              ? "Please enter a valid number"
              : fieldName === "description"
                ? "Description is required and max 500 characters"
                : "This field is required"}
          </Form.Control.Feedback>
        )}
      </div>
    );
  };

  const renderCheckbox = (label, section, key) => (
    <div className="mb-3">
      <Form.Check
        type="checkbox"
        id={`${section}-${key}`}
        checked={formData[section][key]}
        onChange={() => toggleCheckbox(section, key)}
        label={
          <span style={{ fontSize: "15px", color: "#1F2937", fontWeight: 500 }}>
            {label}
          </span>
        }
        style={{ accentColor: "#22C55E" }}
      />
    </div>
  );

  return (
    <div className="border-top">
      <Form onSubmit={handleSubmit} noValidate>
        <h5 style={{ fontWeight: 700, color: "#1F2937" }} className="my-3">
          Club Details
        </h5>

        <Row className="mb-3">
          <Col md={3}>{renderInput("Club/Facility name", "courtName")}</Col>
          <Col md={3}>{renderInput("Full Address", "address")}</Col>
          <Col md={3}>{renderInput("City", "city")}</Col>
          <Col md={3}>{renderInput("State", "state")}</Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>{renderInput("Zip Code", "zip", "number")}</Col>
          <Col md={3}>{renderInput("Number of court", "courtCount", "number")}</Col>
          <Col md={6}>{renderInput("Description", "description", "text-area")}</Col>
        </Row>

        <Row className="mt-4">
          <Col md={4}>
            <h6 style={{ fontWeight: 700, marginBottom: "10px", color: "#1F2937" }}>
              Court Type{" "}
              {errors.courtTypes && (
                <span style={{ color: "#EF4444", fontSize: "12px", fontWeight: "normal" }}>
                  (Select at least one)
                </span>
              )}
            </h6>
            {renderCheckbox("Indoor", "courtTypes", "indoor")}
            {renderCheckbox("Outdoor", "courtTypes", "outdoor")}
          </Col>

          <Col md={8}>
            <h6 style={{ fontWeight: 700, marginBottom: "10px", color: "#1F2937" }}>
              Features{" "}
              {errors.features && (
                <span style={{ color: "#EF4444", fontSize: "12px", fontWeight: "normal" }}>
                  (Select at least one)
                </span>
              )}
            </h6>
            <Row>
              <Col md={4}>{renderCheckbox("Changing Rooms", "features", "changingRooms")}</Col>
              <Col md={4}>{renderCheckbox("Parking", "features", "parking")}</Col>
              <Col md={4}>{renderCheckbox("Shower", "features", "shower")}</Col>
              <Col md={4}>{renderCheckbox("Chill Pad", "features", "chillPad")}</Col>
              <Col md={4}>{renderCheckbox("Coaching Available", "features", "coachingAvailable")}</Col>
            </Row>
          </Col>
        </Row>

        <div className="text-end mt-4">
          <Button
            type="submit"
            style={{
              backgroundColor: isFormValid ? "#22C55E" : "#D1D5DB",
              border: "none",
              borderRadius: "30px",
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "16px",
              cursor: isFormValid ? "pointer" : "not-allowed",
            }}
            disabled={!isFormValid}
          >
            Next
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VenueDetails;