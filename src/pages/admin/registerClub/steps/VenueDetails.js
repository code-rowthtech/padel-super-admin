import React, { useState, useEffect, useRef } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import MarkdownEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import markdownItIns from "markdown-it-ins";
import { showWarning } from "../../../../helpers/Toast";

const mdParser = new MarkdownIt();
mdParser.use(markdownItIns);

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
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(230);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(230);

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
      const zipValue = value.trim();
      newErrors.zip = !/^\d{4,6}$/.test(zipValue);
    } else if (field === "courtCount") {
      const num = Number(value);
      if (!/^\d+$/.test(value.trim()) || num <= 0) {
        newErrors.courtCount = "Please enter a valid number";
      } else if (num > 10) {
        newErrors.courtCount = "You can only add up to 10 courts";
      } else {
        newErrors.courtCount = false;
      }
    } else if (field === "description") {
      const count = value.trim().split(/\s+/).filter(Boolean).length;
      newErrors.description = count === 0;
    }

    setErrors(newErrors);
    updateFormData({ [field]: value });
  };

  const toggleCheckbox = (section, key) => {
    setEditorHeight(230);
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const delta = e.clientY - startYRef.current;
        setEditorHeight(
          Math.max(150, Math.min(800, startHeightRef.current + delta))
        );
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const renderInput = (placeholder, fieldName, type = "text") => {
    const isTextField = type === "text" || type === "text-area";
    const isNumberField = type === "number";

    const handleTextChange = (e) => {
      let value = e.target.value;

      const socialMediaFields = ['linkedinLink', 'xlink', 'facebookLink', 'instagramLink'];
      const shouldCapitalize = isTextField && value.length > 0 && !socialMediaFields.includes(fieldName);

      if (shouldCapitalize) {
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;

        const capitalized =
          fieldName === "courtName"
            ? value
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : value.charAt(0).toUpperCase() + value.slice(1);

        setTimeout(() => {
          e.target.setSelectionRange(selectionStart, selectionEnd);
        }, 0);

        value = capitalized;
      }

      if (fieldName === "zip") {
        value = value.replace(/\D/g, "");
        if (value.startsWith("0") || value.length > 6) {
          return;
        }
      }

      handleChange(fieldName, value);
    };

    return (
      <div>
        {type === "text-area" ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontSize: "14px", color: "#6B7280" }}>
                {placeholder}
              </span>
              <span style={{ fontSize: "12px", color: "#6B7280" }}>
                {wordCount}/{MAX_DESC} words
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <MarkdownEditor
                ref={editorRef}
                value={formData[fieldName]}
                onChange={({ text }) => {
                  const count = text.trim().split(/\s+/).filter(Boolean).length;
                  if (count <= MAX_DESC) {
                    handleChange(fieldName, text);
                    setWordCount(count);
                  } else {
                    showWarning(`Description cannot exceed ${MAX_DESC} words.`);
                  }
                }}
                style={{
                  height: `${editorHeight}px`,
                  border: `1px solid ${
                    errors[fieldName] ? "#EF4444" : "#E5E7EB"
                  }`,
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                }}
                renderHTML={(text) => mdParser.render(text)}
                config={{
                  view: { menu: true, md: true, html: true },
                  placeholder: "Short description (max 500 words)",
                  toolbar: [
                    "bold",
                    "italic",
                    "heading",
                    "|",
                    "quote",
                    "unordered-list",
                    "ordered-list",
                    "|",
                    "link",
                  ],
                  canView: {
                    menu: true,
                    md: true,
                    html: false,
                    fullScreen: false,
                    hideMenu: false,
                  },
                }}
              />
              <div
                onMouseDown={(e) => {
                  setIsDragging(true);
                  startYRef.current = e.clientY;
                  startHeightRef.current = editorHeight;
                  e.preventDefault();
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "40px",
                  height: "20px",
                  cursor: "ns-resize",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F3F4F6",
                  borderRadius: "4px 4px 0 0",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "3px",
                    backgroundColor: "#9CA3AF",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <Form.Control
            type={type}
            placeholder={placeholder}
            value={formData[fieldName]}
            onChange={handleTextChange}
            onFocus={() => setEditorHeight(230)}
            isInvalid={errors[fieldName]}
            style={{
              height: "38px",
              borderRadius: "12px",
              border: `1px solid ${errors[fieldName] ? "#EF4444" : "#E5E7EB"}`,
              fontSize: "14px",
              backgroundColor: "#fff",
              boxShadow: "none",
            }}
          />
        )}
        {errors[fieldName] && (
          <Form.Control.Feedback type="invalid" style={{ fontSize: "12px" }}>
            {typeof errors[fieldName] === "string"
              ? errors[fieldName] // show custom message
              : fieldName === "description"
              ? "Description is required and max 500 words"
              : fieldName === "courtTypes"
              ? "Please select at least one court type"
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
          <span
            className="ps-3"
            style={{
              fontSize: "14px",
              color: "#374151",
              fontWeight: "500",
              fontFamily: "Poppins",
            }}
          >
            {label}
          </span>
        }
        style={{
          accentColor: "#22C55E",
        }}
      />
      <style jsx>{`
        input[type="checkbox"] {
          width: 20px !important;
          height: 20px !important;
          transform: scale(1.2);
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );

  return (
    <div className="border-top">
      <Form onSubmit={handleSubmit} noValidate>
        <h5
          style={{ fontWeight: 600, color: "#374151", fontFamily: "Poppins" }}
          className="my-3"
        >
          Club Details
        </h5>

        <Row className="mb-3">
          <Col md={6}>
            <Row className="mb-3">
              <Col md={6}>{renderInput("Club/Facility name", "courtName")}</Col>
              <Col md={6}>{renderInput("Full Address", "address")}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>{renderInput("City", "city")}</Col>
              <Col md={6}>{renderInput("State", "state")}</Col>
            </Row>
            <Row className="mb-3">
              {" "}
              <Col md={6}>{renderInput("Zip Code", "zip")}</Col>
              <Col md={6}>
                {renderInput("Number of court", "courtCount", "number")}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>{renderInput("LinkedIn Link", "linkedinLink")}</Col>
              <Col md={6}>{renderInput("X Link", "xlink")}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>{renderInput("Facebook Link", "facebookLink")}</Col>
              <Col md={6}>{renderInput("Instagram Link", "instagramLink")}</Col>
            </Row>
          </Col>
          <Col md={6}>
            {renderInput("Description", "description", "text-area")}
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={4}>
            <h6
              style={{
                fontWeight: 600,
                marginBottom: "10px",
                fontSize: "16px",
                color: "#374151",
                fontFamily: "Poppins",
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
                fontWeight: 600,
                marginBottom: "10px",
                fontSize: "16px",
                color: "#374151",
                fontFamily: "Poppins",
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
              <Col md={4}>{renderCheckbox("Shed", "features", "shed")}</Col>
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
              padding: "8px 34px",
              fontWeight: 600,
              fontSize: "16px",
              fontFamily: "Poppins",
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
