import React, { useEffect, useState } from "react";
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
import { FiClock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  registerClub,
  updateRegisteredClub,
} from "../../../../redux/thunks";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { showInfo } from "../../../../helpers/Toast";

const Images = ({ updateImage, formData, onNext, onBack, updateFormData }) => {
  const dispatch = useDispatch();
  const MAX_IMAGES = 10;
  const registerID = sessionStorage.getItem("registerId");
  const { clubLoading, clubError } = useSelector((state) => state.club);
  const { updateClubLoading } = useSelector((s) => s.club);

  // previewImages = [{ preview: "blob:http://...", file: File } for new]
  const [previewImages, setPreviewImages] = useState([]);

  // Sync previewImages from formData.images (only new files)
  useEffect(() => {
    const newImages = formData.images || [];
    const previews = newImages.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewImages(previews);
  }, [formData.images]);

  // Load saved previews from localStorage (only on update)
  useEffect(() => {
    if (updateImage) {
      const saved = localStorage.getItem("clubFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.previewUrls && parsed.previewUrls.length > 0) {
          // Show saved previews (as non-removable, non-file)
          const savedPreviews = parsed.previewUrls.map((url) => ({
            preview: url,
            isSaved: true, // not removable, not file
          }));
          setPreviewImages(savedPreviews);
        }
      }
    }
  }, [updateImage]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = formData.images?.length || 0;
    if (currentCount + files.length > MAX_IMAGES) {
      showInfo(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    // Save new files to formData
    const updatedFiles = [...(formData.images || []), ...files];
    updateFormData({ images: updatedFiles });

    // Update preview
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewImages((prev) => [
      ...prev.filter((img) => img.isSaved), // keep saved
      ...newPreviews,
    ]);
  };

  const removeImage = (index) => {
    const image = previewImages[index];

    if (image.isSaved) {
      showInfo("Cannot remove previously saved images.");
      return;
    }

    // Remove from formData.images
    const updatedFiles = formData.images.filter((_, i) => i !== index - previewImages.filter((img) => img.isSaved).length);
    updateFormData({ images: updatedFiles });

    // Remove from preview
    URL.revokeObjectURL(image.preview);
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const [referenceHours, setReferenceHours] = useState({ start: "", end: "" });
  const [hasChanged, setHasChanged] = useState(false);

  const convertAmPmTo24Hour = (timeStr) => {
    if (!timeStr) return "06:00";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
  };

  const convert24HourToAmPm = (timeStr) => {
    if (!timeStr) return "6:00 AM";
    let [hours, minutes] = timeStr.split(":");
    hours = parseInt(hours, 10);
    const modifier = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes || "00"} ${modifier}`;
  };

  const handleBusinessHoursChange = (day, type, value) => {
    const updatedHours = {
      ...formData.businessHours,
      [day]: { ...formData.businessHours[day], [type]: value },
    };
    updateFormData({ businessHours: updatedHours });
    setReferenceHours({ start: updatedHours[day].start, end: updatedHours[day].end });
    setHasChanged(true);
  };

  const applyToAll = () => {
    if (!referenceHours.start || !referenceHours.end) return;
    const updatedHours = {};
    Object.keys(formData.businessHours).forEach((day) => {
      updatedHours[day] = { start: referenceHours.start, end: referenceHours.end };
    });
    updateFormData({ businessHours: updatedHours });
    setHasChanged(false);
  };

  const renderBusinessHours = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return (
      <>
        {days.map((day) => {
          const dayHours = formData.businessHours[day] || { start: "06:00 AM", end: "11:00 PM" };
          const startTime24 = convertAmPmTo24Hour(dayHours.start);
          const endTime24 = convertAmPmTo24Hour(dayHours.end);
          const startHour = parseInt(startTime24.split(":")[0], 10);
          const minEndHour = startHour + 1;
          const allowedEndTimes = [];
          for (let h = minEndHour; h <= 23; h++) {
            allowedEndTimes.push(`${h.toString().padStart(2, "0")}:00`);
          }

          return (
            <Row key={day} className="align-items-center mb-1 ms-3">
              <Col md={3}><span style={{ fontSize: "14px" }}>{day}</span></Col>
              <Col md={4}>
                <div onClick={() => document.getElementById(`start-select-${day}`).click()} style={{ cursor: "pointer" }}>
                  <InputGroup>
                    <FormControl
                      id={`start-select-${day}`}
                      as="select"
                      value={startTime24}
                      onChange={(e) => {
                        const amPmTime = convert24HourToAmPm(e.target.value);
                        handleBusinessHoursChange(day, "start", amPmTime);
                      }}
                      style={{ height: "32px", borderRadius: "8px 0 0 8px", fontSize: "14px", textAlign: "center",boxShadow:"none" }}
                      className="py-0 border-end-0"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const h = i + 6;
                        const t = `${h.toString().padStart(2, "0")}:00`;
                        return <option key={t} value={t}>{convert24HourToAmPm(t)}</option>;
                      })}
                    </FormControl>
                    <InputGroup.Text className="bg-white" style={{ height: "32px", borderRadius: "0 8px 8px 0" }}>
                      <FiClock size={16} color="#6B7280" />
                    </InputGroup.Text>
                  </InputGroup>
                </div>
              </Col>
              <Col md={1} style={{ textAlign: "center" }}>To</Col>
              <Col md={4}>
                <div onClick={() => document.getElementById(`end-select-${day}`).click()} style={{ cursor: "pointer" }}>
                  <InputGroup>
                    <FormControl
                      id={`end-select-${day}`}
                      as="select"
                      value={endTime24}
                      onChange={(e) => {
                        const amPmTime = convert24HourToAmPm(e.target.value);
                        handleBusinessHoursChange(day, "end", amPmTime);
                      }}
                      style={{ height: "32px", borderRadius: "8px 0 0 8px", fontSize: "14px", textAlign: "center", boxShadow:"none" }}
                      className="py-0 border-end-0"
                    >
                      {allowedEndTimes.map((t) => (
                        <option key={t} value={t}>{convert24HourToAmPm(t)}</option>
                      ))}
                    </FormControl>
                    <InputGroup.Text className="bg-white" style={{ height: "32px", borderRadius: "0 8px 8px 0" }}>
                      <FiClock size={16} color="#6B7280" />
                    </InputGroup.Text>
                  </InputGroup>
                </div>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      showInfo("Please accept the Terms and Conditions.");
      return;
    }

    const newImages = formData.images || [];
    if (newImages.length === 0 && !updateImage) {
      showInfo("Please upload at least one image.");
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append("clubName", formData.courtName || "");
    apiFormData.append(
      "courtType",
      `${formData.courtTypes.indoor ? "Indoor" : ""}${formData.courtTypes.indoor && formData.courtTypes.outdoor ? "/" : ""
      }${formData.courtTypes.outdoor ? "Outdoor" : ""}`
    );
    apiFormData.append("courtCount", formData.courtCount || "");
    apiFormData.append("city", formData.city || "");
    apiFormData.append("state", formData.state || "");
    apiFormData.append("zipCode", formData.zip || "");
    apiFormData.append("address", formData.address || "");
    apiFormData.append("description", formData.description || "");
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

    // Save preview URLs for next update
    const previewUrls = previewImages
      .filter((img) => !img.file) // only saved ones
      .map((img) => img.preview);

    // Save to localStorage
    const savedData = JSON.parse(localStorage.getItem("clubFormData") || "{}");
    localStorage.setItem("clubFormData", JSON.stringify({
      ...savedData,
      previewUrls,
      businessHours: formData.businessHours,
      termsAccepted: formData.termsAccepted,
    }));

    // Only send new files
    newImages.forEach((file) => apiFormData.append("image", file));

    try {
      if (updateImage) {
        apiFormData.append("_id", registerID);
        await dispatch(updateRegisteredClub(apiFormData)).unwrap();
      } else {
        await dispatch(registerClub(apiFormData)).unwrap();
      }
      onNext();
    } catch (error) {
      showInfo("Failed to save club. Please try again.");
    }
  };

  return (
    <div className="border-top small">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <h5 style={{ fontWeight: 700, color: "#1F2937" }} className="my-3">
              Upload Club Images
            </h5>

            {previewImages.length > 0 && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {previewImages.map((image, index) => (
                    <div key={index} style={{ position: "relative" }}>
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
                        loading="lazy"
                      />
                      {image.file && (
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
                          x
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Alert variant="info" className="py-2">
                  <small>
                    {previewImages.filter((i) => i.file).length} new | {previewImages.filter((i) => i.isSaved).length} saved
                  </small>
                </Alert>
              </div>
            )}

            {previewImages.filter((i) => i.file).length < MAX_IMAGES && (
              <div
                onClick={() => document.getElementById("clubImagesInput").click()}
                style={{
                  border: "2px dashed #E5E7EB",
                  borderRadius: "12px",
                  padding: "50px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                }}
              >
                <SlCloudUpload size={80} color="#6B7280" />
                <p style={{ fontSize: "16px", color: "#1F2937", fontWeight: 500 }}>
                  Click or drag to add more images
                </p>
                <p style={{ fontSize: "12px", color: "#6B7280" }}>PNG, JPG, GIF up to 10MB each</p>
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
            <h5 style={{ fontWeight: 700, color: "#1F2937" }} className="my-3 ms-3">
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
              onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
              label={
                <span style={{ fontSize: "14px", color: "#1F2937", fontWeight: 500 }}>
                  I agree to the Terms and conditions and Privacy policy
                </span>
              }
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-4">
          <Button type="button" onClick={onBack} style={{ backgroundColor: "#374151", border: "none", borderRadius: "30px", padding: "10px 30px", fontWeight: 600, fontSize: "16px", color: "#fff", marginRight: "10px" }}>
            Back
          </Button>
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
            {clubLoading || updateClubLoading ? <ButtonLoading color={'white'} /> : "Next"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Images;