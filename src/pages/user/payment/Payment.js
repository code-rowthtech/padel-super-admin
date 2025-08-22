import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
import axios from "axios";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { loginUserNumber } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";

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
    const { courtData, clubData, seletctedCourt } = location.state || {};
    const user = getUserFromSession()
    const store = useSelector((state) => state?.userAuth)
    const bookingStatus = useSelector((state) => state?.userBooking)
    const userLoading = useSelector((state) => state?.userAuth)
    const logo = JSON.parse(localStorage.getItem("logo"));
    const [name, setName] = useState(user?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ? String(user.phoneNumber) : "");
    const [email, setEmail] = useState(user?.email || "");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [selectedCourts, setSelectedCourts] = useState([]);
    const isFormValid = name.trim() && phoneNumber.trim().length === 10 && email.trim() && selectedPayment;

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
    const handlePayment = async () => {
        if (!name || !phoneNumber || !email || !selectedPayment) {
            setError("Please fill in all required fields and select a payment method.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const register_club_id = localStorage.getItem('register_club_id');
            const selectedTimeArray = courtData?.time || [];
            const bookingDate = courtData?.date;
            const courtName = courtData?.court?.[0]?.courtName;
            const slotTimesData = courtData?.slot?.[0]?.slotTimes || [];

            const slotArray = selectedTimeArray?.map((timeSlot) => {
                const matchingSlot = slotTimesData.find(slot => slot.time === timeSlot.time);
                return {
                    slotId: matchingSlot?._id || courtData?.slot?.[0]?._id,
                    businessHours: courtData?.slot?.[0]?.businessHours?.map(t => ({
                        time: t?.time,
                        day: t?.day
                    })) || [{
                        time: "6:00 AM To 11:00 PM",
                        day: "Monday"
                    }],
                    slotTimes: [{
                        time: timeSlot?.time,
                        amount: timeSlot?.amount ?? 2000
                    }],
                    courtName: courtName,
                    courtId: courtData?.court?.[0]?._id,
                    bookingDate: bookingDate
                };
            });

            const payload = {
                name,
                phoneNumber,
                email,
                register_club_id,
                bookingStatus:"upcoming",
                ownerId: clubData?.ownerId,
                slot: slotArray
            };

            dispatch(createBooking(payload)).unwrap().then(() => {
                if (user?.token && user?.name) {
                    navigate('/booking-history');
                } else {
                    dispatch(loginUserNumber({ phoneNumber: phoneNumber,name:name,email:email }));
                    navigate('/booking-history');
                }
            });
            // http://103.185.212.117:7600/api/booking/createOrde

            // const response = await axios.post("", {
            //     amount: totalAmount || 100,
            //     currency: "INR",
            // }, {
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            // });

            // console.log("API Response:", response.data);

            // const { id } = response.data || {};
            // if (!id) {
            //     throw new Error("Invalid response from server: paymentIntentId or clientSecret missing.");
            // }

            // setPaymentId(id);

            // loadRazorpay(() => {
            //     const options = {
            //         key: 'rzp_test_c5wVsgpbPYa9uX',
            //         amount: totalAmount || 100,
            //         currency: 'INR',
            //         name: "padel fe",
            //         description: "payment to padel fe",
            //         image: "https://papayacoders.com/demo.png",
            //         order_id: paymentId,
            //         handler: async function (response) {
            //             const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
            //             // await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
            //         },
            //         prefill: {
            //             name: "padel fe",
            //             email: "padelfe@gmail.com",
            //             contact: phoneNumber
            //         },
            //         theme: {
            //             color: "#F4C430"
            //         },
            //         modal: {
            //             ondismiss: function () {
            //                 setError("Payment was cancelled.");
            //                 setIsLoading(false);
            //             }
            //         },
            //         payment_method: {
            //             upi: selectedPayment === "google" ? true : null,
            //             card: selectedPayment === "card" ? true : null,
            //             wallet: selectedPayment === "google" || selectedPayment === "apple" ? true : null
            //         }
            //     };

            //     const paymentObject = new window.Razorpay(options);
            //     paymentObject.on('payment.failed', function (response) {
            //         console.error("Payment Failed:", response.error);
            //         setError(response.error.description || "Payment failed. Please try again.");
            //         setIsLoading(false);
            //     });
            //     paymentObject.open();
            // });
        } catch (err) {
            console.error("Payment Error:", err);
            setError(err.message || "An error occurred during payment processing.");
        } finally {
            setIsLoading(false);
        }


    };

    // const verifyPayment = async (order_id, payment_id, signature) => {
    //     try {
    //         const response = await axios.post("http://103.185.212.117:7600/api/booking/verify-payment", {
    //             order_id,
    //             payment_id,
    //             signature,
    //         }, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         });

    //         if (response.data.success) {
    //             setSuccess(true);
    //             console.log("Payment Verified:", response.data);
    //         } else {
    //             throw new Error(response.data.message || "Payment verification failed.");
    //         }
    //     } catch (err) {
    //         console.error("Verification Error:", err);
    //         setError(err.message || "An error occurred during payment verification.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    useEffect(() => {
        if (!courtData) return;
        setSelectedCourts(seletctedCourt);
    }, [courtData]);

    // const handleDelete = (index) => {
    //     const updatedCourts = [...selectedCourts];
    //     updatedCourts.splice(index, 1);
    //     setSelectedCourts(updatedCourts);
    // };

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
                                    <label className="form-label">Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        value={name}
                                        style={{ boxShadow: "none" }}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your name"
                                        disabled={user?.name}
                                    />
                                </div>
                                <div className="col-md-4 mb-3 p-1">
                                    <label className="form-label">Phone No <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text border-0 p-2">
                                            <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                        </span>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            minLength={10}
                                            value={phoneNumber}
                                            style={{ boxShadow: "none" }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || /^[6-9][0-9]{0,9}$/.test(value)) {
                                                    setPhoneNumber(value);
                                                }
                                            }}
                                            className="form-control border-0 p-2"
                                            placeholder="91+"
                                            pattern="[6-9][0-9]{9}"
                                            title="Phone number must be 10 digits and start with 6, 7, 8, or 9"
                                            disabled={user?.phoneNumber}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3 p-1">
                                    <label className="form-label">Email <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        value={email}
                                        style={{ boxShadow: "none" }}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                    { id: "google", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                    { id: "apple", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                                    { id: "paypal", name: "Paypal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
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
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSelectedPayment(value);
                                            }}

                                        />
                                    </label>
                                ))}
                            </div>

                        </div>

                        {/* Error and Success Messages */}
                        {/* {error && <div className="alert alert-danger mt-3">{error}</div>}
                        {success && (
                            <div className="alert alert-success mt-3">
                                Payment successful! Payment ID: {paymentId}
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="col-5">
                    <div className="border rounded px-3 py-5 border-0" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="text-center mb-3">
                            <div className="d-flex justify-content-center " style={{ lineHeight: '90px' }}>
                                {logo ?
                                    <Avatar src={logo} alt="User Profile" /> :
                                    <Avatar>
                                        {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                    </Avatar>
                                }
                            </div>
                            <p className=" mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>{clubData?.clubName}</p>
                            <p className="small mb-0"> {clubData?.clubName}
                                {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}  </p>
                        </div>

                        <h6 className="border-top p-2 mb-3 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>
                            Booking Summary
                        </h6>
                        <div style={{ maxHeight: "240px" }}>
                            {selectedCourts.length > 0 ? (
                                selectedCourts.map((court, index) => (
                                    <div key={index}>
                                        <div className="row  mb-3">
                                            <div className="col-5">
                                                <div>
                                                    <span style={{ fontWeight: "600" }}>{court?.courtName}</span>
                                                </div>
                                                <span style={{ fontWeight: "500" }}>
                                                    {(() => {
                                                        const date = new Date(court.date);
                                                        const day = date.toLocaleString('en-US', { day: '2-digit' });
                                                        const month = date.toLocaleString('en-US', { month: 'short' });
                                                        return `${day} ${month}`;
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="col-7 d-flex justify-content-end gap-2">
                                                {/* <button
                                                    className="btn btn-sm text-danger delete-btn"
                                                    onClick={() => handleDelete(index)}
                                                >
                                                    <i className="bi bi-trash-fill pt-1"></i>
                                                </button> */}
                                                <div className="d-flex justify-conent-end align-items-center" >
                                                    <span className="mb-1">
                                                        {court.time.length > 0
                                                            ? court.time.map((t, i) => (
                                                                <span key={i} style={{ marginRight: "10px" }}>
                                                                    {t.time}
                                                                    {i < court.time.length - 1 ? " | " : ""}
                                                                </span>
                                                            ))
                                                            : <span >No time selected</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {court.time.length > 0 && (
                                            <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold" style={{ overflowX: "hidden" }}>
                                                <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to Pay</span>
                                                {court.time && <span style={{ fontSize: "16px", fontWeight: "600" }}>Slots {court.time.length}</span>}
                                                <span style={{ fontSize: "22px", fontWeight: "600", color: "#1A237E" }}>
                                                    ₹ {court.time.reduce((total, t) => total + Number(t.amount || 0), 0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted">No court selected</div>
                            )}
                        </div>

                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={{
                                    ...buttonStyle,
                                    opacity: isFormValid && selectedCourts.length > 0 ? 1 : 0.6,
                                    cursor: isFormValid && selectedCourts.length > 0 ? "pointer" : "not-allowed"
                                }}
                                onClick={handlePayment}
                                className={className}
                                disabled={!isFormValid || isLoading || selectedCourts.length === 0}
                            >
                                <svg
                                    style={svgStyle}
                                    viewBox={`0 0 ${width} ${height}`}
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3DBE64" />
                                            <stop offset="50%" stopColor="#1F41BB" />
                                            <stop offset="100%" stopColor="#1F41BB" />
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
                                        <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                    </g>
                                </svg>
                                <div style={contentStyle}>{bookingStatus?.bookingLoading || isLoading || userLoading?.userAuthLoading ? <ButtonLoading /> : "Book Now"}</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentWithRazorpay = (props) => <Payment {...props} />;

export default PaymentWithRazorpay;
