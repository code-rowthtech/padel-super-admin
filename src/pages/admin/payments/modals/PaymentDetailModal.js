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
          Payment Details
        </h2>
        <img
          src={modalSuccess}
          alt="Details"
          className="py-2"
          style={{ width: "200px", marginBottom: "20px" }}
        />
        <h4>Payment Successful!</h4>
        <span>Your payment has been received successfully.</span>
        <div
          className="d-flex justify-content-between border align-items-center rounded-3 mb-4 mt-2"
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
              {paymentDetails?.userId?.name || "N/A"}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {paymentDetails?.slot?.[0]?.courtName || "-"}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {formatDate(paymentDetails?.bookingDate)}
            </p>
            <p
              className="fw-bold mb-1"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {paymentDetails?.slot?.[0]?.slotTimes?.[0]?.time}
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
            {paymentDetails?.totalAmount
              ? `₹ ${paymentDetails?.totalAmount}`
              : "N/A"}
          </h2>
        </div>
      </div>
    </Modal.Body>
  </Modal>
);
