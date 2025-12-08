import { Box, Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { useDispatch, useSelector } from "react-redux";
import { Usersignup } from "../../../redux/user/auth/authThunk";
import {
  addPlayers,
  getMatchesUser,
  getMatchesView,
} from "../../../redux/user/matches/thunk";
import { showSuccess, showError } from "../../../helpers/Toast";
import Select from "react-select";
import { getPlayerLevel, getPlayerLevelBySkillLevel } from "../../../redux/user/notifiction/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { createRequest } from "../../../redux/user/playerrequest/thunk";
import { searchUserByNumber } from "../../../redux/admin/searchUserbynumber/thunk";
import { resetSearchData } from "../../../redux/admin/searchUserbynumber/slice";

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
  selectedLevel, matchesData,
  playerLevels,
}) => {
  const dispatch = useDispatch();
  const User = getUserFromSession();
  const store = useSelector((state) => state);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    level: "",
  });
  const [userEnteredData, setUserEnteredData] = useState({
    name: "",
    email: "",
  });
  const [originalUserData, setOriginalUserData] = useState({
    name: "",
    email: "",
  });
  const [lastSearchedNumber, setLastSearchedNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState({});
  const loading = useSelector((state) => state?.userAuth?.userSignUpLoading);
  const authData = useSelector((state) => state.userAuth);
  const getPlayerLevelsLoading = useSelector(
    (state) => state?.userNotificationData?.getPlayerLevelLoading || []
  );
  const requestLoading = useSelector((state) => state?.userPlayerRequest?.requestCreateLoading || false
  );
  console.log({ requestLoading });
  const searchUserData = useSelector(
    (state) => state.searchUserByNumber.getSearchData
  );
  console.log({ searchUserData });
  const searchUserDataLoading = useSelector(
    (state) => state.searchUserByNumber.getSearchLoading
  );
  const playererror = useSelector(
    (state) => state?.userNotificationData?.getPlayerLevelLoading || []
  );
  const isGenderDisabled = (optionGender) => {
    const matchGender = matchId?.gender?.toLowerCase();
    return matchGender && matchGender !== optionGender.toLowerCase();
  };
  const levelOptions = React.useMemo(() => {
    return playerLevels?.map((item) => ({
      value: item?.code,
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
  const validateField = (name, value) => {
    if (name === "name" && !value.trim()) return "Name is required";
    if (name === "email" && value.trim() && !/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email";
    if (name === "phoneNumber") {
      const isMatchCreator = matchId?.teamA?.[0]?.userId?._id === User?._id;
      if (!isMatchCreator && !value) return "Phone number is required";
      if (value && !/^[6-9]\d{9}$/.test(value)) return "Invalid phone number";
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
    ["name", "phoneNumber", "level"].forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });
    // Only validate email if it's provided
    if (formData.email.trim()) {
      newErrors.email = validateField("email", formData.email);
    }

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
            // addPlayers({
            //   matchId: matchId?._id,
            //   playerId: res?.response?._id,
            //   team: teamName,
            // })
            createRequest({
              matchId: matchId?._id,
              preferredTeam: teamName,
              level: formData?.level,
              requesterId: res?.response?._id,
            })
          )
            .unwrap()
            .then((requestRes) => {
              setShowModal(false);

              dispatch(getMatchesView(matchId?._id))
                .unwrap()
                .then((matchRes) => {
                  const clubId = matchRes?.data?.clubId?._id;

                  if (!clubId) {
                    return;
                  }

                  const payload = {
                    matchDate: selectedDate?.fullDate,
                    ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
                    ...(selectedLevel && { skillLevel: selectedLevel }),
                    clubId: localStorage.getItem("register_club_id"),
                  };

                  dispatch(getMatchesUser(payload));
                  dispatch(resetSearchData());

                });


              setFormData({
                name: "",
                email: "",
                phoneNumber: "",
                gender: "",
                level: "",
              });
              setUserEnteredData({
                name: "",
                email: "",
              });
              setOriginalUserData({
                name: "",
                email: "",
              });
            });
        }
      })
      .catch((err) => {
        const errorMsg = err?.message || err?.error;
        showError(errorMsg);
      });
  };

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

  useEffect(() => {
    const phoneLength = formData?.phoneNumber?.length || 0;

    if (phoneLength === 10 && formData.phoneNumber !== lastSearchedNumber) {
      // Save original user data before API call
      setOriginalUserData({
        name: userEnteredData.name,
        email: userEnteredData.email
      });
      dispatch(searchUserByNumber({ phoneNumber: formData?.phoneNumber }));
      setLastSearchedNumber(formData.phoneNumber);
    } else if (phoneLength < 10 && lastSearchedNumber) {
      // Only restore when coming from a 10-digit number
      setFormData(prev => ({
        ...prev,
        name: originalUserData.name,
        email: originalUserData.email
      }));
      setUserEnteredData(originalUserData);
      setLastSearchedNumber("");
      dispatch(resetSearchData());
    }
  }, [formData?.phoneNumber, dispatch]);

  useEffect(() => {
    if (searchUserData?.result?.[0] && formData?.phoneNumber?.length === 10) {
      setFormData(prev => ({
        ...prev,
        name: searchUserData.result[0].name || userEnteredData.name,
        email: searchUserData.result[0].email || userEnteredData.email
      }));
      // Update userEnteredData with API data so user can modify it
      setUserEnteredData({
        name: searchUserData.result[0].name || userEnteredData.name,
        email: searchUserData.result[0].email || userEnteredData.email
      });
    }
  }, [searchUserData, formData?.phoneNumber]);


  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)} className="border-0"
    >
      <Box sx={modalStyle} onClick={(e) => e.stopPropagation()} className="border-0   p-md-3 px-2 py-3">
        <h6 className="text-center mb-2" style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
          Add Player
        </h6>

        <form className="border-0" onSubmit={(e) => e.preventDefault()}>
          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control p-2"
              placeholder="Enter name"
              value={searchUserDataLoading ? "Loading...." : formData?.name}
              onChange={(e) => {
                let v = e.target.value;
                if (!v || /^[A-Za-z\s]*$/.test(v)) {
                  v = v.trimStart().replace(/\s+/g, " ");
                  const formatted = v.replace(/\b\w/g, (l) => l.toUpperCase());
                  setFormData((prev) => ({ ...prev, name: formatted }));
                  setUserEnteredData((prev) => ({ ...prev, name: formatted }));
                }
              }}
              style={inputStyle("name")}
            />
            {showErrors.name && errors.name && (
              <small className="text-danger d-block mt-1">{errors.name}</small>
            )}
          </div>

          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Phone No {matchId?.teamA?.[0]?.userId?._id !== User?._id && <span className="text-danger">*</span>}
            </label>
            <div className="input-group" style={inputStyle("phoneNumber")}>
              <span className="input-group-text border-0 border-end bg-white" style={{ fontSize: "11px" }}>
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} className="me-2" /> +91
              </span>
              <input
                type="text"
                maxLength={10}
                className="form-control border-0 p-2"
                placeholder="Enter phone"
                value={formData.phoneNumber}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9]/g, "");
                  if (v.length === 1 && !['6', '7', '8', '9'].includes(v)) {
                    v = '6';
                  }
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

          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Email
            </label>
            <input
              type="email"
              className="form-control p-2"
              placeholder="Enter email"
              value={searchUserDataLoading ? "Loading...." : formData?.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setUserEnteredData((prev) => ({ ...prev, email: e.target.value }));
              }}
              style={inputStyle("email")}
            />
            {/* {showErrors.email && errors.email && (
              <small className="text-danger d-block mt-1">{errors.email}</small>
            )} */}
          </div>

          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">Game Type</label>
            <div className="d-flex gap-3">
              {[
                { value: "Male Only", label: "Male Only" },
                { value: "Female Only", label: "Female Only" },
                { value: "Mixed Double", label: "Mixed Double" },
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



          <div className="mb-md-4 mb-3">
            <label className="form-label label_font mb-1">
              Select Level <span className="text-danger">*</span>
            </label>
            <div style={inputStyle("level")}>
              {getPlayerLevelsLoading === true ? (
                <div className="text-center">
                  <ButtonLoading />
                </div>
              ) : (
                <Select
                  options={levelOptions}
                  isSearchable={false}
                  value={levelOptions?.find((o) => o.value === formData?.level)}
                  onChange={(opt) => setFormData((prev) => ({ ...prev, level: opt?.value }))}
                  placeholder="Choose level"
                  classNamePrefix="select"
                  maxMenuHeight={200}                    // ← Yeh kaam karega
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                      cursor: "pointer",
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menu: (provided) => ({
                      ...provided,
                      ...(window.innerWidth <= 768 && {
                        maxHeight: 150,
                        overflowY: 'auto',
                      }),
                      position: 'relative',
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      ...(window.innerWidth <= 768 && {
                        maxHeight: 150,
                        overflowY: 'auto',
                      }),
                      paddingTop: 0,
                      paddingBottom: 0,
                    }),
                  }}
                  // Optional: agar caret hide karna hai
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    // caret transparent karne ke liye (agar searchable=false hai toh Input ki zarurat nahi)
                  }}
                />
              )}
            </div>
            {showErrors.level && errors.level && (
              <small className="text-danger d-block mt-1">{errors.level}</small>
            )}
          </div>

          <div className="d-flex gap-3 justify-content-end">
            <Button
              variant="outlined"
              onClick={() => {
                setShowModal(false);
                setFormData({
                  name: "",
                  email: "",
                  phoneNumber: "",
                  gender: "",
                  level: "",
                });
                setUserEnteredData({
                  name: "",
                  email: "",
                });
                setOriginalUserData({
                  name: "",
                  email: "",
                });
                dispatch(resetSearchData());
              }}
              sx={{ borderColor: "#001B76", color: "#001B76", width: "25%" }}
              className="py-1 font_size_mobile_button"
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
                width: "25%",
              }}
              className="py-1 font_size_mobile_button"
            >
              {loading || requestLoading ? <ButtonLoading color="white" /> : "Add "}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default UpdatePlayers;
