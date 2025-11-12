import { useCallback, useEffect, useMemo, useState, useRef, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { SlCloudUpload } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import MarkdownEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";
import markdownItIns from "markdown-it-ins";
import {
  getOwnerRegisteredClub,
  updateRegisteredClub,
} from "../../../redux/thunks";
import { showInfo, showWarning } from "../../../helpers/Toast";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import Pricing from "./Pricing";

// Initialize markdown-it with underline support
const mdParser = new MarkdownIt();
mdParser.use(markdownItIns);

// -------------------- constants --------------------
const MAX_IMAGES = 10;
const MAX_WORDS = 500;
const FEATURES = [
  { key: "changingRooms", label: "Changing Rooms" },
  { key: "parking", label: "Parking" },
  { key: "shower", label: "Shower" },
  { key: "chillPad", label: "Chill Pad" },
  { key: "coachingAvailable", label: "Coaching Available" },
  { key: "shed", label: "Shed" },
];

const BUSINESS_HOURS_TEMPLATE = {
  Monday: { start: "06:00 AM", end: "11:00 PM" },
  Tuesday: { start: "06:00 AM", end: "11:00 PM" },
  Wednesday: { start: "06:00 AM", end: "11:00 PM" },
  Thursday: { start: "06:00 AM", end: "11:00 PM" },
  Friday: { start: "06:00 AM", end: "11:00 PM" },
  Saturday: { start: "06:00 AM", end: "11:00 PM" },
  Sunday: { start: "06:00 AM", end: "11:00 PM" },
};

// -------------------- helpers --------------------
const getInitialFormState = (club = {}) => ({
  courtName: club?.clubName || "",
  address: club?.address || "",
  city: club?.city || "",
  state: club?.state || "",
  zip: club?.zipCode || "",
  courtCount: club?.courtCount ? String(club.courtCount) : "",
  description: club?.description || "",
  courtTypes: {
    indoor: ["indoor", "indoor/outdoor"].includes(
      club?.courtType?.trim?.().toLowerCase?.() || ""
    ),
    outdoor: ["outdoor", "indoor/outdoor"].includes(
      club?.courtType?.trim?.().toLowerCase?.() || ""
    ),
  },
  features: FEATURES.reduce(
    (acc, f) => ({
      ...acc,
      [f.key]: Array.isArray(club?.features)
        ? club.features.includes(f.key)
        : false,
    }),
    {}
  ),
  businessHours: Object.keys(BUSINESS_HOURS_TEMPLATE).reduce((acc, day) => {
    const bh = (club?.businessHours || []).find((x) => x.day === day);
    acc[day] = bh
      ? {
        start: (bh.time || "").split(" - ")[0] || "06:00 AM",
        end: (bh.time || "").split(" - ")[1] || "11:00 PM",
        _id: bh._id,
      }
      : BUSINESS_HOURS_TEMPLATE[day];
    return acc;
  }, {}),
  courtImage: club?.courtImage,
  termsAccepted: club?.termsAccepted ?? true,
});

const getInitialPreviews = (imagesOrSingle) => {
  if (typeof imagesOrSingle === "string")
    return [{ preview: imagesOrSingle, isRemote: true }];
  if (Array.isArray(imagesOrSingle))
    return imagesOrSingle
      .slice(0, MAX_IMAGES)
      .map((url) => ({ preview: url, isRemote: true }));
  return [];
};

const validateForm = (data) => {
  const errors = {
    courtName: !data.courtName.trim(),
    address: !data.address.trim(),
    city: !data.city.trim(),
    state: !data.state.trim(),
    zip: !/^\d+$/.test(String(data.zip).trim()),
    courtCount:
      !/^\d+$/.test(String(data.courtCount).trim()) ||
      Number(data.courtCount) <= 0,
    courtTypes: !(data.courtTypes.indoor || data.courtTypes.outdoor),
    features: !Object.values(data.features).some(Boolean),
  };
  return { errors, isValid: !Object.values(errors).some(Boolean) };
};

const formatAmPm = (hour, meridian) =>
  `${String(hour).padStart(2, "0")}:00 ${meridian}`;

// -------------------- small components --------------------
const TimeSelect = ({ value, onChange, idPrefix }) => {
  const { hour, meridian } = useMemo(() => {
    if (!value) return { hour: 6, meridian: "AM" };
    const [time, mod] = value.split(" ");
    const h = Number((time || "06:00").split(":")[0]) || 6;
    return { hour: h, meridian: (mod || "AM").toUpperCase() };
  }, [value]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  return (
    <div className="d-flex gap-2">
      <Form.Select
        aria-label="Select hour"
        id={`${idPrefix}-hour`}
        value={hour}
        onChange={(e) => onChange(formatAmPm(Number(e.target.value), meridian))}
        style={{
          height: "32px",
          borderRadius: "8px",
          fontSize: "11px",
          textAlign: "center",
          boxShadow: "none",
          fontWeight: "500",
          fontFamily: "Poppins",
          maxWidth: 110

        }}
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {`${String(h).padStart(2, "0")}:00`}
          </option>
        ))}
      </Form.Select>
      <Form.Select
        aria-label="Select AM/PM"
        id={`${idPrefix}-ampm`}
        value={meridian}
        onChange={(e) => onChange(formatAmPm(hour, e.target.value))}
        style={{
          height: "32px",
          borderRadius: "8px",
          fontSize: "11px",
          textAlign: "center",
          boxShadow: "none",
          fontWeight: "500",
          fontFamily: "Poppins",
          maxWidth: 110

        }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </Form.Select>
    </div>
  );
};

