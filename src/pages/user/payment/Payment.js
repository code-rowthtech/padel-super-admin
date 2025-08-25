import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { loginUserNumber } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { Alert, Button, Modal } from "react-bootstrap";
import { booking_success_img } from "../../../assets/files";

// Load Razorpay Checkout
const loadRazorpay = (callback) => {
    const script = document.createElement("script");
    script.src = "http://checkout.razorpay.com/v1/checkout.js";
    script.onload = callback;
    script.onerror = () => alert("Failed to load Razorpay SDK. Please try again.");
    document.body.appendChild(script);
};

const Payment = ({ className = "" }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { courtData, clubData, selectedCourts, selectedDate, grandTotal, totalSlots, currentCourtId } = location.state || {};
    const user = getUserFromSession();
    const bookingStatus = useSelector((state) => state?.userBooking);
    const userLoading = useSelector((state) => state?.userAuth);
    const logo = JSON.parse(localStorage.getItem("logo"));
    const [name, setName] = useState(user?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(
        user?.phoneNumber
    );
    const [email, setEmail] = useState(user?.email || "");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorShow, setErrorShow] = useState(false);
    const [modal, setModal] = useState(false)
    const dispatch = useDispatch();
    const [localSelectedCourts, setLocalSelectedCourts] = useState(selectedCourts || []);
    const [localGrandTotal, setLocalGrandTotal] = useState(grandTotal || 0);
    const [localTotalSlots, setLocalTotalSlots] = useState(totalSlots || 0);

    const dayMap = {
        sunday: "Sun",
        monday: "Mon",
        tuesday: "Tue",
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
    };

    // Update localGrandTotal and localTotalSlots when localSelectedCourts changes
    useEffect(() => {
        const newTotalSlots = localSelectedCourts.reduce((sum, c) => sum + c.time.length, 0);
        const newGrandTotal = localSelectedCourts.reduce(
            (sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 2000), 0),
            0
        );
        setLocalTotalSlots(newTotalSlots);
        setLocalGrandTotal(newGrandTotal);
    }, [localSelectedCourts]);

    // Redirect if no courtData
    useEffect(() => {
        if (!courtData) {
            navigate("/booking");
            return;
        }
        setLocalSelectedCourts(selectedCourts || []);
    }, [courtData, selectedCourts, navigate]);

    // Clear error after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorShow(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [error, errorShow]);

    const handleDeleteSlot = (courtIndex, slotIndex) => {
        const removedSlotId = localSelectedCourts[courtIndex]?.time[slotIndex]?._id;
        if (!removedSlotId) {
            console.error("Removed slot ID is undefined");
            return;
        }

        setLocalSelectedCourts((prev) => {
            let updated = [...prev];
            if (updated[courtIndex]?.time) {
                updated[courtIndex].time = updated[courtIndex].time.filter((_, i) => i !== slotIndex);
                // Do not remove the court, even if time array is empty
            }
            return updated;
        });
    };

    const handlePayment = async () => {
        const errors = [];
        if (!name) errors.push("Name is required");
        if (!phoneNumber) {
            errors.push("Phone number must be 10 digits starting with 6, 7, 8, or 9");
        }
        if (!email) errors.push("Email is required");
        if (!selectedPayment) errors.push("Payment method is required");

        if (errors.length > 0) {
            setError(errors.join(", "));
            setErrorShow(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setErrorShow(false);

        try {
            const register_club_id = localStorage.getItem("register_club_id");
            const owner_id = localStorage.getItem("owner_id");
            if (!register_club_id || !owner_id) {
                throw new Error("Club information is missing. Please select a club first.");
            }

            const slotTimesData = courtData?.slot?.[0]?.slotTimes || [];

            const slotArray = localSelectedCourts.flatMap((court) => {
                return court.time.map((timeSlot) => {
                    const matchingSlot = slotTimesData.find((slot) => slot.time === timeSlot.time);
                    return {
                        slotId: matchingSlot?._id || courtData?.slot?.[0]?._id,
                        businessHours:
                            courtData?.slot?.[0]?.businessHours?.map((t) => ({
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
                    };
                });
            });

            const payload = {
                name,
                phoneNumber,
                email,
                register_club_id,
                bookingStatus: "upcoming",
                ownerId: owner_id,
                slot: slotArray,
                paymentMethod: selectedPayment,
            };

            await dispatch(createBooking(payload)).unwrap();
            if (user?.token && user?.name) {
                // navigate("/booking-history");
                setModal(true)
            } else {
                await dispatch(loginUserNumber({ phoneNumber, name, email }));
                setModal(true)
            }
        } catch (err) {
            console.error("Payment Error:", err);
            setError(err.message || "An error occurred during payment processing.");
            setErrorShow(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Button styling
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
        color: "white",
        fontWeight: "600",
        fontSize: `16px`,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingRight: `${circleRadius * 2}px`,
    };

    return (
        <div className="container mt-4 d-flex gap-4 px-4 flex-wrap">
            <div className="row w-100">
                <div className="col-7">
                    <div className="bg-white rounded">
                        {/* Info Section */}
                        <div className="rounded-4 py-4 px-5 mb-4" style={{ backgroundColor: "#F5F5F566" }}>
                            <h6 className="mb-3" style={{ fontSize: "20px", fontWeight: "600" }}>
                                Information
                            </h6>
                            <div className="row">
                                <div className="col-md-4 mb-3 p-1">
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
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your name"
                                        pattern="[A-Za-z\s]+"
                                        title="Name can only contain letters and single spaces between words"
                                        aria-label="Name"
                                        disabled={user?.name}
                                    />
                                </div>
                                <div className="col-md-4 mb-3 p-1">
                                    <label className="form-label">
                                        Phone No <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
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
                                <div className="col-md-4 mb-3 p-1">
                                    <label className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        style={{ boxShadow: "none" }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow letters, numbers, @, and .; prevent spaces
                                            if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                                                if (value.length === 0) {
                                                    setEmail("");
                                                    return;
                                                }
                                                // Capitalize first letter before @, remove spaces
                                                const formattedValue = value
                                                    .replace(/\s+/g, "") // Remove all spaces
                                                    .replace(/^(.)(.*)(@.*)?$/, (match, first, rest, domain = "") => {
                                                        return first.toUpperCase() + rest.toLowerCase() + domain;
                                                    });
                                                setEmail(formattedValue);
                                            }
                                        }}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your email"
                                        disabled={user?.email}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="rounded-4 py-4 px-5" style={{ backgroundColor: "#F5F5F566" }}>
                            <h6 className="mb-4" style={{ fontSize: "20px", fontWeight: "600" }}>
                                Payment Method
                            </h6>
                            <div className="d-flex flex-column gap-3">
                                {[
                                    { id: "Gpay", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                    { id: "Apple Pay", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                                    { id: "Paypal", name: "Paypal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className="d-flex justify-content-between align-items-center p-3 bg-white rounded-4 p-4"
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
                                            onChange={(e) => setSelectedPayment(e.target.value)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* {errorShow && <Alert variant="danger">{error}</Alert>} */}
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="col-5">
                    <div className="border rounded px-3 py-5 border-0" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="text-center mb-3">
                            <div className="d-flex justify-content-center" style={{ lineHeight: "90px" }}>
                                {logo ? (
                                    <Avatar src={logo} alt="User Profile" />
                                ) : (
                                    <Avatar>{clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}</Avatar>
                                )}
                            </div>
                            <p className="mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>
                                {clubData?.clubName}
                            </p>
                            <p className="small mb-0">
                                {clubData?.clubName}
                                {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ", " : ""}
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode].filter(Boolean).join(", ")}
                            </p>
                        </div>

                        <h6 className="border-top p-2 mb-3 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>
                            Booking Summary
                        </h6>
                        <div style={{ maxHeight: "240px", overflowY: "auto", overflowX: "hidden" }}>
                            {localSelectedCourts?.length > 0 ? (
                                localSelectedCourts?.map((court, index) => (
                                    <React.Fragment key={`${index}`}>
                                        {court?.time?.map((timeSlot, timeIndex) => (
                                            <div key={`${index}-${timeIndex}`} className="row mb-2">
                                                <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                    <div className="d-flex">
                                                        <span style={{ fontWeight: "600" }}>
                                                            {court?.day ? dayMap[court.day.toLowerCase()] : ""},
                                                        </span>
                                                        <span className="ps-2" style={{ fontWeight: "600" }}>
                                                            {(() => {
                                                                if (!court?.date) return "";
                                                                const date = new Date(court.date);
                                                                const day = date.toLocaleString("en-US", { day: "2-digit" });
                                                                const month = date.toLocaleString("en-US", { month: "short" });
                                                                return `${day} ${month}`;
                                                            })()}
                                                        </span>
                                                        <span className="ps-2" style={{ fontWeight: "600" }}>
                                                            {timeSlot?.time} (60)
                                                        </span>
                                                        <span className="ps-2" style={{ fontWeight: "400" }}>
                                                            {court?.courtName}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex">
                                                        <span className="ps-2" style={{ fontWeight: "600", color: "#1A237E" }}>
                                                            ₹{timeSlot?.amount || 2000}
                                                        </span>
                                                        <button
                                                            className="btn btn-sm text-danger delete-btn ms-auto"
                                                            onClick={() => handleDeleteSlot(index, timeIndex)}
                                                        >
                                                            <i className="bi bi-trash-fill pt-1"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                <div
                                    className="d-flex justify-content-center align-items-center text-muted"
                                    style={{ height: "25vh" }}
                                >
                                    <p
                                        className="text-danger"
                                        style={{ fontSize: "15px", fontFamily: "Poppins", fontWeight: "600" }}
                                    >
                                        No court selected
                                    </p>
                                </div>
                            )}
                        </div>
                        {localTotalSlots > 0 && (
                            <div
                                className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold"
                                style={{ overflowX: "hidden" }}
                            >
                                <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to Pay</span>
                                <span style={{ fontSize: "16px", fontWeight: "600" }}>Slots {localTotalSlots}</span>
                                <span style={{ fontSize: "22px", fontWeight: "600", color: "#1A237E" }}>
                                    ₹ {localGrandTotal}
                                </span>
                            </div>
                        )}
                        {errorShow && <Alert variant="danger">{error}</Alert>}

                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={{
                                    ...buttonStyle,
                                    opacity: localSelectedCourts?.length > 0 && localTotalSlots > 0 ? 1 : 0.6,
                                    cursor:
                                        localSelectedCourts?.length > 0 && localTotalSlots > 0 ? "pointer" : "not-allowed",
                                }}
                                onClick={handlePayment}
                                className={className}
                                disabled={isLoading || localSelectedCourts?.length === 0 || localTotalSlots === 0}
                            >
                                <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3DBE64" />
                                            <stop offset="50%" stopColor="#3DBE64" />
                                            <stop offset="100%" stopColor="#3DBE64" />
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
                                    <circle cx={circleX} cy={circleY} r={circleRadius} fill="#3DBE64" />
                                    <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path
                                            d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`}
                                        />
                                        <path
                                            d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`}
                                        />
                                        <path
                                            d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`}
                                        />
                                    </g>
                                </svg>
                                <div style={contentStyle}>
                                    {bookingStatus?.bookingLoading || isLoading || userLoading?.userAuthLoading ? (
                                        <ButtonLoading />
                                    ) : (
                                        "Book Now"
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={modal} onHide={() => setModal(false)} centered>
                <div className="p-4 text-center">
                    {/* Illustration */}
                    <img
                        src={booking_success_img}
                        alt="Booking Success"
                        style={{ width: "190px", height: "190px", marginBottom: "20px" }}
                    />

                    {/* Title */}
                    <h4 className="tabel-title">Booking Successful!</h4>
                    <p className="text-dark fw-medium">Your slot has been booked successfully.</p>

                    {/* Continue Button */}
                    <Button
                        onClick={() => { setModal(false); navigate("/booking"); }}
                        className="w-100 rounded-pill border-0 text-white py-3 mt-3"
                        style={{ backgroundColor: "#3DBE64", boxShadow: "none", fontSize: "14px", fontFamily: "Poppins", fontWeight: "600" }}
                    >
                        Continue
                    </Button>

                    {/* Reminder Note */}
                    <p className="text-dark fw-medium mt-3" style={{ fontSize: "14px" }}>
                        You’ll receive a reminder before it starts.
                    </p>

                    {/* Link */}
                    <Link to="/booking-history" className="text-primary fw-semibold">
                        View Booking Details
                    </Link>
                </div>
            </Modal>
        </div>
    );
};

const PaymentWithRazorpay = (props) => <Payment {...props} />;

export default PaymentWithRazorpay;