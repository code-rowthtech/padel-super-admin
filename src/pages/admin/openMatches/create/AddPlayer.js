import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button as BsButton } from "react-bootstrap";
import Select from "react-select";
import { getPlayerLevelBySkillLevel } from "../../../../redux/user/notifiction/thunk";
import { showError, showSuccess } from "../../../../helpers/Toast";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { Usersignup } from "../../../../redux/user/auth/authThunk";
import { searchUserByNumber } from "../../../../redux/admin/searchUserbynumber/thunk";
import { resetSearchData } from "../../../../redux/admin/searchUserbynumber/slice";

const AddPlayer = ({
  showAddMeForm,
  activeSlot,
  setShowAddMeForm,
  setActiveSlot,
  selectedGender,
  editPlayerData, skillDetails
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    level: "",
    type: "",
  });
  const [userEnteredData, setUserEnteredData] = useState({
    name: "",
    email: "",
    gender: "",
  });
  const [originalUserData, setOriginalUserData] = useState({
    name: "",
    email: "",
    gender: "",
  });
  const [lastSearchedNumber, setLastSearchedNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [showErrors, setshowErrors] = useState({});
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
  const getPlayerLevelsBySkillLevel = useSelector((state) => state?.userNotificationData?.getPlayerLevelBySkillLevel?.data?.[0]?.levelIds) || [];
  const getPlayerLevelsBySkillLevelLoading = useSelector((state) => state?.userNotificationData?.getPlayerLevelBySkillLevelLoading) || false;

  const lavel = (getPlayerLevelsBySkillLevel.length > 0 ? getPlayerLevelsBySkillLevel : getPlayerLevels).map(level => ({
    code: level.code,
    title: level.question
  }));


  const getAddedPlayers = () =>
    JSON.parse(localStorage.getItem("addedAdminPlayers") || "{}");
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
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Must be 10 digits, start with 6-9";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.level) newErrors.level = "Please select a level";

    setErrors(newErrors);
    setshowErrors(
      Object.fromEntries(Object.keys(newErrors).map((k) => [k, true]))
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const current = getAddedPlayers();
    const isDuplicate = Object.entries(current)
      .filter(([key]) => key !== 'gameType' && key !== activeSlot)
      .some(([, player]) =>
        player.phoneNumber === formData.phoneNumber &&
        player.name.toLowerCase() === formData.name.toLowerCase()
      );

    if (isDuplicate) {
      showError("This player is already added");
      return;
    }

    setErrors({});
    setshowErrors({});

    dispatch(Usersignup(formData))
      .unwrap()
      .then((res) => {
        if (res?.status !== "200" && res?.message == "User already exists") throw new Error("Signup failed");
        const playerData = {
          ...res.response,
          _id: res?.response?._id,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          type: formData.gender,
          level: formData.level,
        };

        const current = getAddedPlayers();
        current[activeSlot] = playerData;
        if (selectedGender && typeof selectedGender === 'string') {
          current.gameType = selectedGender;
        }
        localStorage.setItem("addedAdminPlayers", JSON.stringify(current));

        window.dispatchEvent(new Event("playersUpdated"));


        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          gender: "",
          level: "",
          type: "",
        });
        setUserEnteredData({
          name: "",
          email: "",
          gender: "",
        });
        setOriginalUserData({
          name: "",
          email: "",
          gender: "",
        });
        setShowAddMeForm(false);
        setActiveSlot(null);
        if (editPlayerData) {
          showSuccess("Player Updated Successfully");
        } else {
          showSuccess("Player Added Successfully");
        }
        dispatch(resetSearchData());

      })
      .catch((err) => {
        const msg = err?.response?.data?.message // || "Failed to add player";
        setErrors({ submit: msg });
        setshowErrors({ submit: true });
      });
  };

  const handleInputChange = (field, value, formatFn = null) => {
    const formatted = formatFn ? formatFn(value) : value;
    setFormData((prev) => ({ ...prev, [field]: formatted }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setshowErrors((prev) => ({ ...prev, [field]: false }));
  };

  useEffect(() => {
    if (showAddMeForm) {
      setErrors({});
      setshowErrors({});

      if (editPlayerData) {
        setFormData({
          name: editPlayerData.name || "",
          email: editPlayerData.email || "",
          phoneNumber: editPlayerData.phoneNumber || "",
          gender: editPlayerData.type || "",
          level: editPlayerData.level || "",
          type: selectedGender || "",
        });
        setUserEnteredData({
          name: editPlayerData.name || "",
          email: editPlayerData.email || "",
          gender: editPlayerData.type || "",
        });
      }
    }
  }, [showAddMeForm]);

  useEffect(() => {
    if (showAddMeForm && !getPlayerLevelsBySkillLevel?.length) {
      dispatch(getPlayerLevelBySkillLevel(skillDetails));
    }
  }, [showAddMeForm]);

  useEffect(() => {
    const timers = Object.keys(showErrors)
      .filter((f) => showErrors[f])
      .map((f) =>
        setTimeout(() => setshowErrors((p) => ({ ...p, [f]: false })), 2000)
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

  useEffect(() => {
    if (showAddMeForm && !editPlayerData) {
      let autoGender = "";
      if (selectedGender === 'Male') {
        autoGender = 'Male';
      } else if (selectedGender === 'Female') {
        autoGender = 'Female';
      }

      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        gender: autoGender,
        level: "",
        type: selectedGender || "",
      });
      setUserEnteredData({
        name: "",
        email: "",
        gender: autoGender,
      });
      setOriginalUserData({
        name: "",
        email: "",
        gender: autoGender,
      });
      setLastSearchedNumber("");
    }
  }, [showAddMeForm, selectedGender, editPlayerData]);

  useEffect(() => {
    if (!showAddMeForm) {
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        level: "",
        type: "",
      });
      setUserEnteredData({
        name: "",
        email: "",
        gender: "",
      });
      setOriginalUserData({
        name: "",
        email: "",
        gender: "",
      });
      setLastSearchedNumber("");
      dispatch(resetSearchData());
    }
  }, [showAddMeForm, dispatch]);

  useEffect(() => {
    const phoneLength = formData?.phoneNumber?.length || 0;

    if (phoneLength === 10 && formData.phoneNumber !== lastSearchedNumber) {
      setOriginalUserData({
        name: userEnteredData.name,
        email: userEnteredData.email,
        gender: userEnteredData.gender
      });
      dispatch(searchUserByNumber({ phoneNumber: formData?.phoneNumber, type: formData?.type }));
      setLastSearchedNumber(formData.phoneNumber);
    } else if (phoneLength < 10 && lastSearchedNumber) {
      setLastSearchedNumber("");
      dispatch(resetSearchData());

      setFormData(prev => ({
        ...prev,
        name: originalUserData.name || "",
        email: originalUserData.email || "",
        gender: originalUserData.gender || ""
      }));
    }
  }, [formData?.phoneNumber, dispatch]);

  useEffect(() => {
    if (showAddMeForm && searchUserData?.result?.[0] && formData?.phoneNumber?.length === 10) {
      const apiGender = searchUserData.result[0].gender;
      let finalGender = apiGender || userEnteredData.gender;

      if (!apiGender) {
        if (selectedGender === 'Male') {
          finalGender = 'Male';
        } else if (selectedGender === 'Female') {
          finalGender = 'Female';
        } else if (selectedGender === 'Mixed') {
          finalGender = 'Other';
        }
      }

      setFormData(prev => ({
        ...prev,
        name: searchUserData.result[0].name || userEnteredData.name,
        email: searchUserData.result[0].email || userEnteredData.email,
        gender: finalGender
      }));
      setUserEnteredData({
        name: searchUserData.result[0].name || userEnteredData.name,
        email: searchUserData.result[0].email || userEnteredData.email,
        gender: finalGender
      });
    }
  }, [searchUserData, formData?.phoneNumber, showAddMeForm, selectedGender]);

  return (
    <Modal
      show={showAddMeForm}
      onHide={() => {
        setShowAddMeForm(false);
        setActiveSlot(null);
        setErrors({});
        setshowErrors({});
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          gender: "",
          level: "",
          type: "",
        });
        setUserEnteredData({
          name: "",
          email: "",
          gender: "",
        });
        setOriginalUserData({
          name: "",
          email: "",
          gender: "",
        });
        dispatch(resetSearchData());
      }}
      centered
      backdrop="static"
      style={{ zIndex: 1060 }}
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
          Player Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} id="addPlayerForm">
          <div className="mb-md-2 mb-1">
            <label className="form-label label_font mb-1">
              Phone No <span className="text-danger">*</span>
            </label>
            <div className="input-group" style={inputStyle("phoneNumber")}>
              <span className="input-group-text border-0 mt-1 bg-white d-flex align-items-center" style={{ fontSize: "11px", }}>
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} className="me-2" />
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  if (v === "" || /^[6-9][0-9]{0,9}$/.test(v)) {
                    handleInputChange("phoneNumber", v);
                  }
                }}
                className="form-control border-0"
                placeholder="Enter phone number"
                style={{ boxShadow: "none", padding: "0.5rem" }}
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
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={searchUserDataLoading ? "Loading...." : formData?.name}
              onChange={(e) => {
                let v = e.target.value;
                if (/^[A-Za-z\s]*$/.test(v)) {
                  if (v.length > 20) v = v.slice(0, 20);
                  const formatted = v
                    .trimStart()
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .replace(/(^|\s)\w/g, (l) => l.toUpperCase());
                  handleInputChange("name", formatted);
                  setUserEnteredData((prev) => ({ ...prev, name: formatted }));
                }
              }}
              className="form-control p-2"
              placeholder="Enter your full name"
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
                  setUserEnteredData((prev) => ({ ...prev, email: formatted }));
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
            <label className="form-label label_font mb-1">
              Gender <span className="text-danger">*</span>
            </label>
            <div className="d-flex gap-3">
              {[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ].map((g) => {
                const isDisabled = selectedGender === 'Male' && g.value !== 'Male' ||
                  selectedGender === 'Female' && g.value !== 'Female' ||
                  selectedGender === 'Mixed' && g.value === 'Male';

                return (
                  <div key={g.value} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id={g.value}
                      value={g.value}
                      disabled={isDisabled}
                      checked={formData.gender?.trim() === g.value}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, gender: e.target.value }));
                        setErrors((prev) => ({ ...prev, gender: "" }));
                        setshowErrors((prev) => ({ ...prev, gender: false }));
                      }}
                      style={{ boxShadow: "none" }}
                    />
                    <label
                      className={`form-check-label ${isDisabled ? "text-muted" : ""}`}
                      htmlFor={g.value}
                    >
                      {g.label}
                    </label>
                  </div>
                );
              })}
            </div>
            {showErrors.gender && errors.gender && (
              <small
                className="text-danger d-block mt-1"
                style={{ fontSize: "12px" }}
              >
                {errors.gender}
              </small>
            )}
          </div>

          <div className="mb-md-3 mb-2">
            <label className="form-label label_font mb-1">
              Select Level <span className="text-danger">*</span>
            </label>
            <div style={inputStyle("level")}>
              {getPlayerLevelsBySkillLevelLoading ? (
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

        </form>
      </Modal.Body>
      <Modal.Footer>
        <BsButton
          variant="outline-primary"
          disabled={userLoading}
          onClick={() => {
            setShowAddMeForm(false);
            setActiveSlot(null);
            setErrors({});
            setshowErrors({});
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
            dispatch(resetSearchData());
          }}
          style={{ borderColor: "#001b76", color: "#001B76" }}
        >
          Cancel
        </BsButton>
        <BsButton
          type="submit"
          form="addPlayerForm"
          variant="primary"
          disabled={userLoading}
          style={{
            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
            border: "none"
          }}
          className='px-3'
        >
          {userLoading ? <ButtonLoading color="white" /> : editPlayerData ? 'Update' : "Add"}
        </BsButton>
      </Modal.Footer>
    </Modal>
  );
};

export default AddPlayer;
