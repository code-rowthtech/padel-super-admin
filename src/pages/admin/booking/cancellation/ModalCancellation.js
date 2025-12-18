import { useEffect, useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { modalSuccess } from "../../../../assets/files";
import { formatDate, formatSlotTime } from "../../../../helpers/Formatting";
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
        {bookingDetails?.bookingStatus === "in-progress"
          ? "Cancellation Request"
          : ""}
      </h4>
      <i
        className="bi bi-x fs-2 text-black fw-bold"
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
            {formatSlotTime(bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time)}
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
          {bookingDetails?.paymentMethod
            ? bookingDetails?.paymentMethod
                ?.charAt(0)
                .toUpperCase()
                .concat(bookingDetails?.paymentMethod?.slice(1))
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
        style={{
          backgroundColor: "#CBD6FF1A",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          maxWidth: "100%",
        }}
      >
        <p
          className="tabel-title py-2 text-start text-muted mb-0"
          style={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.4",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const maxLength = 250;
  const [hasChangedAmount, setHasChangedAmount] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundDate, setRefundDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const validateReason = (text) => {
    if (!text.trim()) return "Reason is required";
    if (text.trim().length < 10) return "Reason must be at least 10 characters";
    return "";
  };
  const handleReasonChange = (e) => {
    let value = e.target.value;

    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }

    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setReason(value);

    if (error) {
      setError(validateReason(value));
    }
  };

  useEffect(() => {
    if (bookingDetails?.totalAmount != null && !hasChangedAmount) {
      setRefundAmount(bookingDetails.totalAmount);
    }
  }, [bookingDetails?.totalAmount, hasChangedAmount]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const maxAmount = Number(bookingDetails?.totalAmount) || 0;

    if (
      value === "" ||
      (!isNaN(value) && Number(value) >= 0 && Number(value) <= maxAmount)
    ) {
      setRefundAmount(value);
      setHasChangedAmount(true);
    }
  };

  const handleRefundClick = () => {
    const validationError = validateReason(reason);
    if (validationError) {
      setError(validationError);
      return;
    }

    const finalAmount =
      hasChangedAmount && refundAmount !== ""
        ? Number(refundAmount)
        : Number(bookingDetails?.totalAmount);

    onRefundSuccess(reason, setReason, finalAmount, refundDate);
  };

  const remaining = maxLength - reason.length;

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
          className="bi bi-x fs-2 text-black fw-bold"
          onClick={handleClose}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      <Modal.Body className="text-center pt-0">
        {/* <img
          src={modalSuccess}
          alt="Details"
          className="mt-2 animated-img"
          style={{ width: "200px" }}
        /> */}
        <div
          className="d-flex justify-content-between border-top border-bottom align-items-center  my-2"
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
              {formatSlotTime(bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time)}
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
        <div className="row">
          <div className="col-md-6 col-12  ">
            <div className="d-flex justify-content-between">
              <h2
                className="tabel-title py-1 text-start ps-1 text-muted"
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
                {bookingDetails?.paymentMethod
                  ? bookingDetails?.paymentMethod
                      ?.charAt(0)
                      ?.toUpperCase()
                      ?.concat(bookingDetails?.paymentMethod?.slice(1))
                  : "N/A"}
              </h2>
            </div>
            <div className="d-flex flex-column text-start">
              <label
                className="tabel-title text-muted ps-1"
                style={{
                  fontFamily: "Poppins",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                Refund Amount
              </label>
              <input
                type="number"
                min="0"
                max={bookingDetails?.totalAmount}
                value={refundAmount}
                onChange={handleAmountChange}
                placeholder={`Max: ₹${bookingDetails?.totalAmount}`}
                className="form-control w-100"
                style={{
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  height: "32px",
                  borderRadius: "8px",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
          <div className=" col-md-6 border-start col-12">
            <div className="d-flex justify-content-between">
              <h2
                className="tabel-title py-1 text-start ps-1 text-muted"
                style={{
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Payment Recieve
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

            <div className="d-flex flex-column text-start">
              <label
                className="tabel-title text-muted ps-1"
                style={{
                  fontFamily: "Poppins",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                Refund Date
              </label>
              <input
                type="date"
                value={refundDate}
                onChange={(e) => setRefundDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="form-control w-100"
                style={{
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  height: "32px",
                  borderRadius: "8px",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 text-start position-relative">
          <label
            className="form-label ps-1"
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Refund Note
          </label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter details about how the payment will be processed refund (e.g., UPI, Bank Transfer, Cash, etc.)"
            value={reason}
            onChange={handleReasonChange}
            className={`rounded-3 textarea-palceholder ${
              error ? "is-invalid" : ""
            }`}
            style={{
              boxShadow: "none",
              resize: "none",
            }}
          />
          <small
            className={`position-absolute bottom-0 end-0 me-2 mb-1 ${
              remaining <= 0 ? "text-danger" : "text-muted"
            }`}
            style={{ fontSize: "0.75rem" }}
          >
            {remaining}/250
          </small>
          {error && (
            <div className="invalid-feedback d-block text-start ps-1">
              {error}
            </div>
          )}
        </div>

        <div className="px-3 mt-3">
          <Button
            className="py-2 border-0 rounded-pill w-100"
            onClick={handleRefundClick}
            style={{
              backgroundColor: "#3DBE64",
              fontSize: "17px",
              fontWeight: "600",
            }}
            disabled={loading || !!error || !reason.trim()}
          >
            {loading ? <ButtonLoading color={"white"} /> : "Submit"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

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

  const maxLength = 250;

  const handleChange = (e) => {
    let value = e.target.value;

    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }

    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setRejectionReason(value);
  };

  const remaining = maxLength - rejectionReason.length;

  const isReasonMatched = [
    "not-available",
    "timing-issue",
    "double-booked",
  ].includes((bookingDetails?.cancellationReason || "").toLowerCase().trim());

  const showCheckbox = !isReasonMatched;

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
          className="bi bi-x fs-2 text-black fw-bold"
          onClick={handleClose}
          style={{ cursor: "pointer" }}
        ></i>
      </div>
      <Modal.Body className="text-center ">
        <Row className="mb-4 px-3">
          <Col
            md={6}
            className="d-flex justify-content-between rounded-3 border p-3"
            style={{ backgroundColor: "#CBD6FF1A" }}
          >
            <div className="text-start">
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                Name:
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                Court Number:
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                Date:
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                Time:
              </p>
            </div>
            <div className="text-end">
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                <strong>
                  {bookingDetails?.userId?.name
                    ?.slice(0, 1)
                    ?.toUpperCase()
                    ?.concat(bookingDetails?.userId?.name?.slice(1)) || "N/A"}
                </strong>
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                <strong>{bookingDetails?.slot?.[0]?.courtName || "N/A"}</strong>
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                <strong>{formatDate(bookingDetails?.bookingDate)}</strong>
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
                className="mb-1"
              >
                <strong>
                  {bookingDetails?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
                  {formatSlotTime(
                    bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time
                  )}
                </strong>
              </p>
            </div>
          </Col>

          <Col md={6}>
            <div>
              <h6>
                <strong>Payment Details</strong>
              </h6>
              <div className="d-flex justify-content-between">
                <p
                  style={{
                    fontSize: "14px",
                    fontFamily: "Poppins",
                    fontWeight: "500",
                  }}
                  className=""
                >
                  Payment Method:
                </p>
                <p className="mb-0">
                  {bookingDetails?.paymentMethod
                    ? bookingDetails?.paymentMethod
                        ?.charAt(0)
                        .toUpperCase()
                        .concat(bookingDetails?.paymentMethod?.slice(1))
                    : "N/A"}
                </p>
              </div>
              <div className="d-flex justify-content-between">
                <p
                  style={{
                    fontSize: "14px",
                    fontFamily: "Poppins",
                    fontWeight: "500",
                  }}
                  className=""
                >
                  Total Payment:
                </p>
                <p className="text-primary fs-4 mb-0">
                  <strong>₹ {bookingDetails?.totalAmount}</strong>
                </p>
              </div>
            </div>
          </Col>
        </Row>

        <div className="mb-4 text-start">
          <h6>What's user reason to cancel this slot</h6>
          <Form.Control
            as="textarea"
            rows={3}
            value={
              bookingDetails?.cancellationReason
                ? bookingDetails.cancellationReason.charAt(0).toUpperCase() +
                  bookingDetails.cancellationReason.slice(1)
                : ""
            }
            disabled
            className="bg-light text-secondary"
            style={{ boxShadow: "none", resize: "none" }}
          />
        </div>

        <div className="mb-4 text-start position-relative">
          <h6>Why You Reject this Request</h6>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Write a reason"
            style={{ boxShadow: "none", resize: "none" }}
            value={rejectionReason}
            onChange={handleChange}
            maxLength={maxLength}
          />
          <small
            className={`position-absolute bottom-0 end-0 me-2 mb-1 ${
              remaining < 0 ? "text-danger" : "text-muted"
            }`}
            style={{ fontSize: "0.75rem" }}
          >
            {remaining}/250
          </small>
        </div>

        {showCheckbox && (
          <Form.Check
            type="checkbox"
            label="This reason does not match our terms and conditions or cancellation policy"
            className="mb-3 text-start shadow-0"
            style={{
              boxShadow: "none",
              fontSize: "13px",
              textTransform: "capitalize",
            }}
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
        )}

        <div className="d-flex justify-content-end">
          <Button
            onClick={handleSubmit}
            style={{ backgroundColor: "#3DBE64" }}
            className="px-4 rounded-pill border-0 fw-bold"
            disabled={
              (showCheckbox && (!isChecked || rejectionReason.trim() === "")) ||
              (!showCheckbox && rejectionReason.trim() === "")
            }
          >
            {loading ? <ButtonLoading color={"white"} /> : "Continue"}
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
        <h4
          className="flex-grow-1 text-center mb-0"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            color: "#1F2937",
          }}
        >
          {bookingDetails?.bookingStatus === "rejected"
            ? "Rejected Details"
            : ""}
        </h4>
        <i
          className="bi bi-x fs-2 text-black fw-bold"
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
                  {formatSlotTime(
                    bookingDetails?.slot?.[0]?.slotTimes?.[0]?.time
                  )}
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
                {bookingDetails?.paymentMethod
                  ? bookingDetails?.paymentMethod
                      ?.charAt(0)
                      .toUpperCase()
                      .concat(bookingDetails?.paymentMethod?.slice(1))
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
            className="bg-light  text-secondary"
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
