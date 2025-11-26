import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess } from "../../../helpers/Toast";
import { Box, Button, Modal } from "@mui/material";
import { getUserProfile, Usersignup } from "../../../redux/user/auth/authThunk";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import Select from "react-select";
import { getPlayerLevel } from "../../../redux/user/notifiction/thunk";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "80%", md: 500 },
  maxWidth: "500px",
  bgcolor: "background.paper",
  p: { xs: 2, md: 4 },
  borderRadius: 2,
  border: "none",
  zIndex: 1300,
  maxHeight: "90vh",
  overflowY: "auto",
};

const NewPlayers = ({
  showAddMeForm,
  activeSlot,
  setShowAddMeForm,
  setActiveSlot, skillDetails,
  userSkillLevel
}) => {
  const [profileLoading, setProfileLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    level: "",
  });
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState({});
  const dispatch = useDispatch();
  const userLoading = useSelector(
    (state) => state?.userAuth?.userSignUpLoading
  );
  const { finalSkillDetails = [] } = useSelector(
    (state) => state.location?.state || {}
  );
  const getPlayerLevels = useSelector((state) => state?.userNotificationData?.getPlayerLevel?.data) || [];


  const lavel = getPlayerLevels.map(level => ({
    code: level.code,
    title: level.question
  }));

  const fallbackUserSkillLevel = finalSkillDetails[finalSkillDetails.length - 1];

  const getAddedPlayers = () =>
    JSON.parse(localStorage.getItem("addedPlayers") || "{}");

  const levelOptions = lavel.map((item) => {
    const added = getAddedPlayers();
    const existing = Object.values(added).map((p) => p?.level);
    const disabled =
      item.code === userSkillLevel || existing.includes(item.code);

    return {
      value: item.code,
      label: (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              color: "#1d4ed8",
              fontWeight: 600,
              fontSize: "15px",
              fontFamily: "Poppins",
            }}
          >
            {item.code}
          </span>
          <span style={{ color: "#374151", fontSize: "13px" }}>
            {item.title}
          </span>
        </div>
      ),
      isDisabled: disabled,
    };
  });

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Must be 10 digits, start with 6-9";
    }

    if (!formData.level) newErrors.level = "Please select a level";

    const added = getAddedPlayers();
    if (Object.values(added).some((p) => p?.level === formData.level)) {
      newErrors.level = "This level is already taken";
    }

    setErrors(newErrors);
    setShowErrors(
      Object.fromEntries(Object.keys(newErrors).map((k) => [k, true]))
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});
    setShowErrors({});

    dispatch(Usersignup(formData))
      .unwrap()
      .then((res) => {
        if (res?.status !== "200") throw new Error("Signup failed");

        const playerData = {
          ...res.response,
          level: formData.level,
          _id: res.response._id || res.response.id, // Ensure ID is included
        };

        // ---- UPDATE localStorage ----
        const current = getAddedPlayers();
        const updated = { ...current, [activeSlot]: playerData };
        localStorage.setItem("addedPlayers", JSON.stringify(updated));

        // Trigger custom event for real-time update
        window.dispatchEvent(new Event("playersUpdated"));

        console.log("Player added with ID:", playerData._id); // Debug log

        // ---- UI cleanup ----
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          gender: "",
          level: "",
        });
        setShowAddMeForm(false);
        setActiveSlot(null);
        showSuccess("Player Added Successfully");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to add player";
        setErrors({ submit: msg });
        setShowErrors({ submit: true });
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      setProfileLoading(true);

      try {
        const result = await dispatch(getUserProfile()).unwrap();

        const firstAnswer = result?.response?.surveyData?.[0]?.playerLevel?.skillLevel;
        if (firstAnswer) {
          const response = await dispatch(getPlayerLevel(firstAnswer)).unwrap();

          const apiData = response?.data || [];

          if (!Array.isArray(apiData) || apiData.length === 0) {
            throw new Error("Empty API response");
          }
        }
      } catch (err) {
        console.error("Error:", err);
      }

      setProfileLoading(false);
    };

    fetchData();

  }, [dispatch]);


  const handleInputChange = (field, value, formatFn = null) => {
    const formatted = formatFn ? formatFn(value) : value;
    setFormData((prev) => ({ ...prev, [field]: formatted }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setShowErrors((prev) => ({ ...prev, [field]: false }));
  };

  // Reset form when modal opens
  useEffect(() => {
    if (showAddMeForm) {
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        level: "",
      });
      setErrors({});
      setShowErrors({});
    }
  }, [showAddMeForm]);

  // Auto-hide errors
  useEffect(() => {
    const timers = Object.keys(showErrors)
      .filter((f) => showErrors[f])
      .map((f) =>
        setTimeout(() => setShowErrors((p) => ({ ...p, [f]: false })), 2000)
      );
    return () => timers.forEach(clearTimeout);
  }, [showErrors]);

  const inputStyle = (field) => ({
    border:
      showErrors[field] && errors[field]
        ? "1px solid #dc3545"
        : "1px solid #ced4da",
    transition: "border 0.2s ease",
    boxShadow: "none",
  });

  return (
    <Modal
      open={showAddMeForm}
      onClose={() => {
        setShowAddMeForm(false);
        setActiveSlot(null);
        setErrors({});
        setShowErrors({});
      }}
    >
      <Box sx={modalStyle} style={{ overflowY: "visible" }}>
        <h6
          className="mb-4 text-center"
          style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}
        >
          Player Information
        </h6>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                let v = e.target.value;
                if (/^[A-Za-z\s]*$/.test(v)) {
                  if (v.length > 30) v = v.slice(0, 30);
                  const formatted = v
                    .trimStart()
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .replace(/(^|\s)\w/g, (l) => l.toUpperCase());
                  handleInputChange("name", formatted);
                }
              }}
              className="form-control p-2"
              placeholder="Enter your name"
              style={inputStyle("name")}
            />
            {showErrors.name && errors.name && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors.name}
              </small>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^[A-Za-z0-9@.]*$/.test(v)) {
                  const formatted = v
                    .replace(/\s+/g, "")
                    .replace(
                      /^(.)(.*)(@.*)?$/,
                      (m, f, r, d = "") => f.toUpperCase() + r.toLowerCase() + d
                    );
                  handleInputChange("email", formatted);
                }
              }}
              className="form-control p-2"
              placeholder="Enter your email"
              style={inputStyle("email")}
            />
            {showErrors.email && errors.email && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors.email}
              </small>
            )}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">
              Phone No <span className="text-danger">*</span>
            </label>
            <div className="input-group border rounded">
              <span className="input-group-text border-0 p-2 bg-white">
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />{" "}
                +91
              </span>
              <input
                type="text"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  if (v === "" || /^[6-9][0-9]{0,9}$/.test(v)) {
                    handleInputChange("phoneNumber", v);
                  }
                }}
                style={inputStyle("phoneNumber")}
                className="form-control border-0 p-2"
                placeholder="Enter phone number"
              />
            </div>
            {showErrors.phoneNumber && errors.phoneNumber && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors.phoneNumber}
              </small>
            )}
          </div>

          {/* Gender */}
          <div className="mb-3">
            <label className="form-label">
              Gender <span className="text-danger">*</span>
            </label>
            <div className="d-flex flex-wrap gap-3">
              {["Male", "Female", "Other"].map((g) => (
                <div key={g} className="form-check d-flex align-items-center gap-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id={g}
                    value={g}
                    checked={formData.gender === g}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                  />
                  <label className="form-check-label pt-1" htmlFor={g}>
                    {g}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="mb-3">
            <label className="form-label">
              Select Level <span className="text-danger">*</span>
            </label>
            <div style={inputStyle("level")}>
              {profileLoading ? 'Loading...' :
                <Select
                  options={levelOptions}
                  value={levelOptions.find((o) => o.value === formData.level)}
                  onChange={(opt) => handleInputChange("level", opt.value)}
                  classNamePrefix="select"
                  isOptionDisabled={(opt) => opt.isDisabled}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                    }),
                  }}
                />
              }
            </div>
            {showErrors.level && errors.level && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors.level}
              </small>
            )}
          </div>

          {/* Submit error */}
          {showErrors.submit && errors.submit && (
            <div className="text-center mb-3">
              <small
                className="text-danger d-block"
                style={{ fontSize: "12px" }}
              >
                {errors.submit}
              </small>
            </div>
          )}

          {/* Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => {
                setShowAddMeForm(false);
                setActiveSlot(null);
                setErrors({});
                setShowErrors({});
              }}
              sx={{ width: { xs: "100%", sm: "50%", border: "1px solid #001b76", color: "#001B76" } }}

            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              sx={{ width: { xs: "100%", sm: "50%" } }}
              style={{
                background:
                  "linear-gradient(180deg, #0034E4 0%, #001B76 100%)", color: "white"
              }}
              disabled={userLoading}
            >
              {userLoading ? <ButtonLoading color="white" /> : "Submit"}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default NewPlayers;
