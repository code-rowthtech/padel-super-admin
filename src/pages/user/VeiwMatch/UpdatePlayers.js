import { Box, Button, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import { Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Usersignup } from '../../../redux/user/auth/authThunk';
import { addPlayers, getMatchesUser, getMatchesView } from '../../../redux/user/matches/thunk';
import { showSuccess } from '../../../helpers/Toast';


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

};
const UpdatePlayers = ({ showModal, matchId,teamName, setShowModal, selectedDate, selectedTime, selectedLevel }) => {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({ name: "", email: "", phoneNumber: "" });
    const addLoading = useSelector((state) => state?.userAuth);
    const [errorShow, setErrorShow] = useState(false);
    const [error, setError] = useState(null);

    const normalizeTime = (time) => {
        if (!time) return null;
        const match = time.match(/^(\d{1,2}):00\s*(AM|PM)$/i);
        if (match) {
            return `${match[1]} ${match[2].toLowerCase()}`;
        }
        return time;
    };
    const handleAddPlayer = () => {
        const errors = [];
        if (!formData.name) errors.push("Name is required");
        if (!formData.phoneNumber) {
            errors.push("Phone number must be 10 digits starting with 6, 7, 8, or 9");
        }
        if (!formData.email) errors.push("Email is required");
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
                    dispatch(addPlayers({ matchId: matchId, playerId: res?.response?._id,team:teamName })).then(() => {
                        setShowModal(false);
                        dispatch(getMatchesView(matchId));
                        const payload = {
                            matchDate: selectedDate?.fullDate,
                            ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
                            ...(selectedLevel && { skillLevel: selectedLevel }),
                        };
                        dispatch(getMatchesUser(payload));
                    });
                    showSuccess("Add Players Successfully");
                }
                setFormData({ name: "", email: "", phoneNumber: "" });
            }).catch((err) => {
                setError(err?.response?.data?.message || "An error occurred. Please try again.");
                setErrorShow(true);
            })

    };


    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorShow(false);
            setError('')
        }, 2000);
        return () => clearTimeout(timer);
    }, [error, errorShow]);
    return (
        <Modal
            open={showModal}
            onClose={() => {
                setShowModal(false);
            }}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"    >
            <Box sx={modalStyle}>
                <h6 id="modal-title" className="mb-3 text-center" style={{ fontSize: "16px", fontWeight: "600", fontFamily: "Poppins" }}>
                    Player Information
                </h6>
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
                                        setFormData((prev) => ({ ...prev, name: "" }));
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
                                        .replace(/\s+/g, "") // Remove all spaces
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
                                maxLength={10} // Restrict to 10 digits
                                value={formData.phoneNumber}
                                style={{ boxShadow: "none" }}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
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
                    {errorShow && <Alert variant="danger">{error}</Alert>}
                    <div className="d-flex justify-content-between">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setShowModal(false);
                            }}
                            sx={{ width: "45%" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{ width: "45%" }}
                            className="text-white"
                            style={{ backgroundColor: "#3DBE64" }}
                            onClick={() => handleAddPlayer()}
                        >
                            {addLoading?.userSignUpLoading ? <ButtonLoading /> : "Submit"}
                        </Button>

                    </div>
                </form>
            </Box>
        </Modal>)
}

export default UpdatePlayers