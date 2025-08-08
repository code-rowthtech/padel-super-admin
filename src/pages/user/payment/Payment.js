import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
import axios from "axios";
import { logo } from '../../../assets/files';


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
    const { courtData, clubData } = location.state || {};
    console.log(courtData, 'clubData');
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [selectedCourts, setSelectedCourts] = useState([]);
console.log({selectedCourts});
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
            // dispatch(createBooking(payload));

            // Call backend to create Razorpay order with provided API and keys
            const response = await axios.post("http://103.185.212.117:7600/api/booking/createOrder", {
                amount: totalAmount * 100, // Amount in paise
                currency: "INR",
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("API Response:", response.data); // Debug API response

            const { id } = response.data || {};
            if (!id) {
                throw new Error("Invalid response from server: paymentIntentId or clientSecret missing.");
            }

            setPaymentId(id);

            loadRazorpay(() => {
                const options = {
                    key: 'rzp_test_c5wVsgpbPYa9uX',
                    amount: totalAmount * 100,
                    currency: 'INR',
                    name: "padel fe",
                    description: "payment to padel fe",
                    image: "https://papayacoders.com/demo.png",
                    order_id: paymentId,
                    handler: async function (response) {
                        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
                        await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
                    },
                    prefill: {
                        name: "padel fe",
                        email: "padelfe@gmail.com",
                        contact: phoneNumber
                    },
                    theme: {
                        color: "#F4C430"
                    },
                    modal: {
                        ondismiss: function () {
                            setError("Payment was cancelled.");
                            setIsLoading(false);
                        }
                    },
                    payment_method: {
                        upi: selectedPayment === "google" ? true : null,
                        card: selectedPayment === "card" ? true : null,
                        wallet: selectedPayment === "google" || selectedPayment === "apple" ? true : null
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
            console.error("Payment Error:", err);
            setError(err.message || "An error occurred during payment processing.");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyPayment = async (order_id, payment_id, signature) => {
        try {
            const response = await axios.post("http://103.185.212.117:7600/api/booking/verify-payment", {
                order_id,
                payment_id,
                signature,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.success) {
                setSuccess(true);
                console.log("Payment Verified:", response.data);
            } else {
                throw new Error(response.data.message || "Payment verification failed.");
            }
        } catch (err) {
            console.error("Verification Error:", err);
            setError(err.message || "An error occurred during payment verification.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!courtData) return;

        const formattedData = courtData?.time?.map((timeSlot) => ({
            date: courtData.date,
            day: courtData.day,
            time: timeSlot.time,
            price: timeSlot.amount || 1000, // fallback to 1000 if amount is 0 or undefined
            court: courtData.court?.[0]?.name || 'Court'
        }));
        console.log({formattedData});

        setSelectedCourts(formattedData);
    }, [courtData]);

    const handleDelete = (index) => {
        const updatedCourts = [...selectedCourts];
        updatedCourts.splice(index, 1);
        setSelectedCourts(updatedCourts);
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
                                <img src={logo} width={80} alt="Club Logo" />
                            </div>
                            <p className=" mt-4 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>{clubData?.clubName}</p>
                            <p className="small mb-0"> {clubData?.clubName}
                                {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}  </p>
                        </div>

                        <h6 className="border-top p-2 mb-3 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>
                            Booking Summary
                        </h6>
                        <div
                            style={{
                                maxHeight: "240px",
                                overflowY: "auto",
                            }}
                        >
                            {selectedCourts?.map((court, index) => (
                                <div key={index} className="court-row d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <span >
                                            <b>
                                            {new Date(court.date).toLocaleDateString("en-GB", {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "short",
                                            })}
                                            , {court.time} (60m)</b> Court {index + 1}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            className="btn btn-sm text-danger delete-btn"
                                            onClick={() => handleDelete(index)}
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                        <div>₹ {court.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to pay</span>
                            <span className="" style={{fontSize: "22px", fontWeight: "600",color:"#1A237E"}}>
                                ₹ {selectedCourts?.reduce((acc, cur) => acc + cur.price, 0)}
                            </span>
                        </div>


                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={buttonStyle}
                                onClick={handlePayment}
                                className={className}
                                disabled={!selectedPayment || (selectedPayment === "google") || isLoading}
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