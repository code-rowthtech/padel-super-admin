import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { complete_img } from "../../../../assets/files";
import { addReviewClub } from "../../../../redux/user/club/thunk";
import { useDispatch, useSelector } from "react-redux";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { formatDate } from "../../../../helpers/Formatting";
import { getBooking } from "../../../../redux/user/booking/thunk";

export const BookingRatingModal = ({ show, tableData, onHide, initialRating, defaultMessage }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [review, setReview] = useState("");
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const addReviewLoading = store?.userClub?.reviewLoading;

    const hasReview = !!tableData?.booking?.customerReview;

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
        if (hasReview) return; // prevent submit if already reviewed
        const club_id = localStorage.getItem("register_club_id");
        const payload = {
            reviewComment: review,
            reviewRating: rating,
            register_club_id: club_id,
            bookingId : tableData?.booking?._id
        };
        dispatch(addReviewClub(payload))
            .unwrap()
            .then(() => {
                setRating(0);
                setReview("");
                onHide();
                dispatch(getBooking({ type: "completed" }));
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
            <div className="d-flex align-items-center justify-content-center gap-2 mt-2 fs-5">
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
                <span className="ms-2" style={{ fontFamily: "Poppins", fontWeight: "500", fontSize: "15px" }}>
                    {rating} {getRatingLabel(rating)}
                </span>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Body className="text-center px-3 pt-0 pb-2">
                <div className="d-flex justify-content-end">
                    <button
                        type="button"
                        className="bi bi-x fs-4 text-danger"
                        style={{ border: "none", background: "none" }}
                        aria-label="Close"
                        onClick={onHide}
                    />
                </div>

                <h5 className="mb-0 fw-bold" style={{ color: "#111827" }}>
                    You Played very well
                </h5>
                <img
                    src={complete_img}
                    alt="Success"
                    className="animated-image"
                    style={{ width: "200px" }}
                />

                {/* Court & Booking details */}
                <div className="rounded-3 border mb-2 p-2" style={{ borderColor: "#1A73E8", borderWidth: "1px", borderStyle: "solid" }}>
                    <div className="d-flex p-0 justify-content-between">
                        <div className="text-start">
                            <p className="text-muted mb-1" style={{ fontSize: "13px", fontWeight: "500" }}>Court</p>
                            <p className="text-muted mb-0" style={{ fontSize: "13px", fontWeight: "500" }}>Booking Date</p>
                        </div>
                        <div className="text-end">
                            <p className="fw-bold mb-1" style={{ fontSize: "14px", color: "#111827" }}>
                                {tableData?.slotItem?.courtName || "N/A"}
                            </p>
                            <p className="fw-bold mb-0" style={{ fontSize: "14px", color: "#111827" }}>
                                {formatDate(tableData?.slotItem?.bookingDate) || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="text-start px-1 mb-1">
                    <h5 className="fw-bold mb-2">Payment Details</h5>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted">Payment Method</span>
                        <span>Gpay</span>
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
                    <h4 className="tabel-title text-start">Rate this court</h4>
                    {renderStars()}
                </div>

                {/* Review input */}
                <div className="mt-2 text-start">
                    <p className="mb-2" style={{ fontWeight: "600", color: "#374151" }}>Write a message</p>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        disabled={hasReview}
                        style={{ boxShadow: "none", fontWeight: "600" }}
                        placeholder="Write Here"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                {/* Button */}
                {!hasReview && (
                    <div className="justify-content-center mt-4 d-flex align-items-center">
                        <Button
                            style={{ backgroundColor: "#1A237E", fontWeight: "500", fontSize: "17px", border: "0" }}
                            onClick={handleSubmit}
                            className="rounded-pill py-2 w-100"
                        >
                            {addReviewLoading ? <ButtonLoading /> : "Submit"}
                        </Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};
