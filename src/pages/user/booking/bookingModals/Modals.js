import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { logo, modalSuccess } from '../../../../assets/files';

export const BookingHistoryCancelModal = ({ show, onHide }) => {
    const [changeContent, setChangeContent] = useState(false)
    const closeModal = () => {
        onHide()
        setTimeout(()=>
        setChangeContent(false),500)
    }
    return (
        <Modal show={show} onHide={closeModal} centered backdrop="static">
            <Modal.Body className="text-center p-4">
                <div className="d-flex justify-content-end">
                    <i class="bi bi-x fs-4 text-danger" onClick={closeModal}></i>
                </div>

                {/* Check Icon */}
                {!changeContent && <img src={modalSuccess} alt="Details" className='py-4' style={{ width: '200px', marginBottom: '20px' }} />}

                <div className="rounded-3 border mb-4" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="d-flex justify-content-start ps-2 pt-2 align-items-center">
                        <img src={logo} className='rounded-circle shadow' style={{ width: "80px", height: "80px", objectFit: "contain" }} alt="Logo" />
                        <p>Your Slots are Successfully booked.</p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="text-start p-2 ps-3">
                            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Name</p>
                            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Court Number</p>
                            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Date & Time /Min</p>
                        </div>
                        <div className="text-end p-2 pe-3">
                            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>The Good Club</p>
                            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>1 Court</p>
                            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>19thJun’ 2025  8:00am (60min)</p>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="text-start px-2">
                    <h5>Payment Details</h5>
                    <div className="d-flex justify-content-between">
                        <h6>Payment Method</h6>
                        <h6>Gpay</h6>
                    </div>
                    <div className="d-flex justify-content-between">
                        <h6>Total Payment</h6>
                        <h3 style={{ color: "#1A237E" }}>1000</h3>
                    </div>
                </div>
                {changeContent && (
                    <div className="mt-4 text-start px-2">
                        <h5 className="mb-3" style={{ color: "#374151" }}>What's your reason to cancel this slot?</h5>
                        <select className="form-select">
                            <option selected disabled>Choose a reason</option>
                            <option value="not-available">Not Available</option>
                            <option value="timing-issue">Timing Issue</option>
                            <option value="double-booked">Double Booked</option>
                        </select>
                    </div>
                )}

            </Modal.Body>

            <div className="justify-content-center mb-3 d-flex align-items-center p-3">
                {changeContent ? (

                    <Button
                        style={{ backgroundColor: "#1A237E", fontWeight: "500", fontSize: "17px" }}
                        onClick={() => {
                            // handle submit reason
                            closeModal();
                        }}
                        className="rounded-pill py-2 border-0 w-100 px-4"
                    >
                        Submit
                    </Button>
                ) : (
                    <Button
                        style={{ backgroundColor: "#3DBE64", fontWeight: "500", fontSize: "17px" }}
                        onClick={() => setChangeContent(true)}
                        className="rounded-pill py-2 border-0 w-100 px-4"
                    >
                        Cancel Booking
                    </Button>
                )}

            </div>
        </Modal>
    );
};