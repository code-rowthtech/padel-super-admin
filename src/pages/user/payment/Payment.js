import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
import { getUserProfile, loginUserNumber, updateUser } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Button, Modal } from "react-bootstrap";
import { booking_logo_img, success2 } from "../../../assets/files";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdOutlineDeleteOutline } from "react-icons/md";


const Payment = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courtData, clubData, selectedCourts, grandTotal, totalSlots } = location.state || {};
  const user = getUserFromSession();
  const store = useSelector((state) => state?.userAuth);

  const bookingStatus = useSelector((state) => state?.userBooking);
  const userLoading = useSelector((state) => state?.userAuth);
  const logo = clubData?.logo;
  const updateName = JSON.parse(localStorage.getItem("updateprofile"));
  const [name, setName] = useState(user?.name || updateName?.fullName || store?.user?.response?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(
    updateName?.phone || user?.phoneNumber || updateName?.phone ? `+91 ${user.phoneNumber}` : ""
  );
  const [email, setEmail] = useState(updateName?.email || user?.email || store?.user?.response?.email || "");
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    paymentMethod: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const dispatch = useDispatch();
  const [localSelectedCourts, setLocalSelectedCourts] = useState(selectedCourts || []);
  const [localGrandTotal, setLocalGrandTotal] = useState(grandTotal || 0);
  const [localTotalSlots, setLocalTotalSlots] = useState(totalSlots || 0);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleDeleteSlot = (e, courtId, date, timeId) => {
    e.stopPropagation();
    setLocalSelectedCourts((prev) =>
      prev
        .map((court) =>
          court._id === courtId && court.date === date
            ? { ...court, time: court.time.filter((t) => t._id !== timeId) }
            : court
        )
        .filter((court) => court.time.length > 0)
    );

    // If no courts remain, navigate back to booking
    if (localSelectedCourts.length === 1 && localSelectedCourts[0].time.length === 1) {
      setTimeout(() => navigate("/booking"), 100);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Payment handle function with comprehensive error handling
  const handlePayment = async () => {
    try {
      const rawPhoneNumber = phoneNumber.replace(/^\+91\s/, "").trim();

      // Enhanced validation
      const newErrors = {
        name: !name.trim() 
          ? "Name is required" 
          : name.trim().length < 2 
            ? "Name must be at least 2 characters" 
            : "",
        phoneNumber: !rawPhoneNumber
          ? "Phone number is required"
          : !/^[6-9]\d{9}$/.test(rawPhoneNumber)
            ? "Invalid phone number format"
            : "",
        email: email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
          ? "Invalid email format"
          : "",
      };

      setErrors(newErrors);
      if (Object.values(newErrors).some((e) => e)) return;
      
      if (localTotalSlots === 0) {
        setErrors((prev) => ({ ...prev, general: "Please select at least one slot" }));
        return;
      }

      if (localGrandTotal <= 0) {
        setErrors((prev) => ({ ...prev, general: "Invalid payment amount" }));
        return;
      }

      setIsLoading(true);
      setErrors({ name: "", phoneNumber: "", email: "", paymentMethod: "", general: "" });

      const register_club_id = localStorage.getItem("register_club_id");
      const owner_id = localStorage.getItem("owner_id");

      if (!register_club_id || !owner_id) {
        throw new Error("Club information missing.");
      }

      // Prepare slot array
      const slotArray = localSelectedCourts.flatMap((court) =>
        court.time.map((timeSlot) => ({
          slotId: timeSlot._id,
          businessHours: courtData?.slot?.[0]?.businessHours?.map((t) => ({
            time: t?.time,
            day: t?.day,
          })) || [{ time: "6:00 AM To 11:00 PM", day: "Monday" }],
          slotTimes: [{ time: timeSlot.time, amount: timeSlot.amount ?? 2000 }],
          courtName: court.courtName,
          courtId: court._id,
          bookingDate: court.date,
        }))
      );

      const basePayload = {
        name: name.trim(),
        phoneNumber: rawPhoneNumber,
        email: email.trim(),
        register_club_id,
        bookingStatus: "upcoming",
        bookingType: "regular",
        ownerId: owner_id,
        slot: slotArray,
        paymentMethod: 'razorpay',
      };

      // First: Login if needed
      if (!user?.name && !user?.phoneNumber) {
        await dispatch(
          updateUser({
            phoneNumber: rawPhoneNumber,
            name: name.trim(),
            email: email.trim(),
          })
        ).unwrap();
      }

      const initialBookingResponse = await dispatch(createBooking({
        ...basePayload,
        initiatePayment: true
      })).unwrap();

      if (initialBookingResponse?.paymentDetails?.key || initialBookingResponse?.paymentDetails?.orderId) {
        const options = {
          key: initialBookingResponse?.paymentDetails?.key || "rzp_test_RqcQk54KN54oc3",
          order_id: initialBookingResponse?.paymentDetails?.orderId,
          amount: localGrandTotal * 100,
          currency: "INR",
          name: clubData?.clubName || "Court Booking",
          description: localTotalSlots > 1 ? `${localTotalSlots} Slots` : "1 Slot",
          image: logo || undefined,
          prefill: { name: name.trim(), email: email.trim(), contact: rawPhoneNumber },
          theme: { color: "#001B76" },

          handler: async function (response) {
            try {
              const finalBookingResponse = await dispatch(createBooking({
                ...basePayload,
                initiatePayment: false,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })).unwrap();

              if (finalBookingResponse?.success || finalBookingResponse?.message?.includes("created")) {
                setLocalSelectedCourts([]);
                setModal(true);
                dispatch(getUserProfile());
              } else {
                throw new Error(finalBookingResponse?.message || "Booking confirmation failed");
              }
            } catch (err) {
              console.error(err);
              setErrors((prev) => ({ ...prev, general: "Booking confirmation failed" }));
            } finally {
              setIsLoading(false);
            }
          },

          modal: {
            ondismiss: () => {
              setIsLoading(false);
              setErrors((prev) => ({ ...prev, general: "Payment cancelled by user" }));
            },
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
          setErrors((prev) => ({
            ...prev,
            general: response.error?.description || "Payment failed",
          }));
          setIsLoading(false);
        });

        razorpay.open();
      } else {
        throw new Error("Payment initialization failed");
      }

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "Payment failed. Please try again.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
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
    <div className="container mt-lg-4 mb-3 mb-md-0 px-0 px-md-0">
      <div className="row g-4 mx-auto d-flex align-items-center justify-content-center">
        <div className="col-12 col-lg-5 mobile-payment-content px-0">
          <div className="bg-white rounded">
            {/* Info Section */}
            <div
              className="rounded-4 py-md-4 py-2 pb-3 pb-lg-1 px-3 px-md-5 h-100 mb-md-4 mb-3"
              style={{
                // backgroundColor: "#F5F5F566",
                border: errors.name || errors.email || errors.phoneNumber ? "2px solid red" : "none"
              }}
            >
              <div className="row d-flex justify-content-center align-tems-center mx-auto">
                <h6 className="mb-md-3 mb-0 mt-3 mt-lg-0 custom-heading-use fw-semibold text-center text-md-start ps-1">Information</h6>

                <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                  <label className="form-label mb-0 ps-lg-0" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
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
                    className="form-control p-2"
                    placeholder="Enter your name"
                    aria-label="Name"
                  />
                  {errors.name && (
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                  <label className="form-label mb-0 ps-lg-0" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
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
                      className="form-control p-2"
                      placeholder="+91"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0 ">
                  <label className="form-label mb-0 ps-lg-0" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                    Email
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
                    className="form-control p-2"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-payment-summary">
          <div
            className="border w-100 px-0 pt-1 pb-3 border-0 mobile-summary-container small-curve-wrapper d-flex flex-column"
            style={{
              height: "62vh",
              borderRadius: "10px 30% 10px 10px",
              background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
              position: "relative",
            }}
          >
            {/* mobile small curve arrow */}
            {localTotalSlots > 0 && (
              <div
                className="small-curve-arrow d-lg-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {!isExpanded ? (
                  <MdKeyboardArrowUp
                    size={25}
                    color="white"
                    className="arrow-shake-infinite"
                  />
                ) : (
                  <MdKeyboardArrowDown
                    size={25}
                    color="white"
                    className="arrow-shake-infinite"
                  />
                )}
              </div>
            )}

            <style>{`
    .small-curve-arrow {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      background: #0b39d7;
      width: 49px;
      height: 27px;
      border-radius: 20px 20px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 2px;
      cursor: pointer;
    }
  `}</style>

            {/* Desktop Logo & Address */}
            <div className="d-flex my-4 position-relative d-none d-lg-flex">
              <img src={booking_logo_img} className="booking-logo-img" alt="" />

              <div className="text-center ps-2 pe-0 mt-3" style={{ maxWidth: "200px" }}>
                <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>
                  {clubData?.clubName}
                </p>
                <p
                  className="mt-2 mb-1 text-white"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    fontFamily: "Poppins",
                    lineHeight: "1.3",
                  }}
                >
                  {clubData?.address} <br /> {clubData?.zipCode}
                </p>
              </div>

              <div className="position-absolute" style={{ top: "11px", left: "17.1%" }}>
                {logo ? (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "#f9f9f9",
                      boxShadow: "0px 4px 11px #0000002e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img src={logo} alt="Club" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "120px",
                      height: "120px",
                      backgroundColor: "#374151",
                      border: "2px solid white",
                      fontSize: "24px",
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    {clubData?.clubName?.charAt(0).toUpperCase() || "Logo"}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Booking Summary Title */}
            <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center d-none d-lg-flex">
              <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">
                Booking Summary{localTotalSlots > 0 ? ` (${localTotalSlots} Slot selected)` : ''}
              </h6>
            </div>

            {/* Desktop Slots Scroll */}
            <div className="px-3" style={{ maxHeight: "200px", overflowY: "auto", overflowX: "hidden", paddingRight: "16px" }}>
              <style>{`
      div::-webkit-scrollbar {
        width: 8px;
        border-radius: 3px;
      }
      div::-webkit-scrollbar-thumb {
        background: #626262;
      }
    `}</style>

              <div className="d-none d-lg-block">
                {localSelectedCourts?.length > 0 ? (
                  localSelectedCourts?.map((court, idx) =>
                    court?.time?.map((slot, i) => (
                      <div key={`${idx}-${i}`} className="row mb-2">
                        <div className="col-12 d-flex justify-content-between align-items-center text-white">
                          <div className="d-flex">
                            <span style={{ fontSize: "14px", fontWeight: "600" }}>
                              {new Date(court.date).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                            <span className="ps-1" style={{ fontSize: "14px", fontWeight: "600" }}>
                              {formatTime(slot.time)}
                            </span>
                            <span className="ps-2" style={{ fontSize: "14px", fontWeight: "500" }}>
                              {court.courtName}
                            </span>
                          </div>

                          <div>
                            ₹
                            <span className="ps-0" style={{ fontWeight: "600", fontSize: "14px" }}>
                              {slot?.amount ? Number(slot?.amount).toLocaleString("en-IN") : 0}
                            </span>
                            <MdOutlineDeleteOutline
                              className="ms-1 mt-1 mb-1"
                              size={15}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => handleDeleteSlot(e, court._id, court.date, slot._id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center text-white" style={{ height: "25vh" }}>
                    <p>No slot selected</p>
                  </div>
                )}
              </div>

              {/* MOBILE Slots */}
              <div className="d-lg-none px-0 mobile-slots-container">
                <div
                  className={`mobile-expanded-slots ${isExpanded ? "expanded border-bottom" : ""}`}
                  style={{
                    maxHeight: isExpanded ? (localTotalSlots > 2 ? "155px" : "200px") : "0",
                    overflowY: isExpanded && localTotalSlots > 2 ? "auto" : "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  {isExpanded && (
                    <h6
                      className="mb-0 pb-1 text-white fw-semibold pt-2"
                      style={{ fontSize: "15px" }}
                    >
                      Order Summary :
                    </h6>
                  )}
                  <style>{` .mobile-expanded-slots.expanded::-webkit-scrollbar {
                                width: 6px;} `}
                  </style>

                  {isExpanded && localSelectedCourts?.map((court, cIdx) =>
                    court.time.map((slot, sIdx) => (
                      <div key={`${cIdx}-${sIdx}`} className="row mb-1 text-white">
                        <div className="col-12 d-flex justify-content-between align-items-center">
                          <div className="d-flex">
                            <span style={{ fontSize: "11px", fontWeight: "600" }}>
                              {new Date(court.date).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                            <span className="ps-1" style={{ fontSize: "11px", fontWeight: "600" }}>
                              {formatTime(slot.time)}
                            </span>
                            <span className="ps-1" style={{ fontSize: "10px", fontWeight: "500" }}>
                              {court.courtName}
                            </span>
                          </div>

                          <div className="d-flex align-items-center">
                            <span style={{ fontSize: "11px", fontWeight: "600" }}>₹ {slot.amount}</span>
                            <MdOutlineDeleteOutline
                              className="ms-1"
                              style={{ fontSize: "14px", cursor: "pointer" }}
                              onClick={(e) => handleDeleteSlot(e, court._id, court.date, slot._id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Total Section */}
            {/* {localTotalSlots > 0 && (
              <>
                <div className="d-lg-none py-0 pt-1">
                  <div
                    className="d-flex justify-content-between align-items-center px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <span className="text-white" style={{ fontSize: "14px", fontWeight: "500" }}>
                        Total to Pay
                      </span>
                      <span className="d-block text-white" style={{ fontSize: "12px" }}>
                        Total Slots: {localTotalSlots}
                      </span>
                    </div>

                    <span className="text-white" style={{ fontSize: "20px", fontWeight: "600" }}>
                      ₹{localGrandTotal}
                    </span>
                  </div>
                </div>
              </>
            )} */}
            {localTotalSlots > 0 && (
              <>
                <div className="d-lg-none py-0 pt-1">
                  <div
                    className="d-flex justify-content-between align-items-center px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex flex-column">
                      <span
                        className="text-white"
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                        }}
                      >
                        Total to Pay
                      </span>
                      <span
                        className="text-white"
                        style={{
                          fontSize: "12px",
                          color: "#e5e7eb",
                          fontFamily: "Poppins",
                        }}
                      >
                        Total Slot: {localTotalSlots}
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-white"
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          fontFamily: "Poppins",
                        }}
                      >
                        ₹{Number(localGrandTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold mobile-total-section d-none d-lg-flex">
                  <p
                    className="d-flex flex-column mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Total to Pay{" "}
                    {/* <span style={{ fontSize: "13px", fontWeight: "500" }}>
                        Total slots {localTotalSlots}
                      </span> */}
                  </p>
                  <p
                    className="mb-0"
                    style={{ fontSize: "25px", fontWeight: "600" }}
                  >
                    ₹{Number(localGrandTotal).toLocaleString('en-IN')}
                  </p>
                </div>
              </>
            )}

            {/* Book Button */}
            <div className="mt-auto d-flex justify-content-center align-items-center px-3 pb-2">
              <button
                style={{
                  ...buttonStyle,
                  opacity: localTotalSlots === 0 ? 0.5 : 1,
                  cursor: localTotalSlots === 0 ? "not-allowed" : "pointer",
                  pointerEvents: localTotalSlots === 0 ? "none" : "auto",
                }}
                className={`${className} `}
                disabled={localTotalSlots === 0}
                onClick={handlePayment}
              >
                <svg
                  style={svgStyle}
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={`buttonGradient-${width}-${height}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#fff" />
                      <stop offset="50%" stopColor="#fff" />
                      <stop offset="100%" stopColor="#fff" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79
                      } ${height * 0.15} ${width * 0.81} ${height * 0.2} ${width * 0.83
                      } ${height * 0.3} C ${width * 0.83} ${height * 0.32} ${width * 0.84
                      } ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85
                      } ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86
                      } ${height * 0.3} C ${width * 0.88} ${height * 0.2} ${width * 0.9
                      } ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97
                      } ${height * 0.15} ${width * 0.996} ${height * 0.3} ${width * 0.996
                      } ${height * 0.5} C ${width * 0.996} ${height * 0.7} ${width * 0.97
                      } ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.9
                      } ${height * 0.85} ${width * 0.88} ${height * 0.8} ${width * 0.86
                      } ${height * 0.7} C ${width * 0.86} ${height * 0.68} ${width * 0.85
                      } ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84
                      } ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83
                      } ${height * 0.7} C ${width * 0.81} ${height * 0.8} ${width * 0.79
                      } ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08
                      } ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004
                      } ${height * 0.7} ${width * 0.004} ${height * 0.5} C ${width * 0.004
                      } ${height * 0.3} ${width * 0.04} ${height * 0.15} ${width * 0.08
                      } ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`}
                    fill={`url(#buttonGradient-${width}-${height})`}
                  />
                  <circle
                    cx={circleX}
                    cy={circleY}
                    r={circleRadius}
                    fill="#001B76"
                  />
                  <g
                    stroke="white"
                    strokeWidth={height * 0.03}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="book-now-arrow"
                    style={{
                      transformOrigin: `${arrowX}px ${arrowY}px`,
                      transition: "transform 0.3s ease"
                    }}
                  >
                    <path
                      d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4
                        } L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                        }`}
                    />
                    <path
                      d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                        } L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4
                        }`}
                    />
                    <path
                      d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                        } L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1
                        }`}
                    />
                  </g>
                </svg>
                <div style={contentStyle}>  {bookingStatus?.bookingLoading ? <ButtonLoading color="#001B76" /> : "Pay Now"}</div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      <Modal show={modal} centered>
        <div className="p-4 pt-0 text-center">
          <img src={success2} alt="Booking Success" className="img-fluid mx-auto" style={{ width: "294px", height: "254px" }} />
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

    </div>
  );
};

const PaymentWithRazorpay = (props) => <Payment {...props} />;

export default PaymentWithRazorpay;