
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { modalDetails, modalSuccess } from '../../../../assets/files';

export const BookingCancellationModal = ({ show, handleClose, openDetails }) => (
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

            <div className="text-center">
                <h2 className="tabel-title py-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}> Cancellation Request</h2>
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
                <div className="d-flex justify-content-between mb-0">
                    <h2 className="tabel-title py-2 text-start m-0 ps-1 text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "500" }}>Payment Method</h2>
                    <h2 className="tabel-title py-2 text-start m-0" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "600", color: "#374151" }}>Gpay</h2>
                </div>
                <div className="d-flex justify-content-between">
                    <h2 className="tabel-title py-2 text-start ps-1 text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "500" }}>Total payment</h2>
                    <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "600", color: "#374151" }}>1000</h2>
                </div>

                <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: "700", color: "#374151" }}>What’s your reason to cancel this slot</h2>
                <div className="d-flex justify-content-between p-2 rounded-3" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <p className="tabel-title py-2 text-start text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. </p>
                </div>

                <div className="d-flex justify-content-evenly gap-3 p-3 align-items-center">
                    <Button className=' border-0 rounded-pill py-2 w-100' style={{ backgroundColor: "#D53317", fontSize: '17px', fontWeight: "600" }} onClick={handleClose}>Reject</Button>
                    <Button className=' border-0 w-100 py-2 rounded-pill' style={{ backgroundColor: "#3DBE64", fontSize: '17px', fontWeight: "600" }} onClick={openDetails}>Accept</Button>
                </div>

            </div>

        </Modal.Body>
    </Modal>
);

export const BookingRefundModal = ({ show, handleClose, onRefundSuccess }) => (
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
                <h2 className="tabel-title py-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}> Cancellation Request</h2>
                <img src={modalSuccess} alt="Details" className='mt-3' style={{ width: '250px', marginBottom: '20px' }} />
                <h2 className="tabel-title mb-3" style={{ fontFamily: "Poppins", fontSize: '15px', fontWeight: "600" }}> Confirm Cancellation</h2>
                <div className="d-flex justify-content-between border align-items-center rounded-3 mb-4" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="text-start  p-2 ps-3">
                        <p className="text-muted mb-2" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Name</p>
                        <p className="text-muted mb-2" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Court Number</p>
                        <p className="text-muted mb-2" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Date & Time/ Min</p>
                        <p className="text-muted mb-2" style={{ fontSize: '12px', fontWeight: "500", fontFamily: 'Poppins' }}>Time/ Min</p>
                    </div>
                    <div className="text-end p-2 pe-3">
                        <p className="fw-bold mb-2" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>Leslie Alexander</p>
                        <p className="fw-bold mb-2" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>2 Court</p>
                        <p className="fw-bold mb-2" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>22/06/2025</p>
                        <p className="fw-bold mb-2" style={{ fontSize: '14px', fontWeight: "600", fontFamily: 'Poppins' }}>9:00am (60min)</p>
                    </div>
                </div>
                <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "17px", fontWeight: "700", color: "#374151" }}>Payment Details</h2>
                <div className="d-flex justify-content-between mb-0">
                    <h2 className="tabel-title py-2 text-start m-0 ps-1 text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "500" }}>Payment Method</h2>
                    <h2 className="tabel-title py-2 text-start m-0" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "600", color: "#374151" }}>Gpay</h2>
                </div>
                <div className="d-flex justify-content-between">
                    <h2 className="tabel-title py-2 text-start ps-1 text-muted" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "500" }}>Total payment</h2>
                    <h2 className="tabel-title py-2 text-start" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "600", color: "#374151" }}>1000</h2>
                </div>

                <div className="ps-3 pe-3 mt-3">
                    <Button className=' py-2 border-0 rounded-pill w-100 '
                        onClick={onRefundSuccess}  
                        style={{ backgroundColor: "#3DBE64", fontSize: '17px', fontWeight: "600" }}
                    >
                        Refund Process
                    </Button>
                </div>
            </div>

        </Modal.Body>
    </Modal>
);

export const RefundSuccessModal = ({ show, handleClose }) => (
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
                <img src={modalSuccess} alt="Details" className='mt-3' style={{ width: '250px', marginBottom: '20px' }} />
                <h2 className="tabel-title mb-3" style={{ fontFamily: "Poppins", fontSize: '15px', fontWeight: "600" }}>Refund successfully Complete</h2>
                <p className='table-data text-dark fw-bold'>The refund has been successfully Completed.</p>
                <div className="ps-3 pe-3 mt-3">
                    <Button  onClick={handleClose} className=' py-2 border-0 rounded-pill w-100 ' style={{ backgroundColor: "#3DBE64", fontSize: '17px', fontWeight: "600" }}>Continue</Button>
                </div>
            </div>

        </Modal.Body>
    </Modal>
);
