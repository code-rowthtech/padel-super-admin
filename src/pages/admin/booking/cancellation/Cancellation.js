import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Container,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
import {
  BookingCancellationModal,
  BookingRefundModal,
  CancelRequestModal,
  RefundSuccessModal,
  SuccessRequestModal,
} from "./ModalCancellation";
import { useDispatch, useSelector } from "react-redux";

import { AppBar, Tabs, Tab, Box } from "@mui/material";
import {
  ButtonLoading,
  DataLoading,
} from "../../../../helpers/loading/Loaders";
import { getUserFromSession } from "../../../../helpers/api/apiCore";
import { FaEye } from "react-icons/fa";
import { formatDate } from "../../../../helpers/Formatting";
import {
  getBookingByStatus,
  getBookingDetailsById,
  updateBookingStatus,
} from "../../../../redux/thunks";

const Cancellation = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showCancellation, setShowCancellation] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showRequestSuccess, setShowRequestSuccess] = useState(false);
  const dispatch = useDispatch();
  const {
    getBookingData,
    getBookingLoading,
    getBookingDetailsData,
    getBookingDetailsLoading,
    updateBookingLoading,
  } = useSelector((state) => state.booking);

  const [value, setValue] = useState(0);
  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const bookings = getBookingData?.bookings || [];
  const bookingDetails = getBookingDetailsData?.booking || [];
  const status =
    tab === 0 ? "in-progress" : tab === 1 ? "refunded" : "rejected";

  useEffect(() => {
    dispatch(
      getBookingByStatus({
        status,
        ownerId,
        //  startDate: formatDate(startDate), endDate: formatDate(endDate)
      })
    );
  }, [tab]);
  const ownerId = getUserFromSession()?._id;
  const [loadingBookingId, setLoadingBookingId] = useState(null);

  const handleBookingDetails = async (id) => {
    setLoadingBookingId(id); // Start loading for this ID
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      if (tab === 0) setShowCancellation(true);
      if (tab === 1) setShowRefund(true);
      if (tab === 2) setShowRequestSuccess(true);
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingBookingId(null); // Stop loading
    }
  };
  return (
    <Container fluid className="px-4">
      <Row className="mb-3">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Box sx={{ bgcolor: "white" }}>
              <AppBar
                position="static"
                color="default"
                className="bg-white border-bottom border-light"
                elevation={0}
              >
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab className="fw-medium table-data" label="Request" />
                  <Tab className="fw-medium table-data" label="Accepted" />
                  <Tab className="fw-medium table-data" label="Rejected" />
                </Tabs>
              </AppBar>
            </Box>

            <div className="d-flex align-items-center gap-2">
              <span style={{ fontWeight: 600 }}>From</span>
              <div className="position-relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  customInput={
                    <button
                      style={{
                        border: "none",
                        backgroundColor: "white",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#495057",
                      }}
                    >
                      {startDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <MdDateRange className="ms-2 mb-1" size={20} />
                    </button>
                  }
                />
              </div>

              <span style={{ fontWeight: 600 }}>To</span>

              <div className="position-relative ">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  customInput={
                    <button
                      style={{
                        border: "none",
                        backgroundColor: "white",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "#495057",
                      }}
                    >
                      {endDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <MdDateRange className="ms-2 mb-1" size={20} />
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="mb-3 tabel-title">
              {tab === 0 ? "Requested" : tab === 1 ? "Accepted" : "Rejected"}{" "}
              Cancellations
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : (
              <div
                className="custom-scroll-container"
                style={{ maxHeight: "290px", overflowY: "auto" }}
              >
                {bookings?.length > 0 ? (
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Contact</th>
                        <th>Booking Type</th>
                        <th>Booking Amount</th>
                        <th>Booking Date</th>
                        <th>Cancellation Reason</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((item, index) => (
                        <tr key={index}>
                          <td className="table-data border-bottom">
                            {item?.userId?.name || "N/A"}
                          </td>
                          <td className="table-data border-bottom">
                            {item?.userId?.countryCode || ""}
                            {item?.userId?.phoneNumber || "N/A"}
                          </td>
                          <td className="table-data border-bottom">
                            {item?.bookingType || "-"}
                          </td>
                          <td className="table-data border-bottom">
                            ₹{item?.totalAmount}
                          </td>
                          <td className="table-data border-bottom">
                            {formatDate(item?.bookingDate)}
                          </td>
                          <td className="table-data border-bottom">
                            <OverlayTrigger
                              placement="left"
                              overlay={
                                <Tooltip>
                                  {item?.cancellationReason || "N/A"}
                                </Tooltip>
                              }
                            >
                              <span style={{ cursor: "default" }}>
                                {item?.cancellationReason?.slice(0, 50) +
                                  "..." || "N/A"}
                              </span>
                            </OverlayTrigger>
                          </td>
                          <td
                            className="table-data border-bottom"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleBookingDetails(item?._id)}
                          >
                            {loadingBookingId === item?._id ? (
                              <ButtonLoading color="blue" />
                            ) : (
                              <FaEye className="text-primary" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div
                    className="d-flex text-danger justify-content-center align-items-center"
                    style={{ height: "30vh" }}
                  >
                    No
                    <span className="px-1">
                      {" "}
                      {tab === 0
                        ? "Requested"
                        : tab === 1
                        ? "Accepted"
                        : "Rejected"}
                    </span>
                    Cancellations were Found !
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
      <BookingCancellationModal
        show={showCancellation}
        handleClose={() => setShowCancellation(false)}
        updateStatus={() => {
          dispatch(
            updateBookingStatus({ id: bookingDetails?._id, status: "refunded" })
          )
            .unwrap()
            .then(() => {
              setShowCancellation(false);
              dispatch(
                getBookingByStatus({
                  status,
                  ownerId,
                })
              );
            });
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
              id: bookingDetails?._id,
              status: "rejected",
              cancellationReasonForOwner: reason,
            })
          )
            .unwrap()
            .then(() => {
              setShowRequest(false);
              dispatch(
                getBookingByStatus({
                  status,
                  ownerId,
                })
              );
            });
        }}
        loading={updateBookingLoading}
        bookingDetails={bookingDetails}
      />

      <SuccessRequestModal
        show={showRequestSuccess}
        handleClose={() => setShowRequestSuccess(false)}
        openRequestSuccessModal={() => {
          setShowRequestSuccess(false);
        }}
        bookingDetails={bookingDetails}
      />

      <BookingRefundModal
        show={showRefund}
        handleClose={() => setShowRefund(false)}
        onRefundSuccess={() => {
          setShowRefund(false);
          setTimeout(() => setShowSuccess(true), 300);
        }}
        bookingDetails={bookingDetails}
      />

      <RefundSuccessModal
        show={showSuccess}
        handleClose={() => setShowSuccess(false)}
        openCancelModal={() => {
          setShowSuccess(false);
          setTimeout(() => setShowRequest(true), 300);
        }}
      />
    </Container>
  );
};

export default Cancellation;
