import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "react-bootstrap";
import { showSuccess } from "../../../helpers/Toast";
import { Box, Button, Modal } from "@mui/material";
import { Usersignup } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    p: 4,
    borderRadius: 2,
    border: 'none',
    zIndex: 1300, // Add this
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
                    {errorShow && <Alert variant="danger" className='position-absolute' style={{ bottom: "80%", width: "87%",fontSize:"16px",fontFamily:"Poppins",fontWeight:"500" }}>{error}</Alert>}
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
                            <div className="d-flex gap-3">
                                <div>
                                    <input
                                        type="radio"
                                        id="male"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === "Male"}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                                        className="form-check-input"
                                        style={{ boxShadow: "none" }}
                                    />
                                    <label htmlFor="male" className="form-check-label ms-2">Male</label>
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        id="female"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === "Female"}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                                        className="form-check-input"
                                        style={{ boxShadow: "none" }}
                                    />
                                    <label htmlFor="female" className="form-check-label ms-2">Female</label>
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        id="other"
                                        name="other"
                                        value="Other"
                                        checked={formData.gender === "Other"}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                                        className="form-check-input"
                                        style={{ boxShadow: "none" }}
                                    />
                                    <label htmlFor="other" className="form-check-label ms-2">Other</label>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Select Level  <span className="text-danger">*</span>
                            </label>
                            <select
                                value={formData.level}
                                style={{ boxShadow: "none" }}
                                onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                                className="form-control border p-2"
                                aria-label="Select Label Name"
                            >
                                <option value="">Select Level </option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="A|B">A|B</option>
                                <option value="B|C">B|C</option>
                                <option value="C|D">C|D</option>
                            </select>
                        </div>
                        <div className="d-flex justify-content-between">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    setShowAddMeForm(false);
                                    setActiveSlot(null);
                                }}
                                sx={{ width: "45%" }}
                            >
                                Cancel
                            </Button>
                            <Button
                                sx={{ width: "45%" }}
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