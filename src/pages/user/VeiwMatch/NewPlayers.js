import React, { useEffect, useState } from 'react'
import { Box, Button, Modal } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { loginUserNumber } from '../../../redux/user/auth/authThunk';

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
export const NewPlayers = ({ showAddMeForm, activeSlot, setShowAddMeForm, setActiveSlot }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorShow, setErrorShow] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch()
    const user = useSelector((state) => state?.userAuth?.userData?.data);


    const handleSubmit = () => {
        const errors = [];
        if (!name) errors.push("Name is required");
        if (!phoneNumber) {
            errors.push("Phone number must be 10 digits starting with 6, 7, 8, or 9");
        }
        if (!email) errors.push("Email is required");
        if (errors.length > 0) {
            setError(errors.join(", "));
            setErrorShow(true);
            return;
        }
        setError(null);
        setErrorShow(false);

        dispatch(loginUserNumber({ phoneNumber, name, email })).unwrap().then((res) => {
            console.log(res,'resresres');
            setShowAddMeForm(false);
            setActiveSlot(null);
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
        <>
            {showAddMeForm && activeSlot === "slot-1" && (
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
                            User Information
                        </h6>
                        <form>
                            <div className="mb-3">
                                <label className="form-label">
                                    Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                                            if (value.length === 0 && value.trim() === "") {
                                                setName("");
                                                return;
                                            }
                                            const formattedValue = value
                                                .trimStart()
                                                .replace(/\s+/g, " ")
                                                .toLowerCase()
                                                .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
                                            setName(formattedValue);
                                        }
                                    }}
                                    className="form-control border p-2"
                                    placeholder="Enter your name"
                                    pattern="[A-Za-z\s]+"
                                    title="Name can only contain letters and single spaces between words"
                                    aria-label="Name"
                                    disabled={user?.name}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                                            if (value.length === 0) {
                                                setEmail("");
                                                return;
                                            }
                                            const formattedValue = value
                                                .replace(/\s+/g, "") // Remove all spaces
                                                .replace(/^(.)(.*)(@.*)?$/, (match, first, rest, domain = "") => {
                                                    return first.toUpperCase() + rest.toLowerCase() + domain;
                                                });
                                            setEmail(formattedValue);
                                        }
                                    }}
                                    className="form-control border p-2"
                                    placeholder="Enter your email"
                                    disabled={user?.email}
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
                                        value={phoneNumber}
                                        style={{ boxShadow: "none" }}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
                                            if (value === "" || /^[6-9][0-9]{0,9}$/.test(value)) {
                                                setPhoneNumber(value); // Store only the digits
                                            }
                                        }}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter phone number"
                                        pattern="[6-9][0-9]{9}"
                                        title="Phone number must be 10 digits and start with 6, 7, 8, or 9"
                                        disabled={user?.phoneNumber}
                                    />
                                </div>
                            </div>
                            {errorShow && <Alert variant="danger">{error}</Alert>}
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
                                    Submit
                                </Button>

                            </div>
                        </form>
                    </Box>
                </Modal>
            )
            }
        </>
    )
}
