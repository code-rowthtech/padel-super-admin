// BookingModals.js
import { useState } from "react";
import { Modal, Button, Form, OverlayTrigger, Tooltip, Col, Row } from "react-bootstrap";
import { modalDetails, modalSuccess } from "../../../../assets/files";
import { formatDate } from "../../../../helpers/Formatting";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { FcCancel } from "react-icons/fc";
import { formatSlotTime } from "../../../../helpers/Formatting";
export const BookingSuccessModal = ({ show, handleClose, openDetails }) => (
  <Modal show={show} onHide={handleClose} centered backdrop="static">
    <div className="d-flex justify-content-between">
      <h3
        className="flex-grow-1 text-center mb-0"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "#1F2937",
        }}
      >
        <img
          src={modalDetails}
          alt="Success"
          className="animated-img"
          style={{ width: "260px" }}
          loading="lazy"
        />
      </h3>
      <i
        className="bi bi-x fs-2 text-danger fw-bold pe-2"
        onClick={handleClose}
        style={{ cursor: "pointer" }}
      ></i>
    </div>
    <Modal.Body className="text-center pt-0">
      <h4 className="table-heading py-1 mb-1 fw-bold">Booking Successful!</h4>
      <p className="table-data mb-2 fw-bold text-dark">
        Your slot has been booked successfully.
      </p>
      <Button
        onClick={handleClose}
        className="my-2"
        style={{
          backgroundColor: "#34C759",
          border: "none",
          borderRadius: "30px",
          padding: "10px 40px",
          fontWeight: "600",
          fontSize: "16px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        Continue
      </Button>
      <div className="mt-2">
        <button
          onClick={openDetails}
          className="dashboard-viewmore"
          style={{
            background: "none",
            border: "none",
            color: "#007BFF",
            textDecoration: "underline",
            fontSize: "16px",
          }}
        >
          View Booking Details
        </button>
      </div>
    </Modal.Body>
  </Modal>
);

export const BookingConfirmationModal = ({ show, handleClose }) => (
  <Modal
    show={show}
    onHide={handleClose}
    className="h-100"
    centered
    backdrop="static"
  >
    <Modal.Body className="text-center p-4 position-relative">
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "20px",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          color: "red",
        }}
      >
        ×
      </button>

      <div className="text-center">
        <h2
          className="tabel-title py-4"
          style={{ fontFamily: "Poppins", fontWeight: "600" }}
        >
          Booking Confirmation
        </h2>
        <img
          src={modalSuccess}
          alt="Details"
          className="py-4 animated-img"
          style={{ width: "250px", marginBottom: "20px" }}
          loading="lazy"
        />
        <div
          className="d-flex justify-content-between border align-items-center rounded-3 mb-4"
          style={{ backgroundColor: "#CBD6FF1A" }}
        >
          <div className="text-start  p-2 ps-3">
            <p
              className="text-muted mb-1"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Name
            </p>
            <p
              className="text-muted mb-1"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Court Number
            </p>
            <p
              className="text-muted mb-1"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Date & Time/ Min
            </p>
            <p
              className="text-muted mb-1"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Time/ Min
            </p>
          </div>
          <div className="text-end p-2 pe-3">
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              Leslie Alexander
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              2 Court
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              22/06/2025
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              9:00am (60min)
            </p>
          </div>
        </div>
        <h2
          className="tabel-title py-2 text-start"
          style={{
            fontFamily: "Poppins",
            fontSize: "17px",
            fontWeight: "700",
            color: "#374151",
          }}
        >
          Payment Details
        </h2>
        <div className="d-flex justify-content-between">
          <h2
            className="tabel-title py-2 text-start text-muted"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Total payment
          </h2>
          <h2
            className="tabel-title py-2 text-start"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Manual Booking
          </h2>
        </div>
      </div>
    </Modal.Body>
  </Modal>
);

