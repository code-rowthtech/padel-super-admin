import React from "react";
import { Modal } from "react-bootstrap";
import { modalSuccess } from "../../../../assets/files";
import { formatDate } from "../../../../helpers/Formatting";

export const PaymentDetailsModal = ({ show, handleClose, paymentDetails }) => (
  <Modal
    show={show}
    onHide={handleClose}
    className="h-100"
    centered
    backdrop="static"
  >
    <div className="d-flex justify-content-between align-items-center p-2">
      <h3
        className="flex-grow-1 text-center mb-0"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "#1F2937",
        }}
      >
        Payment Details
      </h3>
      <i
        className="bi bi-x fs-2 text-danger fw-bold"
        onClick={handleClose}
        style={{ cursor: "pointer" }}
      ></i>
    </div>
    <Modal.Body className="text-center pt-0">
      <div className="text-center">
        <img
          src={modalSuccess}
          alt="Details"
          className="animated-img mb-1"
          style={{ width: "200px" }}
          loading="lazy"
        />
        <h4>
          {paymentDetails?.amount
            ? paymentDetails?.status === "paid"
              ? "Payment Paid"
              : "Payment Pending"
            : "Booking Details"}
        </h4>
        <span>
          {paymentDetails?.amount
            ? "Settlement details for this club payment."
            : "Booking details for unpaid settlement."}
        </span>
        <div
          className="d-flex justify-content-between border align-items-center rounded-3 mb-2 mt-3"
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
              Club
            </p>
            <p
              className="text-muted mb-1"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Owner
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
              Status
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
              {paymentDetails?.clubId?.clubName ||
                paymentDetails?.register_club_id?.clubName ||
                "N/A"}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {paymentDetails?.ownerId?.name ||
                paymentDetails?.clubId?.ownerId?.name ||
                paymentDetails?.register_club_id?.ownerId?.name ||
                "-"}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {formatDate(paymentDetails?.paidDate || paymentDetails?.bookingDate)}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {paymentDetails?.status || paymentDetails?.bookingStatus || "-"}
            </p>
          </div>
        </div>
        <h2
          className="tabel-title pt-2 text-start"
          style={{
            fontFamily: "Poppins",
            fontSize: "17px",
            fontWeight: "700",
            color: "#374151",
          }}
        >
          Settlement Details
        </h2>
        <div className="d-flex justify-content-between">
          <h2
            className="tabel-title py-1 text-start text-muted"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Total payment
          </h2>
          <h2
            className="tabel-title py-1 text-start"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {paymentDetails?.amount || paymentDetails?.totalAmount
              ? `₹ ${paymentDetails?.amount || paymentDetails?.totalAmount}`
              : "N/A"}
          </h2>
        </div>
        {paymentDetails?.invoiceUrl && (
          <div className="d-flex justify-content-between">
            <h2
              className="tabel-title py-1 text-start text-muted"
              style={{
                fontFamily: "Poppins",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Invoice
            </h2>
            <a
              href={paymentDetails.invoiceUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "14px", fontWeight: "600" }}
            >
              View
            </a>
          </div>
        )}
      </div>
    </Modal.Body>
  </Modal>
);
