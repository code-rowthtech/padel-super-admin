import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { modalSuccess } from '../../../../assets/files';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

export const BookingRatingModal = ({ show, onHide, onSubmit, initialRating, defaultMessage }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        // Initialize with the passed values when modal opens
        if (show) {
            setRating(initialRating || 0);
            setReview(defaultMessage || '');
        }
    }, [show, initialRating, defaultMessage]);

    const handleSave = () => {
        onSubmit({ rating, review });
        onHide();
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
        const newHoverRating = isHalf ? star - 0.5 : star;
        setHoverRating(newHoverRating);
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Body className="text-center p-4">
                {/* Close Button */}
                <div className="d-flex justify-content-end">
                    <button
                        type="button"
                        className="bi bi-x fs-4 text-danger"
                        style={{ border: 'none', background: 'none' }}
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
                    style={{ width: '200px', marginBottom: '20px' }}
                />

                {/* Booking Details */}
                <div
                    className="rounded-3 border mb-4 p-3"
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#1A73E8',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: '10px',
                        textAlign: 'left',
                    }}
                >
                    <h5 className="mb-1 fw-bold" style={{ color: '#111827' }}>🎉 You Played very well</h5>
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                        Your Slots are Successfully booked.
                    </p>

                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: '500' }}>
                                Court Name
                            </p>
                            <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: '500' }}>
                                Court Number
                            </p>
                            <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: '500' }}>
                                Date & Time / Min
                            </p>
                        </div>
                        <div className="text-end">
                            <p className="fw-bold mb-1" style={{ fontSize: '14px', color: '#111827' }}>
                                The Good Club
                            </p>
                            <p className="fw-bold mb-1" style={{ fontSize: '14px', color: '#111827' }}>
                                1 Court
                            </p>
                            <p className="fw-bold mb-1" style={{ fontSize: '14px', color: '#111827' }}>
                                19th Jun' 2025 8:00am (60min)
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
                        <span style={{ color: '#1A237E', fontWeight: '700' }}>₹1000</span>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="my-3">
                    <h4 className="tabel-title text-start">Rate this court (Padel Haus)</h4>
                    {[1, 2, 3, 4, 5].map((star) => {
                        const fillValue = hoverRating || rating;
                        let icon;

                        if (fillValue >= star) {
                            icon = <i className="bi bi-star-fill" style={{ color: "#3DBE64", fontSize: "30px" }}></i>;
                        } else if (fillValue >= star - 0.5) {
                            icon = <i className="bi bi-star-half" style={{ color: "#3DBE64", fontSize: "30px" }}></i>;
                        } else {
                            icon = <i className="bi bi-star" style={{ color: "#3DBE64", fontSize: "30px" }}></i>;
                        }

                        return (
                            <span
                                key={star}
                                className='ms-2'
                                style={{ cursor: "pointer" }}
                                onClick={(e) => handleClick(e, star)}
                                onMouseMove={(e) => handleHover(e, star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                {icon}
                            </span>
                        );
                    })}
                    {rating > 0 && (
                        <span className=' ms-2'
                            style={{
                                fontSize: "18px",
                                fontWeight: "500",
                                color: "#374151",
                                fontFamily: "Poppins"
                            }}
                        >
                            {rating.toFixed(1)}
                        </span>
                    )}
                </div>

                {/* Review Box */}
                <div className="mt-4 text-start">
                    <p className="mb-2" style={{ fontWeight: '600', color: '#374151' }}>
                        Write a message
                    </p>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        style={{ boxShadow: 'none', fontWeight: "600" }}
                        placeholder="Write Here"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="justify-content-center mt-4 d-flex align-items-center">
                    <Button
                        style={{
                            backgroundColor: '#1A237E',
                            fontWeight: '500',
                            fontSize: '17px',
                            border: '0'
                        }}
                        onClick={handleSave}
                        className="rounded-pill py-2 w-100"
                    >
                        {initialRating ? "Update" : "Submit"}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};