export const BookingDetailsModal = ({ show, handleClose, bookingDetails }) => (
  <Modal
    show={show}
    onHide={handleClose}
    className="h-100"
    centered
    backdrop="static"
  >
    <div className="d-flex justify-content-between align-items-center p-2">
      <h4
        className="flex-grow-1 text-center mb-0"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "#1F2937",
        }}
      >
        {console.log(bookingDetails?.bookingStatus,'bookingDetails?.bookingStatus')}
        {bookingDetails?.bookingStatus === 'upcoming' ? "Booking Details" : bookingDetails?.bookingStatus === 'refunded' ? "Cancellation Details" : ""}
      </h4>
      <i
        className="bi bi-x fs-2 text-danger fw-bold"
        onClick={handleClose}
        style={{ cursor: "pointer" }}
      ></i>
    </div>
    <Modal.Body className="text-center pt-0">
      {/* <img
        src={modalSuccess}
        alt="Details"
        className="py-2 animated-img"
        style={{ width: "200px" }}
        loading="lazy"
      /> */}
      <Col xs={12} className="px-0">
        {/* Full Width Container */}
        <div style={{ backgroundColor: "#CBD6FF1A" }} className="p-3">

          {/* Name */}
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              Name
            </p>
            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {bookingDetails?.userId?.name
                ? bookingDetails.userId.name.charAt(0).toUpperCase() + bookingDetails.userId.name.slice(1)
                : "N/A"}
            </p>
          </div>
          <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Court */}
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              Court
            </p>
            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {bookingDetails?.slot?.[0]?.courtName || "-"}
            </p>
          </div>
          <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Slot Time */}
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              Slot Time
            </p>
            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {bookingDetails?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
              {formatSlotTime(bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time)}
            </p>
          </div>
          <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Booking Date */}
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              Booking Date
            </p>
            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
              {formatDate(bookingDetails?.bookingDate)}
            </p>
          </div>
          <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />

          {/* Conditional Fields */}
          {bookingDetails?.cancellationDate && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  Cancellation Date
                </p>
                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  {formatDate(bookingDetails.cancellationDate)}
                </p>
              </div>
              <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />
            </>
          )}

          {bookingDetails?.cancellationReason && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  Cancellation Reason
                </p>
                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>{bookingDetails.cancellationReason}</Tooltip>}>
                    <span>
                      {bookingDetails.cancellationReason.length > 35
                        ? bookingDetails.cancellationReason.slice(0, 35) + "..."
                        : bookingDetails.cancellationReason}
                    </span>
                  </OverlayTrigger>
                </p>
              </div>
              <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />
            </>
          )}

          {bookingDetails?.cancellationReasonForOwner && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  Cancellation Owner Reason
                </p>
                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>{bookingDetails.cancellationReasonForOwner}</Tooltip>}>
                    <span>
                      {bookingDetails.cancellationReasonForOwner.length > 35
                        ? bookingDetails.cancellationReasonForOwner.slice(0, 35) + "..."
                        : bookingDetails.cancellationReasonForOwner}
                    </span>
                  </OverlayTrigger>
                </p>
              </div>
              <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />
            </>
          )}

          {bookingDetails?.refundDescription && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  Refund Note
                </p>
                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>{bookingDetails.refundDescription}</Tooltip>}>
                    <span>
                      {bookingDetails.refundDescription.length > 35
                        ? bookingDetails.refundDescription.slice(0, 35) + "..."
                        : bookingDetails.refundDescription}
                    </span>
                  </OverlayTrigger>
                </p>
              </div>
              <hr className="my-2 mx-0" style={{ borderTop: "1px solid #E5E7EB" }} />
            </>
          )}

          {bookingDetails?.refundDate && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  Refund Date
                </p>
                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                  {formatDate(bookingDetails.refundDate)}
                </p>
              </div>
            </>
          )}

        </div>
      </Col>
      <h2
        className="tabel-title text-start px-2 pt-1"
        style={{
          fontFamily: "Poppins",
          fontSize: "17px",
          fontWeight: "700",
          color: "#374151",
        }}
      >
        Payment Details
      </h2>
      <div className="d-flex justify-content-between align-items-center px-2">
        <h2
          className="tabel-title text-start text-muted"
          style={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Payment recieve
        </h2>
        <h2
          className="tabel-title text-start"
          style={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          {bookingDetails?.totalAmount
            ? `₹ ${bookingDetails?.totalAmount}`
            : "N/A"}
        </h2>
        {console.log({bookingDetails})}
        {bookingDetails?.bookingStatus === 'refunded' && (
          <>
            |
            <h2
              className="tabel-title py-2 text-start text-muted"
              style={{
                fontFamily: "Poppins",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Refund Amount
            </h2>
            <h2
              className="tabel-title py-2 text-start"
              style={{
                fontFamily: "Poppins",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              {bookingDetails?.refundAmount
                ? `₹ ${bookingDetails?.refundAmount}`
                : "N/A"}
            </h2>
          </>
        )}
      </div>
    </Modal.Body>
  </Modal>
);
export const BookingCancelModal = ({
  show,
  onHide,
  bookingDetails,
  cancelBooking,
  loading,
}) => {
  const [changeContent, setChangeContent] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [error, setError] = useState("");

  const closeModal = () => {
    onHide();
    setTimeout(() => {
      setChangeContent(false);
      setCancelReason("");
      setOtherReason("");
      setError("");
    }, 500);
  };

  const handleSubmit = () => {
    // Validate reason selection
    if (!cancelReason) {
      setError("Please select a reason for cancellation.");
      return;
    }

    // Validate other reason text if "Other" is selected
    if (cancelReason === "other" && !otherReason.trim()) {
      setError("Please describe your reason for cancellation.");
      return;
    }

    setError("");

    // Prepare the reason to send - if "Other", use the text area content
    const finalReason =
      cancelReason === "other" ? otherReason.trim() : cancelReason;

    cancelBooking(finalReason);
    closeModal();
  };

  return (
    <Modal show={show} onHide={closeModal} centered backdrop="static" size="md">
      <Modal.Body>
        {/* Close Button */}
        <div className="d-flex justify-content-between align-items-center">
          <h3
            className="flex-grow-1 text-center mb-0"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              color: "#1F2937",
            }}
          >
            Cancel Booking
          </h3>
          <i
            className="bi bi-x fs-2 text-danger fw-bold"
            onClick={closeModal}
            style={{ cursor: "pointer" }}
          ></i>
        </div>
        <div className="text-center">
          <FcCancel size={150} className="animated-img" />
          <div
            className="d-flex justify-content-between align-items-center border rounded-3 p-3 mb-3"
            style={{ backgroundColor: "#CBD6FF1A" }}
          >
            <div className="text-start">
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
              >
                Name
              </p>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
              >
                Court Number
              </p>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
              >
                Date
              </p>
              <p
                className="text-muted mb-1"
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                }}
              >
                Time
              </p>
            </div>
            <div className="text-end">
              <p
                className="fw-bold mb-1"
                style={{ fontSize: "14px", fontFamily: "Poppins" }}
              >
                {bookingDetails?.userId?.name
                  ?.slice(0, 1)
                  ?.toUpperCase()
                  ?.concat(bookingDetails?.userId?.name?.slice(1)) || "N/A"}
              </p>
              <p
                className="fw-bold mb-1"
                style={{ fontSize: "14px", fontFamily: "Poppins" }}
              >
                {bookingDetails?.slot?.[0]?.courtName || "-"}
              </p>
              <p
                className="fw-bold mb-1"
                style={{ fontSize: "14px", fontFamily: "Poppins" }}
              >
                {formatDate(bookingDetails?.bookingDate)}
              </p>
              <p
                className="fw-bold mb-1"
                style={{ fontSize: "14px", fontFamily: "Poppins" }}
              >
                {formatSlotTime(
                  bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time
                ) || "-"}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="text-start p-2 pt-0">
            <h5 style={{ color: "#1F2937", fontWeight: "600" }}>
              Payment Details
            </h5>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ color: "#6B7280", fontFamily: "Poppins" }}>
                Payment Method
              </span>
              <span style={{ fontWeight: "500" }}>
                {bookingDetails?.bookingType || "-"}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span style={{ color: "#6B7280", fontFamily: "Poppins" }}>
                Total Payment
              </span>
              <span style={{ fontWeight: "600", color: "#1A237E" }}>
                ₹ {bookingDetails?.totalAmount || "0"}
              </span>
            </div>
          </div>

          {/* Cancel Reason Section */}
          {changeContent && (
            <div className="mt-2 text-start p-2 pt-0">
              <h6
                style={{
                  color: "#374151",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                  fontSize: "14px",
                }}
              >
                Why are you cancelling this booking?
              </h6>
              <Form.Select
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setOtherReason(""); // Clear other reason when changing selection
                  if (error) setError("");
                }}
                isInvalid={!!error && !cancelReason}
                className="mt-2"
                style={{ fontFamily: "Poppins" }}
              >
                <option value="">Choose a reason</option>
                <option value="Not-Available">Not Available</option>
                <option value="Timing-Issue">Timing Issue</option>
                <option value="Double-Booked">Double Booked</option>
                <option value="Other">Other</option>
              </Form.Select>

              {/* Text area for "Other" reason */}
              {cancelReason === "other" && (
                <Form.Group className="mt-2">
                  <Form.Label style={{ fontSize: "14px", fontWeight: "500" }}>
                    Please describe your reason *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={otherReason}
                    onChange={(e) => {
                      setOtherReason(e.target.value);
                      if (error) setError("");
                    }}
                    isInvalid={
                      !!error && cancelReason === "other" && !otherReason.trim()
                    }
                    placeholder="Please describe why you are cancelling this booking..."
                    style={{
                      resize: "vertical",
                      fontFamily: "Poppins",
                      fontSize: "14px",
                    }}
                  />
                </Form.Group>
              )}

              <Form.Control.Feedback
                type="invalid"
                style={{ display: "block" }}
              >
                {error}
              </Form.Control.Feedback>
            </div>
          )}
        </div>
      </Modal.Body>

      {/* Action Buttons */}
      <Modal.Footer className="d-flex justify-content-center border-0 p-3 pt-0">
        {changeContent ? (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#1A237E",
              borderColor: "#1A237E",
              fontWeight: "500",
              fontSize: "17px",
              padding: "10px 30px",
              width: "100%",
            }}
            className="rounded-pill shadow-sm"
          >
            {loading ? <ButtonLoading /> : "Submit"}
          </Button>
        ) : (
          <Button
            onClick={() => setChangeContent(true)}
            style={{
              backgroundColor: "#3DBE64",
              borderColor: "#3DBE64",
              fontWeight: "500",
              fontSize: "17px",
              padding: "10px 30px",
              width: "100%",
            }}
            className="rounded-pill shadow-sm"
          >
            Cancel Booking
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
