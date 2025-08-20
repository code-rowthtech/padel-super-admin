// src/components/BookingHistoryCancelModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { modalSuccess, logo } from '../../../../assets/files';
import { formatDate } from '../../../../helpers/Formatting';
import { useDispatch, useSelector } from 'react-redux';
import { bookingStatus, getBooking } from '../../../../redux/user/booking/thunk';
import { ButtonLoading } from '../../../../helpers/loading/Loaders';
import { getUserFromSession } from '../../../../helpers/api/apiCore';
import { Avatar } from '@mui/material';

export const BookingHistoryCancelModal = ({ tableData, activeTab, setChangeCancelShow, changeCancelShow, show, onHide, booking }) => {
  const [changeContent, setChangeContent] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const bookingStatusData = useSelector((state) => state?.userBooking)
  const User = getUserFromSession()
  console.log({ bookingStatusData });
  const dispatch = useDispatch()
  const handleClose = () => {
    onHide();
    setChangeContent(false);
    setChangeCancelShow(false)
    setSelectedReason('');
    setOtherReason('');
    setShowSuccessModal(false);
    setShowConfirmationModal(false);
  };
  useEffect(() => {
    if (changeCancelShow) {
      setChangeContent(true)
    }
  }, [changeCancelShow])

  const handleSubmit = () => {
    if (!selectedReason || (selectedReason === 'other' && !otherReason.trim())) {
      alert('Please select a reason or provide a custom reason.');
      return;
    }
    setShowSuccessModal(true);
  };

  const handleContinue = () => {
    dispatch(bookingStatus({ id: tableData?.booking?._id, status: 'in-progress', cancellationReason: otherReason || selectedReason }))
  };

  useEffect(() => {
    if (bookingStatusData?.bookingStatusData?.status === "200") {
      setShowSuccessModal(false);
      setShowConfirmationModal(true);
    }
    if (activeTab === "upcoming" && User?.token) {
      dispatch(getBooking({ type: "upcoming" }));
    } else if (User?.token) {
      dispatch(getBooking());
    }
  }, [bookingStatusData?.bookingStatusData?.status])

  return (
    <>
      <Modal show={show && !showSuccessModal && !showConfirmationModal} onHide={handleClose} centered backdrop="static">
        <Modal.Body className="text-center p-4">
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="bi bi-x fs-4 text-danger"
              style={{ border: 'none', background: 'none' }}
              aria-label="Close"
              onClick={handleClose}
            />
          </div>

          {!changeContent && (
            <img
              src={modalSuccess}
              alt="Success"
              className="py-4"
              style={{ width: '200px', marginBottom: '20px' }}
            />
          )}

          <div className="rounded-3 border mb-4" style={{ backgroundColor: '#CBD6FF1A' }}>
            <div className="d-flex  ps-2 pt-2 gap-2 align-items-center">
              {/* <img
                src={logo}
                className="rounded-circle shadow"
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                alt="Club Logo"
              /> */}
              <Avatar>
                {/* {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"} */}
              </Avatar>
              <p className='mt-3'>Your slots are successfully booked.</p>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-start p-2 ps-3">
                <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  Court Name
                </p>
                <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  Date
                </p>
              </div>
              <div className="text-end p-2 pe-3">
                <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
                  {tableData?.slotItem?.courtName || 'N/A'}
                </p>

                <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
                  {formatDate(tableData?.slotItem?.bookingDate) || '1N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-start px-2">
            <h5>Payment Details</h5>
            <div className="d-flex justify-content-between">
              <h6>Payment Method</h6>
              <h6>{booking?.paymentMethod || 'Gpay'}</h6>
            </div>
            <div className="d-flex justify-content-between">
              <h6>Total Payment</h6>
              <h3 style={{ color: '#1A237E' }}>{tableData?.booking?.totalAmount || "N/A"}</h3>
            </div>
          </div>

          {changeContent && (
            <div className="mt-4 text-start px-2">
              <h5 className="mb-3" style={{ color: '#374151' }}>
                What's your reason to cancel this slot?
              </h5>
              <Form.Select
                style={{ boxShadow: 'none' }}
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                aria-label="Select cancellation reason"
              >
                <option value="" disabled>
                  Choose a reason
                </option>
                <option value="not-available">Not Available</option>
                <option value="timing-issue">Timing Issue</option>
                <option value="double-booked">Double Booked</option>
                <option value="other">Other</option>
              </Form.Select>

              {selectedReason === 'other' && (
                <div className="mt-4">
                  <p className="mb-3" style={{ fontWeight: '500', color: '#374151' }}>
                    Write a reason here
                  </p>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    style={{ boxShadow: 'none' }}
                    placeholder="Please describe your reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    aria-label="Custom cancellation reason"
                  />
                </div>
              )}
            </div>
          )}

          <div className="justify-content-center mb-3 d-flex align-items-center p-3">
            {changeContent ? (
              <Button
                style={{ backgroundColor: '#1A237E', fontWeight: '500', fontSize: '17px', border: '0' }}
                onClick={handleSubmit}
                className="rounded-pill py-2 w-100 px-4"
              >
                Submit
              </Button>
            ) : (
              tableData?.booking?.cancellationReason ? '' :
                <Button
                  style={{ backgroundColor: '#3DBE64', fontWeight: '500', fontSize: '17px', border: '0' }}
                  onClick={() => setChangeContent(true)}
                  className="rounded-pill py-2 w-100 px-4"
                >
                  Cancel Booking
                </Button>

            )}
          </div>
        </Modal.Body>
      </Modal>

      <BookingHistorySuccessModal
        show={showSuccessModal}
        onHide={handleClose}
        onContinue={handleContinue}
        bookingStatusData={bookingStatusData}
      />

      <CancellationConfirmationModal
        show={showConfirmationModal}
        onHide={handleClose}
        selectedReason={selectedReason}
        otherReason={otherReason}
        tableData={tableData}
      />
    </>
  );
};

export const BookingHistorySuccessModal = ({ show, onHide, bookingStatusData, onContinue }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="bi bi-x fs-4 text-danger"
            style={{ border: 'none', background: 'none' }}
            aria-label="Close"
            onClick={onHide}
          />
        </div>

        <img
          src={modalSuccess}
          alt="Success"
          className="py-4"
          style={{ width: '200px', marginBottom: '20px' }}
        />

        <div className="rounded-3 mb-4">
          <h3>Confirm Cancellation</h3>
          <p>You will receive your refund in your account.</p>
          {/* <a href="#" style={{ color: '#1A237E' }}>
            View Status
          </a> */}
        </div>

        <div className="justify-content-center mb-3 d-flex align-items-center p-3">
          <Button
            style={{ backgroundColor: '#1A237E', fontWeight: '500', fontSize: '17px', border: '0' }}
            onClick={onContinue}
            className="rounded-pill py-2 w-100 px-4"
          >
            {bookingStatusData?.bookingStatusLoading ? <ButtonLoading /> : 'Continue'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const CancellationConfirmationModal = ({ tableData, show, onHide, selectedReason, otherReason }) => {
  const displayReason = selectedReason === 'other' && otherReason.trim() ? otherReason : selectedReason || 'No reason provided';

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="bi bi-x fs-4 text-danger"
            style={{ border: 'none', background: 'none' }}
            aria-label="Close"
            onClick={onHide}
          />
        </div>
        <h3 className="text-center tabel-title mb-3">Booking Cancellation</h3>
        <div className="d-flex mb-3 justify-content-between border rounded bg-light align-items-center">
          <div className="text-start p-2 ps-3">
            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
              Court Name
            </p>

            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
              Date & Time /Min
            </p>
          </div>
          <div className="text-end p-2 pe-3">
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {tableData?.slotItem?.courtName}
            </p>
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {formatDate(tableData?.slotItem?.bookingDate)}
            </p>
          </div>
        </div>

        <div className="text-start mb-3 px-2">
          <h5 className="tabel-title">Payment Details</h5>
          <div className="d-flex justify-content-between">
            <h6>Payment Method</h6>
            <h6>{'Gpay'}</h6>
          </div>
          <div className="d-flex justify-content-between">
            <h6>Total Payment</h6>
            <h3 style={{ color: '#1A237E' }}>{tableData?.booking?.totalAmount}</h3>
          </div>
        </div>

        <div className="mt-3 mb-3">
          <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
            What’s your reason to cancel this slot
          </h5>
          <Form.Select
            as="select"
            value={displayReason}
            disabled
            aria-label="Cancellation reason"
            style={{ boxShadow: 'none' }}
          >
            <option value={displayReason}>{displayReason}</option>
          </Form.Select>
        </div>

        <div className="rounded-3 mb-4">
          <h3 className="tabel-title">You will Receive a message with in ‘5 hr to 1 day’ about this request</h3>
          <p className="table-data">
            If you are not receive any message, so{' '}
            <span className="text-primary">apply <br /> again</span> to cancellation.
          </p>
        </div>
      </Modal.Body>
      <CancellationConfirmationModal selectedReason={selectedReason} otherReason={otherReason} />

    </Modal>
  );
};

export const AcceptedRejectedModal = ({ show, onHide, booking, selectedOption, selectedReason, otherReason }) => {
  const displayReason = selectedReason === 'other' && otherReason.trim() ? otherReason : selectedReason || 'No reason provided';

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="bi bi-x fs-4 text-danger"
            style={{ border: 'none', background: 'none' }}
            aria-label="Close"
            onClick={onHide}
          />
        </div>
        <h3 className="text-center tabel-title mb-3">Booking Cancellation</h3>
        {booking?.booking?.bookingStatus === "refunded" ?
          <img
            src={modalSuccess}
            alt="Success"
            className="py-4"
            style={{ width: '200px', marginBottom: '20px' }}
          />
          : null
        }
        <div className="d-flex mb-3 justify-content-between border rounded bg-light align-items-center">
          <div className="text-start p-2 ps-3">
            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
              Court Name
            </p>

            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
              Date
            </p>
          </div>
          <div className="text-end p-2 pe-3">
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {booking?.slotItem?.courtName}
            </p>
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {formatDate(booking?.slotItem?.bookingDate)}
            </p>
          </div>
        </div>

        <div className="text-start mb-3 px-2">
          <h5 className="tabel-title">Payment Details</h5>
          <div className="d-flex justify-content-between">
            <h6>Payment Method</h6>
            <h6>{'Gpay'}</h6>
          </div>
          <div className="d-flex justify-content-between">
            <h6>Total Payment</h6>
            <h3 style={{ color: '#1A237E' }}>{booking?.booking?.totalAmount}</h3>
          </div>
        </div>

        <div className="mt-3 mb-3">
          <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
            What’s your reason to cancel this slot
          </h5>
          <Form.Select
            as="select"
            value={booking?.booking?.cancellationReason}
            disabled
            aria-label="Cancellation reason"
            style={{ boxShadow: 'none' }}
          >
            <option value={booking?.booking?.cancellationReason}>{booking?.booking?.cancellationReason}</option>
          </Form.Select>
        </div>

        <div className="rounded-3 mb-4">
          {booking?.booking?.bookingStatus === "refunded" ?
            <h3 className="tabel-title">Your Refund has been Deposited into your account within 3 days</h3>
            :
            <>
              <h3 className="tabel-title">Your Request has been <span className="text-danger">Rejected</span> Because of our <span className='text-primary'>team & condition</span>  are not applicable on this reason</h3>
              <p className="table-data">
                If you Know our team & condition for cancellation, so <br /> <span className="text-primary">click here</span>
              </p>
            </>
          }


        </div>
      </Modal.Body>
    </Modal>
  );
};