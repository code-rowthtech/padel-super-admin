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
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: 24,
};

const UpdatePlayers = ({
  showModal,
  matchId,
  teamName,
  setShowModal,
  selectedDate,
  selectedTime,
  selectedLevel,
  match, skillLevel
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    level: "",
  });

  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState({});
  const [playerLevels, setPlayerLevels] = useState([]);

  const loading = useSelector((state) => state?.userAuth?.userSignUpLoading);
  const getPlayerLevelsData = useSelector(
    (state) => state?.userNotificationData?.getPlayerLevel?.data || []
  );
  console.log({ matchId });
  useEffect(() => {
    if (!showModal) return;
    if (!skillLevel) return;

    dispatch(getPlayerLevel(skillLevel))
      .unwrap()
      .then((res) => {
        const levels = (res?.data || []).map((l) => ({
          code: l.code,
          title: l.question,
        }));
        setPlayerLevels(levels);
      })
      .catch(() => setPlayerLevels([]));
  }, [showModal, skillLevel]);

  const isGenderDisabled = (optionGender) => {
    const matchGender = matchId?.gender?.toLowerCase();
    return matchGender && matchGender !== optionGender.toLowerCase();
  };



  // Backup: Redux state se bhi sync rakho
  useEffect(() => {
    if (Array.isArray(getPlayerLevelsData) && getPlayerLevelsData.length > 0) {
      setPlayerLevels(
        getPlayerLevelsData.map((l) => ({
          code: l.code,
          title: l.question,
        }))
      );
    }
  }, [getPlayerLevelsData]);

  const levelOptions = React.useMemo(() => {
    return playerLevels.map((item) => ({
      value: item.code,
      label: (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "#1d4ed8", fontWeight: 600, fontSize: "15px", fontFamily: "Poppins" }}>
            {item.code}
          </span>
          <span style={{ color: "#374151", fontSize: "13px" }}>{item.title}</span>
        </div>
      ),
    }));
  }, [playerLevels]);
  console.log({ levelOptions });
  const validateField = (name, value) => {
    if (name === "name" && !value.trim()) return "Name is required";
    if (name === "email" && !value.trim()) return "Email is required";
    if (name === "phoneNumber") {
      if (!value) return "Phone number is required";
      if (!/^[6-9]\d{9}$/.test(value)) return "Invalid phone number";
    }
    if (name === "level" && !value) return "Please select a level";
    return "";
  };
  const normalizeTime = (time) => {
    if (!time) return null;
    const match = time.match(/^(\d{1,2}):00\s*(AM|PM)$/i);
    if (match) {
      return `${match[1]} ${match[2].toLowerCase()}`;
    }
    return time;
  };

  const handleAddPlayer = () => {
    const newErrors = {};
    ["name", "email", "phoneNumber", "level"].forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      setShowErrors(Object.fromEntries(Object.keys(newErrors).map((k) => [k, true])));
      return;
    }

    dispatch(Usersignup(formData))
      .unwrap()
      .then((res) => {
        if (res?.status === "200") {

          dispatch(
            addPlayers({
              matchId: matchId?._id,
              playerId: res?.response?._id,
              team: teamName,
            })
          )
            .unwrap()
            .then(() => {
              setShowModal(false);

              // WAIT for match data
              dispatch(getMatchesView(matchId?._id))
                .unwrap()
                .then((matchRes) => {
                  // EXTRACT CLUB ID PROPERLY
                  const clubId = matchRes?.data?.clubId?._id;

                  if (!clubId) {
                    console.error("Club ID not found in match response");
                    return;
                  }

                  // NOW BUILD CORRECT PAYLOAD
                  const payload = {
                    clubId, // <-- REQUIRED
                    matchDate: selectedDate?.fullDate,
                    ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
                    ...(selectedLevel && { skillLevel: selectedLevel }),
                  };

                  // NOW CALL MATCH USER API
                  dispatch(getMatchesUser(payload));
                });

              showSuccess("Player added successfully");
            });

          // Reset form
          setFormData({
            name: "",
            email: "",
            phoneNumber: "",
            gender: "",
            level: "",
          });
        }
      })
      .catch(() => {
        setErrors({ email: "Enter valid email address" });
        setShowErrors({ email: true });
      });
  };

  // Auto hide errors
  useEffect(() => {
    const timers = Object.keys(showErrors)
      .filter((key) => showErrors[key])
      .map((key) =>
        setTimeout(() => setShowErrors((prev) => ({ ...prev, [key]: false })), 3000)
      );
    return () => timers.forEach(clearTimeout);
  }, [showErrors]);

  const inputStyle = (field) => ({
    border: showErrors[field] && errors[field] ? "1px solid #dc3545" : "1px solid #ced4da",
    borderRadius: "6px",
    boxShadow: "none",
  });

  useEffect(() => {
    if (!matchId?.gender) return;
    setFormData((prev) => ({ ...prev, gender: matchId.gender }));
  }, [matchId?.gender]);


  return (
    <Modal open={showModal} onClose={() => setShowModal(false)}>
      <Box sx={modalStyle}>
        <h6 className="text-center mb-4" style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
          Add Player
        </h6>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control p-2"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => {
                let v = e.target.value;
                if (!v || /^[A-Za-z\s]*$/.test(v)) {
                  v = v.trimStart().replace(/\s+/g, " ");
                  const formatted = v.replace(/\b\w/g, (l) => l.toUpperCase());
                  setFormData((prev) => ({ ...prev, name: formatted }));
                }
              }}
              style={inputStyle("name")}
            />
            {showErrors.name && errors.name && (
              <small className="text-danger d-block mt-1">{errors.name}</small>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control p-2"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              style={inputStyle("email")}
            />
            {showErrors.email && errors.email && (
              <small className="text-danger d-block mt-1">{errors.email}</small>
            )}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">
              Phone No <span className="text-danger">*</span>
            </label>
            <div className="input-group" style={inputStyle("phoneNumber")}>
              <span className="input-group-text border-0 bg-white">
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} /> +91
              </span>
              <input
                type="text"
                maxLength={10}
                className="form-control border-0 p-2"
                placeholder="Enter phone"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  if (v.length <= 10) {
                    setFormData((prev) => ({ ...prev, phoneNumber: v }));
                  }
                }}
                style={{ boxShadow: "none" }}
              />
            </div>
            {showErrors.phoneNumber && errors.phoneNumber && (
              <small className="text-danger d-block mt-1">{errors.phoneNumber}</small>
            )}
          </div>

          {/* Gender (optional) */}
          <div className="mb-3">
            <label className="form-label">Gender</label>
            <div className="d-flex gap-4">
              {[
                { value: "Male Only", label: "Male Only" },
                { value: "Female Only", label: "Female Only" },
                { value: "Mixed Only", label: "Mixed Only" },
              ].map((g) => (
                <div key={g.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    id={g.value}
                    value={g.value}
                    disabled={isGenderDisabled(g.value)}
                    checked={formData.gender === g.value}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gender: e.target.value }))
                    }
                  />
                  <label
                    className={`form-check-label ${isGenderDisabled(g.value) ? "text-muted" : ""}`}
                    htmlFor={g.value}
                  >
                    {g.label} {isGenderDisabled(g.value)}
                  </label>
                </div>
              ))}
            </div>
          </div>



          {/* Level */}
          <div className="mb-4">
            <label className="form-label">
              Select Level <span className="text-danger">*</span>
            </label>
            <div style={inputStyle("level")}>
              {playerLevels.length === 0 ? (
                <div className="p-3 text-center text-muted">Loading levels...</div>
              ) : (
                <Select
                  options={levelOptions}
                  value={levelOptions.find((o) => o.value === formData.level)}
                  onChange={(opt) => setFormData((prev) => ({ ...prev, level: opt.value }))}
                  placeholder="Choose level"
                  classNamePrefix="select"
                  styles={{ control: (base) => ({ ...base, border: "none", boxShadow: "none" }) }}
                />
              )}
            </div>
            {showErrors.level && errors.level && (
              <small className="text-danger d-block mt-1">{errors.level}</small>
            )}
          </div>

          {/* Buttons */}
          <div className="d-flex gap-3 justify-content-end">
            <Button
              variant="outlined"
              onClick={() => setShowModal(false)}
              sx={{ borderColor: "#001B76", color: "#001B76" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPlayer}
              disabled={loading}
              sx={{
                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                color: "white",
                "&:hover": { background: "#001B76" },
              }}
            >
              {loading ? <ButtonLoading color="white" /> : "Add "}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdatePlayers;