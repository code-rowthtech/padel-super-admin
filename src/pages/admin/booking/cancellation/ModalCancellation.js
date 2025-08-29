import { useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { modalSuccess } from "../../../../assets/files";
import { formatDate } from "../../../../helpers/Formatting";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";

export const BookingCancellationModal = ({
  show,
  handleClose,
  updateStatus,
  openRejection,
  bookingDetails,
  loading,
}) => (
  <Modal show={show} onHide={handleClose} centered backdrop="static">
    <div className="d-flex justify-content-between align-items-center p-2">
      <h4
        className="flex-grow-1 text-center mb-0"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "#1F2937",
        }}
      >
        Cancellation Request
      </h4>
      <i
        className="bi bi-x fs-2 text-danger fw-bold"
        onClick={handleClose}
        style={{ cursor: "pointer" }}
      ></i>
    </div>
    <Modal.Body className="text-center pt-0">
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
            {bookingDetails?.userId?.name
              ?.slice(0, 1)
              ?.toUpperCase()
              ?.concat(bookingDetails?.userId?.name?.slice(1)) || "N/A"}
          </p>
          <p
            className="fw-bold mb-1"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "Poppins",
            }}
          >
            {bookingDetails?.slot?.[0]?.courtName || "N/A"}
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
            {bookingDetails?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
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
      <div className="d-flex justify-content-between mb-0">
        <h2
          className="tabel-title py-2 text-start m-0 ps-1 text-muted"
          style={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Payment Method
        </h2>
        <h2
          className="tabel-title py-2 text-start m-0"
          style={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          {bookingDetails?.bookingType
            ? bookingDetails?.bookingType
                ?.charAt(0)
                .toUpperCase()
                .concat(bookingDetails?.bookingType?.slice(1))
            : "N/A"}{" "}
        </h2>
      </div>
      <div className="d-flex justify-content-between">
        <h2
          className="tabel-title py-2 text-start ps-1 text-muted"
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
          ₹ {bookingDetails?.totalAmount}
        </h2>
      </div>

      <h2
        className="tabel-title py-2 text-start"
        style={{
          fontFamily: "Poppins",
          fontSize: "15px",
          fontWeight: "700",
          color: "#374151",
        }}
      >
        User's reason to cancel this slot
      </h2>
      <div
        className="d-flex justify-content-between p-2 rounded-3"
        style={{ backgroundColor: "#CBD6FF1A" }}
      >
        <p
          className="tabel-title py-2 text-start text-muted"
          style={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: "400",
          }}
        >
          {bookingDetails?.cancellationReason || ""}
        </p>
      </div>

      <div className="d-flex justify-content-evenly gap-3 p-3 align-items-center">
        <Button
          className=" border-0 rounded-pill py-2 w-100"
          style={{
            backgroundColor: "#D53317",
            fontSize: "17px",
            fontWeight: "600",
          }}
          onClick={openRejection}
        >
          Reject
        </Button>
        <Button
          className=" border-0 w-100 py-2 rounded-pill"
          style={{
            backgroundColor: "#3DBE64",
            fontSize: "17px",
            fontWeight: "600",
          }}
          onClick={updateStatus}
        >
          {loading ? <ButtonLoading /> : "Accept"}
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export const BookingRefundModal = ({
  show,
  handleClose,
  onRefundSuccess,
  bookingDetails,
  loading,
}) => {
  // const [refundAmount, setRefundAmount] = useState("");
  // const [amountError, setAmountError] = useState("");

  // const validateAmount = (amount) => {
  //   if (!amount) return "Refund amount is required";
  //   if (isNaN(amount) || parseFloat(amount) <= 0)
  //     return "Please enter a valid amount";
  //   if (parseFloat(amount) > parseFloat(bookingDetails?.totalAmount || 0)) {
  //     return "Refund amount cannot exceed total amount";
  //   }
  //   return "";
  // };
  const handleRefundClick = () => {
    // const error = validateAmount(refundAmount);
    // if (error) {
    //   setAmountError(error);
    //   return;
    // }
    onRefundSuccess(parseFloat(bookingDetails?.totalAmount));
  };

  // const handleAmountChange = (e) => {
  //   const value = e.target.value;
  //   setRefundAmount(value);
  //   if (amountError) {
  //     setAmountError(validateAmount(value));
  //   }
  // };

  return (
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
          Confirm Cancellation
        </h4>
        <i
          className="bi bi-x fs-2 text-danger fw-bold"
          onClick={handleClose}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      <Modal.Body className="text-center pt-0">
        <img
          src={modalSuccess}
          alt="Details"
          className="mt-2 animated-img"
          style={{ width: "200px" }}
        />
        <div
          className="d-flex justify-content-between border align-items-center rounded-3 my-2"
          style={{ backgroundColor: "#CBD6FF1A" }}
        >
          <div className="text-start  p-2 ps-3">
            <p
              className="text-muted mb-2"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Name
            </p>
            <p
              className="text-muted mb-2"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Court Number
            </p>
            <p
              className="text-muted mb-2"
              style={{
                fontSize: "12px",
                fontWeight: "500",
                fontFamily: "Poppins",
              }}
            >
              Date
            </p>
            <p
              className="text-muted mb-2"
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
              className="fw-bold mb-2"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {bookingDetails?.userId?.name
                ?.slice(0, 1)
                ?.toUpperCase()
                ?.concat(bookingDetails?.userId?.name?.slice(1)) || "N/A"}
            </p>
            <p
              className="fw-bold mb-2"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {bookingDetails?.slot?.[0]?.courtName || "N/A"}
            </p>
            <p
              className="fw-bold mb-2"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {formatDate(bookingDetails?.bookingDate)}
            </p>
            <p
              className="fw-bold mb-2"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "Poppins",
              }}
            >
              {bookingDetails?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
              {bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time}
            </p>
          </div>
        </div>
        <h2
          className="tabel-title pt-1 text-start px-1"
          style={{
            fontFamily: "Poppins",
            fontSize: "17px",
            fontWeight: "700",
            color: "#374151",
          }}
        >
          Payment Details
        </h2>
        <div className="d-flex justify-content-between mb-0">
          <h2
            className="tabel-title py-1 text-start m-0 ps-1 text-muted"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Payment Method
          </h2>
          <h2
            className="tabel-title py-1 text-start m-0"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {bookingDetails?.bookingType
              ? bookingDetails?.bookingType
                  ?.charAt(0)
                  ?.toUpperCase()
                  ?.concat(bookingDetails?.bookingType?.slice(1))
              : "N/A"}
          </h2>
        </div>
        <div className="d-flex justify-content-between">
          <h2
            className="tabel-title py-1 text-start ps-1 text-muted"
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
            ₹ {bookingDetails?.totalAmount}
          </h2>
          |
          <h2
            className="tabel-title py-1 text-start ps-1 text-muted"
            style={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Refund Amount
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
            ₹ {bookingDetails?.totalAmount}
          </h2>
        </div>

        {/* Refund Amount Field */}
        {/* <div className="mt-3">
            <label
              className="form-label text-start w-100 ps-1"
              style={{
                fontFamily: "Poppins",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Refund Amount *
            </label>
            <input
              type="number"
              className={`form-control rounded-3 py-2 ${
                amountError ? "is-invalid" : ""
              }`}
              placeholder="Enter refund amount"
              value={refundAmount}
              onChange={handleAmountChange}
              style={{ backgroundColor: "#CBD6FF7A" }}
              min="0"
              max={bookingDetails?.totalAmount || 0}
              step="0.01"
            />
            {amountError && (
              <div
                className="text-danger text-start ps-1 mt-1"
                style={{ fontSize: "0.875rem" }}
              >
                {amountError}
              </div>
            )}
          </div> */}

        <div className="ps-3 pe-3 mt-2">
          <Button
            className="py-2 border-0 rounded-pill w-100"
            onClick={handleRefundClick}
            style={{
              backgroundColor: "#3DBE64",
              fontSize: "17px",
              fontWeight: "600",
            }}
            disabled={loading}
          >
            {loading ? <ButtonLoading /> : "Process Refund"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const RefundSuccessModal = ({ show, handleClose }) => (
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
        <img
          src={modalSuccess}
          alt="Details"
          className="mt-3 animated-img"
          style={{ width: "250px", marginBottom: "20px" }}
        />
        <h2
          className="tabel-title mb-3"
          style={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: "600" }}
        >
          Refund successfully Complete
        </h2>
        <p className="table-data text-dark fw-bold">
          The refund has been successfully Completed.
        </p>
        <div className="ps-3 pe-3 mt-3">
          <Button
            onClick={handleClose}
            className=" py-2 border-0 rounded-pill w-100 "
            style={{
              backgroundColor: "#3DBE64",
              fontSize: "17px",
              fontWeight: "600",
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal.Body>
  </Modal>
);

export const CancelRequestModal = ({
  show,
  handleClose,
  openRequestModal,
  bookingDetails,
  loading,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = () => {
    openRequestModal(rejectionReason);
    setTimeout(() => {
      setRejectionReason("");
    }, 2000);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
      className="cancel-modal "
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
          Cancellation Request
        </h3>
        <i
          className="bi bi-x fs-2 text-danger fw-bold"
          onClick={handleClose}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      <Modal.Body className="text-center ">
        <Row className="mb-4 px-3">
          {/* Left Column */}
          <Col
            md={6}
            className="d-flex justify-content-between rounded-3 border p-3"
            style={{ backgroundColor: "#CBD6FF1A" }}
          >
            <div className="text-start">
              <h6>Name:</h6>
              <p>Court Number:</p>
              <p>Date:</p>
              <p>Time:</p>
            </div>
            <div className="text-end">
              <h6>
                <strong>
                  {bookingDetails?.userId?.name
                    ?.slice(0, 1)
                    ?.toUpperCase()
                    ?.concat(bookingDetails?.userId?.name?.slice(1)) || "N/A"}
                </strong>
              </h6>
              <p>
                <strong>{bookingDetails?.slot?.[0]?.courtName || "N/A"}</strong>
              </p>
              <p>
                <strong>{formatDate(bookingDetails?.bookingDate)}</strong>
              </p>
              <p>
                <strong>
                  {bookingDetails?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
                  {bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time}
                </strong>
              </p>
            </div>
          </Col>

          {/* Right Column */}
          <Col md={6}>
            <div>
              <h6>
                <strong>Payment Details</strong>
              </h6>
              <div className="d-flex justify-content-between">
                <p>Payment Method:</p>
                <p className="mb-0">
                  {bookingDetails?.bookingType
                    ? bookingDetails?.bookingType
                        ?.charAt(0)
                        .toUpperCase()
                        .concat(bookingDetails?.bookingType?.slice(1))
                    : "N/A"}
                </p>
              </div>
              <div className="d-flex justify-content-between">
                <p>Total Payment:</p>
                <p className="text-primary fs-4 mb-0">
                  <strong>₹ {bookingDetails?.totalAmount}</strong>
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* User's reason */}
        <div className="mb-4 text-start">
          <h6>What's user reason to cancel this slot</h6>
          <Form.Control
            as="textarea"
            rows={3}
            value={bookingDetails?.cancellationReason || ""}
            disabled
            className="bg-light text-secondary"
            style={{ boxShadow: "none" }}
          />
        </div>

        {/* Rejection reason textarea */}
        <div className="mb-4 text-start">
          <h6>Why You Reject this Request</h6>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Write a reason"
            style={{ boxShadow: "none" }}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>

        {/* Checkbox */}
        <Form.Check
          type="checkbox"
          label="This reason also does not match our Terms and Conditions and cancellation policy"
          className="mb-3 text-start shadow-0"
          style={{ boxShadow: "none" }}
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />

        {/* Continue Button */}
        <div className="d-flex justify-content-end">
          <Button
            onClick={handleSubmit}
            style={{ backgroundColor: "#3DBE64" }}
            className="px-4 rounded-pill border-0 fw-bold"
            disabled={!isChecked || rejectionReason.trim() === ""}
          >
            {loading ? <ButtonLoading /> : "Continue"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const SuccessRequestModal = ({ show, handleClose, bookingDetails }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
      className="cancel-modal "
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
          Cancellation Request
        </h3>
        <i
          className="bi bi-x fs-2 text-danger fw-bold"
          onClick={handleClose}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      <Modal.Body className="text-center  pt-0">
        <Row className="mb-4 px-3">
          <Col
            md={6}
            className="d-flex justify-content-between rounded-3 border p-3"
            style={{ backgroundColor: "#CBD6FF1A" }}
          >
            <div className="text-start ">
              <h6>Name:</h6>
              <p>Court Number:</p>
              <p>Date:</p>
              <p>Time:</p>
            </div>
            <div className=" text-end">
              <h6>
                <strong>
                  {bookingDetails?.userId?.name
                    ?.slice(0, 1)
                    ?.toUpperCase()
                    ?.concat(bookingDetails?.userId?.name?.slice(1)) || "N/A"}
                </strong>{" "}
              </h6>
              <p>
                <strong>{bookingDetails?.slot?.[0]?.courtName || "N/A"}</strong>{" "}
              </p>
              <p>
                <strong>{formatDate(bookingDetails?.bookingDate)}</strong>{" "}
              </p>
              <p>
                <strong>
                  {bookingDetails?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
                  {bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time}
                </strong>{" "}
              </p>
            </div>
          </Col>

          <Col md={6}>
            <h6 className="mb-3">
              <strong>Payment Details</strong>
            </h6>
            <div className="d-flex justify-content-between">
              <p>Payment Method:</p>
              <p className="  mb-0">
                {bookingDetails?.bookingType
                  ? bookingDetails?.bookingType
                      ?.charAt(0)
                      .toUpperCase()
                      .concat(bookingDetails?.bookingType?.slice(1))
                  : "N/A"}
              </p>
            </div>
            <div className="d-flex justify-content-between">
              <p>Total Payment:</p>
              <p className="text-primary fs-4 mb-0">
                <strong>₹ {bookingDetails?.totalAmount}</strong>
              </p>
            </div>
          </Col>
        </Row>

        <div className="mb-4 text-start">
          <h6>User's reason to cancel this slot</h6>
          <Form.Control
            as="textarea"
            rows={3}
            value={bookingDetails?.cancellationReason}
            disabled
            className="bg-light text-secondary"
            style={{ boxShadow: "none" }}
          />
        </div>

        <div className="mb-4 text-start">
          <h6>Our reason to Reject his Request</h6>
          <Form.Control
            as="textarea"
            rows={3}
            value={bookingDetails?.cancellationReasonForOwner}
            disabled
            className="bg-light text-secondary"
            style={{ boxShadow: "none" }}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};
