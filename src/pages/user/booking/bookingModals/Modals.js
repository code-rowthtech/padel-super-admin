import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { modalSuccess } from '../../../../assets/files';
import { formatDate } from '../../../../helpers/Formatting';
import { useDispatch, useSelector } from 'react-redux';
import { bookingStatus, getBooking } from '../../../../redux/user/booking/thunk';
import { ButtonLoading } from '../../../../helpers/loading/Loaders';
import { getUserFromSession } from '../../../../helpers/api/apiCore';
import { Avatar } from '@mui/material';
import { format, isValid } from 'date-fns';
import { showError, showInfo } from '../../../../helpers/Toast';

export const BookingHistoryCancelModal = ({ tableData, activeTab, currentPage, setChangeCancelShow, changeCancelShow, show, onHide, booking }) => {
  const [changeContent, setChangeContent] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const bookingStatusData = useSelector((state) => state?.userBooking)
  const store = useSelector((state) => state)
  const clubData = store?.userClub?.clubData?.data?.courts[0] || []
  const logo = clubData?.logo;
  const User = getUserFromSession()
  const safeFormatDate = (dateValue, formatString = "dd/MM/yyyy", fallback = "N/A") => {
    if (!dateValue) return fallback;
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : fallback;
  };
  console.log({tableData  });
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


  const handleContinue = () => {
    dispatch(bookingStatus({ requestType: 'user', id: tableData?.booking?._id, status: 'in-progress', cancellationReason: otherReason || selectedReason })).unwrap().then((res) => {
      if (res?.status === '200') {
        if (tableData?.booking?.bookingStatus === 'upcoming' && activeTab === 'upcoming') {
          dispatch(getBooking({ type: 'upcoming', page: currentPage, limit: 15 }))
        } else {
          dispatch(getBooking({ page: currentPage, limit: 15 }))
        }
        setShowSuccessModal(true);
        setChangeContent(true)
      }
    })
  };

  const handleSubmit = () => {
    if (!selectedReason || (selectedReason === 'other' && !otherReason.trim())) {
      showError('Please select a reason or provide a custom reason.');
      return;
    } else {
      handleContinue();
    }

  };
  useEffect(() => {
    if (bookingStatusData?.bookingStatusData?.status === "200" && bookingStatusData?.bookingStatusData?.message) {
      setShowSuccessModal(false);
      handleClose();
    }
  }, [bookingStatusData?.bookingStatusData?.status, bookingStatusData?.bookingStatusData?.message])

  const displayReason = selectedReason === 'other' && otherReason.trim() ? otherReason : selectedReason || 'No reason provided';


  return (
    <>
      <Modal show={show && !showSuccessModal && !showConfirmationModal} onHide={handleClose} centered>
        <div className="d-flex pt-2 justify-content-center align-items-center position-relative  pb-2">
          <h4
            className="text-center tabel-title mb-0"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              color: "#1F2937",
            }}
          >
            {tableData?.booking?.bookingStatus === "upcoming"
              ? "Booking Details"
              : tableData?.booking?.bookingStatus === "in-progress"
                ? "Cancellation Request"
                : "Booking Details"}
          </h4>

          <i
            className="bi bi-x fs-2 text-dark fw-bold position-absolute end-0 me-3"
            onClick={handleClose}
            style={{ cursor: "pointer" }}
          ></i>
        </div>
        <Modal.Body className="text-start pt-0 pb-0">
          <div className=" border-top border-bottom mb-4" >
            <div className="d-flex gap-2 align-items-center justify-content-start">

              {logo ?
                <Avatar src={logo} alt="User Profile" /> :
                <Avatar>
                  {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                </Avatar>
              }
              <p className="mt-3">
                {changeContent
                  ? "You're about to cancel this booking"
                  : {
                    "in-progress": "Your cancellation request is pending for action.",
                    "upcoming": "Your slot has been booked",
                  }[tableData?.booking?.bookingStatus] || ""}
              </p>
            </div>
            <div className="p-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  Court Name
                </p>
                <p className=" mb-1" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  {tableData?.booking?.register_club_id?.clubName || 'N/A'}
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  Court Number
                </p>
                <p className=" mb-1" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  {tableData?.slotItem?.courtName || 'N/A'}
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  Date
                </p>
                <p className=" mb-1" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                  {safeFormatDate(
                    new Date(tableData?.booking?.createdAt),
                    "dd/MM/yyyy" || "N/A"
                  )}
                </p>
              </div>

              {tableData?.booking?.bookingStatus === "in-progress" && (
                <div className="d-flex justify-content-between align-items-center">
                  <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
                    Cancellation Request Date
                  </p>
                  <p className=" mb-1" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Poppins' }}>
                    {safeFormatDate(
                      new Date(tableData?.booking?.cancellationDate),
                      "dd/MM/yyyy " || "N/A"
                    )}
                  </p>
                </div>
              )}
            </div>


          </div>

          <div className="text-start px-2">
            <h5 className='' style={{ fontSize: "18px", fontWeight: "500", fontFamily: "Poppins" }}>Payment Details</h5>
            <div className="d-flex justify-content-between">
              <h6 style={{ fontSize: "15px", fontWeight: "400", fontFamily: "Poppins" }}>Payment Method</h6>
              <h6 style={{ fontSize: '15px', fontWeight: "500" }}>{tableData?.booking?.paymentMethod || 'N/A'}</h6>
            </div>
            <div className="d-flex justify-content-between">
              <h6 style={{ fontSize: "15px", fontWeight: "400", fontFamily: "Poppins" }}>Total Payment</h6>
              <h3 style={{ color: '#1A237E', fontSize: '15px', fontWeight: "500" }}>₹{tableData?.booking?.totalAmount || "N/A"}</h3>
            </div>
          </div>

          {tableData?.booking?.bookingStatus === "in-progress" ? (
            <div className="mt-1 mb-0">
              <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
                What’s your reason to cancel this slot
              </h5>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  defaultValue={tableData?.booking?.cancellationReason
                    ? tableData?.booking?.cancellationReason.charAt(0).toUpperCase() + tableData?.booking?.cancellationReason?.slice(1)
                    : "N/A" || "N/A"}
                  disabled
                />
              </Form.Group>

            </div>
          ) : null}

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
                <div className="mt-4 position-relative">
                  <p className="mb-3" style={{ fontWeight: "500", color: "#374151" }}>
                    Write a reason here
                  </p>

                  <div style={{ position: "relative" }}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      style={{
                        boxShadow: "none",
                        paddingBottom: "28px",
                      }}
                      placeholder="Please describe your reason"
                      value={otherReason}
                      onChange={(e) => {
                        const text = e.target.value;
                        if (text.length <= 150) setOtherReason(text);
                      }}
                      aria-label="Custom cancellation reason"
                    />

                    <small
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        right: "12px",
                        color: otherReason.length >= 150 ? "red" : "#6b7280",
                        fontSize: "12px",
                      }}
                    >
                      {otherReason?.length}/150
                    </small>
                  </div>
                </div>

              )}
            </div>
          )}

          <div className="justify-content-center  d-flex align-items-center p-3">
            {changeContent ? (
              <Button
                style={{ backgroundColor: '#1A237E', fontWeight: '500', fontSize: '17px', border: '0' }}
                onClick={handleSubmit}
                className="rounded-pill py-2 w-100 px-4"
              >
                {bookingStatusData?.bookingStatusLoading ? <ButtonLoading color={'white'} /> : 'Submit'}
              </Button>
            ) : (
              tableData?.booking?.cancellationReason || tableData?.booking?.customerReview?._id ? '' :
                <Button
                  style={{ backgroundColor: '#1A237E', fontWeight: '500', fontSize: '17px', border: '0' }}
                  onClick={() => setChangeContent(true)}
                  className="rounded-pill py-lg-2 py-1 w-100 px-4"
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
        safeFormatDate={safeFormatDate}
      />

      <CancellationConfirmationModal
        show={showConfirmationModal}
        onHide={handleClose}
        selectedReason={selectedReason}
        otherReason={otherReason}
        safeFormatDate={safeFormatDate}
        tableData={tableData}
      />
    </>
  );
};

