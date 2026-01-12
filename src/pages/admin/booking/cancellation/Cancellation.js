import React from "react";
import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Container,
  Table,
  OverlayTrigger,
  Tooltip,
  InputGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineDateRange } from "react-icons/md";
import { FaEye, FaTimes } from "react-icons/fa";
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
  bookingCount,
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

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingBookingId, setLoadingBookingId] = useState(null);

  const [tab, setTab] = useState(0);
  const status = ["in-progress", "refunded", "rejected"][tab];

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
  const totalItems = getBookingData?.totalItems || 0;
  const sendDate = startDate && endDate;
  console.log({ bookings });
  const [counts, setCounts] = useState({
    request: 0,
    cancelled: 0,
    rejected: 0,
  });

  const requestCount = sendDate && tab === 0 ? totalItems : counts.request;
  const cancelledCount = sendDate && tab === 1 ? totalItems : counts.cancelled;
  const rejectedCount = sendDate && tab === 2 ? totalItems : counts.rejected;
  useEffect(() => {
    dispatch(getBookingByStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(resetBookingData());
    const payload = { status, ownerId, page: currentPage };
    if (sendDate) {
      const formatToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      payload.startDate = formatToYYYYMMDD(startDate);
      payload.endDate = formatToYYYYMMDD(endDate);
    }
    dispatch(getBookingByStatus(payload)).then((res) => {
      if (res.payload && !sendDate) {
        setCounts({
          request: res.payload.request || 0,
          cancelled: res.payload.cancelled || 0,
          rejected: res.payload.rejected || 0,
        });
      }
    });
  }, [tab, sendDate, status, currentPage]);
  const handleBookingDetails = async (id) => {
    setLoadingBookingId(id);
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      if (tab === 0) setShowCancellation(true);
      if (tab === 1) setShowDetails(true);
      if (tab === 2) setShowRequestSuccess(true);
    } catch (err) {
    } finally {
      setLoadingBookingId(null);
    }
  };

  const totalRecords = getBookingData?.totalItems || 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const renderSlotTimes = (slot) => {
    console.log(slot, 'slotslotslot');
    if (!slot || !Array.isArray(slot)) return "-";

    // Get all slot times from all slots
    const allSlotTimes = slot.reduce((acc, slotItem) => {
      if (slotItem?.slotTimes && Array.isArray(slotItem.slotTimes)) {
        const times = slotItem?.slotTimes?.map(timeSlot => timeSlot?.time).filter(Boolean);
        acc.push(...times);
      }
      return acc;
    }, []);

    return allSlotTimes?.length ? allSlotTimes.join(", ") : "-";
  };
  return (
    <Container fluid className="px-0">
      <Row className="mb-md-3 mb-2">
        <Col xs={12}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-lg-center gap-2">
            <Box sx={{ bgcolor: "white", width: { xs: "100%", lg: "auto" } }}>
              <AppBar
                position="static"
                color="default"
                className="bg-white border-bottom border-light"
                elevation={0}
              >
                <Tabs
                  value={tab}
                  onChange={(_, v) => {
                    setTab(v);
                    setCurrentPage(1);
                  }}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      fontSize: { xs: "13px", sm: "14px", lg: "15px" },
                      minWidth: { xs: "90px", sm: "130px" },
                      textTransform: "none",
                    },
                  }}
                >
                  <Tab
                    label={
                      <span>
                        Request{" "}
                        <b style={{ color: "#16a34a" }}>({requestCount})</b>
                      </span>
                    }
                    className="fw-medium table-data px-2"
                  />
                  <Tab
                    label={
                      <span>
                        Cancelled{" "}
                        <b style={{ color: "#16a34a" }}>({cancelledCount})</b>
                      </span>
                    }
                    className="fw-medium table-data px-2"
                  />
                  <Tab
                    label={
                      <span>
                        Rejected{" "}
                        <b style={{ color: "#16a34a" }}>({rejectedCount})</b>
                      </span>
                    }
                    className="fw-medium table-data px-2"
                  />
                </Tabs>
              </AppBar>
            </Box>

            <div className="d-flex align-items-center justify-content-end col-md-6 col-12">
              {!showDatePicker && !startDate && !endDate ? (
                <div
                  className="d-flex align-items-center justify-content-center rounded p-2"
                  style={{
                    backgroundColor: "#FAFBFF",
                    width: "40px",
                    height: "38px",
                    border: "1px solid #dee2e6",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDatePicker(true)}
                >
                  <MdOutlineDateRange size={16} className="text-muted" />
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center rounded p-1"
                  style={{
                    backgroundColor: "#FAFBFF",
                    maxWidth: "280px",
                    height: "38px",
                    border: "1px solid #dee2e6",
                    gap: "8px",
                  }}
                >
                  <div className="px-2">
                    <MdOutlineDateRange size={16} className="text-muted" />
                  </div>
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      const [start, end] = update;
                      if (start && end) {
                        setShowDatePicker(false);
                      }
                    }}
                    dateFormat="dd/MM/yy"
                    placeholderText="DD/MM/YY – DD/MM/YY"
                    className="form-control border-0 bg-transparent shadow-none custom-datepicker-input"
                    open={showDatePicker}
                    onClickOutside={() => setShowDatePicker(false)}
                  />
                  {(startDate || endDate) && (
                    <div
                      className="px-2"
                      onClick={() => {
                        setDateRange([null, null]);
                        setShowDatePicker(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <FaTimes size={14} className="text-danger" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-md-3 p-2">
            <h6 className="mb-md-3 mb-2 tabel-title">
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
              <>
                <div className="custom-scroll-container d-none d-md-block">
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead>
                      <tr className="text-center">
                        <th className="d-none d-lg-table-cell">User Name</th>
                        <th className="d-lg-none">User</th>
                        <th className="d-none d-md-table-cell">Contact</th>
                        <th>Date</th>
                        <th className="d-none d-lg-table-cell">Court No</th>
                        <th className="d-lg-none">Court</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((item) => (
                        <tr
                          key={item?._id}
                          className="table-data border-bottom align-middle text-center"
                        >
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            {item?.userId?.name
                              ? item.userId.name.charAt(0).toUpperCase() +
                              item.userId.name.slice(1)
                              : "N/A"}
                          </td>
                          <td className="d-none d-md-table-cell small">
                            {item?.userId?.countryCode || ""}{" "}
                            {item?.userId?.phoneNumber || "N/A"}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center">
                              <span className="fw-medium small">
                                {formatDate(item?.bookingDate)}
                              </span>
                              {(() => {
                                const times = item?.slot?.[0]?.slotTimes?.map((time) =>
                                  formatTime(time?.time)
                                ) || [];
                                
                                if (times.length === 0) return "-";
                                
                                const startTime = times[0];
                                const endTime = times[times.length - 1];
                                const displayTime = times.length > 1 ? `${startTime} - ${endTime}` : startTime;
                                const allTimes = times.join(", ");

                                return times.length > 3 ? (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>{allTimes}</Tooltip>}
                                  >
                                    <span className="text-muted small ms-2">
                                      {displayTime}
                                    </span>
                                  </OverlayTrigger>
                                ) : (
                                  <span className="text-muted small ms-2">
                                    {displayTime}
                                  </span>
                                );
                              })()}
                            </div>
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "80px" }}
                          >
                            {item?.slot?.[0]?.courtName || "-"}
                          </td>
                          <td style={{ cursor: "pointer" }}>
                            {loadingBookingId === item._id ? (
                              <ButtonLoading color="blue" size={8} />
                            ) : (
                              <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip>View Details</Tooltip>}
                              >
                                <FaEye
                                  onClick={() => handleBookingDetails(item._id)}
                                  className="text-primary"
                                  style={{ cursor: "pointer" }}
                                  size={16}
                                />
                              </OverlayTrigger>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="mobile-card-table d-block d-md-none">
                  {bookings?.map((item) => (
                    <div key={item?._id} className="card mb-2">
                      <div className="card-body">
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">User:</span>
                          <span className="mobile-card-value">
                            {item?.userId?.name
                              ? item.userId.name.charAt(0).toUpperCase() +
                              item.userId.name.slice(1)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Contact:</span>
                          <span className="mobile-card-value">
                            {item?.userId?.countryCode || ""}{" "}
                            {item?.userId?.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Date:</span>
                          <span className="mobile-card-value">
                            {formatDate(item?.bookingDate)}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Time:</span>
                          <span className="mobile-card-value">
                            {(() => {
                              const times = item?.slot?.[0]?.slotTimes?.map((time) =>
                                formatTime(time?.time)
                              ) || [];
                              
                              if (times?.length === 0) return "-";
                              
                              const startTime = times[0];
                              const endTime = times[times?.length - 1];
                              const displayTime = times?.length > 1 ? `${startTime} - ${endTime}` : startTime;
                              const allTimes = times.join(", ");

                              return times?.length > 3 ? (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>{allTimes}</Tooltip>}
                                >
                                  <span className="text-muted small ms-2">
                                    {displayTime}
                                  </span>
                                </OverlayTrigger>
                              ) : (
                                <span className="text-muted small ms-2">
                                  {displayTime}
                                </span>
                              );
                            })()}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Court:</span>
                          <span className="mobile-card-value">
                            {item?.slot?.[0]?.courtName || "-"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Action:</span>
                          <div className="mobile-card-value">
                            {loadingBookingId === item._id ? (
                              <ButtonLoading color="blue" size={7} />
                            ) : (
                              <FaEye
                                className="text-primary"
                                onClick={() => handleBookingDetails(item._id)}
                                size={18}
                                style={{ cursor: "pointer" }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
      <BookingCancellationModal
        show={showCancellation}
        handleClose={() => setShowCancellation(false)}
        updateStatus={() => {
          setShowRefund(true);
          setShowCancellation(false);
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
              requestType: "admin",
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
        onRefundSuccess={(refundDescription, setReason, amount, refundDate) => {
          dispatch(
            updateBookingStatus({
              id: bookingDetails._id,
              status: "refunded",
              refundDescription,
              refundDate,
              refundAmount: amount,
              requestType: "admin",
            })
          )
            .unwrap()
            .then(() => {
              setShowRefund(false);
              setReason("");
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
      {/* <RefundSuccessModal
        show={showSuccess}
        handleClose={() => {
          setShowSuccess(false);
          setTab(1);
        }}
      /> */}
    </Container>
  );
};

export default Cancellation;
