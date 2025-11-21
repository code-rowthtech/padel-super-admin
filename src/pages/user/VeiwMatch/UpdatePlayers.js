import { Box, Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { useDispatch, useSelector } from "react-redux";
import { Usersignup } from "../../../redux/user/auth/authThunk";
import {
  addPlayers,
  getMatchesUser,
  getMatchesView,
} from "../../../redux/user/matches/thunk";
import { showSuccess } from "../../../helpers/Toast";
import Select from "react-select";

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
  maxHeight: "90vh",
  overflowY: "auto",
};

const UpdatePlayers = ({
  showModal,
  matchId,
  teamName,
  setShowModal,
  selectedDate,
  selectedTime,
  selectedLevel,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    level: "",
  });
  const addLoading = useSelector((state) => state?.userAuth);
  const [errors, setErrors] = useState({}); // Per-field errors
  const [showErrors, setShowErrors] = useState({}); // Visibility

  const normalizeTime = (time) => {
    if (!time) return null;
    const match = time.match(/^(\d{1,2}):00\s*(AM|PM)$/i);
    if (match) {
      return `${match[1]} ${match[2].toLowerCase()}`;
    }
    return time;
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "name" && !value) error = "Name is required";
    else if (name === "phoneNumber") {
      if (!value) error = "Phone number is required";
      else if (value.length !== 10 || !/^[6-9][0-9]{9}$/.test(value))
        error = "Phone number must be 10 digits starting with 6-9";
    } else if (name === "email" && !value) error = "Email is required";
    else if (name === "level" && !value) error = "Select Level is required";
    return error;
  };

  const handleAddPlayer = () => {
    const newErrors = {};
    const fields = ["name", "email", "phoneNumber", "level"];
    fields.forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    if (Object.values(newErrors).some((err) => err)) {
      setErrors(newErrors);
      setShowErrors(Object.fromEntries(fields.map((f) => [f, true])));
      return;
    }

    setErrors({});
    setShowErrors({});

    dispatch(Usersignup(formData))
      .unwrap()
      .then((res) => {
        if (res?.status === "200") {
          dispatch(
            addPlayers({
              matchId,
              playerId: res?.response?._id,
              team: teamName,
            })
          ).then(() => {
            setShowModal(false);
            dispatch(getMatchesView(matchId));
            const payload = {
              matchDate: selectedDate?.fullDate,
              ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
              ...(selectedLevel && { skillLevel: selectedLevel }),
            };
            dispatch(getMatchesUser(payload));
          });
          showSuccess("Player added successfully");
        }
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          gender: "",
          level: "",
        });
      })
      .catch(() => {
        setErrors({ email: "Enter valid email address" });
        setShowErrors({ email: true });
      });
  };

  // Auto-hide errors after 2 sec
  useEffect(() => {
    const timers = Object.keys(showErrors)
      .map((field) => {
        if (showErrors[field]) {
          return setTimeout(() => {
            setShowErrors((prev) => ({ ...prev, [field]: false }));
          }, 2000);
        }
        return null;
      })
      .filter(Boolean);

    return () => timers.forEach(clearTimeout);
  }, [showErrors]);

  const lavel = [
    { code: "A", title: "Top Player" },
    { code: "B1", title: "Experienced Player" },
    { code: "B2", title: "Advanced Player" },
    { code: "C1", title: "Confident Player" },
    { code: "C2", title: "Intermediate Player" },
    { code: "D1", title: "Amateur Player" },
    { code: "D2", title: "Novice Player" },
    { code: "E", title: "Entry Level" },
  ];

  const levelOptions = lavel.map((item) => ({
    value: item.code,
    label: (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span
          style={{
            color: "#1d4ed8",
            fontWeight: "600",
            fontSize: "15px",
            fontFamily: "Poppins",
          }}
        >
          {item.code}
        </span>
        <span style={{ color: "#374151", fontSize: "13px" }}>{item.title}</span>
      </div>
    ),
  }));

  const inputStyle = (field) => ({
    boxShadow: "none",
    border:
      showErrors[field] && errors[field]
        ? "1px solid #dc3545"
        : "1px solid #ced4da",
    transition: "border 0.2s ease",
  });

  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      aria-labelledby="parent-modal-title"
    >
      <Box sx={modalStyle}>
        <h6
          className="mb-3 text-center"
          style={{ fontSize: "16px", fontWeight: "600", fontFamily: "Poppins" }}
        >
          Player Information
        </h6>

        <form>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                  const formatted = value
                    .trimStart()
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .replace(/(^|\s)\w/g, (l) => l.toUpperCase());
                  setFormData((prev) => ({ ...prev, name: formatted }));
                }
              }}
              className="form-control p-2"
              placeholder="Enter your name"
              style={inputStyle("name")}
            />
            {showErrors.name && errors.name && (
              <small
                className="text-danger"
                style={{ fontSize: "12px", fontFamily: "Poppins" }}
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
                const value = e.target.value;
                if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                  const formatted = value
                    .replace(/\s+/g, "")
                    .replace(
                      /^(.)(.*)(@.*)?$/,
                      (m, f, r, d = "") => f.toUpperCase() + r.toLowerCase() + d
                    );
                  setFormData((prev) => ({ ...prev, email: formatted }));
                }
              }}
              className="form-control p-2"
              placeholder="Enter your email"
              style={inputStyle("email")}
            />
            {showErrors.email && errors.email && (
              <small
                className="text-danger"
                style={{ fontSize: "12px", fontFamily: "Poppins" }}
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
            <div className="input-group" style={inputStyle("phoneNumber")}>
              <span className="input-group-text border-0 p-2">
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                <span>+91</span>
              </span>
              <input
                type="text"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value === "" || /^[6-9][0-9]{0,9}$/.test(value)) {
                    setFormData((prev) => ({ ...prev, phoneNumber: value }));
                  }
                }}
                className="form-control border-0 p-2"
                placeholder="Enter phone number"
              />
            </div>
            {showErrors.phoneNumber && errors.phoneNumber && (
              <small
                className="text-danger"
                style={{ fontSize: "12px", fontFamily: "Poppins" }}
              >
                {errors.phoneNumber}
              </small>
            )}
          </div>

          {/* Gender */}
          <div className="mb-3">
            <label className="form-label">Gender</label>
            <div className="d-flex flex-wrap gap-3">
              {["Male", "Female", "Other"].map((gender) => (
                <div key={gender} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id={gender}
                    value={gender}
                    checked={formData.gender === gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  />
                  <label className="form-check-label" htmlFor={gender}>
                    {gender}
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
              <Select
                options={levelOptions}
                value={levelOptions.find((opt) => opt.value === formData.level)}
                onChange={(opt) =>
                  setFormData((prev) => ({ ...prev, level: opt.value }))
                }
                className="basic-single"
                classNamePrefix="select"
              />
            </div>
            {showErrors.level && errors.level && (
              <small
                className="text-danger"
                style={{ fontSize: "12px", fontFamily: "Poppins" }}
              >
                {errors.level}
              </small>
            )}
          </div>

          {/* Buttons */}
          <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setShowModal(false)}
              sx={{ width: { xs: "100%", sm: "45%" } }}
            >
              Cancel
            </Button>
            <Button
              sx={{ width: { xs: "100%", sm: "45%" } }}
              style={{ backgroundColor: "#3DBE64", color: "white" }}
              onClick={handleAddPlayer}
            >
              {addLoading?.userSignUpLoading ? (
                <ButtonLoading color="white" />
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdatePlayers;
