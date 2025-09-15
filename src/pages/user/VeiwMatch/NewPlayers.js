import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "react-bootstrap";
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
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorShow, setErrorShow] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const userLoading = useSelector((state) => state?.userAuth);
    const [formData, setFormData] = useState({ name: "", email: "", phoneNumber: "", gender: "", level: "" });

    const handleSubmit = () => {
        const errors = [];
        if (!formData.name) {
            errors.push("Name is required");
        }
        else if (!formData.phoneNumber) {
            errors.push("Phone number must be 10 digits starting with 6, 7, 8, or 9");
        }
        else if (!formData.email) {
            errors.push("Email is required");
        }
        // else if (!formData.gender) {
        //     errors.push("Gender is required");
        // }
        else if (!formData.level) {
            errors.push("Select Level Name is required");
        }
        if (errors.length > 0) {
            setError(errors.join(", "));
            setErrorShow(true);
            return;
        }
        setError(null);
        setErrorShow(false);

        dispatch(Usersignup(formData))
            .unwrap()
            .then((res) => {
                if (res?.status === "200") {
                    const addedPlayers = localStorage.getItem('addedPlayers')
                        ? JSON.parse(localStorage.getItem('addedPlayers'))
                        : {};
                    addedPlayers[activeSlot] = res?.response;
                    localStorage.setItem('addedPlayers', JSON.stringify(addedPlayers));
                    setPhoneNumber('');
                    setName('');
                    setEmail('');
                    setShowAddMeForm(false);
                    setActiveSlot(null);
                    showSuccess("Player Added Successfully");
                    setFormData({ name: "", email: "", phoneNumber: "", gender: "", level: "" });
                }
            }).catch((err) => {
                setError(err?.response?.data?.message || "An error occurred. Please try again.");
                setErrorShow(true);
            });
    };

    useEffect(() => {
        if (errorShow) {
            const timer = setTimeout(() => {
                setErrorShow(false);
                setError('');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [errorShow]);

    const lavel = [
        {
            code: "A",
            title: "Top Player",
        },
        {
            code: "B1",
            title: "Experienced Player",
        },
        {
            code: "B2",
            title: "Advanced Player",
        },
        {
            code: "C1",
            title: "Confident Player",
        },
        {
            code: "C2",
            title: "Intermediate Player",
        },
        {
            code: "D1",
            title: "Amateur Player",
        },
        {
            code: "D2",
            title: "Novice Player",
        },
        {
            code: "E",
            title: "Entry Level",
        },
    ]

    const levelOptions = lavel.map((item) => ({
        value: item.code,
        label: (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ color: "#1d4ed8", fontWeight: "600", fontSize: "15px", fontFamily: "Poppins" }}>
                    {item.code}
                </span>
                <span style={{ color: "#374151", fontSize: "13px" }}>
                    {item.title}
                </span>
            </div>
        )
    }));

    return (
        <>
            <Modal
                open={showAddMeForm}
                onClose={() => {
                    setShowAddMeForm(false);
                    setActiveSlot(null);
                }}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
            >
                <Box sx={modalStyle}>
                    <h6 id="modal-title" className="mb-3 text-center" style={{ fontSize: "16px", fontWeight: "600", fontFamily: "Poppins" }}>
                        Player Information
                    </h6>
                    {errorShow && <Alert variant="danger" className='mb-3' style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>{error}</Alert>}
                    <form>
                        <div className="mb-3">
                            <label className="form-label">
                                Name <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                style={{ boxShadow: "none" }}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                                        if (value.length === 0 && value.trim() === "") {
                                            setFormData((prev) => ({ ...prev, name: '' }));
                                            return;
                                        }
                                        const formattedValue = value
                                            .trimStart()
                                            .replace(/\s+/g, " ")
                                            .toLowerCase()
                                            .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
                                        setFormData((prev) => ({ ...prev, name: formattedValue }));
                                    }
                                }}
                                className="form-control border p-2"
                                placeholder="Enter your name"
                                pattern="[A-Za-z\s]+"
                                title="Name can only contain letters and single spaces between words"
                                aria-label="Name"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Email <span className="text-danger">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                style={{ boxShadow: "none" }}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                                        if (value.length === 0) {
                                            setFormData((prev) => ({ ...prev, email: '' }));
                                            return;
                                        }
                                        const formattedValue = value
                                            .replace(/\s+/g, "")
                                            .replace(/^(.)(.*)(@.*)?$/, (match, first, rest, domain = "") => {
                                                return first.toUpperCase() + rest.toLowerCase() + domain;
                                            });
                                        setFormData((prev) => ({ ...prev, email: formattedValue }));
                                    }
                                }}
                                className="form-control border p-2"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Phone No <span className="text-danger">*</span>
                            </label>
                            <div className="input-group border">
                                <span className="input-group-text border-0 p-2">
                                    <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                    <span>+91</span>
                                </span>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={formData.phoneNumber}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        if (value === "" || /^[6-9][0-9]{0,9}$/.test(value)) {
                                            setFormData((prev) => ({ ...prev, phoneNumber: value }));
                                        }
                                    }}
                                    className="form-control border-0 p-2"
                                    placeholder="Enter phone number"
                                    pattern="[6-9][0-9]{9}"
                                    title="Phone number must be 10 digits and start with 6, 7, 8, or 9"
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Gender
                            </label>
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
                                            disabled={userLoading?.userSignUpLoading }
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
                        <div className="mb-3">
                            <label className="form-label">
                                Select Level  <span className="text-danger">*</span>
                            </label>
                            <Select
                                options={levelOptions}
                                value={levelOptions.find((opt) => opt.value === formData.level)}
                                onChange={(option) => setFormData((prev) => ({ ...prev, level: option.value }))}
                                className="basic-single"
                                classNamePrefix="select"
                                style={{ boxShadow: "none" }}
                            />
                        </div>
                        <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    setShowAddMeForm(false);
                                    setActiveSlot(null);
                                }}
                                sx={{ width: { xs: "100%", sm: "45%" } }}
                            >
                                Cancel
                            </Button>
                            <Button
                                sx={{ width: { xs: "100%", sm: "45%" } }}
                                className="text-white"
                                style={{ backgroundColor: "#3DBE64" }}
                                onClick={() => handleSubmit()}
                            >
                                {userLoading?.userSignUpLoading ? <ButtonLoading /> : "Submit"}
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </>
    );
};

export default NewPlayers;