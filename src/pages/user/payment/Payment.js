import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
import { loginUserNumber } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { Button, Modal } from "react-bootstrap";
import { success2 } from "../../../assets/files";
import { getUserFromSession } from "../../../helpers/api/apiCore";

// Load PayPal SDK (kept if needed later)
const loadPayPal = (callback) => {
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID";
    script.onload = () => callback(window.paypal);
    // script.onerror = () => alert("Failed to load PayPal SDK. Please try again.");
    document.body.appendChild(script);
};

const Payment = ({ className = "" }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { courtData, clubData, selectedCourts, grandTotal, totalSlots } = location.state || {};
    const user = getUserFromSession();
    const bookingStatus = useSelector((state) => state?.userBooking);
    console.log({ user });
    const userLoading = useSelector((state) => state?.userAuth);
    const logo = JSON.parse(localStorage.getItem("logo"));
    const updateName = JSON.parse(localStorage.getItem("updateprofile"));
    const [name, setName] = useState(user?.name || updateName?.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(
        user?.phoneNumber || updateName?.phone ? `+91 ${user.phoneNumber || updateName?.phone}` : ""
    );
    const [email, setEmail] = useState(user?.email || updateName?.email || "");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [errors, setErrors] = useState({
        name: "",
        phoneNumber: "",
        email: "",
        paymentMethod: "",
        general: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const paypalRef = useRef(null);
    const dispatch = useDispatch();
    const [localSelectedCourts, setLocalSelectedCourts] = useState(selectedCourts || []);
    const [localGrandTotal, setLocalGrandTotal] = useState(grandTotal || 0);
    const [localTotalSlots, setLocalTotalSlots] = useState(totalSlots || 0);

    useEffect(() => {
        const newTotalSlots = localSelectedCourts.reduce((sum, c) => sum + c.time.length, 0);
        const newGrandTotal = localSelectedCourts.reduce(
            (sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 2000), 0),
            0
        );
        setLocalTotalSlots(newTotalSlots);
        setLocalGrandTotal(newGrandTotal);
    }, [localSelectedCourts]);

    useEffect(() => {
        if (!courtData) {
            navigate("/booking");
            return;
        }
        setLocalSelectedCourts(selectedCourts || []);
    }, [courtData, selectedCourts, navigate]);

    useEffect(() => {
        if (paymentConfirmed && bookingStatus?.bookingData?.message === "Bookings created") {
            setLocalSelectedCourts([]);
            setPaymentConfirmed(false);
        }
    }, [paymentConfirmed, bookingStatus?.bookingData?.message]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setErrors((prev) => ({
                ...prev,
                name: "",
                phoneNumber: "",
                email: "",
                paymentMethod: "",
                general: "",
            }));
        }, 5000);
        return () => clearTimeout(timer);
    }, [errors]);

    // PayPal integration (optional, kept but not triggered unless selected)
    useEffect(() => {
        if (selectedPayment === "Paypal" && !paypalLoaded) {
            loadPayPal((paypal) => {
                if (paypal) {
                    paypalRef.current = paypal;
                    setPaypalLoaded(true);
                    paypal.Buttons({
                        createOrder: (data, actions) => {
                            return actions.order.create({
                                purchase_units: [{ amount: { value: localGrandTotal.toString(), currency_code: "USD" } }],
                            });
                        },
                        onApprove: async (data, actions) => {
                            const payload = {
                                name,
                                phoneNumber: phoneNumber.replace(/^\+91\s/, ""),
                                email,
                                register_club_id: localStorage.getItem("register_club_id"),
                                bookingStatus: "upcoming",
                                bookingType: "user",
                                ownerId: localStorage.getItem("owner_id"),
                                slot: localSelectedCourts.flatMap((court) => ({
                                    slotId: court.time[0]?._id,
                                    businessHours: courtData?.slot?.[0]?.businessHours?.map((t) => ({
                                        time: t?.time,
                                        day: t?.day,
                                    })) || [{ time: "06:00 AM - 11:00 PM", day: "Wednesday" }],
                                    slotTimes: court.time.map((timeSlot) => ({
                                        time: timeSlot?.time,
                                        amount: timeSlot?.amount ?? 2000,
                                    })),
                                    courtName: court?.courtName,
                                    courtId: court?._id,
                                    bookingDate: court?.date,
                                })),
                                paymentMethod: selectedPayment,
                            };
                            try {
                                if (!user?.name || !user?.phoneNumber) {
                                    const loginResponse = await dispatch(loginUserNumber({ phoneNumber: phoneNumber.replace(/^\+91\s/, ""), name, email })).unwrap();
                                    if (loginResponse?.status !== "200") throw new Error("Login failed");
                                }
                                const bookingResponse = await dispatch(createBooking(payload)).unwrap();
                                if (bookingResponse?.success) {
                                    setPaymentConfirmed(true);
                                    setModal(true);
                                    setLocalSelectedCourts([]);
                                } else {
                                    throw new Error(bookingResponse?.message);
                                }
                            } catch (err) {
                                setErrors((prev) => ({ ...prev, general: err.message }));
                            }
                        },
                        onError: (err) => {
                            setErrors((prev) => ({ ...prev, general: "PayPal payment failed." }));
                        },
                    }).render("#paypal-button-container");
                }
            });
        }
    }, [selectedPayment, paypalLoaded, localGrandTotal, localSelectedCourts, dispatch, courtData, name, phoneNumber, email, user]);

    const handleDeleteSlot = (courtIndex, slotIndex) => {
        const removedSlotId = localSelectedCourts[courtIndex]?.time[slotIndex]?._id;
        if (!removedSlotId) return;

        setLocalSelectedCourts((prev) => {
            let updated = [...prev];
            if (updated[courtIndex]?.time) {
                updated[courtIndex].time = updated[courtIndex].time.filter((_, i) => i !== slotIndex);
                if (updated[courtIndex].time.length === 0) {
                    updated = updated.filter((_, i) => i !== courtIndex);
                }
            }
            return updated;
        });
    };

    // MAIN PAYMENT HANDLER - ONLY API CALL, NO RAZORPAY
    const handlePayment = async () => {
        const rawPhoneNumber = phoneNumber.replace(/^\+91\s/, "") || "";
        const newErrors = {
            name: !name ? "Name is required" : "",
            phoneNumber: !rawPhoneNumber
                ? "Phone number is required"
                : !/^[6-9]\d{9}$/.test(rawPhoneNumber)
                    ? "Phone number must be 10 digits starting with 6, 7, 8, or 9"
                    : "",
            email: !email ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? "Invalid email format"
                : "",
            paymentMethod: !selectedPayment ? "Payment method is required" : "",
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some((error) => error)) {
            return;
        }

        setIsLoading(true);

        try {
            const register_club_id = localStorage.getItem("register_club_id");
            const owner_id = localStorage.getItem("owner_id");
            if (!register_club_id || !owner_id) {
                throw new Error("Club information is missing. Please select a club first.");
            }

            const slotArray = localSelectedCourts.flatMap((court) => {
                return court?.time?.map((timeSlot) => ({
                    slotId: timeSlot._id,
                    businessHours: courtData?.slot?.[0]?.businessHours?.map((t) => ({
                        time: t?.time,
                        day: t?.day,
                    })) || [
                            {
                                time: "6:00 AM To 11:00 PM",
                                day: "Monday",
                            },
                        ],
                    slotTimes: [
                        {
                            time: timeSlot?.time,
                            amount: timeSlot?.amount ?? 2000,
                        },
                    ],
                    courtName: court?.courtName,
                    courtId: court?._id,
                    bookingDate: court?.date,
                }));
            });

            const payload = {
                name,
                phoneNumber: rawPhoneNumber,
                email,
                register_club_id,
                bookingStatus: "upcoming",
                bookingType: 'user',
                ownerId: owner_id,
                slot: slotArray,
                paymentMethod: selectedPayment,
            };

            try {
                if (!user?.name) {
                    // 🔹 Step 1: Login by phone number
                    const loginRes = await dispatch(
                        loginUserNumber({
                            phoneNumber: rawPhoneNumber.toString(),
                            name,
                            email,
                        })
                    ).unwrap();

                    if (loginRes?.status === "200") {
                        // 🔹 Step 2: Create booking after successful login
                        const bookingRes = await dispatch(createBooking(payload)).unwrap();
                        if (bookingRes?.success) {
                            setModal(true);
                        }
                    }
                } else {
                    // 🔹 Already logged in → Directly create booking
                    const bookingRes = await dispatch(createBooking(payload)).unwrap();
                    if (bookingRes?.success) {
                        setModal(true);
                    }
                }
            } catch (error) {
                console.error("Booking or login failed:", error);
            }

        } catch (err) {
            console.error("Payment Error:", err);
            setErrors((prev) => ({
                ...prev,
                general: err.message || "An error occurred during payment processing.",
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeStr) => {
        return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
    };

    const width = 370;
    const height = 75;
    const circleRadius = height * 0.3;
    const curvedSectionStart = width * 0.76;
    const curvedSectionEnd = width * 0.996;
    const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
    const circleY = height * 0.5;
    const arrowSize = circleRadius * 0.6;
    const arrowX = circleX;
    const arrowY = circleY;

    const buttonStyle = {
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        overflow: "visible",
    };

    const svgStyle = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
    };

    const contentStyle = {
        position: "relative",
        zIndex: 2,
        color: "#001B76",
        fontWeight: "600",
        fontSize: "16px",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingRight: `${circleRadius * 2}px`,
    };

    return (
        <div className="container mt-lg-4 mb-3 px-3 px-md-4">
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <div className="bg-white rounded">
                        {/* Info Section */}
                        <div
                            className="rounded-4 py-4 px-3 px-md-5 mb-4"
                            style={{ backgroundColor: "#F5F5F566", border: errors.name || errors.email || errors.phoneNumber ? "2px solid red" : "none" }}
                        >
                            <h6 className="mb-3 custom-heading-use">Information</h6>
                            <div className="row">
                                <div className="col-12 col-md-4 mb-3 p-1">
                                    <label className="form-label mb-0 ps-lg-2" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                                        Name <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
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
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your name"
                                        aria-label="Name"
                                    />
                                    {errors.name && (
                                        <div className="text-danger position-absolute" style={{ fontSize: "12px", marginTop: "4px" }}>
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-4 mb-3 p-1">
                                    <label className="form-label mb-0 ps-lg-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                                        Phone Number <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text border-0 p-2" style={{ backgroundColor: "#F5F5F5" }}>
                                            <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                        </span>
                                        <input
                                            type="text"
                                            maxLength={13}
                                            value={phoneNumber}
                                            style={{ boxShadow: "none" }}
                                            disabled={user?.phoneNumber}
                                            onChange={(e) => {
                                                const inputValue = e.target.value.replace(/[^0-9]/g, "");
                                                if (inputValue === "" || /^[6-9][0-9]{0,9}$/.test(inputValue)) {
                                                    const formattedValue = inputValue === "" ? "" : `+91 ${inputValue}`;
                                                    setPhoneNumber(formattedValue);
                                                }
                                            }}
                                            className="form-control border-0 p-2"
                                            placeholder="+91"
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <div className="text-danger position-absolute" style={{ fontSize: "12px", marginTop: "4px" }}>
                                            {errors.phoneNumber}
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-4 mb-3 p-1">
                                    <label className="form-label mb-0 ps-lg-2" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                                        Email <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
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
                                                    .replace(/\s+/g, "")
                                                    .replace(/^(.)(.*)(@.*)?$/, (match, first, rest, domain = "") => {
                                                        return first.toUpperCase() + rest.toLowerCase() + domain;
                                                    });
                                                setEmail(formattedValue);
                                            }
                                        }}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && (
                                        <div className="text-danger position-absolute" style={{ fontSize: "12px", marginTop: "4px" }}>
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div
                            className="rounded-4 py-4 px-3 px-md-5"
                            style={{
                                backgroundColor: "#F5F5F566",
                                border: errors.paymentMethod ? "2px solid red" : "none",
                            }}
                        >
                            <h6 className="mb-4 custom-heading-use">
                                Payment Method <span className="text-danger" style={{ fontSize: "12px", fontFamily: "Poppins", fontWeight: "500" }}>{errors.paymentMethod}</span>
                            </h6>
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { id: "Gpay", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                    { id: "Apple Pay", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                                    { id: "Paypal", name: "PayPal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className="d-flex justify-content-between align-items-center p-3 bg-white rounded-pill"
                                        style={{ boxShadow: "3px 4px 6.3px 0px #F5F5F5" }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <img src={method.icon} alt={method.name} width={28} />
                                            <span className="fw-medium">{method.name}</span>
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            className="form-check-input"
                                            checked={selectedPayment === method.id}
                                            style={{ border: "4px solid #4D4DFF", width: "20px", height: "20px", boxShadow: "none" }}
                                            onChange={(e) => setSelectedPayment(e.target.value)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="col-12 col-lg-5">
                    <div className="border px-3 py-5 border-0" style={{ borderRadius: "10px 30% 10px 10px", background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                        <div className="text-center mb-3">
                            <div className="d-flex justify-content-center">
                                {logo ? (
                                    <Avatar src={logo} alt="User Profile" style={{ height: "112px", width: "112px", boxShadow: "0px 4px 11.4px 0px #0000002E" }} />
                                ) : (
                                    <Avatar style={{ height: "112px", width: "112px", fontSize: "30px", boxShadow: "0px 4px 11.4px 0px #0000002E" }}>
                                        {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                    </Avatar>
                                )}
                            </div>
                            <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>
                                {clubData?.clubName}
                            </p>
                        </div>

                        <h6 className="border-top p-2 pt-3 mb-3 ps-0 custom-heading-use text-white">Booking Summary</h6>
                        <div style={{ maxHeight: "240px", overflowY: "auto", overflowX: "hidden" }}>
                            {localSelectedCourts?.length > 0 ? (
                                localSelectedCourts?.map((court, index) => (
                                    <React.Fragment key={`${index}`}>
                                        {court?.time?.map((timeSlot, timeIndex) => (
                                            <div key={`${index}-${timeIndex}`} className="row mb-2">
                                                <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                    <div className="d-flex text-white">
                                                        <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                            {(() => {
                                                                if (!court?.date) return "";
                                                                const date = new Date(court.date);
                                                                const day = date.toLocaleString("en-US", { day: "2-digit" });
                                                                const month = date.toLocaleString("en-US", { month: "short" });
                                                                return `${day}, ${month}`;
                                                            })()}
                                                        </span>
                                                        <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                            {formatTime(timeSlot.time)}
                                                        </span>
                                                        <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>
                                                            {court?.courtName}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center text-white">
                                                        ₹<span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins" }}>
                                                            {timeSlot?.amount || 2000}
                                                        </span>
                                                        <button
                                                            className="btn btn-sm text-white delete-btn"
                                                            onClick={() => handleDeleteSlot(index, timeIndex)}
                                                        >
                                                            <i className="bi bi-trash-fill text-white mb-2"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                <div
                                    className="d-flex flex-column justify-content-center align-items-center text-center"
                                    style={{ height: "25vh" }}
                                >
                                    <p
                                        className="text-white mb-2"
                                        style={{
                                            fontSize: "15px",
                                            fontFamily: "Poppins",
                                            fontWeight: "600",
                                        }}
                                    >
                                        No court selected
                                    </p>
                                    <button
                                        className="btn px-4 border-0 py-2 rounded-pill"
                                        style={{
                                            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                                            color: "#fff",
                                            fontFamily: "Poppins",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                        }}
                                        onClick={() => navigate("/booking")}
                                    >
                                        Select Slot
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.general && (
                            <div className="text-white" style={{ fontSize: "12px", marginTop: "8px" }}>
                                {errors.general}
                            </div>
                        )}
                        {localTotalSlots > 0 && (
                            <div className="border-top text-white pt-3 mt-2 d-flex align-items-center justify-content-between fw-bold">
                                <p className="d-flex flex-column" style={{ fontSize: "16px", fontWeight: "600" }}>
                                    Total to Pay <span style={{ fontSize: "14px", fontWeight: "600" }}>Slots {localTotalSlots}</span>
                                </p>
                                <p style={{ fontSize: "25px", fontWeight: "600" }}>₹ {localGrandTotal}</p>
                            </div>
                        )}

                        <div className="d-flex justify-content-center mt-3 mb-4">
                            <button
                                style={{
                                    ...buttonStyle,
                                    opacity: localSelectedCourts?.length > 0 && localTotalSlots > 0 ? 1 : 0.6,
                                    cursor: localSelectedCourts?.length > 0 && localTotalSlots > 0 ? "pointer" : "not-allowed",
                                }}
                                onClick={handlePayment}
                                className={className}
                                disabled={isLoading || localSelectedCourts?.length === 0 || localTotalSlots === 0}
                            >
                                <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#fff" />
                                            <stop offset="50%" stopColor="#fff" />
                                            <stop offset="100%" stopColor="#fff" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M ${width * 0.76} ${height * 0.15} 
                      C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} 
                      C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} 
                      C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} 
                      C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} 
                      C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} 
                      C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} 
                      C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} 
                      C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} 
                      C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} 
                      C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} 
                      L ${width * 0.08} ${height * 0.85} 
                      C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} 
                      C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} 
                      L ${width * 0.76} ${height * 0.15} Z`}
                                        fill={`url(#buttonGradient-${width}-${height})`}
                                    />
                                    <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                                    <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                    </g>
                                </svg>
                                <div style={contentStyle}>
                                    {isLoading || bookingStatus?.bookingLoading ? <ButtonLoading color={"#001B76"} /> : "Book Now"}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal show={modal} centered>
                <div className="p-4 pt-0 text-center">
                    <img src={success2} alt="Booking Success" className="img-fluid mx-auto" style={{ width: "294px", height: "394px" }} />
                    <h4 className="tabel-title" style={{ fontFamily: "Poppins" }}>Booking Successful!</h4>
                    <p className="text-dark" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>
                        Your slot has been booked successfully.
                    </p>
                    <Button
                        onClick={() => {
                            setModal(false);
                            navigate("/booking", { replace: true });
                        }}
                        className="w-75 rounded-pill border-0 text-white py-lg-3 mt-lg-4 mb-lg-4"
                        style={{ background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)", boxShadow: "none", fontSize: "14px", fontFamily: "Poppins", fontWeight: "600" }}
                    >
                        Continue
                    </Button>
                    <p className="text-dark fw-medium mt-3 mb-1" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>
                        You’ll receive a reminder before it starts.
                    </p>
                    <Link to="/booking-history" replace className="nav-link" style={{ color: "#001B76", fontWeight: "600", fontFamily: "Poppins", fontSize: "14px" }}>
                        View Booking Details
                    </Link>
                </div>
            </Modal>

            {/* PayPal Container (hidden unless PayPal selected) */}
            <div id="paypal-button-container" style={{ display: selectedPayment === "Paypal" ? "block" : "none" }}></div>
        </div>
    );
};

const PaymentWithRazorpay = (props) => <Payment {...props} />;

export default PaymentWithRazorpay;