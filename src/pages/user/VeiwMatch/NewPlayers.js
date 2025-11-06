import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess } from "../../../helpers/Toast";
import { Box, Button, Modal } from "@mui/material";
import { Usersignup } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import Select from "react-select";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: 500 },
    maxWidth: '500px',
    bgcolor: 'background.paper',
    p: { xs: 2, md: 4 },
    borderRadius: 2,
    border: 'none',
    zIndex: 1300,
    maxHeight: '90vh',
    overflowY: 'auto',
};

const NewPlayers = ({ showAddMeForm, activeSlot, setShowAddMeForm, setActiveSlot }) => {
    const [formData, setFormData] = useState({
        name: "", email: "", phoneNumber: "", gender: "", level: ""
    });
    const [errors, setErrors] = useState({});
    const [showErrors, setShowErrors] = useState({}); // Visibility control
    const dispatch = useDispatch();
    const userLoading = useSelector((state) => state?.userAuth);
    const { finalSkillDetails = [] } = useSelector((state) => state.location?.state || {});

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

    const levelOptions = lavel.map((item) => {
        const lastSkillLevel = finalSkillDetails?.slice(-1)[0];
        const addedPlayers = JSON.parse(localStorage.getItem('addedPlayers') || '{}');
        const existingLevels = Object.values(addedPlayers).map(p => p?.level);
        const isDisabled = item.code === lastSkillLevel || existingLevels.includes(item.code);

        return {
            value: item.code,
            label: (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: "#1d4ed8", fontWeight: 600, fontSize: "15px", fontFamily: "Poppins" }}>
                        {item.code}
                    </span>
                    <span style={{ color: "#374151", fontSize: "13px" }}>
                        {item.title}
                    </span>
                </div>
            ),
            isDisabled,
        };
    });

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";

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

        if (!formData.level) {
            newErrors.level = "Please select a level";
        }

        const addedPlayers = JSON.parse(localStorage.getItem('addedPlayers') || '{}');
        const existingLevels = Object.values(addedPlayers).map(p => p?.level);
        if (existingLevels.includes(formData.level)) {
            newErrors.level = "This level is already taken";
        }

        setErrors(newErrors);
        setShowErrors(Object.fromEntries(Object.keys(newErrors).map(k => [k, true])));
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
                if (res?.status === "200") {
                    const addedPlayers = JSON.parse(localStorage.getItem('addedPlayers') || '{}');
                    addedPlayers[activeSlot] = { ...res?.response, level: formData.level };
                    localStorage.setItem('addedPlayers', JSON.stringify(addedPlayers));

                    setFormData({ name: "", email: "", phoneNumber: "", gender: "", level: "" });
                    setShowAddMeForm(false);
                    setActiveSlot(null);
                    showSuccess("Player Added Successfully");
                }
            })
            .catch((err) => {
                const msg = err?.response?.data?.message || "Failed to add player";
                setErrors({ submit: msg });
                setShowErrors({ submit: true });
            });
    };

    const handleInputChange = (field, value, formatFn = null) => {
        const formatted = formatFn ? formatFn(value) : value;
        setFormData(prev => ({ ...prev, [field]: formatted }));
        setErrors(prev => ({ ...prev, [field]: "" }));
        setShowErrors(prev => ({ ...prev, [field]: false }));
    };

    // Auto-hide errors after 2 sec
    useEffect(() => {
        const timers = Object.keys(showErrors)
            .filter(field => showErrors[field])
            .map(field => setTimeout(() => {
                setShowErrors(prev => ({ ...prev, [field]: false }));
            }, 2000));

        return () => timers.forEach(clearTimeout);
    }, [showErrors]);

    const inputStyle = (field) => ({
        border: showErrors[field] && errors[field] ? "1px solid #dc3545" : "1px solid #ced4da",
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
            <Box sx={modalStyle}>
                <h6 className="mb-4 text-center" style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
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
                                let value = e.target.value;
                                if (/^[A-Za-z\s]*$/.test(value)) {
                                    if (value.length > 30) value = value.slice(0, 30);
                                    const formatted = value
                                        .trimStart()
                                        .replace(/\s+/g, " ")
                                        .toLowerCase()
                                        .replace(/(^|\s)\w/g, l => l.toUpperCase());
                                    handleInputChange('name', formatted);
                                }
                            }}
                            className="form-control p-2"
                            placeholder="Enter your name"
                            style={inputStyle("name")}
                        />
                        {showErrors.name && errors.name && (
                            <small className="text-danger d-block mt-1" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
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
                                    const formatted = value.replace(/\s+/g, "")
                                        .replace(/^(.)(.*)(@.*)?$/, (m, f, r, d = "") => f.toUpperCase() + r.toLowerCase() + d);
                                    handleInputChange('email', formatted);
                                }
                            }}
                            className="form-control p-2"
                            placeholder="Enter your email"
                            style={inputStyle("email")}
                        />
                        {showErrors.email && errors.email && (
                            <small className="text-danger d-block mt-1" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                                {errors.email}
                            </small>
                        )}
                    </div>
                    {/* Phone */}
                    <div className="mb-3">
                        <label className="form-label">
                            Phone No <span className="text-danger">*</span>
                        </label>
                        <div className="input-group border rounded" >
                            <span className="input-group-text border-0 p-2 bg-white">
                                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} /> +91
                            </span>
                            <input
                                type="text"
                                maxLength={10}
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    if (value === "" || /^[6-9][0-9]{0,9}$/.test(value)) {
                                        handleInputChange('phoneNumber', value);
                                    }
                                }}
                                style={inputStyle("phoneNumber")}
                                className="form-control border-0 p-2"
                                placeholder="Enter phone number"
                            />
                        </div>
                        {showErrors.phoneNumber && errors.phoneNumber && (
                            <small className="text-danger d-block mt-1" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                                {errors.phoneNumber}
                            </small>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="mb-3">
                        <label className="form-label">Gender</label>
                        <div className="d-flex flex-wrap gap-3">
                            {["Male", "Female", "Other"].map((g) => (
                                <div key={g} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="gender"
                                        id={g}
                                        value={g}
                                        checked={formData.gender === g}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor={g}>{g}</label>
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
                                value={levelOptions.find(opt => opt.value === formData.level)}
                                onChange={(opt) => handleInputChange('level', opt.value)}
                                classNamePrefix="select"
                                isOptionDisabled={(opt) => opt.isDisabled}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        border: "none",
                                        boxShadow: "none",
                                    })
                                }}
                            />
                        </div>
                        {showErrors.level && errors.level && (
                            <small className="text-danger d-block mt-1" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                                {errors.level}
                            </small>
                        )}
                    </div>

                    {/* Submit Error (inline, below buttons) */}
                    {showErrors.submit && errors.submit && (
                        <div className="text-center mb-3">
                            <small className="text-danger d-block" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
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
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            style={{ backgroundColor: "#3DBE64", color: "white" }}
                            disabled={userLoading?.userSignUpLoading}
                        >
                            {userLoading?.userSignUpLoading ? <ButtonLoading color="white" /> : "Submit"}
                        </Button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};

export default NewPlayers;