// BookingModals.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { modalDetails, modalSuccess } from "../../../../assets/files";
import { formatDate } from "../../../../helpers/Formatting";
import { set } from "date-fns";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { FcCancel } from "react-icons/fc";

export const BookingSuccessModal = ({ show, handleClose, openDetails }) => (
  <Modal show={show} onHide={handleClose} centered backdrop="static">
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
      <img
        src={modalDetails}
        alt="Success"
        className="py-4"
        style={{ width: "250px", marginBottom: "20px" }}
      />
      <h4 className="table-heading py-1 mb-2 fw-bold">Booking Successful!</h4>
      <p className="table-data mb-4 fw-bold text-dark">
        Your slot has been booked successfully.
      </p>
      <Button
        onClick={handleClose}
        className="mt-3"
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
      {/* <div>
        <button
          onClick={openDetails}
          className="dashboard-viewmore"
          style={{
            background: "none",
            border: "none",
            color: "#007BFF",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          View Booking Details
        </button>
      </div> */}
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
          className="py-4"
          style={{ width: "250px", marginBottom: "20px" }}
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
          Booking Details
        </h2>
        <img
          src={modalSuccess}
          alt="Details"
          className="py-4"
          style={{ width: "200px", marginBottom: "20px" }}
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
          <div className="text-end p-2 pe-3">
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {bookingDetails?.userId?.name || "N/A"}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {bookingDetails?.slot?.[0]?.courtName || "-"}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {formatDate(bookingDetails?.bookingDate)}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time}
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
            {bookingDetails?.totalAmount
              ? `₹ ${bookingDetails?.totalAmount}`
              : "N/A"}
          </h2>
        </div>
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
  const [error, setError] = useState("");

  const closeModal = () => {
    onHide();
    setTimeout(() => {
      setChangeContent(false);
      setCancelReason("");
      setError("");
    }, 500);
  };

  const handleSubmit = () => {
    if (!cancelReason) {
      setError("Please select a reason for cancellation.");
      return;
    }
    setError("");
    cancelBooking(cancelReason);
    closeModal();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Modal show={show} onHide={closeModal} centered backdrop="static" size="md">
      <Modal.Body>
        {/* Close Button */}
        <div className="d-flex justify-content-end">
          <button
            onClick={closeModal}
            className="btn p-0"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: "#dc3545",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="text-center mb-4">
          <h2
            className="table-title"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              fontSize: "1.5rem",
              color: "#1F2937",
            }}
          >
            Cancel Booking
          </h2>

          {/* <img
            src={modalSuccess} // Make sure this is imported or defined
            alt="Booking Confirmation"
            style={{ width: "200px", marginBottom: "20px" }}
          /> */}
          <FcCancel size={150} />
          {/* Booking Info Grid */}
          <div
            className="d-flex justify-content-between align-items-center border rounded-3 p-3 mb-4"
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
                {bookingDetails?.userId?.name || "N/A"}
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
                {bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time || "-"}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="text-start">
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
            <div className="mt-4 text-start">
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
                  if (error) setError("");
                }}
                isInvalid={!!error}
                className="mt-2"
                style={{ fontFamily: "Poppins" }}
              >
                <option value="">Choose a reason</option>
                <option value="not-available">Not Available</option>
                <option value="timing-issue">Timing Issue</option>
                <option value="double-booked">Double Booked</option>
                <option value="other">Other</option>
              </Form.Select>
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
      <Modal.Footer className="d-flex justify-content-center border-0 p-3">
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