const ImageTile = ({ src, onRemove }) => (
  <div
    style={{ position: "relative", width: 88, height: 88 }}
    className="rounded overflow-hidden shadow-sm bg-light"
  >
    <img
      src={src}
      alt="preview"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      loading="lazy"
    />
    <Button
      type="button"
      size="sm"
      variant="danger"
      onClick={onRemove}
      style={{
        position: "absolute",
        top: 4,
        right: 4,
        lineHeight: 1,
        padding: "0.1rem 0.35rem",
      }}
      aria-label="Remove image"
    >
      ×
    </Button>
  </div>
);

const AddImageTile = ({ onFiles, hidden }) => {
  const handleFiles = (fileList) => onFiles(Array.from(fileList || []));

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hidden) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={onDrop}
      className={`d-flex align-items-center justify-content-center border border-secondary-subtle rounded bg-white text-muted cursor-pointer ${hidden ? "d-none" : ""
        }`}
      style={{ width: 88, height: 88, cursor: "pointer" }}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/gif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="d-none"
      />
      <div className="text-center">
        <SlCloudUpload size={22} className="mb-1" />
        <div style={{ fontSize: 11 }}>Add</div>
      </div>
    </label>
  );
};

// -------------------- main --------------------
const ClubUpdateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const owner = getOwnerFromSession();
  const ownerId = owner?.generatedBy || owner?._id;

  const { ownerClubLoading, ownerClubError, ownerClubData } = useSelector(
    (s) => s.manualBooking
  );
  const { updateClubLoading } = useSelector((s) => s.club);
  const clubDetails = ownerClubData?.[0];

  const [formData, setFormData] = useState(() =>
    getInitialFormState(clubDetails)
  );
  const [previews, setPreviews] = useState(() =>
    getInitialPreviews(clubDetails?.images || clubDetails?.courtImage)
  );
  const [touched, setTouched] = useState({});
  const [visibleErrors, setVisibleErrors] = useState({});
  const [referenceHours, setReferenceHours] = useState({ start: "", end: "" });
  const [hasChanged, setHasChanged] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hitUpdateApi, setHitUpdateApi] = useState(false);
  const editorRef = useRef(null);

  // Track initial form data to detect changes
  const [initialFormData, setInitialFormData] = useState(() =>
    getInitialFormState(clubDetails)
  );
  const [initialPreviews, setInitialPreviews] = useState(() =>
    getInitialPreviews(clubDetails?.images || clubDetails?.courtImage)
  );

  // fetch once
  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId })).unwrap();
  }, [dispatch, ownerId]);

  // hydrate when async data arrives
  useEffect(() => {
    if (!clubDetails) return;
    const newFormData = getInitialFormState(clubDetails);
    const newPreviews = getInitialPreviews(
      clubDetails?.images || clubDetails?.courtImage
    );
    setFormData(newFormData);
    setInitialFormData(newFormData);
    setPreviews(newPreviews);
    setInitialPreviews(newPreviews);
    setTouched({});
    setVisibleErrors({});
    setWordCount(
      clubDetails?.description
        ? clubDetails.description.trim().split(/\s+/).filter(Boolean).length
        : 0
    );
  }, [clubDetails]);

  // update visible errors on change
  useEffect(() => {
    const { errors } = validateForm(formData);
    const v = Object.fromEntries(
      Object.entries(errors).map(([k, v]) => [k, !!(touched[k] && v)])
    );
    setVisibleErrors(v);
  }, [formData, touched]);

  // revoke blob URLs on unmount
  useEffect(
    () => () => {
      previews.forEach((p) => {
        if (!p.isRemote && p.preview) {
          try {
            URL.revokeObjectURL(p.preview);
          } catch { }
        }
      });
    },
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const countWords = useCallback((text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  const handleChange = useCallback(
    (field, value) => {
      if (field === "description") {
        const wordCount = countWords(value);
        if (wordCount <= MAX_WORDS) {
          setFormData((prev) => ({ ...prev, [field]: value }));
          setWordCount(wordCount);
        } else {
          showWarning(`Description cannot exceed ${MAX_WORDS} words.`);
        }
      } else if (field === "courtCount") {
        // Allow blank temporarily (so user can edit freely)
        if (value.trim() === "") {
          setFormData((prev) => ({ ...prev, [field]: value }));
          return;
        }

        const num = Number(value);
        if (!/^\d+$/.test(value.trim())) {
          showWarning("Please enter a valid number of courts.");
          return;
        }
        if (num > 10) {
          showWarning("You can only add up to 10 courts.");
          return;
        }

        setFormData((prev) => ({ ...prev, [field]: value }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }

      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    [countWords]
  );

  const handleBlur = useCallback((field) => {
    setTouched((p) => ({ ...p, [field]: true }));
  }, []);



  const handleCheckbox = useCallback((section, key) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section]?.[key] },
    }));
    setTouched((prev) => ({ ...prev, [section]: true }));
  }, []);

  const handleAddFiles = useCallback(
    (files) => {
      if (!files?.length) return;
      if (previews.length + files.length > MAX_IMAGES) {
        showInfo(`You can upload a maximum of ${MAX_IMAGES} images.`);
        return;
      }
      const newTiles = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isRemote: false,
      }));
      setPreviews((p) => [...p, ...newTiles]);
    },
    [previews.length]
  );

  const removeImage = useCallback((index) => {
    setPreviews((p) => {
      const next = [...p];
      const img = next[index];
      if (img && !img.isRemote && img.preview) {
        try {
          URL.revokeObjectURL(img.preview);
        } catch { }
      }
      next.splice(index, 1);
      return next;
    });
  }, []);

  const handleHoursChange = useCallback((day, type, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [type]: value },
      };
      setReferenceHours({ start: updated[day].start, end: updated[day].end });
      setHasChanged(true);
      return { ...prev, businessHours: updated };
    });
  }, []);

  const applyToAll = useCallback(() => {
    if (!referenceHours.start || !referenceHours.end) return;
    setFormData((prev) => {
      const updated = Object.fromEntries(
        Object.entries(prev.businessHours).map(([d, v]) => [
          d,
          { ...v, start: referenceHours.start, end: referenceHours.end },
        ])
      );
      return { ...prev, businessHours: updated };
    });
    setHasChanged(false);
  }, [referenceHours]);

  const { isValid: formIsValid } = useMemo(
    () => validateForm(formData),
    [formData]
  );
  const isSubmitEnabled =
    formIsValid &&
    previews.length > 0 &&
    formData.termsAccepted &&
    !updateClubLoading;

  // Check if form data or images have changed
  const hasFormChanged = useMemo(() => {
    if (!initialFormData || !formData) return false;

    // Compare simple fields
    const simpleFields = [
      "courtName",
      "address",
      "city",
      "state",
      "zip",
      "courtCount",
      "description",
    ];
    for (const field of simpleFields) {
      if (formData[field] !== initialFormData[field]) return true;
    }

    // Compare courtTypes
    if (
      formData.courtTypes.indoor !== initialFormData.courtTypes.indoor ||
      formData.courtTypes.outdoor !== initialFormData.courtTypes.outdoor
    )
      return true;

    // Compare features
    for (const key of Object.keys(formData.features)) {
      if (formData.features[key] !== initialFormData.features[key]) return true;
    }

    // Compare business hours
    for (const day of Object.keys(formData.businessHours)) {
      if (
        formData.businessHours[day].start !==
        initialFormData.businessHours[day].start ||
        formData.businessHours[day].end !==
        initialFormData.businessHours[day].end
      )
        return true;
    }

    // Compare images
    if (previews.length !== initialPreviews.length) return true;
    for (let i = 0; i < previews.length; i++) {
      if (
        previews[i].preview !== initialPreviews[i].preview ||
        previews[i].isRemote !== initialPreviews[i].isRemote
      ) {
        return true;
      }
    }

    return false;
  }, [formData, initialFormData, previews, initialPreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHitUpdateApi(true);

    if (!hasFormChanged) {
      return;
    }

    const touchAll = {
      courtName: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      courtCount: true,
      courtTypes: true,
      features: true,
    };
    setTouched(touchAll);
    const { isValid } = validateForm(formData);
    if (!isValid) {
      showWarning("Please fill all required club details fields.");
      return;
    }
    if (previews.length === 0) {
      showWarning("Please upload at least one image.");
      return;
    }
    if (!formData.termsAccepted) {
      showInfo("Please accept the terms and conditions.");
      return;
    }

    const fd = new FormData();
    fd.append("_id", clubDetails?._id);
    fd.append("clubName", formData.courtName);
    fd.append(
      "courtType",
      `${formData.courtTypes.indoor ? "Indoor" : ""}${formData.courtTypes.indoor && formData.courtTypes.outdoor ? "/" : ""
      }${formData.courtTypes.outdoor ? "Outdoor" : ""}`
    );
    fd.append("courtCount", formData.courtCount);
    fd.append("city", formData.city);
    fd.append("state", formData.state);
    fd.append("zipCode", formData.zip);
    fd.append("address", formData.address);
    fd.append("description", formData.description);
    // NOTE: placeholder coordinates; replace with real coordinates if available
    fd.append("location[coordinates][0]", "50.90");
    fd.append("location[coordinates][1]", "80.09");

    Object.entries(formData.features).forEach(
      ([k, v]) => v && fd.append("features", k)
    );

    Object.values(formData.businessHours).forEach((h, i) => {
      fd.append(`businessHoursUpdates[${i}][time]`, `${h.start} - ${h.end}`);
      fd.append(`businessHoursUpdates[${i}][_id]`, h?._id);
    });

    previews.forEach((img, index) => {
      if (!img.isRemote && img.file) {
        fd.append("image", img.file);
        fd.append("imageIndex", String(index)); // keep order compatibility
      }
    });

    const remote = previews.filter((x) => x.isRemote).map((x) => x.preview);
    if (remote.length) fd.append("images", JSON.stringify(remote));

    try {
      await dispatch(updateRegisteredClub(fd)).unwrap();
      dispatch(getOwnerRegisteredClub({ ownerId }));
      setHitUpdateApi(false);
      setHasChanged(false);
      // Update initial state to reflect the new saved data
      setInitialFormData(formData);
      setInitialPreviews(previews);
    } catch (err) {
      // why: preserve UX on API errors
      console.error("Update failed", err);
      setHitUpdateApi(false);
    }
  };

  // -------------------- render helpers --------------------
  const Input = memo(({ label, field, type = "text", placeholder }) => (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold small text-secondary">
        {label}
      </Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        onBlur={() => setTouched((p) => ({ ...p, [field]: true }))}
        isInvalid={!!visibleErrors[field]}
        style={{
          height: "38px",
          borderRadius: "12px",
          fontSize: "14px",
          backgroundColor: "#fff",
          boxShadow: "none"
        }}
      />
      {visibleErrors[field] && (
        <Form.Control.Feedback type="invalid" className="d-block small">
          {field === "zip" || field === "courtCount"
            ? "Please enter a valid number"
            : "This field is required"}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  ));

  // -------------------- UI --------------------
  return (
    <Card className="p-4 shadow-sm border-0">
      {ownerClubLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Row>
                <Col md={4}>
                  <Input
                    key="courtName"
                    label="Club/Facility Name"
                    field="courtName"
                    placeholder="e.g., Smash Arena"
                  />
                </Col>
                <Col md={4}>
                  <Input key="city" label="City" field="city" />
                </Col>
                <Col md={4}>
                  <Input key="state" label="State" field="state" />
                </Col>{" "}
                <Col md={3}>
                  <Input key="zip" label="Zip Code" field="zip" type="number" />
                </Col>
                <Col md={3}>
                  <Input
                    key="courtCount"
                    label="Number of Courts "
                    field="courtCount"
                    type="number"
                    max={4000}
                  />
                </Col>
                <Col md={6}>
                  <Input
                    key="address"
                    as="textArea"
                    label="Full Address"
                    field="address"
                    placeholder="Street, Area"
                  />
                </Col>

              </Row>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="fw-semibold small text-secondary">
                    Description
                  </Form.Label>
                  <span className="small text-muted">
                    {wordCount}/{MAX_WORDS} words
                  </span>
                </div>
                <MarkdownEditor
                  ref={editorRef}
                  key="description-editor"
                  value={formData.description}
                  onChange={({ text }) => {
                    const wordCount = countWords(text);
                    if (wordCount <= MAX_WORDS) {
                      setFormData((prev) => ({ ...prev, description: text }));
                      setWordCount(wordCount);
                      setTouched((prev) => ({ ...prev, description: true }));
                    } else {
                      showWarning(`Description cannot exceed ${MAX_WORDS} words.`);
                    }
                  }}
                  style={{
                    height: "200px",
                    border: `1px solid ${visibleErrors.description ? "#dc3545" : "#ced4da"
                      }`,
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                  }}
                  renderHTML={(text) => mdParser.render(text)}
                  config={{
                    view: {
                      menu: true,   // show toolbar
                      md: true,     // show markdown input
                      html: false,  // hide preview panel
                    },
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
                      menu: true,     // keep toolbar visible
                      md: true,       // keep markdown editor visible
                      html: false,    // ❌ remove preview (eye) button
                      fullScreen: false,
                      hideMenu: false,
                    },
                  }}

                />
                {visibleErrors.description && (
                  <Form.Control.Feedback
                    type="invalid"
                    className="d-block small"
                  >
                    This field is required
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

          </Row>

          <Row>
            <Col md={12}>
              <h6 className="fw-bold mb-2">Photos</h6>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="text-muted small">
                  {previews.length}/{MAX_IMAGES} images
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {previews.map((img, i) => (
                  <ImageTile
                    key={i}
                    src={img.preview}
                    onRemove={() => removeImage(i)}
                  />
                ))}
                <AddImageTile
                  onFiles={handleAddFiles}
                  hidden={previews.length >= MAX_IMAGES}
                />
              </div>
              <div className="text-muted small mt-2">
                PNG, JPG, GIF up to 2MB each
              </div>
            </Col>
          </Row>


          <hr className="my-3" />

          <Row>
            <Col md={4} className="mb-3">
              <h6 className="mb-2" style={{ fontWeight: 600, marginBottom: "10px", fontSize: '16px', color: "#374151", fontFamily: "Poppins" }}>
                Court Type{" "}
                {visibleErrors.courtTypes && (
                  <span className="text-danger small">
                    (Select at least one)
                  </span>
                )}
              </h6>
              <div className="d-flex flex-column gap-2">
                <Form.Check
                  type="checkbox"
                  label={
                    <span className="ps-3" style={{ fontSize: "14px", color: "#374151", fontWeight: '500', fontFamily: "Poppins" }}>
                      Indoor
                    </span>
                  }
                  id="ct-indoor"
                  checked={!!formData.courtTypes.indoor}
                  onChange={() => handleCheckbox("courtTypes", "indoor")}
                  onBlur={() => setTouched((p) => ({ ...p, courtTypes: true }))}
                />
                <Form.Check
                  type="checkbox"
                  label={
                    <span className="ps-3" style={{ fontSize: "14px", color: "#374151", fontWeight: '500', fontFamily: "Poppins" }}>
                      Outdoor
                    </span>
                  }
                  id="ct-outdoor"
                  checked={!!formData.courtTypes.outdoor}
                  onChange={() => handleCheckbox("courtTypes", "outdoor")}
                  onBlur={() => setTouched((p) => ({ ...p, courtTypes: true }))}
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
            </Col>

            <Col md={8} className="mb-3">
              <h6 className="mb-2" style={{ fontWeight: 600, marginBottom: "10px", fontSize: '16px', color: "#374151", fontFamily: "Poppins" }}>
                Features{" "}
                {visibleErrors.features && (
                  <span className="text-danger small">
                    (Select at least one)
                  </span>
                )}
              </h6>
              <Row>
                {FEATURES.map((f) => (
                  <Col md={3} key={f.key} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`feat-${f.key}`}
                      label={
                        <span className="ps-3" style={{ fontSize: "14px", color: "#374151", fontWeight: '500', fontFamily: "Poppins" }}>
                          {f.label}
                        </span>
                      }
                      checked={!!formData.features[f.key]}
                      onChange={() => handleCheckbox("features", f.key)}
                      onBlur={() =>
                        setTouched((p) => ({ ...p, features: true }))
                      }
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>




          <hr className="my-3" />

          <Row>
            <Col md={7}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className=" mb-0" style={{ fontSize: "20px", fontWeight: "600", color: "#374151", fontFamily: "Poppins" }}>Business Hours</h6>
                {hasChanged && (
                  <Button
                    type="button"
                    size="sm"
                    variant={hasChanged ? "success" : "secondary"}
                    disabled={!hasChanged}
                    onClick={applyToAll}
                  >
                    Apply last change to all days
                  </Button>
                )}
              </div>
              {Object.keys(formData.businessHours).map((day) => {
                const val = formData.businessHours[day] || {
                  start: "06:00 AM",
                  end: "11:00 PM",
                };
                return (
                  <Row key={day} className="align-items-center g-2 mb-2">
                    <Col md={3} className="text-secondary small fw-semibold">
                      <span style={{ fontSize: "12px", fontFamily: "Poppins", fontWeight: "500", color: "#374151" }}>{day}</span>
                    </Col>
                    <Col md={4}>
                      <TimeSelect
                        idPrefix={`${day}-start`}
                        value={val.start}
                        onChange={(v) => handleHoursChange(day, "start", v)}
                      />
                    </Col>
                    <Col md={1} style={{ textAlign: "center", fontSize: '12px', fontFamily: "Poppins", color: '#374151', fontWeight: "500" }}>
                      To
                    </Col>
                    <Col md={4}>
                      <TimeSelect
                        idPrefix={`${day}-end`}
                        value={val.end}
                        onChange={(v) => handleHoursChange(day, "end", v)}
                      />
                    </Col>
                  </Row>
                );
              })}
            </Col>
            <Col md={5}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className=" mb-0" style={{ fontSize: "20px", fontWeight: "600", color: "#374151", fontFamily: "Poppins" }}>Set Price</h6>

                {/* <Form.Check
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                  label="Select All"
                /> */}
              </div>
              <Pricing
                hitApi={hitUpdateApi}
                setHitUpdateApi={setHitUpdateApi}
              />
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-pill px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              className="rounded-pill px-4"
              disabled={!isSubmitEnabled}
              style={{
                backgroundColor: "#22c55e",
                border: "none",
                fontWeight: 600,
              }}
            >
              {updateClubLoading ? <ButtonLoading color="#fff" size={13} /> : "Update"}
            </Button>
          </div>

          {ownerClubError && (
            <Alert variant="danger" className="mt-3">
              {ownerClubError}
            </Alert>
          )}
        </Form>
      )}
    </Card>
  );
};

export default ClubUpdateForm;
