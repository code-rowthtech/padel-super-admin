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
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever formData or errors change
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
    // Basic validation for required fields
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

    // Validate at least one court type is selected
    if (section === "courtTypes") {
      const hasCourtType =
        newValue ||
        Object.entries(newData.courtTypes)
          .filter(([k]) => k !== key)
          .some(([_, v]) => v);

      setErrors((prev) => ({
        ...prev,
        courtTypes: !hasCourtType,
      }));
    }

    // Validate at least one feature is selected
    if (section === "features") {
      const hasFeature =
        newValue ||
        Object.entries(newData.features)
          .filter(([k]) => k !== key)
          .some(([_, v]) => v);

      setErrors((prev) => ({
        ...prev,
        features: !hasFeature,
      }));
    }

    updateFormData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  const renderInput = (placeholder, fieldName, type = "text") => (
    <div>
      {type === "text-area" ? (
        <Form.Control
          as="textarea"
          placeholder={placeholder}
          value={formData[fieldName]}
          onChange={(e) => handleChange(fieldName, e.target.value)}
          isInvalid={!!errors[fieldName]}
          style={{
            height: "70px", // Adjust height for textarea
            borderRadius: "12px",
            border: `1px solid ${errors[fieldName] ? "#EF4444" : "#E5E7EB"}`,
            fontSize: "14px",
            resize: "vertical", // Allow vertical resizing
          }}
        />
      ) : (
        <Form.Control
          type={type}
          placeholder={placeholder}
          value={formData[fieldName]}
          onChange={(e) => handleChange(fieldName, e.target.value)}
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
            : "This field is required"}
        </Form.Control.Feedback>
      )}
    </div>
  );

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
        style={{
          accentColor: "#22C55E",
        }}
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
          <Col md={3}>
            {renderInput("Number of court", "courtCount", "number")}
          </Col>
          <Col md={6}>
            {renderInput("Description", "description", "text-area")}
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={4}>
            <h6
              style={{
                fontWeight: 700,
                marginBottom: "10px",
                color: "#1F2937",
              }}
            >
              Court Type{" "}
              {errors.courtTypes && (
                <span
                  style={{
                    color: "#EF4444",
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  (Select at least one)
                </span>
              )}
            </h6>
            {renderCheckbox("Indoor", "courtTypes", "indoor")}
            {renderCheckbox("Outdoor", "courtTypes", "outdoor")}
          </Col>

          <Col md={8}>
            <h6
              style={{
                fontWeight: 700,
                marginBottom: "10px",
                color: "#1F2937",
              }}
            >
              Features{" "}
              {errors.features && (
                <span
                  style={{
                    color: "#EF4444",
                    fontSize: "12px",
                    fontWeight: "normal",
                  }}
                >
                  (Select at least one)
                </span>
              )}
            </h6>
            <Row>
              <Col md={4}>
                {renderCheckbox("Changing Rooms", "features", "changingRooms")}
              </Col>
              <Col md={4}>
                {renderCheckbox("Parking", "features", "parking")}
              </Col>
              <Col md={4}>{renderCheckbox("Shower", "features", "shower")}</Col>
              <Col md={4}>
                {renderCheckbox("Chill Pad", "features", "chillPad")}
              </Col>
              <Col md={4}>
                {renderCheckbox(
                  "Coaching Available",
                  "features",
                  "coachingAvailable"
                )}
              </Col>
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
