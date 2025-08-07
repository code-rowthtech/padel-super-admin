// BookingModals.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { modalDetails, modalSuccess } from '../../../../assets/files';
import { formatDate } from '../../../../helpers/Formatting';

export const BookingSuccessModal = ({ show, handleClose, openDetails }) => (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
        <Modal.Body className="text-center p-4 position-relative">
            <button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'red'
                }}
            >
                ×
            </button>
            <img src={modalDetails} alt="Success" className='py-4' style={{ width: '250px', marginBottom: '20px' }} />
            <h4 className="table-heading py-1 mb-2 fw-bold">Booking Successful!</h4>
            <p className="table-data mb-4 fw-bold text-dark">Your slot has been booked successfully.</p>
            <Button
                onClick={handleClose}
                className='mt-3'
                style={{
                    backgroundColor: '#34C759',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '10px 40px',
                    fontWeight: '600',
                    fontSize: '16px',
                    width: '100%',
                    maxWidth: '300px',
                    marginBottom: '20%',
                }}
            >
                Continue
            </Button>
            <div>
                <button
                    onClick={openDetails}
                    className='dashboard-viewmore'
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#007BFF',
                        textDecoration: 'underline',
                        fontSize: '14px',
                    }}
                >
                    View Booking Details
                </button>
            </div>
        </Modal.Body>
    </Modal>
);

export const BookingConfirmationModal = ({ show, handleClose }) => (
    <Modal show={show} onHide={handleClose} className='h-100' centered backdrop="static">
        <Modal.Body className="text-center p-4 position-relative">
            <button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'red'
                }}
            >
                ×
            </button>

            <div className="text-center">
                <h2 className="tabel-title py-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>Booking Confirmation</h2>
                <img src={modalSuccess} alt="Details" className='py-4' style={{ width: '250px', marginBottom: '20px' }} />
                <div className="d-flex justify-content-between border align-items-center rounded-3 mb-4" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="text-start  p-2 ps-3">
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Name</p>
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Court Number</p>
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Date & Time/ Min</p>
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Time/ Min</p>
                    </div>
                    <div className="text-end p-2 pe-3">
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>Leslie Alexander</p>
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>2 Court</p>
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>22/06/2025</p>
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>9:00am (60min)</p>
                    </div>
                </div>
                <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "17px", fontWeight: "700", color: "#374151" }}>Payment Details</h2>
                <div className="d-flex justify-content-between">
                    <h2 className="tabel-title py-2 text-start text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "500" }}>Total payment</h2>
                    <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "600", color: "#374151" }}>Manual Booking</h2>
                </div>

            </div>

        </Modal.Body>
    </Modal>
);

export const BookingDetailsModal = ({ show, handleClose, bookingDetails }) => (
    <Modal show={show} onHide={handleClose} className='h-100' centered backdrop="static">
        <Modal.Body className="text-center p-4 position-relative">
            <button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'red'
                }}
            >
                ×
            </button>

            <div className="text-center">
                <h2 className="tabel-title py-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>Booking Details</h2>
                <img src={modalSuccess} alt="Details" className='py-4' style={{ width: '200px', marginBottom: '20px' }} />
                <div className="d-flex justify-content-between border align-items-center rounded-3 mb-4" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="text-start  p-2 ps-3">
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Name</p>
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Court Number</p>
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Date</p>
                        <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Time</p>
                    </div>
                    <div className="text-end p-2 pe-3">
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>{bookingDetails?.userId?.name || 'N/A'}</p>
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>2 Court</p>
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>{formatDate(bookingDetails?.bookingDate)}</p>
                        <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>{bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time}</p>
                    </div>
                </div>
                <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "17px", fontWeight: "700", color: "#374151" }}>Payment Details</h2>
                <div className="d-flex justify-content-between">
                    <h2 className="tabel-title py-2 text-start text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "500" }}>Total payment</h2>
                    <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "600", color: "#374151" }}>{bookingDetails?.totalAmount
                        ? `₹ ${bookingDetails?.totalAmount}` : 'N/A'}</h2>
                </div>

            </div>

        </Modal.Body>
    </Modal>
);
