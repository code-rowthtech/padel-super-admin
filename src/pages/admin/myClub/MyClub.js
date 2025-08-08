import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Alert,
  Card,
} from "react-bootstrap";
import { SlCloudUpload } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Tabs, Tab, Box } from "@mui/material";

const MAX_IMAGES = 10;

// ----------------------------
// ClubUpdateForm Component
// ----------------------------
const ClubUpdateForm = ({ onCancel }) => {
  const dispatch = useDispatch();
  const { clubLoading, clubError } = useSelector((state) => state.club);

  // Initial form state
  const initialFormState = {
    courtName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    courtCount: "",
    courtTypes: { indoor: false, outdoor: false },
    features: {
      changingRooms: false,
      parking: false,
      shower: false,
      chillPad: false,
      coaching: false,
    },
    businessHours: {
      Monday: { start: "06:00 AM", end: "11:00 PM" },
      Tuesday: { start: "06:00 AM", end: "11:00 PM" },
      Wednesday: { start: "06:00 AM", end: "11:00 PM" },
      Thursday: { start: "06:00 AM", end: "11:00 PM" },
      Friday: { start: "06:00 AM", end: "11:00 PM" },
      Saturday: { start: "06:00 AM", end: "11:00 PM" },
      Sunday: { start: "06:00 AM", end: "11:00 PM" },
    },
    termsAccepted: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [previewImages, setPreviewImages] = useState([]);
  const [referenceHours, setReferenceHours] = useState({ start: "", end: "" });
  const [hasChanged, setHasChanged] = useState(false);
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

  // Validation Logic
  useEffect(() => {
    const hasValidCourtTypes =
      formData.courtTypes.indoor || formData.courtTypes.outdoor;
    const hasValidFeatures = Object.values(formData.features).some(Boolean);
    const hasValidZip =
      /^\d+$/.test(formData.zip.trim()) && formData.zip.trim().length > 0;
    const hasValidCourtCount =
      /^\d+$/.test(formData.courtCount.trim()) &&
      formData.courtCount.trim() > 0;

    setErrors({
      courtName: !formData.courtName.trim(),
      address: !formData.address.trim(),
      city: !formData.city.trim(),
      state: !formData.state.trim(),
      zip: !hasValidZip,
      courtCount: !hasValidCourtCount,
      courtTypes: !hasValidCourtTypes,
      features: !hasValidFeatures,
    });
  }, [formData]);

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    previewImages.length > 0 &&
    formData.termsAccepted;

  // Handlers
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleCheckbox = useCallback((section, key) => {
    setFormData((prev) => {
      const updatedSection = {
        ...prev[section],
        [key]: !prev[section][key],
      };

      // Re-validate after toggle
      if (section === "courtTypes") {
        const hasCourtType = updatedSection.indoor || updatedSection.outdoor;
        setErrors((errs) => ({ ...errs, courtTypes: !hasCourtType }));
      }

      if (section === "features") {
        const hasFeature = Object.values(updatedSection).some(Boolean);
        setErrors((errs) => ({ ...errs, features: !hasFeature }));
      }

      return { ...prev, [section]: updatedSection };
    });
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      if (previewImages.length + files.length > MAX_IMAGES) {
        alert(`You can upload a maximum of ${MAX_IMAGES} images.`);
        return;
      }
      const newPreviews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    },
    [previewImages.length]
  );

  const removeImage = useCallback((index) => {
    setPreviewImages((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  }, []);

  // Time Format Helpers
  const convertAmPmTo24Hour = useCallback((timeStr) => {
    if (!timeStr) return "";
    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      hours = hours.toString();
      if (hours === "12") hours = "00";
      if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();
      return `${hours.padStart(2, "0")}:${minutes}`;
    } catch (error) {
      return "";
    }
  }, []);

  const convert24HourToAmPm = useCallback((timeStr) => {
    if (!timeStr) return "";
    try {
      let [hours, minutes] = timeStr.split(":");
      hours = parseInt(hours, 10);
      const modifier = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, "0")}:${minutes} ${modifier}`;
    } catch (error) {
      return "";
    }
  }, []);

  const handleBusinessHoursChange = useCallback((day, type, value) => {
    setFormData((prev) => {
      const updatedHours = {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [type]: value,
        },
      };

      // Store latest change for "Apply to All"
      setReferenceHours({
        start: updatedHours[day].start,
        end: updatedHours[day].end,
      });

      setHasChanged(true);
      return { ...prev, businessHours: updatedHours };
    });
  }, []);

  const applyToAll = useCallback(() => {
    if (!referenceHours.start || !referenceHours.end) return;

    setFormData((prev) => {
      const updatedHours = {};
      Object.keys(prev.businessHours).forEach((day) => {
        updatedHours[day] = {
          start: referenceHours.start,
          end: referenceHours.end,
        };
      });

      setHasChanged(false);
      return { ...prev, businessHours: updatedHours };
    });
  }, [referenceHours]);

  const renderBusinessHours = useCallback(() => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return (
      <>
        {days.map((day) => {
          const dayHours = formData.businessHours[day];
          const startTime24 = convertAmPmTo24Hour(dayHours.start);
          const endTime24 = convertAmPmTo24Hour(dayHours.end);

          return (
            <Row key={day} className="align-items-center mb-1 ms-3">
              <Col md={3}>
                <span style={{ fontSize: "14px" }}>{day}</span>
              </Col>

              <Col md={4}>
                <InputGroup>
                  <FormControl
                    type="time"
                    step="3600"
                    value={startTime24}
                    onChange={(e) => {
                      const hourOnly = e.target.value.split(":")[0] + ":00";
                      const amPmTime = convert24HourToAmPm(hourOnly);
                      handleBusinessHoursChange(day, "start", amPmTime);
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                    }}
                    className="py-0 px-2"
                  />
                </InputGroup>
              </Col>

              <Col md={1} style={{ textAlign: "center" }}>
                To
              </Col>

              <Col md={4}>
                <InputGroup>
                  <FormControl
                    type="time"
                    step="3600"
                    value={endTime24}
                    onChange={(e) => {
                      const hourOnly = e.target.value.split(":")[0] + ":00";
                      const amPmTime = convert24HourToAmPm(hourOnly);
                      handleBusinessHoursChange(day, "end", amPmTime);
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                    }}
                    className="py-0 px-2"
                  />
                </InputGroup>
              </Col>
            </Row>
          );
        })}

        <Row className="justify-content-end mt-3">
          <Col md="auto">
            <button
              type="button"
              onClick={applyToAll}
              disabled={!hasChanged}
              style={{
                backgroundColor: hasChanged ? "#22c55e" : "#ccc",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "14px",
                border: "none",
                cursor: hasChanged ? "pointer" : "not-allowed",
              }}
            >
              Apply to All
            </button>
          </Col>
        </Row>
      </>
    );
  }, [
    formData.businessHours,
    convertAmPmTo24Hour,
    convert24HourToAmPm,
    handleBusinessHoursChange,
    applyToAll,
    hasChanged,
  ]);

  const renderInput = useCallback(
    (placeholder, fieldName, type = "text") => (
      <div className="mb-3">
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
            backgroundColor: "#F9FAFB",
          }}
        />
        {errors[fieldName] && (
          <Form.Control.Feedback
            type="invalid"
            style={{ display: "block", fontSize: "12px" }}
          >
            {fieldName === "zip" || fieldName === "courtCount"
              ? "Please enter a valid number"
              : "This field is required"}
          </Form.Control.Feedback>
        )}
      </div>
    ),
    [formData, errors, handleChange]
  );

  const renderCheckbox = useCallback(
    (label, section, key) => (
      <div className="mb-3">
        <Form.Check
          type="checkbox"
          id={`${section}-${key}`}
          checked={formData[section][key]}
          onChange={() => toggleCheckbox(section, key)}
          label={
            <span
              style={{ fontSize: "15px", color: "#1F2937", fontWeight: 500 }}
            >
              {label}
            </span>
          }
          style={{
            accentColor: "#22C55E",
          }}
        />
      </div>
    ),
    [formData, toggleCheckbox]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isFormValid) return;

      const apiFormData = new FormData();
      apiFormData.append("clubName", formData.courtName);
      apiFormData.append(
        "courtType",
        `${formData.courtTypes.indoor ? "Indoor" : ""}${
          formData.courtTypes.indoor && formData.courtTypes.outdoor ? "/" : ""
        }${formData.courtTypes.outdoor ? "Outdoor" : ""}`
      );
      apiFormData.append("courtCount", formData.courtCount);
      apiFormData.append("city", formData.city);
      apiFormData.append("state", formData.state);
      apiFormData.append("zipCode", formData.zip);
      apiFormData.append("address", formData.address);
      apiFormData.append("location[coordinates][0]", "50.90");
      apiFormData.append("location[coordinates][1]", "80.09");

      Object.entries(formData.features).forEach(([key, value]) => {
        if (value) apiFormData.append("features", key);
      });

      apiFormData.append(
        "businessHours",
        JSON.stringify(
          Object.entries(formData.businessHours).map(([day, times]) => ({
            time: `${times.start} - ${times.end}`,
            day,
          }))
        )
      );

      previewImages.forEach((image) => {
        apiFormData.append("image", image.file);
      });

      try {
        // await dispatch(registerClub(apiFormData)).unwrap();
        // Optionally: show success toast or redirect
      } catch (error) {
        console.error("Update failed:", error);
      }
    },
    [formData, previewImages, isFormValid]
  );

  return (
    <Card>
      <Card.Body>
        {/* Venue Details Section */}
        <h5 className="fw-bold text-gray-800 mb-3">Court Details</h5>
        <Row className="mb-3">
          <Col md>{renderInput("Court/Facility name", "courtName")}</Col>
          <Col md>{renderInput("Full Address", "address")}</Col>
          <Col md>{renderInput("City", "city")}</Col>
        </Row>
        <Row className="mb-3">
          <Col md>{renderInput("State", "state")}</Col>
          <Col md>{renderInput("Zip Code", "zip", "number")}</Col>
          <Col md>{renderInput("Number of court", "courtCount", "number")}</Col>
        </Row>
        <Row>
          <Col md={4}>
            <h6 className="fw-bold text-gray-800 mb-2">
              Court Type{" "}
              {errors.courtTypes && (
                <span className="text-danger small fw-normal">
                  (Select at least one)
                </span>
              )}
            </h6>
            {renderCheckbox("Indoor", "courtTypes", "indoor")}
            {renderCheckbox("Outdoor", "courtTypes", "outdoor")}
          </Col>
          <Col md={8}>
            <h6 className="fw-bold text-gray-800 mb-2">
              Features{" "}
              {errors.features && (
                <span className="text-danger small fw-normal">
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
                {renderCheckbox("Coaching Available", "features", "coaching")}
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Images Section */}
        <h5 className="fw-bold text-gray-800 my-3">Upload Club Image</h5>
        {/* Image Preview */}
        {previewImages.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {previewImages.map((image, index) => (
                <div
                  key={index}
                  style={{ position: "relative" }}
                  className="mb-2"
                >
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    className="img-thumbnail"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="btn-close btn-close-white bg-danger rounded-circle p-1"
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="bg-light p-2 rounded small text-muted">
              {previewImages.length}/{MAX_IMAGES} images selected
            </div>
          </div>
        )}
        {/* Upload Zone */}
        {previewImages.length !== MAX_IMAGES && (
          <div
            onClick={() => document.getElementById("clubImagesInput").click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-primary", "bg-light");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-primary", "bg-light");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-primary", "bg-light");
              const files = Array.from(e.dataTransfer.files);
              handleFileChange({ target: { files } });
            }}
            className={`border rounded p-4 text-center cursor-pointer ${
              previewImages.length === 0 ? "border-info" : ""
            }`}
            style={{
              transition: "all 0.3s ease",
            }}
          >
            <SlCloudUpload
              size={previewImages.length > 0 ? 40 : 80}
              color={previewImages.length === 0 ? "#0dcaf0" : "#6B7280"}
              style={{
                transition: "transform 0.3s ease",
              }}
            />

            <p
              className={`mt-2 fw-medium ${
                previewImages.length === 0 ? "text-info" : "text-gray-800"
              }`}
            >
              {previewImages.length === 0
                ? "Click or drag images here (required)"
                : "Click or drag to add more images"}
            </p>

            <p className="small text-muted mb-1">
              PNG, JPG, GIF up to 10MB each
            </p>

            {previewImages.length > 0 && (
              <p className="small text-success">
                {MAX_IMAGES - previewImages.length} image(s) remaining
              </p>
            )}

            <input
              type="file"
              id="clubImagesInput"
              multiple
              accept="image/png,image/jpeg,image/gif"
              className="d-none"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Business Hours */}
        <div className="mt-4">
          <h5 className="fw-bold text-gray-800 mb-3">Business Hours</h5>
          {renderBusinessHours()}
        </div>

        {/* Terms and Conditions */}
        <div className="mt-3">
          <Form.Check
            type="checkbox"
            id="termsCheckbox"
            checked={formData.termsAccepted}
            onChange={(e) =>
              setFormData({ ...formData, termsAccepted: e.target.checked })
            }
            label={
              <span className="text-gray-800 fw-medium">
                I agree to the{" "}
                <a href="#" className="text-success text-decoration-underline">
                  Terms and conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-success text-decoration-underline">
                  Privacy policy
                </a>
              </span>
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="rounded-pill px-4 py-2 fw-medium"
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!isFormValid || clubLoading}
            className="rounded-pill px-4 py-2 fw-medium"
          >
            {clubLoading ? "Processing..." : "Update"}
          </Button>
        </div>

        {/* Error Alert */}
        {clubError && (
          <Alert variant="danger" className="mt-3">
            {clubError}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

// ----------------------------
// MyClub Component
// ----------------------------
const MyClub = () => {
  const [activeTab, setActiveTab] = useState(0);
  const clubRef = useRef(null);
  const pricingRef = useRef(null);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    const refs = [clubRef, pricingRef];
    refs[newValue]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCancel = () => {
    // Implement cancel logic
    console.log("Cancelled");
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={4}>
          <Box sx={{ bgcolor: "white" }}>
            <AppBar
              position="static"
              color="default"
              className="bg-white border-bottom border-light"
              elevation={0}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label="Club Details"
                  className="fw-medium"
                  style={{
                    textTransform: "none",
                    fontSize: "15px",
                    color: "#1F2937",
                  }}
                />
                <Tab
                  label="Pricing"
                  className="fw-medium"
                  style={{
                    textTransform: "none",
                    fontSize: "15px",
                    color: "#1F2937",
                  }}
                />
              </Tabs>
            </AppBar>
          </Box>
        </Col>
      </Row>
      <hr />

      {/* Club Details Tab */}
      <div
        ref={clubRef}
        className={`border rounded p-3 mb-4 bg-white ${
          activeTab === 0 ? "border-success border-2" : "border-light"
        }`}
      >
        <ClubUpdateForm onCancel={handleCancel} />
      </div>

      {/* Pricing Tab */}
      <div
        ref={pricingRef}
        className={`border rounded p-3 bg-white ${
          activeTab === 1 ? "border-success border-2" : "border-light"
        }`}
      >
        <h5 className="fw-bold text-gray-800 mb-3">Pricing</h5>
        <p>Please configure pricing for your club courts.</p>
      </div>
    </>
  );
};

export default MyClub;
