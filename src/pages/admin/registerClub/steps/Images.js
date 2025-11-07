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
  createLogo,
  registerClub,
  updateLogo,
  updateRegisteredClub,
} from "../../../../redux/thunks";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { showInfo } from "../../../../helpers/Toast";
import { useNavigate } from "react-router-dom";

const Images = ({ updateImage, formData, onNext, onBack, updateFormData }) => {
  const dispatch = useDispatch();
  const MAX_IMAGES = 10;
  const registerID = sessionStorage.getItem("registerId");
  const { clubLoading } = useSelector((state) => state.club);
  const { updateClubLoading } = useSelector((s) => s.club);
  const { getLogoLoading } = useSelector((s) => s.logo);
  const ownerId = localStorage.getItem("owner_signup_id");

  /* -------------------  IMAGES  ------------------- */
  const [previewImages, setPreviewImages] = useState([]);
  const navigate = useNavigate()
  useEffect(() => {
    const newImages = formData.images || [];
    const previews = newImages.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewImages(previews);
  }, [formData.images]);

  useEffect(() => {
    if (updateImage) {
      const saved = localStorage.getItem("clubFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.previewUrls?.length) {
          const savedPreviews = parsed.previewUrls.map((url) => ({
            preview: url,
            isSaved: true,
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

    const updatedFiles = [...(formData.images || []), ...files];
    updateFormData({ images: updatedFiles });

    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewImages((prev) => [
      ...prev.filter((img) => img.isSaved),
      ...newPreviews,
    ]);
  };

  const removeImage = (index) => {
    const image = previewImages[index];
    if (image.isSaved) {
      showInfo("Cannot remove previously saved images.");
      return;
    }
    const updatedFiles = formData.images.filter(
      (_, i) => i !== index - previewImages.filter((img) => img.isSaved).length
    );
    updateFormData({ images: updatedFiles });
    URL.revokeObjectURL(image.preview);
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  /* -------------------  LOGO  ------------------- */
  const [logoPreview, setLogoPreview] = useState(null); // { file, preview }

  // Load saved logo when editing
  useEffect(() => {
    if (updateImage) {
      const saved = localStorage.getItem("clubFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logoUrl) {
          setLogoPreview({ preview: parsed.logoUrl, isSaved: true });
        }
      }
    }
  }, [updateImage]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke old preview
    if (logoPreview?.preview && !logoPreview.isSaved) {
      URL.revokeObjectURL(logoPreview.preview);
    }

    const preview = URL.createObjectURL(file);
    setLogoPreview({ file, preview });
    updateFormData({ logo: file });
  };

  const removeLogo = () => {
    if (logoPreview?.isSaved) {
      showInfo("Cannot remove previously saved logo.");
      return;
    }
    if (logoPreview?.preview) URL.revokeObjectURL(logoPreview.preview);
    setLogoPreview(null);
    updateFormData({ logo: null });
  };

  /* -------------------  BUSINESS HOURS  ------------------- */
  const [referenceHours, setReferenceHours] = useState({ start: "", end: "" });
  const [hasChanged, setHasChanged] = useState(false);

  const convertAmPmTo24Hour = (timeStr) => {
    if (!timeStr) return "05:00";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;
    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
  };

  const convert24HourToAmPm = (timeStr) => {
    if (!timeStr) return "5:00 AM";
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

  const openSelect = (selectId) => {
    const el = document.getElementById(selectId);
    if (el) {
      el.focus();
      const click = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      el.dispatchEvent(click);
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
          const dayHours =
            formData.businessHours[day] || { start: "05:00 AM", end: "11:00 PM" };
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
              <Col md={3}>
                <span style={{ fontSize: "14px" }}>{day}</span>
              </Col>

              {/* START */}
              <Col md={4}>
                <InputGroup>
                  <FormControl
                    id={`start-select-${day}`}
                    as="select"
                    value={startTime24}
                    onChange={(e) => {
                      const amPmTime = convert24HourToAmPm(e.target.value);
                      handleBusinessHoursChange(day, "start", amPmTime);
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow: "none",
                    }}
                    className="py-0 "
                  >
                    {Array.from({ length: 13 }, (_, i) => {
                      const h = i + 5;
                      const t = `${h.toString().padStart(2, "0")}:00`;
                      return (
                        <option key={t} value={t}>
                          {convert24HourToAmPm(t)}
                        </option>
                      );
                    })}
                  </FormControl>

                  {/* <InputGroup.Text
                    className="bg-white"
                    style={{ height: "32px", borderRadius: "0 8px 8px 0" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openSelect(`start-select-${day}`);
                    }}
                  >
                    <FiClock style={{ cursor: "pointer" }} size={16} color="#6B7280" />
                  </InputGroup.Text> */}
                </InputGroup>
              </Col>

              <Col md={1} style={{ textAlign: "center" }}>
                To
              </Col>

              {/* END */}
              <Col md={4}>
                <InputGroup>
                  <FormControl
                    id={`end-select-${day}`}
                    as="select"
                    value={endTime24}
                    onChange={(e) => {
                      const amPmTime = convert24HourToAmPm(e.target.value);
                      handleBusinessHoursChange(day, "end", amPmTime);
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow: "none",
                    }}
                    className="py-0 "
                  >
                    {allowedEndTimes.map((t) => (
                      <option key={t} value={t}>
                        {convert24HourToAmPm(t)}
                      </option>
                    ))}
                  </FormControl>

                  {/* <InputGroup.Text
                    className="bg-white"
                    style={{ height: "32px", borderRadius: "0 8px 8px 0" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openSelect(`end-select-${day}`);
                    }}
                  >
                    <FiClock style={{ cursor: "pointer" }} size={16} color="#6B7280" />
                  </InputGroup.Text> */}
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

  /* -------------------  SUBMIT  ------------------- */
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

    // ---------- 1. LOGO API (if logo exists) ----------
    if (formData.logo) {
      const logoForm = new FormData();
      logoForm.append("ownerId", ownerId);
      logoForm.append("image", formData.logo);

      try {
        if (updateImage) {
          dispatch(updateLogo(logoForm))

        } else {
          await dispatch(createLogo(logoForm)).unwrap();

        }
      } catch (err) {
        showInfo("Failed to upload logo. Continuing with club registration...");
      }
    }

    // ---------- 2. CLUB REGISTER / UPDATE ----------
    const savedPreviews = previewImages
      .filter((img) => img.isSaved)
      .map((img) => img.preview);

    const savedData = {
      ...JSON.parse(localStorage.getItem("clubFormData") || "{}"),
      previewUrls: savedPreviews,
      logoUrl: logoPreview?.isSaved ? logoPreview.preview : null,
      businessHours: formData.businessHours,
      termsAccepted: formData.termsAccepted,
    };
    localStorage.setItem("clubFormData", JSON.stringify(savedData));

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

    newImages.forEach((file) => apiFormData.append("image", file));

    try {
      let result;
      if (updateImage) {
        apiFormData.append("_id", registerID);
        result = await dispatch(updateRegisteredClub(apiFormData)).unwrap();
      } else {
        result = await dispatch(registerClub(apiFormData)).unwrap();
      }
      console.log({ result });
      console.log({ result });
      // Check status 200
      if (result?.status === 200 || result?.success === true) {
        console.log("Success:", result);
        onNext(); // Only call if status is 200
      } else {
        console.log("Non-200 response:", result);
        // showInfo(result?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("API Error:", error);
      showInfo(error?.message || "Failed to save club. Please try again.");
    }
  };

  /* -------------------  RENDER  ------------------- */
  return (
    <div className="border-top small">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <h5 style={{ fontWeight: 600, color: "#1F2937", fontFamily: "Poppins" }} className="my-3">
              Upload Club Images
            </h5>
            <div className="mb-0">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {previewImages.length > 0 && (
                  previewImages.map((image, index) => (
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
                          type="button"
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
                  ))
                )}
                {previewImages.filter((i) => i.file).length < MAX_IMAGES && (
                  <div className="border"
                    onClick={() => document.getElementById("clubImagesInput").click()}
                    style={{
                      borderRadius: "12px",
                      width: '80px',
                      height: '80px',
                      padding: "10px 0px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div className={` gap-3`}>
                      <SlCloudUpload size={25} color="#6B7280" />
                      <p className="mb-0 m-0" style={{ fontSize: "16px", color: "#1F2937", fontWeight: 500 }}>
                        Upload
                      </p>
                    </div>
                    {/* <p className="text-muted m-0" style={{ fontSize: "12px", fontWeight: 400 }}>
                      {previewImages.length > 0 ? '' : 'PNG, JPG, GIF up to 5MB each'}
                    </p> */}
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
              </div>
              {previewImages.length > 0 && (
                <Alert variant="info" className="py-2">
                  <small>
                    {previewImages.filter((i) => i.file).length} new {" "}
                    {previewImages.filter((i) => i.isSaved).length} saved
                  </small>
                </Alert>
              )}
            </div>

            <div>
              <h5 style={{ fontWeight: 600, color: "#1F2937", fontFamily: "Poppins" }} className="">
                Upload Club Logo
              </h5>

              {logoPreview ? (
                <div className="mb-3">
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={logoPreview.preview}
                      alt="Club Logo"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                      }}
                    />
                    {!logoPreview.isSaved && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {!logoPreview && (
                <div className="border"
                  onClick={() => document.getElementById("logoInput").click()}
                  style={{
                    borderRadius: "12px",
                    width: '80px',
                    height: '80px',
                    padding: "10px 0px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                  }}
                >
                  <div className=" gap-3 py-1">
                    <SlCloudUpload size={25} color="#6B7280" />
                    <p className="mb-0 m-0" style={{ fontSize: "15px", color: "#1F2937", fontFamily: "Poppins", fontWeight: 500 }}>
                      Upload
                    </p>
                  </div>

                  <input
                    type="file"
                    id="logoInput"
                    accept="image/png,image/jpeg"
                    style={{ display: "none" }}
                    onChange={handleLogoChange}
                  />
                </div>
              )}
            </div>
          </Col>

          <Col md={6}>
            <h5 style={{ fontWeight: 600, color: "#1F2937", fontFamily: "Poppins" }} className="my-3 ms-3">
              Business Hours
            </h5>
            {renderBusinessHours()}
          </Col>

        </Row>


        {/* TERMS */}
        <Row className="mt-4">
          <Col>
            <Form.Check
              type="checkbox"
              id="termsCheckbox"
              checked={formData.termsAccepted}
              onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
              label={
                <span style={{ fontSize: "14px", color: "#1F2937", fontWeight: 500 }}>
                  I agree to the{" "}
                  <b
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/admin/sameprivacy");
                    }}
                  >
                    Terms & conditions
                  </b>{" "}
                  and{" "}
                  <b
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/admin/sameprivacy");
                    }}
                  >
                    Privacy policy
                  </b>
                </span>
              }
            />
          </Col>
        </Row>

        {/* BUTTONS */}
        <div className="d-flex justify-content-end mt-4">
          <Button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: "#374151",
              border: "none",
              borderRadius: "30px",
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "16px",
              color: "#fff",
              marginRight: "10px",
            }}
          >
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
            {clubLoading || updateClubLoading || getLogoLoading ? (
              <ButtonLoading color="white" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Images;