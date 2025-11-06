import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { booking_success_img, complete_img, modalSuccess } from "../../../../assets/files";
import { addReviewClub } from "../../../../redux/user/club/thunk";
import { useDispatch, useSelector } from "react-redux";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { formatDate } from "../../../../helpers/Formatting";
import { getBooking } from "../../../../redux/user/booking/thunk";
import { format, isValid } from "date-fns";
import { showError, showInfo } from "../../../../helpers/Toast";

export const BookingRatingModal = ({ show, activeTab, currentPage, tableData, onHide, initialRating, defaultMessage }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [review, setReview] = useState("");
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const addReviewLoading = store?.userClub?.reviewLoading;
    const hasReview = !!tableData?.booking?.customerReview;
    const safeFormatDate = (dateValue, formatString = "dd/MM/yyyy", fallback = "N/A") => {
        if (!dateValue) return fallback;
        const date = new Date(dateValue);
        return isValid(date) ? format(date, formatString) : fallback;
    };
    useEffect(() => {
        if (show) {
            if (hasReview) {
                setRating(tableData?.booking?.customerReview?.reviewRating || 0);
                setReview(tableData?.booking?.customerReview?.reviewComment || "");
            } else {
                setRating(initialRating || 0);
                setReview(defaultMessage || "");
            }
        }
    }, [show, hasReview, tableData?.booking?.customerReview, initialRating, defaultMessage]);

    const handleSubmit = () => {
        if (hasReview) return;

        if (rating === 0) {
            showInfo("Please rate the court before submitting!");
            return;
        }

        if (!review.trim()) {
            showInfo("Please write a short message before submitting!");
            return;
        }

        const club_id = localStorage.getItem("register_club_id");
        const payload = {
            reviewComment: review.trim(),
            reviewRating: rating,
            register_club_id: club_id,
            bookingId: tableData?.booking?._id,
        };

        dispatch(addReviewClub(payload))
            .unwrap()
            .then(() => {
                setRating(0);
                setReview("");
                onHide();
                dispatch(getBooking({ type: activeTab === 'all' ? '' : activeTab, page: currentPage, limit: 20 }));
            });
    };


    const handleClick = (value) => {
        if (!hasReview) setRating(value);
    };

    const getRatingLabel = (currentRating) => {
        if (currentRating >= 4.5) return "Excellent";
        if (currentRating >= 3.5) return "Very Good";
        if (currentRating >= 2.5) return "Good";
        if (currentRating >= 1.5) return "Average";
        if (currentRating >= 0.5) return "Poor";
        return "Not Rated";
    };

    const renderStars = () => {
        return (
            <div className="d-flex align-items-center justify-content-center gap-2  fs-5">
                {[...Array(5)].map((_, i) => {
                    const fullValue = i + 1;
                    const halfValue = i + 0.5;

                    return (
                        <span key={i} style={{ position: "relative", cursor: hasReview ? "default" : "pointer" }}>
                            {!hasReview && (
                                <>
                                    <span
                                        onClick={() => handleClick(halfValue)}
                                        onMouseEnter={() => setHover(halfValue)}
                                        onMouseLeave={() => setHover(null)}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            width: "50%",
                                            height: "100%",
                                            zIndex: 2,
                                        }}
                                    />
                                    <span
                                        onClick={() => handleClick(fullValue)}
                                        onMouseEnter={() => setHover(fullValue)}
                                        onMouseLeave={() => setHover(null)}
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            width: "50%",
                                            height: "100%",
                                            zIndex: 1,
                                        }}
                                    />
                                </>
                            )}
                            {rating >= fullValue || (hover && hover >= fullValue) ? (
                                <StarIcon style={{ color: "#32B768" }} />
                            ) : rating >= halfValue || (hover && hover >= halfValue) ? (
                                <StarHalfIcon style={{ color: "#32B768" }} />
                            ) : (
                                <StarBorderIcon style={{ color: "#ccc" }} />
                            )}
                        </span>
                    );
                })}
                <span className="ms-2 mt-3 mb-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "15px" }}>
                    {rating} {getRatingLabel(rating)}
                </span>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <div className="d-flex justify-content-between align-items-center m-0 p-2">
                <h4
                    className="flex-grow-1 tabel-title text-center mb-0"
                    style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        color: "#1F2937",
                    }}
                >
                    Completed
                </h4>
                <i
                    className="bi bi-x fs-2 text-danger fw-bold"
                    onClick={onHide}
                    style={{ cursor: "pointer" }}
                ></i>
            </div>
            <Modal.Body className="text-center px-3 pt-0 pb-2">
                {/* <img
                    src={modalSuccess}
                    alt="Success"
                    className="animated-img"
                    style={{ width: "200px" }}
                /> */}

                <div className="rounded-3 border mb-2 p-2" style={{ borderColor: "#1A73E8", borderWidth: "1px", borderStyle: "solid" }}>
                    <p className="text-start m-0 table-data">🎉 You Played very well</p>
                    <p className="text-start" style={{ fontSize: "10px", fontWeight: "400", fontFamily: "Poppins", color: "#374151" }}>Your Slots are Successfully booked.</p>
                    <div className="d-flex p-0 justify-content-between">
                        <div className="text-start">
                            <p className="text-muted mb-1" style={{ fontSize: "13px", fontWeight: "500" }}>Court Name</p>
                            <p className="text-muted mb-1" style={{ fontSize: "13px", fontWeight: "500" }}>Court Number</p>
                            <p className="text-muted mb-0" style={{ fontSize: "13px", fontWeight: "500" }}>Date</p>
                        </div>
                        <div className="text-end">
                            <p className="fw-bold mb-1" style={{ fontSize: "14px", color: "#111827" }}>
                                {tableData?.booking?.register_club_id?.clubName || "N/A"}
                            </p>
                            <p className="fw-bold mb-1" style={{ fontSize: "14px", color: "#111827" }}>
                                {tableData?.slotItem?.courtName || "N/A"}
                            </p>
                            <p className="fw-bold mb-0" style={{ fontSize: "14px", color: "#111827" }}>
                                {safeFormatDate(
                                    new Date(tableData?.slotItem?.bookingDate),
                                    "dd/MM/yyyy"
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="text-start px-1 mb-1">
                    <h5 className="fw-bold mb-2">Payment Details</h5>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Payment Method</span>
                        <span>{tableData?.booking?.paymentMethod || "N/A"}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Payment</span>
                        <h5 style={{ color: "#1A237E", fontWeight: "700" }}>
                            ₹{tableData?.booking?.totalAmount || "N/A"}
                        </h5>
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <h4 className="tabel-title m-0 text-start">Rate this court</h4>
                    {renderStars()}
                </div>

                {/* Review input */}
                <div className="mt-1 text-start position-relative">
                    <p className="mb-2" style={{ fontWeight: "600", color: "#374151" }}>
                        Write a message
                    </p>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        disabled={hasReview}
                        style={{ boxShadow: "none", fontWeight: "600" }}
                        placeholder="Write Here"
                        value={review}
                        onChange={(e) => {
                            let inputValue = e.target.value;
                            if (inputValue.length > 0) {
                                inputValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
                            }
                            if (inputValue.length <= 250) {
                                setReview(inputValue);
                            }
                        }}
                    />
                    {hasReview ? '' : <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            fontSize: "12px",
                            color: "#6B7280",
                            fontWeight: "500",
                        }}
                    >
                        {review.length}/250
                    </div>
                    }
                </div>

                {/* Button */}
                {!hasReview && (
                    <div className="justify-content-center mt-2 d-flex align-items-center">
                        <Button
                            style={{ backgroundColor: "#1A237E", fontWeight: "500", fontSize: "17px", border: "0" }}
                            onClick={handleSubmit}
                            className="rounded-pill py-2 w-100"
                        >
                            {addReviewLoading ? <ButtonLoading color={'white'} /> : "Submit"}
                        </Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};
