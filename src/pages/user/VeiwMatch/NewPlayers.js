import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess } from "../../../helpers/Toast";
import { Box, Button, Modal } from "@mui/material";
import { getUserProfile, Usersignup } from "../../../redux/user/auth/authThunk";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import Select from "react-select";
import { getPlayerLevel } from "../../../redux/user/notifiction/thunk";
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
  zIndex: 1300,
  maxHeight: "90vh",
  overflowY: "auto",
};

const NewPlayers = ({
  showAddMeForm,
  activeSlot,
  setShowAddMeForm,
  setActiveSlot, skillDetails,
  userSkillLevel, selectedGender, defaultSkillLevel, profileLoading
}) => {
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
  const searchUserData = useSelector(
    (state) => state.searchUserByNumber.getSearchData
  );
  const searchUserDataLoading = useSelector(
    (state) => state.searchUserByNumber.getSearchLoading
  );

  const getPlayerLevels = useSelector((state) => state?.userNotificationData?.getPlayerLevel?.data) || [];


  const lavel = getPlayerLevels.map(level => ({
    code: level.code,
    title: level.question
  }));


  const getAddedPlayers = () =>
    JSON.parse(localStorage.getItem("addedPlayers") || "{}");

  const levelOptions = useMemo(() => {
    return lavel.map((item) => ({
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
    }));
  }, [lavel]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
    //   newErrors.email = "Enter a valid email";
    // }

    if (formData.phoneNumber && !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Must be 10 digits, start with 6-9";
    }

    if (!formData.level) newErrors.level = "Please select a level";

    const added = getAddedPlayers();
    const existingLevels = Object.values(added)
      .map((p) => p?.level);

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
          _id: res?.response?._id,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          level: formData.level,
        };

        const current = getAddedPlayers();
        const updated = { ...current, [activeSlot]: playerData };
        localStorage.setItem("addedPlayers", JSON.stringify(updated));

        window.dispatchEvent(new Event("playersUpdated"));


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
        dispatch(resetSearchData());

      })
      .catch((err) => {
        const msg = err?.response?.data?.message // || "Failed to add player";
        setErrors({ submit: msg });
        setShowErrors({ submit: true });
      });
  };

  const handleInputChange = (field, value, formatFn = null) => {
    const formatted = formatFn ? formatFn(value) : value;
    setFormData((prev) => ({ ...prev, [field]: formatted }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setShowErrors((prev) => ({ ...prev, [field]: false }));
  };

  useEffect(() => {
    if (showAddMeForm) {
      setErrors({});
      setShowErrors({});
    }
  }, [showAddMeForm]);

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

  const isGenderDisabled = (optionGender) => {
    const matchGender = selectedGender?.toLowerCase();
    return matchGender && matchGender !== optionGender.toLowerCase();
  };

  useEffect(() => {
    if (showAddMeForm && selectedGender) {
      setFormData((prev) => ({ ...prev, gender: selectedGender }));
    }
  }, [showAddMeForm, selectedGender]);

  useEffect(() => {
    const phoneLength = formData?.phoneNumber?.length || 0;

    if (phoneLength === 10) {
      dispatch(searchUserByNumber({ phoneNumber: formData?.phoneNumber }));
    } else if (phoneLength < 10) {
      setFormData(prev => ({ ...prev, name: "", email: "" }));
      dispatch(resetSearchData());
    }
  }, [formData?.phoneNumber, dispatch]);

  useEffect(() => {
    if (searchUserData?.result?.[0] && formData?.phoneNumber?.length === 10) {
      setFormData(prev => ({
        ...prev,
        name: searchUserData.result[0].name || "",
        email: searchUserData.result[0].email || ""
      }));
    }
  }, [searchUserData, formData?.phoneNumber]);

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
      <Box sx={modalStyle} style={{ overflowY: "visible" }} className="p-md-3 px-2 py-3">
        <h6
          className="mb-2 text-center"
          style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}
        >
          Player Information
        </h6>

        <form onSubmit={handleSubmit}>
          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={searchUserDataLoading ? "Loading...." : formData?.name}
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
            {showErrors?.name && errors?.name && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors?.name}
              </small>
            )}
          </div>

          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Phone No
            </label>
            <div className="input-group border rounded">
              <span className="input-group-text border-0 p-2 bg-white" style={{ fontSize: "11px" }}>
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} className="me-2" />{" "}
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

          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Email
            </label>
            <input
              type="email"
              value={searchUserDataLoading ? "Loading...." : formData?.email}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^[A-Za-z0-9@.]*$/.test(v)) {
                  const formatted = v.replace(/\s+/g, "");
                  handleInputChange("email", formatted);
                }
              }}
              className="form-control p-2"
              placeholder="Enter your email"
              style={inputStyle("email")}
            />
            {/* {showErrors.email && errors.email && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors.email}
              </small>
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

          <div className="mb-md-3 mb-2">
            <label className="form-label label_font mb-1">
              Select Level <span className="text-danger">*</span>
            </label>
            <div style={inputStyle("level")}>
              {profileLoading ? (
                <div className="text-center p-2">
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
                  maxMenuHeight={200}
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
                      zIndex: 9999,
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      ...(window.innerWidth <= 768 && {
                        maxHeight: 150,
                        overflowY: 'auto',
                      }),
                      paddingTop: 0,
                      paddingBottom: 0,
                      zIndex: 9999,
                    }),
                  }}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                />
              )}
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

          <div className="d-flex flex-sm-row gap-2 mt-4 aling-items-center justify-content-end">
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
              sx={{ width: { xs: "25%", sm: "25%", border: "1px solid #001b76", color: "#001B76" } }}
              className="py-1 font_size_mobile_button"

            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              sx={{ width: { xs: "25%", sm: "25%" } }}
              style={{
                background:
                  "linear-gradient(180deg, #0034E4 0%, #001B76 100%)", color: "white"
              }}
              disabled={userLoading}
              className="py-1 font_size_mobile_button"

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
