import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Container,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import {
  BookingCancellationModal,
  BookingRefundModal,
  CancelRequestModal,
  RefundSuccessModal,
  SuccessRequestModal,
} from "./ModalCancellation";
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonLoading,
  DataLoading,
} from "../../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
import { formatDate, formatTime } from "../../../../helpers/Formatting";
import {
  getBookingByStatus,
  getBookingDetailsById,
  updateBookingStatus,
} from "../../../../redux/thunks";
import { resetBookingData } from "../../../../redux/admin/booking/slice";
import Pagination from "../../../../helpers/Pagination";
import { format } from "date-fns";
import { BookingDetailsModal } from "../manual booking/BookingModal";
const Cancellation = () => {
  const dispatch = useDispatch();
  const ownerId = getOwnerFromSession()?._id;
  const [currentPage, setCurrentPage] = useState(1);

  const [startDate, setStartDate] = useState(null); // empty by default
  const [endDate, setEndDate] = useState(null); // empty by default
  const [loadingBookingId, setLoadingBookingId] = useState(null);

  const [tab, setTab] = useState(0);
  const status = ["in-progress", "refunded", "rejected"][tab];

  // Modal state
  const [showDetails, setShowDetails] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showRequestSuccess, setShowRequestSuccess] = useState(false);

  const {
    getBookingData,
    getBookingLoading,
    getBookingDetailsData,
    updateBookingLoading,
  } = useSelector((state) => state.booking);

  const bookings = getBookingData?.bookings || [];
  const bookingDetails = getBookingDetailsData?.booking || {};
  useEffect(() => {
    dispatch(resetBookingData());
  }, []);
  // Fetch bookings when tab changes or valid date range selected
  const sendDate = startDate && endDate;
  useEffect(() => {
    const payload = { status, ownerId, page: currentPage };
    if (sendDate) {
      payload.startDate = formatDate(startDate);
      payload.endDate = formatDate(endDate);
    }
    dispatch(getBookingByStatus(payload));
  }, [tab, sendDate, status, currentPage]);
  // Booking details handler
  const handleBookingDetails = async (id) => {
    setLoadingBookingId(id);
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      if (tab === 0) setShowCancellation(true);
      if (tab === 1) setShowDetails(true);
      if (tab === 2) setShowRequestSuccess(true);
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
    } finally {
      setLoadingBookingId(null);
    }
  };

  // Date picker button
  const DateButton = ({ value, onClick }) => (
    <button
      onClick={onClick}
      style={{
        border: "none",
        backgroundColor: "white",
        padding: "8px 16px",
        cursor: "pointer",
        fontWeight: 600,
        color: "#495057",
      }}
    >
      {value || "Select Date"} <MdDateRange className="ms-2 mb-1" size={20} />
    </button>
  );
  const totalRecords = getBookingData?.totalItems || 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const renderSlotTimes = (slotTimes) =>
    slotTimes?.length ? slotTimes.map((slot) => slot.time).join(", ") : "-";
  return (
    <Container fluid className="px-4">
      {/* Tabs + Date filters */}
      <Row className="mb-3">
        <Col
          md={12}
          className="d-flex justify-content-between align-items-center"
        >
          <Box sx={{ bgcolor: "white" }}>
            <AppBar position="static" color="default" elevation={0}>
              <Tabs
                value={tab}
                onChange={(_, v) => {
                  setTab(v);
                  setCurrentPage(1);
                }}
              >
                <Tab label="Request" />
                <Tab label="Cancelled" />
                <Tab label="Rejected" />
              </Tabs>
            </AppBar>
          </Box>

          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">From</span>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                if (!date) setEndDate(null);
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              customInput={<DateButton />}
            />

            <span className="fw-semibold">To</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              customInput={<DateButton />}
            />
            {sendDate && (
              <i
                className="bi bi-x-square-fill text-danger"
                onClick={() => {
                  setStartDate(null, setEndDate(null));
                }}
              ></i>
            )}
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="mb-3 tabel-title">
              {
                [
                  "Requested Cancellations",
                  "Cancelled Requests",
                  "Rejected Cancellations",
                ][tab]
              }
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : bookings.length > 0 ? (
              <div className="custom-scroll-container">
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Contact</th>
                      <th>Booking Date</th>
                      {/* <th>Booking</th> */}
                      <th>Court No</th>
                      {/* <th>Slot</th> */}
                      {/* <th>Amount</th> */}
                      {/* {tab === 1 && <th>Refund Amount</th>} */}
                      {/* <th>Date/Time</th> */}
                      {/* <th>Cancellation Reason</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings?.map((item) => (
                      <tr key={item?._id} className="table-data border-bottom">
                        <td>
                          {item?.userId?.name
                            ? item.userId.name.charAt(0).toUpperCase() +
                              item.userId.name.slice(1)
                            : "N/A"}
                        </td>
                        <td>
                          {item?.userId?.countryCode || ""}{" "}
                          {item?.userId?.phoneNumber || "N/A"}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "inline-grid", // shrink to content
                              gridTemplateColumns: "140px auto", // fixed col for date, flexible for time
                              textAlign: "left", // keep text aligned from start
                            }}
                          >
                            <span className="fw-medium text-nowrap">
                              {formatDate(item?.bookingDate)}
                            </span>
                            <span className="text-muted ms-1">
                              |{" "}
                              {formatTime(
                                renderSlotTimes(item?.slot?.[0]?.slotTimes)
                              )}
                            </span>
                          </div>
                        </td>

                        {/* <td>
                          {item?.bookingType
                            ?.slice(0, 1)
                            ?.toUpperCase()
                            ?.concat(item?.bookingType?.slice(1)) || "-"}
                        </td> */}
                        <td>{item?.slot?.[0]?.courtName || "-"}</td>
                        {/* <td>
                          {item?.slot[0]?.businessHours?.[0]?.day || ""}{" "}
                          {renderSlotTimes(item?.slot[0]?.slotTimes)}
                        </td> */}
                        {/* <td>₹{item?.totalAmount}</td> */}
                        {/* {tab === 1 && <td>₹{item?.refundAmount}</td>} */}
                        {/* <td>
                          {format(
                            new Date(item?.createdAt),
                            "dd/MM/yyyy | hh:mm a"
                          )}
                        </td> */}
                        {/* <td>
                          <OverlayTrigger
                            placement="left"
                            overlay={
                              <Tooltip>
                                {item?.cancellationReason || "N/A"}
                              </Tooltip>
                            }
                          >
                            <span style={{ cursor: "default" }}>
                              {item?.cancellationReason
                                ? `${item.cancellationReason?.slice(0, 50)}...`
                                : "N/A"}
                            </span>
                          </OverlayTrigger>
                        </td> */}
                        {/* {tab !== 1 && ( */}
                        <td onClick={() => handleBookingDetails(item._id)}>
                          {loadingBookingId === item._id ? (
                            <ButtonLoading color="blue" size={7} />
                          ) : (
                            <FaEye
                              className="text-primary"
                              style={{ cursor: "pointer" }}
                            />
                          )}
                        </td>
                        {/* )} */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div
                className="d-flex text-danger justify-content-center align-items-center"
                style={{ height: "60vh" }}
              >
                No{" "}
                {
                  [
                    "Requested Cancellations ",
                    "Cancelled Requests ",
                    "Rejected Cancellations ",
                  ][tab]
                }
                found!
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          <Pagination
            totalRecords={totalRecords}
            defaultLimit={10}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </Col>
      </Row>
      {/* Modals */}
      <BookingCancellationModal
        show={showCancellation}
        handleClose={() => setShowCancellation(false)}
        updateStatus={() => {
          setShowRefund(true);
          setShowCancellation(false);
          // dispatch(
          //   updateBookingStatus({ id: bookingDetails._id, status: "refunded" })
          // )
          //   .unwrap()
          //   .then(() => {
          //     setShowCancellation(false);
          //     dispatch(getBookingByStatus({ status, ownerId }));
          //   });
        }}
        openRejection={() => {
          setShowCancellation(false);
          setTimeout(() => setShowRequest(true), 300);
        }}
        loading={updateBookingLoading}
        bookingDetails={bookingDetails}
      />

      <CancelRequestModal
        show={showRequest}
        handleClose={() => setShowRequest(false)}
        openRequestModal={(reason) => {
          dispatch(
            updateBookingStatus({
              id: bookingDetails._id,
              status: "rejected",
              cancellationReasonForOwner: reason,
            })
          )
            .unwrap()
            .then(() => {
              setShowRequest(false);
              dispatch(getBookingByStatus({ status, ownerId }));
            });
        }}
        loading={updateBookingLoading}
        bookingDetails={bookingDetails}
      />

      <SuccessRequestModal
        show={showRequestSuccess}
        handleClose={() => setShowRequestSuccess(false)}
        bookingDetails={bookingDetails}
      />

      <BookingRefundModal
        show={showRefund}
        handleClose={() => setShowRefund(false)}
        onRefundSuccess={(refundAmount) => {
          dispatch(
            updateBookingStatus({
              id: bookingDetails._id,
              status: "refunded",
              refundAmount,
            })
          )
            .unwrap()
            .then(() => {
              setShowRefund(false);
              dispatch(getBookingByStatus({ status, ownerId }));
              setTimeout(() => setShowSuccess(true), 300);
            });
        }}
        loading={updateBookingLoading}
        bookingDetails={bookingDetails}
      />
      <BookingDetailsModal
        show={showDetails}
        handleClose={() => setShowDetails(false)}
        bookingDetails={bookingDetails}
      />
      <RefundSuccessModal
        show={showSuccess}
        handleClose={() => {
          setShowSuccess(false);
          setTab(1);
        }}
      />
    </Container>
  );
};

export default Cancellation;
