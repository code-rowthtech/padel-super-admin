import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
import axios from "axios";

// Load Razorpay Checkout
const loadRazorpay = (callback) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = callback;
    script.onerror = () => alert("Failed to load Razorpay SDK. Please try again.");
    document.body.appendChild(script);
};

const Payment = ({ className = "" }) => {
    const location = useLocation();
    const { courtData, clubData } = location.state || {};
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [upiId, setUpiId] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [clientSecret, setClientSecret] = useState('')
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showUpiInput, setShowUpiInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const totalAmount = courtData?.time?.reduce((acc, curr) => acc + (curr.amount || 100), 0);

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
            // Create booking payload
            const selectedSlot = courtData?.slot?.[0];
            const selectedTimeArray = courtData?.time || [];
            const payload = {
                name,
                phoneNumber,
                email,
                register_club_id: clubData?._id,
                ownerId: clubData?.ownerId,
                slot: courtData?.court?.map((courtItem) => ({
                    slotId: selectedSlot?._id,
                    courtId: courtItem?.courtName,
                    bookingDate: new Date(courtData?.date).toISOString(),
                    businessHours: selectedTimeArray.map(() => ({
                        time: "6:00 AM To 10:00 PM",
                        day: courtData?.day || "Monday",
                    })),
                    slotTimes: courtData?.time?.map((timeSlot) => ({
                        time: timeSlot?.time,
                        amount: timeSlot?.amount,
                    })) || [],
                })),
            };

            // Dispatch booking creation
            dispatch(createBooking(payload));

            // Call backend to create Razorpay order
            const response = await axios.post("http://103.185.212.117:7600/api/booking/createPaymentIntent", {
                amount: totalAmount * 100, // Amount in paise
                currency: "inr",
            });

            console.log("API Response:", response.data); // Debug API response

            const { paymentIntentId, clientSecret } = response.data?.data;
            if (!paymentIntentId && !clientSecret) {
                throw new Error("Invalid response from server: paymentIntentId missing.");
            }

            setPaymentId(paymentIntentId);
            setClientSecret(clientSecret)

            if (selectedPayment === "google") {
                setShowUpiInput(true); // Show UPI ID input for Google Pay
            } else if (selectedPayment === "apple") {
                // Placeholder for Apple Pay (requires server-side setup)
                setError("Apple Pay is not fully implemented. Contact support.");
            }
        } catch (err) {
            console.error("Payment Error:", err);
            setError(err.message || "An error occurred during payment processing.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpiPayment = async () => {
        if (!upiId) {
            setError("Please enter a UPI ID.");
            return;
        }

        // Basic UPI ID validation
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(upiId)) {
            setError("Invalid UPI ID format. Use format like example@upi.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            loadRazorpay(() => {
                const options = {
                    key: 'pk_test_51PR7yyRtiTZeMEJoLz3SgGSzOcHhYPpA0qpyBVbfbmmwOtvmiFNYioR5LvfJcF6FXGczVzTsIOA37UqPIxlLE8yk00TNpSPiJe',
                    amount: totalAmount || 100,
                    currency: 'INR',
                    name: "padel fe",
                    description: "payment to padel fe",
                    image: "https://papayacoders.com/demo.png",
                    order_id: paymentId, // Added order_id from handlePayment
                    handler: function (response) {
                        setSuccess(true);
                        console.log("Payment Success:", response);
                    },
                    prefill: {
                        name: "padel fe",
                        email: "padelfe@gmail.com"
                    },
                    theme: {
                        color: "#F4C430"
                    },
                    payment_method: {
                        upi: {
                            vpa: upiId // Added UPI configuration
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setError("Payment was cancelled.");
                            setIsLoading(false);
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (response) {
                    console.error("Payment Failed:", response.error);
                    setError(response.error.description || "Payment failed. Please try again.");
                    setIsLoading(false);
                });
                paymentObject.open();
            });
        } catch (err) {
            console.error("UPI Payment Error:", err);
            setError(err.message || "An error occurred during UPI payment.");
            setIsLoading(false);
        }
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
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        style={{ boxShadow: "none" }}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="col-md-4 mb-3 p-1">
                                    <label className="form-label">Phone No *</label>
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
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="form-control border-0 p-2"
                                            placeholder="91+"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3 p-1">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        style={{ boxShadow: "none" }}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your email"
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

                            {/* UPI ID Input for Google Pay */}
                            {showUpiInput && selectedPayment === "google" && (
                                <div className="mt-4">
                                    <label className="form-label">UPI ID *</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="form-control border-0 p-2"
                                        placeholder="Enter your UPI ID (e.g., example@upi)"
                                    />
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={handleUpiPayment}
                                        disabled={!upiId || isLoading}
                                    >
                                        {isLoading ? "Processing..." : "Confirm UPI Payment"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Error and Success Messages */}
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                        {success && (
                            <div className="alert alert-success mt-3">
                                Payment successful! Payment ID: {paymentId}
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="col-5">
                    <div className="border rounded px-3 py-5 border-0" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="text-center mb-3">
                            <div
                                className="rounded-circle bg-white mx-auto mb-2 shadow"
                                style={{ width: "90px", height: "90px", lineHeight: "90px" }}
                            >
                                <img src="https://via.placeholder.com/80" width={80} alt="Club Logo" />
                            </div>
                            <p className="mt-4 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>
                                {clubData?.clubName}
                            </p>
                            <p className="small mb-0">
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        </div>

                        <h6 className="border-top p-2 mb-3 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>
                            Booking Summary
                        </h6>
                        <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                            {/* Add booking summary details here */}
                        </div>

                        <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to pay</span>
                            <span className="text-primary">₹ {totalAmount}</span>
                        </div>

                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={buttonStyle}
                                onClick={handlePayment}
                                className={className}
                                disabled={!selectedPayment || isLoading}
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
                                <div style={contentStyle}>{isLoading ? "Processing..." : "Book Now"}</div>
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