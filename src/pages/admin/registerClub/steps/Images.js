import React, { useState, useCallback } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";
import { SlCloudUpload } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import { registerClub } from "../../../../redux/thunks";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";

const Images = ({ formData, onNext, onBack, updateFormData }) => {
  const dispatch = useDispatch();
  const { clubLoading, clubError } = useSelector((state) => state.club);
  const [previewImages, setPreviewImages] = useState([]);
  const MAX_IMAGES = 10;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed the limit
    if (previewImages.length + files.length > MAX_IMAGES) {
      alert(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const newPreviewImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    const newPreviewImages = [...previewImages];
    URL.revokeObjectURL(newPreviewImages[index].preview);
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };

  //   const handleBusinessHoursChange = (day, field, value) => {
  //     updateFormData({
  //       businessHours: {
  //         ...formData.businessHours,
  //         [day]: {
  //           ...formData.businessHours[day],
  //           [field]: value,
  //         },
  //       },
  //     });
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert("Please accept the Terms and Conditions.");
      return;
    }

    // Prepare FormData for API call
    const apiFormData = new FormData();

    // Add venue details
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
    // apiFormData.append('description', 'test');
    apiFormData.append("location[coordinates][0]", "50.90");
    apiFormData.append("location[coordinates][1]", "80.09");

    // Add features
    Object.entries(formData.features).forEach(([key, value]) => {
      if (value) apiFormData.append("features", key);
    });

    // Add business hours
    apiFormData.append(
      "businessHours",
      JSON.stringify(
        Object.entries(formData.businessHours).map(([day, times]) => ({
          time: `${times.start} - ${times.end}`,
          day,
        }))
      )
    );

    // Add images
    previewImages.forEach((image, index) => {
      apiFormData.append(`image`, image.file);
    });
    console.log(apiFormData, "apiFormData");
    try {
      await dispatch(registerClub(apiFormData)).unwrap();
      onNext();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const [referenceHours, setReferenceHours] = useState({ start: "", end: "" });
  const [hasChanged, setHasChanged] = useState(false);

  const handleBusinessHoursChange = (day, type, value) => {
    const updatedHours = {
      ...formData.businessHours,
      [day]: {
        ...formData.businessHours[day],
        [type]: value,
      },
    };

    updateFormData({ businessHours: updatedHours });

    // store latest change for "Apply to All"
    setReferenceHours({
      start: updatedHours[day].start,
      end: updatedHours[day].end,
    });

    setHasChanged(true); // enable button
  };

  const applyToAll = () => {
    if (!referenceHours.start || !referenceHours.end) return;

    const updatedHours = {};
    Object.keys(formData.businessHours).forEach((day) => {
      updatedHours[day] = {
        start: referenceHours.start,
        end: referenceHours.end,
      };
    });

    updateFormData({ businessHours: updatedHours });
    setHasChanged(false); // disable again after applying
  };
  // Helper function to convert AM/PM to 24-hour format for the input
  const convertAmPmTo24Hour = (timeStr) => {
    if (!timeStr) return "";

    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      // Ensure hours is a string
      hours = hours.toString();

      if (hours === "12") hours = "00";
      if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();

      return `${hours.padStart(2, "0")}:${minutes}`;
    } catch (error) {
      console.error("Error converting AM/PM to 24-hour:", error);
      return "";
    }
  };

  // Helper function to convert 24-hour to AM/PM format for storage
  const convert24HourToAmPm = (timeStr) => {
    if (!timeStr) return "";

    try {
      let [hours, minutes] = timeStr.split(":");
      hours = parseInt(hours, 10);
      const modifier = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      return `${hours.toString().padStart(2, "0")}:${minutes} ${modifier}`;
    } catch (error) {
      console.error("Error converting 24-hour to AM/PM:", error);
      return "";
    }
  };
  const renderBusinessHours = () => {
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
                  <FormControl
                    type="time"
                    step="3600" // hour-only selection
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
  };

  return (
    <div className="border-top small">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <h5 style={{ fontWeight: 700, color: "#1F2937" }} className="my-3">
              Upload Club Images
            </h5>

            {/* Image preview gallery */}
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
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <Alert variant="info" className="py-2">
                  <small>
                    {previewImages.length}/{MAX_IMAGES} images selected
                    {previewImages.length === 0 &&
                      " - Please select at least 1 image"}
                  </small>
                </Alert>
              </div>
            )}

            {/* Upload dropzone */}
            {previewImages.length !== MAX_IMAGES && (
              <div
                onClick={() =>
                  document.getElementById("clubImagesInput").click()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "#4a7652";
                  e.currentTarget.style.backgroundColor = "#f8fdf8";
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor =
                    previewImages.length === 0 ? "#0dcaf0ad" : "#E5E7EB";
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor =
                    previewImages.length === 0 ? "#0dcaf0ad" : "#E5E7EB";
                  e.currentTarget.style.backgroundColor = "#fff";
                  const files = Array.from(e.dataTransfer.files);
                  handleFileChange({ target: { files } });
                }}
                style={{
                  border: `2px dashed ${
                    previewImages.length === 0 ? "#0dcaf0ad" : "#E5E7EB"
                  }`,
                  borderRadius: "12px",
                  padding: previewImages.length > 0 ? "14px" : "50px",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  backgroundColor: "#fff",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <SlCloudUpload
                  size={previewImages.length > 0 ? 40 : 80}
                  color={previewImages.length === 0 ? "#0dcaf0ad" : "#6B7280"}
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                />

                <p
                  style={{
                    marginTop: previewImages.length === 0 ? "0px" : "10px",
                    fontSize: "16px",
                    color: previewImages.length === 0 ? "#0dcaf0ad" : "#1F2937",
                    fontWeight: 500,
                  }}
                >
                  {previewImages.length === 0
                    ? "Click or drag images here (required)"
                    : "Click or drag to add more images"}
                </p>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginBottom: "6px",
                  }}
                >
                  PNG, JPG, GIF up to 10kb each
                </p>

                {previewImages.length > 0 && (
                  <p style={{ fontSize: "12px", color: "#4a7652" }}>
                    {MAX_IMAGES - previewImages.length} image(s) remaining
                  </p>
                )}

                <input
                  type="file"
                  id="clubImagesInput"
                  multiple
                  accept="image/png,image/jpeg,image/gif"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            )}
          </Col>

          <Col md={6}>
            <h5
              style={{ fontWeight: 700, color: "#1F2937" }}
              className="my-3 ms-3"
            >
              Business Hours
            </h5>
            {renderBusinessHours()}
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Form.Check
              type="checkbox"
              id="termsCheckbox"
              checked={formData.termsAccepted}
              onChange={(e) =>
                updateFormData({ termsAccepted: e.target.checked })
              }
              label={
                <span
                  style={{
                    fontSize: "14px",
                    color: "#1F2937",
                    fontWeight: 500,
                  }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    style={{ color: "#22C55E", textDecoration: "underline" }}
                  >
                    Terms and conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    style={{ color: "#22C55E", textDecoration: "underline" }}
                  >
                    Privacy policy
                  </a>
                </span>
              }
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-between mt-4">
          <span
            onClick={onBack}
            style={{ color: "#1F2937", fontWeight: 600, cursor: "pointer" }}
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-left-short fs-4 fw-bold"></i>Back
          </span>
          <Button
            type="submit"
            style={{
              backgroundColor: "#22C55E",
              border: "none",
              borderRadius: "30px",
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "16px",
              color: "#fff",
            }}
            disabled={previewImages.length === 0}
          >
            {clubLoading ? <ButtonLoading /> : "Next"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Images;
