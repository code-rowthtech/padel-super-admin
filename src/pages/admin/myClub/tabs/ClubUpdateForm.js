// ClubUpdateForm.jsx
import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { SlCloudUpload } from "react-icons/sl";
import {
  getOwnerRegisteredClub,
  updateRegisteredClub,
} from "../../../../redux/thunks";
import { showInfo, showWarning } from "../../../../helpers/Toast";
import {
  ButtonLoading,
  DataLoading,
} from "../../../../helpers/loading/Loaders";
import { useNavigate } from "react-router-dom";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
const MAX_IMAGES = 10;

const defaultFeatureKeys = [
  "changingRooms",
  "parking",
  "shower",
  "chillPad",
  "coachingAvailable",
];

const defaultBusinessHoursTemplate = {
  Monday: { start: "06:00 AM", end: "11:00 PM" },
  Tuesday: { start: "06:00 AM", end: "11:00 PM" },
  Wednesday: { start: "06:00 AM", end: "11:00 PM" },
  Thursday: { start: "06:00 AM", end: "11:00 PM" },
  Friday: { start: "06:00 AM", end: "11:00 PM" },
  Saturday: { start: "06:00 AM", end: "11:00 PM" },
  Sunday: { start: "06:00 AM", end: "11:00 PM" },
};

const getInitialFormState = (details = {}) => {
  const type = details?.courtType?.trim().toLowerCase();

  const courtTypes = {
    indoor: type === "indoor" || type === "indoor/outdoor",
    outdoor: type === "outdoor" || type === "indoor/outdoor",
  };

  const features = defaultFeatureKeys.reduce((acc, key) => {
    acc[key] = Array.isArray(details?.features)
      ? details.features.includes(key)
      : false;
    return acc;
  }, {});

  const businessHours = { ...defaultBusinessHoursTemplate };

  (details?.businessHours || []).forEach(({ day, time, _id }) => {
    if (!day || !time) return;

    const [start, end] = time.split(" - ").map((s) => s?.trim() || "");

    if (businessHours[day]) {
      businessHours[day] = { start, end, _id };
    }
  });

  return {
    courtName: details?.clubName || "",
    address: details?.address || "",
    city: details?.city || "",
    state: details?.state || "",
    zip: details?.zipCode || "",
    courtCount:
      typeof details?.courtCount !== "undefined"
        ? String(details.courtCount)
        : "",
    courtTypes,
    features,
    businessHours,
    courtImage: details?.courtImage,
    termsAccepted:
      typeof details?.termsAccepted !== "undefined"
        ? !!details.termsAccepted
        : true,
    description: details?.description || "",
  };
};

const getInitialPreviews = (details = {}) => {
  // Handle single image URL (courtImage)
  if (typeof details === "string") {
    return [{ preview: details, isRemote: true }];
  }
  // Handle array of images (images)
  if (Array.isArray(details)) {
    return details.slice(0, MAX_IMAGES).map((url) => ({
      preview: url,
      isRemote: true,
    }));
  }
  return [];
};
// Validation helper (full validation, independent of touched)
const validateFields = (data) => {
  const hasValidCourtTypes = !!(
    data.courtTypes?.indoor || data.courtTypes?.outdoor
  );
  const hasValidFeatures = Object.values(data.features || {}).some(Boolean);
  const zipTrim = String(data.zip || "").trim();
  const hasValidZip = /^\d+$/.test(zipTrim) && zipTrim.length > 0;
  const courtCountTrim = String(data.courtCount || "").trim();
  const hasValidCourtCount =
    /^\d+$/.test(courtCountTrim) && Number(courtCountTrim) > 0;

  const errorsObj = {
    courtName: !String(data.courtName || "").trim(),
    address: !String(data.address || "").trim(),
    city: !String(data.city || "").trim(),
    state: !String(data.state || "").trim(),
    zip: !hasValidZip,
    courtCount: !hasValidCourtCount,
    courtTypes: !hasValidCourtTypes,
    features: !hasValidFeatures,
  };

  const isValid = !Object.values(errorsObj).some(Boolean);
  return { errorsObj, isValid };
};

const ClubUpdateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const owner = getOwnerFromSession();
  const ownerId = owner?.generatedBy || owner?._id;
  const { ownerClubLoading, ownerClubError, ownerClubData } = useSelector(
    (state) => state.manualBooking
  );
  const { updateClubLoading } = useSelector((state) => state.club);
  const clubDetails = ownerClubData?.[0];

  // Prefill from clubDetails and update if clubDetails changes.
  const [formData, setFormData] = useState(() =>
    getInitialFormState(clubDetails)
  );
  const [previewImages, setPreviewImages] = useState(() =>
    getInitialPreviews(clubDetails?.images || clubDetails?.courtImage)
  );

  // Keep reference hours for "Apply to all"
  const [referenceHours, setReferenceHours] = useState({ start: "", end: "" });
  const [hasChanged, setHasChanged] = useState(false);

  // touched controls whether we show validation messages for a field
  const [touched, setTouched] = useState({
    courtName: false,
    address: false,
    city: false,
    state: false,
    zip: false,
    courtCount: false,
    courtTypes: false,
    features: false,
  });

  // errors reflect currently-visible errors (touched-aware or forced on submit)
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

  // Keep track of locally created object URLs so we can revoke them on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach((img) => {
        if (!img.isRemote && img.preview) {
          try {
            URL.revokeObjectURL(img.preview);
          } catch (e) {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If clubDetails is loaded/updated asynchronously, update form + previews
  useEffect(() => {
    setFormData(getInitialFormState(clubDetails));
    setPreviewImages(
      getInitialPreviews(clubDetails?.images || clubDetails?.courtImage)
    );
    // Reset touched/errors so prefilled values don't show errors immediately
    setTouched({
      courtName: false,
      address: false,
      city: false,
      state: false,
      zip: false,
      courtCount: false,
      courtTypes: false,
      features: false,
    });
    setErrors({
      courtName: false,
      address: false,
      city: false,
      state: false,
      zip: false,
      courtCount: false,
      courtTypes: false,
      features: false,
    });
  }, [clubDetails]);

  // Update visible errors when formData or touched changes (only show for touched)
  useEffect(() => {
    const { errorsObj } = validateFields(formData);
    // only show errors for touched fields
    const visibleErrors = {};
    Object.keys(errorsObj).forEach((k) => {
      visibleErrors[k] = !!(touched[k] && errorsObj[k]);
    });
    setErrors((prev) => ({ ...prev, ...visibleErrors }));
  }, [formData, touched]);

  // overall valid state (no visible errors + images + terms)
  const noVisibleErrors = !Object.values(errors).some(Boolean);
  const isFormValid =
    noVisibleErrors && previewImages.length > 0 && formData.termsAccepted;

  // --- Handlers ---
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const toggleCheckbox = useCallback((section, key) => {
    setFormData((prev) => {
      const updatedSection = {
        ...prev[section],
        [key]: !prev[section]?.[key],
      };
      return { ...prev, [section]: updatedSection };
    });
    // mark the section as touched so validation will show
    setTouched((prev) => ({ ...prev, [section]: true }));
  }, []);

  const handleFileChange = useCallback(
    (eOrObj) => {
      // Accept either a real event or a synthetic object { target: { files } } used by drop handler
      const filesList = eOrObj?.target?.files ?? eOrObj; // e.target.files or array
      const files = Array.isArray(filesList)
        ? filesList
        : Array.from(filesList || []);

      if (previewImages.length + files.length > MAX_IMAGES) {
        showInfo(`You can upload a maximum of ${MAX_IMAGES} images.`);
        return;
      }

      const newPreviews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isRemote: false,
      }));

      setPreviewImages((prev) => [...prev, ...newPreviews]);
    },
    [previewImages.length]
  );

  const removeImage = useCallback((index) => {
    setPreviewImages((prev) => {
      const newPreviews = [...prev];
      const img = newPreviews[index];
      if (img && !img.isRemote && img.preview) {
        try {
          URL.revokeObjectURL(img.preview);
        } catch (err) {}
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  }, []);

  // Time conversion helpers (AM/PM <-> 24:00)
  const convertAmPmTo24Hour = useCallback((timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.trim().split(" ");
    if (parts.length < 2) return "";
    const [time, modifier] = parts;
    const [hStr, mStr] = time.split(":");
    let hours = parseInt(hStr, 10);
    const minutes = mStr ?? "00";
    if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }, []);

  const convert24HourToAmPm = useCallback((timeStr) => {
    if (!timeStr) return "";
    const [hStr, mStr] = timeStr.split(":");
    let hours = parseInt(hStr, 10);
    const minutes = mStr ?? "00";
    const modifier = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )} ${modifier}`;
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
      Object.keys(prev.businessHours).forEach((d) => {
        const existing = prev.businessHours[d] || {};
        updatedHours[d] = {
          _id: existing._id || undefined, // keep the existing _id if present
          start: referenceHours.start,
          end: referenceHours.end,
        };
      });
      setHasChanged(false);
      return { ...prev, businessHours: updatedHours };
    });
  }, [referenceHours]);

  // Render helpers
  const renderInput = useCallback(
    (placeholder, fieldName, type = "text") => (
      <div className="mb-3">
        {type === "text-area" ? (
          <Form.Control
            as="textarea"
            placeholder={placeholder}
            value={formData[fieldName]}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, [fieldName]: true }))
            }
            isInvalid={!!errors[fieldName]}
            style={{
              height: "70px", // Adjust height for textarea
              borderRadius: "12px",
              border: `1px solid ${errors[fieldName] ? "#EF4444" : "#E5E7EB"}`,
              fontSize: "14px",
              backgroundColor: "#F9FAFB",
              resize: "vertical", // Allow vertical resizing
            }}
          />
        ) : (
          <Form.Control
            type={type}
            placeholder={placeholder}
            value={formData[fieldName]}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, [fieldName]: true }))
            }
            isInvalid={!!errors[fieldName]}
            style={{
              height: "50px",
              borderRadius: "12px",
              border: `1px solid ${errors[fieldName] ? "#EF4444" : "#E5E7EB"}`,
              fontSize: "14px",
              backgroundColor: "#F9FAFB",
            }}
          />
        )}
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
          checked={!!formData[section]?.[key]}
          onChange={() => toggleCheckbox(section, key)}
          onBlur={() => setTouched((prev) => ({ ...prev, [section]: true }))}
          label={
            <span
              style={{ fontSize: "15px", color: "#1F2937", fontWeight: 500 }}
            >
              {label}
            </span>
          }
          style={{ accentColor: "#22C55E" }}
        />
      </div>
    ),
    [formData, toggleCheckbox]
  );

  // Submit: force-show all errors (touch everything) and validate synchronously
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      // mark all fields touched
      const allTouched = {
        courtName: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        courtCount: true,
        courtTypes: true,
        features: true,
      };
      setTouched(allTouched);

      // full validation
      const { errorsObj, isValid } = validateFields(formData);
      setErrors(errorsObj);

      if (!isValid) return;
      if (previewImages.length === 0) {
        showWarning("Please upload at least one image.");
        return;
      }
      if (!formData.termsAccepted) {
        showInfo("Please accept the terms and conditions.");
        return;
      }

      // prepare FormData
      const apiFormData = new FormData();
      apiFormData.append("_id", clubDetails?._id);
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
      apiFormData.append("description", formData.description);
      // placeholder coordinates (replace with real)
      apiFormData.append("location[coordinates][0]", "50.90");
      apiFormData.append("location[coordinates][1]", "80.09");

      Object.entries(formData.features).forEach(([key, value]) => {
        if (value) apiFormData.append("features", key);
      });

      if (
        formData.businessHours &&
        typeof formData.businessHours === "object"
      ) {
        Object.values(formData.businessHours).forEach((hour, index) => {
          console.log({ hour });
          apiFormData.append(
            `businessHoursUpdates[${index}][time]`,
            `${hour.start} - ${hour.end}`
          );
          apiFormData.append(`businessHoursUpdates[${index}][_id]`, hour?._id);
        });
      }

      // Only append new images (files) to the form data
      previewImages.forEach((image, index) => {
        if (!image.isRemote && image.file) {
          apiFormData.append("image", image.file);
          apiFormData.append("imageIndex", index);
        }
      });

      // If there are remote images that should be kept, you might want to send their URLs
      const remoteImages = previewImages
        .filter((img) => img.isRemote)
        .map((img) => img.preview);

      if (remoteImages.length > 0) {
        apiFormData.append("images", JSON.stringify(remoteImages));
      }

      try {
        dispatch(updateRegisteredClub(apiFormData))
          .unwrap()
          .then(() => {
            dispatch(getOwnerRegisteredClub({ ownerId }));
          });
      } catch (err) {
        console.error("Update failed:", err);
      }
    },
    [formData, previewImages]
  );
  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  // Business hours UI renderer
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
          const dayHours = formData.businessHours[day] || {
            start: "06:00 AM",
            end: "11:00 PM",
          };
          const startTime24 = convertAmPmTo24Hour(dayHours.start);
          const endTime24 = convertAmPmTo24Hour(dayHours.end);

          return (
            <Row key={day} className="align-items-center mb-1 ms-3">
              <Col md={3}>
                <span style={{ fontSize: "14px" }}>{day}</span>
              </Col>

              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="time"
                    step="3600" // This ensures hour-only increments
                    value={
                      startTime24.includes(":")
                        ? startTime24
                        : `${startTime24}:00`
                    }
                    onChange={(e) => {
                      // Extract just the hour part and add :00 for minutes
                      const hourValue = e.target.value.split(":")[0] || "00";
                      const hourOnly24 = `${hourValue.padStart(2, "0")}:00`;
                      const amPmTime = convert24HourToAmPm(hourOnly24);
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
                  <Form.Control
                    type="time"
                    step="3600"
                    value={
                      endTime24.includes(":") ? endTime24 : `${endTime24}:00`
                    }
                    onChange={(e) => {
                      const hourValue = e.target.value.split(":")[0] || "00";
                      const hourOnly24 = `${hourValue.padStart(2, "0")}:00`;
                      const amPmTime = convert24HourToAmPm(hourOnly24);
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

  // --- Render ---

  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId })).unwrap();
  }, []);
  return (
    <Card>
      {ownerClubLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <Card.Body>
          <h5 className="fw-bold text-gray-800 mb-3">Club Details</h5>

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
                  {renderCheckbox(
                    "Changing Rooms",
                    "features",
                    "changingRooms"
                  )}
                </Col>
                <Col md={4}>
                  {renderCheckbox("Parking", "features", "parking")}
                </Col>
                <Col md={4}>
                  {renderCheckbox("Shower", "features", "shower")}
                </Col>
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

          <h5 className="fw-bold text-gray-800 my-3">Upload Club Image</h5>

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
                      className="btn-close btn-close-light bg-danger rounded-circle p-1"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "10px",
                        height: "10px",
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

          {previewImages.length !== MAX_IMAGES && (
            <div
              onClick={() =>
                document.getElementById("clubImagesInput")?.click()
              }
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
                const files = Array.from(e.dataTransfer.files || []);
                handleFileChange({ target: { files } });
              }}
              className={`border rounded p-2 text-center cursor-pointer ${
                previewImages.length === 0 ? "border-info" : ""
              }`}
              style={{ transition: "all 0.3s ease" }}
            >
              <SlCloudUpload
                size={previewImages.length > 0 ? 40 : 80}
                color={previewImages.length === 0 ? "#0dcaf0" : "#6B7280"}
                style={{ transition: "transform 0.3s ease" }}
                className="mt-2"
              />

              <p
                className={`fw-medium ${
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
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </div>
          )}

          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Business Hours</h5>
              <h6 className="fw-bold">Start Time</h6>
              <h6 className="fw-bold">Closing Time</h6>
              <Row className="justify-content-end ">
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
            </div>
            {renderBusinessHours()}
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="rounded-pill px-4 py-2 fw-medium"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
                backgroundColor: "#22c55e",
                border: "none",
              }}
              onClick={handleSubmit}
              disabled={!isFormValid || updateClubLoading}
              className="rounded-pill px-4 py-2 fw-medium"
            >
              {updateClubLoading ? <ButtonLoading size={13} /> : "Update"}
            </Button>
          </div>

          {ownerClubError && (
            <Alert variant="danger" className="mt-3">
              {ownerClubError}
            </Alert>
          )}
        </Card.Body>
      )}
    </Card>
  );
};

export default ClubUpdateForm;
