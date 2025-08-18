import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { modalSuccess } from "../../../../assets/files";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { addReviewClub, getReviewClub } from "../../../../redux/user/club/thunk";
import { useDispatch, useSelector } from "react-redux";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { formatDate } from "../../../../helpers/Formatting";

export const BookingRatingModal = ({ show, tableData,onHide, reviewData, initialRating, defaultMessage }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState("");
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const getReviewData = store?.userClub?.getReviewData?.data;
    const addReviewLoading = store?.userClub?.reviewLoading;
console.log({tableData});
    useEffect(() => {
        if (show) {
            // Set default values based on reviewData if it exists
            if (reviewData) {
                setRating(reviewData.averageRating || 0);
                setReview(reviewData.reviews?.[reviewData.reviews.length - 1]?.reviewComment || "");
            } else {
                setRating(initialRating || 0);
                setReview(defaultMessage || "");
            }
        }
    }, [show, reviewData, initialRating, defaultMessage]);

    const handleSubmit = () => {
        const club_id = localStorage.getItem("register_club_id");
        const payload = {
            reviewComment: review,
            reviewRating: rating,
            register_club_id: club_id,
        };
        dispatch(addReviewClub(payload))
            .unwrap()
            .then(() => {
                setRating(0);
                setReview("");
                onHide();
                dispatch(getReviewClub(club_id));
            });
    };

    const handleClick = (event, star) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - left;
        const isHalf = clickX < width / 2;
        const newRating = isHalf ? star - 0.5 : star;
        setRating(newRating);
    };

    const handleHover = (event, star) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        const hoverX = event.clientX - left;
        const isHalf = hoverX < width / 2;
        setHoverRating(isHalf ? star - 0.5 : star);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const renderStars = () => {
        const currentRating = hoverRating || rating;
        return (
            <div className="d-flex align-items-center justify-content-center">
                {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    if (currentRating >= starValue) {
                        return (
                            <StarIcon
                                key={i}
                                style={{ color: "#32B768", cursor: "pointer", fontSize: "18px" }}
                                onClick={(e) => handleClick(e, starValue)}
                                onMouseMove={(e) => handleHover(e, starValue)}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    } else if (currentRating >= starValue - 0.5) {
                        return (
                            <FaStarHalfAlt
                                key={i}
                                style={{ color: "#32B768", cursor: "pointer", fontSize: "18px" }}
                                onClick={(e) => handleClick(e, starValue)}
                                onMouseMove={(e) => handleHover(e, starValue)}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    } else {
                        return (
                            <StarBorderIcon
                                key={i}
                                style={{ color: "#ccc", cursor: "pointer", fontSize: "18px" }}
                                onClick={(e) => handleClick(e, starValue)}
                                onMouseMove={(e) => handleHover(e, starValue)}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    }
                })}
                {currentRating > 0 && (
                    <span
                        className="ms-2"
                        style={{
                            fontSize: "18px",
                            fontWeight: "500",
                            color: "#374151",
                            fontFamily: "Poppins",
                        }}
                    >
                        {currentRating.toFixed(1)}
                    </span>
                )}
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Body className="text-center p-4">
                {/* Close Button */}
                <div className="d-flex justify-content-end">
                    <button
                        type="button"
                        className="bi bi-x fs-4 text-danger"
                        style={{ border: "none", background: "none" }}
                        aria-label="Close"
                        onClick={onHide}
                    />
                </div>

                {/* Title */}
                <h3 className="text-center tabel-title mb-2">Booking Confirmation</h3>
                <img
                    src={modalSuccess}
                    alt="Success"
                    className="mb-3"
                    style={{ width: "200px", marginBottom: "20px" }}
                />

                {/* Booking Details */}
                <div
                    className="rounded-3 border mb-4 p-3"
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#1A73E8",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderRadius: "10px",
                        textAlign: "left",
                    }}
                >
                    <h5 className="mb-1 fw-bold" style={{ color: "#111827" }}>
                        🎉 You Played very well
                    </h5>
                    <p style={{ fontSize: "14px", color: "#6B7280" }}>
                        Your Slots are Successfully booked.
                    </p>

                    <div className="d-flex justify-content-between">
                        <div>
                            <p
                                className="text-muted mb-1"
                                style={{ fontSize: "13px", fontWeight: "500" }}
                            >
                                Court Name
                            </p>
                         
                            <p
                                className="text-muted mb-1"
                                style={{ fontSize: "13px", fontWeight: "500" }}
                            >
                                Date 
                            </p>
                        </div>
                        <div className="text-end">
                            <p
                                className="fw-bold mb-1"
                                style={{ fontSize: "14px", color: "#111827" }}
                            >
                               {tableData?.slotItem?.courtName || 'N/A'}
                            </p>
                        
                            <p
                                className="fw-bold mb-1"
                                style={{ fontSize: "14px", color: "#111827" }}
                            >
                                 {formatDate(tableData?.slotItem?.bookingDate) || '1N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="text-start px-1 mb-4">
                    <h5 className="fw-bold mb-2">Payment Details</h5>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Payment Method</span>
                        <span>Gpay</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Payment</span>
                        <span style={{ color: "#1A237E", fontWeight: "700" }}>₹{tableData?.booking?.totalAmount || "N/A"}</span>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="my-3">
                    <h4 className="tabel-title text-start">Rate this court (Padel Haus)</h4>
                    {renderStars()}
                </div>

                {/* Review Box */}
                <div className="mt-4 text-start">
                    <p className="mb-2" style={{ fontWeight: "600", color: "#374151" }}>
                        Write a message
                    </p>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        style={{ boxShadow: "none", fontWeight: "600" }}
                        placeholder="Write Here"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="justify-content-center mt-4 d-flex align-items-center">
                    <Button
                        style={{
                            backgroundColor: "#1A237E",
                            fontWeight: "500",
                            fontSize: "17px",
                            border: "0",
                        }}
                        onClick={() => handleSubmit()}
                        className="rounded-pill py-2 w-100"
                    >
                        {addReviewLoading ? (
                            <ButtonLoading />
                        ) : reviewData ? (
                            "Update"
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};