export const BookingHistorySuccessModal = ({ show, onHide, safeFormatDate, bookingStatusData, onContinue }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="bi bi-x fs-4 text-dark"
            style={{ border: 'none', background: 'none' }}
            aria-label="Close"
            onClick={onHide}
          />
        </div>

        <img
          src={modalSuccess}
          alt="Success"
          className="py-4 animated-image"
          style={{ width: '200px', marginBottom: '20px' }}
        />

        <div className="rounded-3 mb-4">
          <h3>Request for Cancellation</h3>
          <p>Your cancellation request has been submitted. The refund will be processed once your request is approved.</p>
          {/* <a href="#" style={{ color: '#1A237E' }}>
            View Status
          </a> */}
        </div>

        {/* <div className="justify-content-center mb-3 d-flex align-items-center p-3">
          <Button
            style={{ backgroundColor: '#1A237E', fontWeight: '500', fontSize: '17px', border: '0' }}
            onClick={onContinue}
            className="rounded-pill py-2 w-100 px-4"
          >
            {bookingStatusData?.bookingStatusLoading ? <ButtonLoading color={'white'} /> : 'Continue'}
          </Button>
        </div> */}
      </Modal.Body>
    </Modal>
  );
};

export const CancellationConfirmationModal = ({ tableData, show, onHide, selectedReason, otherReason }) => {
  const displayReason = selectedReason === 'other' && otherReason.trim() ? otherReason : selectedReason || 'No reason provided';
  const safeFormatDate = (dateValue, formatString = "dd/MM/yyyy", fallback = "N/A") => {
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : fallback;
  };
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="bi bi-x fs-4 text-dark"
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
              Court Number
            </p>

            <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'Poppins' }}>
              Date
            </p>
          </div>
          <div className="text-end p-2 pe-3">
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {tableData?.slotItem?.courtName}
            </p>
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {tableData?.booking?.register_club_id?.clubName}
            </p>
            <p className="fw-bold mb-1" style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Poppins' }}>
              {safeFormatDate(
                new Date(tableData?.slotItem?.createdAt),
                "dd/MM/yyyy" || "N/A"
              )}
            </p>
          </div>
        </div>

        <div className="text-start mb-3 px-2">
          <h5 className="tabel-title">Payment Details</h5>
          <div className="d-flex justify-content-between">
            <h6>Payment Method</h6>
            <h6>{tableData?.slotItem?.paymentMethod || "N/A"}</h6>
          </div>
          <div className="d-flex justify-content-between">
            <h6>Total Payment</h6>
            <h3 style={{ color: '#1A237E' }}>₹{tableData?.booking?.totalAmount}</h3>
          </div>
        </div>

        <div className="mt-3 mb-3">
          <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
            What’s your reason to cancel this slot
          </h5>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              defaultValue={displayReason || "N/A"}
              disabled
            />
          </Form.Group>
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

export const AcceptedRejectedModal = ({ show, onHide, tableData, booking, selectedOption, selectedReason, otherReason }) => {
  const safeFormatDate = (dateValue, formatString = "dd/MM/yyyy", fallback = "N/A") => {
    const date = new Date(dateValue);
    return isValid(date) ? format(date, formatString) : fallback;
  };
  return (
    <Modal show={show} onHide={onHide} centered>
      <div className="d-flex justify-content-between align-items-center m-0 p-2">
        <h4
          className="flex-grow-1 tabel-title text-center mb-0"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            color: "#1F2937",
          }}
        >
          Booking {booking?.booking?.bookingStatus === 'in-progress' ? "Requested" : booking?.booking?.bookingStatus === 'rejected' ? "Rejected" : "Cancelled"}
        </h4>
        <i
          className="bi bi-x fs-2 text-dark fw-bold"
          onClick={onHide}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      <Modal.Body className="text-center p-4 pt-0">
        <div className="mb-2 border-top border-bottom rounded bg-light p-2 px-3">
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
              Court Name
            </p>
            <p className=" mb-1" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {booking?.booking?.register_club_id?.clubName || "N/A"}
            </p>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
              Court Number
            </p>
            <p className=" mb-1" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {booking?.slotItem?.courtName || "N/A"}
            </p>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
              Date
            </p>
            <p className=" mb-1" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {safeFormatDate(new Date(booking?.booking?.createdAt), "dd/MM/yyyy")}
            </p>
          </div>

          {(booking?.booking?.bookingStatus === "in-progress" ||
            booking?.booking?.bookingStatus === "refunded" ||
            booking?.booking?.bookingStatus === "rejected") && (
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                  Cancelled Date
                </p>
                <p className=" mb-1" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  {safeFormatDate(new Date(booking?.booking?.cancellationDate), "dd/MM/yyyy")}
                </p>
              </div>
            )}

          {booking?.booking?.bookingStatus === "refunded" && (
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                Refund Date
              </p>
              <p className=" mb-1" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                {safeFormatDate(new Date(booking?.booking?.refundDate), "dd/MM/yyyy")}
              </p>
            </div>
          )}

          {booking?.booking?.bookingStatus === "rejected" && (
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                Rejected Date
              </p>
              <p className=" mb-1" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                {safeFormatDate(new Date(booking?.booking?.rejectedDate), "dd/MM/yyyy")}
              </p>
            </div>
          )}
        </div>


        <div className="text-start mb-2 px-2">
          <h5 className="tabel-title">Payment Details</h5>
          <div className="d-flex justify-content-between">
            <h6>Payment Method</h6>
            <h6 style={{ fontSize: "18px", fontFamily: "Poppins", fontWeight: "500" }}>{booking?.booking?.paymentMethod || "N/A"}</h6>
          </div>
          <div className="d-flex justify-content-between">
            <h6>Total Payment</h6>
            <h3 className='' style={{ color: '#1A237E', fontSize: "18px", fontWeight: "500" }}>₹{booking?.booking?.totalAmount}</h3>
          </div>
          {booking?.booking?.bookingStatus === "refunded" &&
            <div className="d-flex justify-content-between">
              <h6>Refund Amount</h6>
              <h5 style={{ color: '#1A237E', fontSize: "18px", fontWeight: "500" }}>₹{booking?.booking?.refundAmount}</h5>
            </div>
          }
        </div>

        <div className="mt-3 mb-3">
          <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
          {booking?.booking?.bookingStatus === "cancelled" ? "Your booking cancelled reason" : "What’s your reason to cancel this slot"}  
          </h5>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={2}
              defaultValue={
                booking?.booking?.cancellationReason
                  ? booking?.booking?.cancellationReason.charAt(0).toUpperCase() + booking?.booking?.cancellationReason?.slice(1)
                  : "N/A"
              }
              disabled
            />
          </Form.Group>
        </div>

        {booking?.booking?.cancellationReasonForOwner ? <div className="mt-3 mb-3">
          <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
            Court owner reason to cancel this slot
          </h5>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={2}
              defaultValue={booking?.booking?.cancellationReasonForOwner
                ? booking?.booking?.cancellationReasonForOwner.charAt(0).toUpperCase() + booking?.booking?.cancellationReasonForOwner?.slice(1)
                : "N/A" || "N/A"}
              disabled
            />

          </Form.Group>
        </div>
          : ''}

        {booking?.booking?.refundDescription && booking?.booking?.bookingStatus === 'refunded' ? <div className="mt-3 mb-3">
          <h5 className="mb-3 text-start" style={{ fontWeight: '600', color: '#374151' }}>
            Refund Note
          </h5>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={4}
              defaultValue={booking?.booking?.refundDescription
                ? booking?.booking?.refundDescription.charAt(0).toUpperCase() + booking?.booking?.refundDescription?.slice(1)
                : "N/A" || "N/A"}
              disabled
            />

          </Form.Group>
        </div>
          : ''}

        <div className="rounded-3 mb-4">
          <div className="rounded-3 mb-4">
            {booking?.booking?.bookingStatus === "rejected" ? (
              <>
                <h3 className="tabel-title">
                  Your Request has been <span className="text-danger">Rejected</span> Because of our{" "}
                  <span className="text-primary">Terms & Condition</span> are not applicable on this reason
                </h3>

              </>
            ) : booking?.booking?.bookingStatus === "refunded" && !booking?.booking?.refundAmount ? (
              <h3 className="tabel-title">Your Refund has been Deposited into your account within 3 days</h3>
            ) : null}
          </div>


        </div>
      </Modal.Body>
    </Modal >
  );
};