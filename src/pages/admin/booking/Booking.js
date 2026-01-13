import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineDateRange } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  bookingCount,
  getBookingByStatus,
  getBookingDetailsById,
  updateBookingStatus,
} from "../../../redux/thunks";
import { FaEye } from "react-icons/fa";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import {
  BookingDetailsModal,
  BookingCancelModal,
} from "./manual booking/BookingModal";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { formatDate, formatTime } from "../../../helpers/Formatting";
import { MdOutlineCancel } from "react-icons/md";
import { resetBookingData } from "../../../redux/admin/booking/slice";
import Pagination from "../../../helpers/Pagination";
import { resetOwnerClub } from "../../../redux/admin/manualBooking/slice";

const Booking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ownerId = getOwnerFromSession()?._id;
  const [currentPage, setCurrentPage] = useState(1);

  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingCancel, setShowBookingCancel] = useState(false);
  const [tab, setTab] = useState(0);
  const [loadingBookingId, setLoadingBookingId] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    getBookingData,
    getBookingLoading,
    getBookingDetailsData,
    updateBookingLoading,
    bookingCount: tabCount,
  } = useSelector((state) => state.booking);

  const bookings = getBookingData?.bookings || [];
  const totalItems = getBookingData?.totalItems || 0;
  const sendDate = startDate && endDate;

  const [counts, setCounts] = useState({
    allCount: 0,
    upcomingCount: 0,
    completedCount: 0,
  });

  const allCount = sendDate && tab === 0 ? totalItems : counts?.allCount;
  const upcomingCount = sendDate && tab === 1 ? totalItems : counts?.upcomingCount;
  const completedCount = sendDate && tab === 2 ? totalItems : counts?.completedCount;

  const defaultLimit = 20;

  useEffect(() => {
    const payload: any = {
      ownerId,
      page: currentPage,
      limit: defaultLimit,
    };

    if (tab !== 0) {
      const status = tab === 1 ? "upcoming" : "completed";
      payload.status = status;
    }

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

    dispatch(bookingCount({ ownerId }));
    dispatch(resetBookingData());
    dispatch(getBookingByStatus(payload));
  }, [tab, currentPage, dispatch, ownerId, sendDate]);

  useEffect(() => {
    if (tabCount && !sendDate) {
      setCounts({
        allCount: tabCount.allCount || 0,
        upcomingCount: tabCount.upcomingCount || 0,
        completedCount: tabCount.completedCount || 0,
      });
    }
  }, [tabCount, sendDate]);

  const handleBookingDetails = async (id, type) => {
    setLoadingBookingId(id);
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      type === "details"
        ? setShowBookingDetails(true)
        : setShowBookingCancel(true);
    } catch (error) {
    } finally {
      setLoadingBookingId(null);
    }
  };

  // Helper function to parse time to minutes for comparison
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;

    let cleaned = timeStr.toString().toLowerCase().trim();
    let hour, minute = 0, period = "";

    if (cleaned.includes("am") || cleaned.includes("pm")) {
      period = cleaned.endsWith("am") ? "am" : "pm";
      cleaned = cleaned.replace(/am|pm/gi, "").trim();
    }

    if (cleaned.includes(":")) {
      const parts = cleaned.split(":");
      hour = parseInt(parts[0]);
      minute = parseInt(parts[1]) || 0;
    } else {
      hour = parseInt(cleaned);
    }

    if (isNaN(hour)) return null;

    // Convert to 24-hour format
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  const renderSlotTimes = (slotTimes) => {
    if (!slotTimes?.length) return "-";

    // Sort slots by time
    const sortedSlots = [...slotTimes].sort((a, b) => {
      const timeA = parseTimeToMinutes(a.time);
      const timeB = parseTimeToMinutes(b.time);
      return timeA - timeB;
    });

    const groups = [];
    let currentGroup = [];

    for (let i = 0; i < sortedSlots.length; i++) {
      const slot = sortedSlots[i];

      if (currentGroup.length === 0) {
        currentGroup = [slot];
      } else {
        const lastSlot = currentGroup[currentGroup.length - 1];
        const lastTime = parseTimeToMinutes(lastSlot.time);
        const currentTime = parseTimeToMinutes(slot.time);
        const timeDiff = currentTime - lastTime;

        // Check if slots are consecutive (60 minutes apart)
        if (timeDiff === 60) {
          currentGroup.push(slot);
        } else {
          groups.push([...currentGroup]);
          currentGroup = [slot];
        }
      }
    }

    // Add remaining group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Format groups as ranges or individual times
    return groups.map(group => {
      if (group.length === 1) {
        return group[0].time;
      } else {
        const startTime = group[0].time;
        const lastSlot = group[group.length - 1];

        // Calculate end time (add 1 hour to last slot)
        const lastTimeMinutes = parseTimeToMinutes(lastSlot.time);
        const endTimeMinutes = lastTimeMinutes + 60;
        const endHour = Math.floor(endTimeMinutes / 60);

        let displayHour = endHour;
        let period = "am";

        if (endHour >= 12) {
          period = "pm";
          if (endHour > 12) displayHour = endHour - 12;
        }
        if (endHour === 0) displayHour = 12;

        const endTime = `${displayHour} ${period}`;
        return `${startTime}-${endTime}`;
      }
    }).join(", ");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="px-0 px-md-4">

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
                    setDateRange([null, null]);
                  }}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      fontSize: { xs: "13px", sm: "14px", lg: "15px" },
                      minWidth: { xs: "100px", sm: "120px" },
                      textTransform: "none",
                    },
                  }}
                >
                  <Tab
                    label={
                      <>
                        <span>
                          All <b style={{ color: "#16a34a" }}>({allCount}) </b>{" "}
                        </span>
                      </>
                    }
                    className="fw-medium table-data px-1 d-flex text-nowrap"
                  />

                  <Tab
                    label={
                      <>
                        <span>
                          {" "}
                          Upcoming{" "}
                          <b style={{ color: "#16a34a" }}>({upcomingCount})</b>
                        </span>
                      </>
                    }
                    className="fw-medium text-nowrap table-data px-1"
                  />

                  <Tab
                    label={
                      <>
                        <span>
                          Completed{" "}
                          <b style={{ color: "#16a34a" }}>({completedCount})</b>{" "}
                        </span>
                      </>
                    }
                    className="fw-medium text-nowrap table-data px-1"
                  />
                </Tabs>
              </AppBar>
            </Box>

            <div className="d-flex align-items-center gap-2 col-md-6 col-12 d-flex align-items-center justify-content-end">
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
                        setCurrentPage(1);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <FaTimes size={14} className="text-danger" />
                    </div>
                  )}
                </div>
              )}

              <button
                className="d-flex align-items-center position-relative p-0 border-0"
                style={{
                  borderRadius: "20px 10px 10px 20px",
                  background: "none",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
                onClick={() => {
                  navigate("/admin/manualbooking");
                  dispatch(resetOwnerClub());
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="p-md-1 p-2 rounded-circle bg-light"
                  style={{ position: "relative", left: "10px" }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      backgroundColor: "#1F41BB",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      fontSize: "20px",
                    }}
                  >
                    <span className="mb-1">+</span>
                  </div>
                </div>
                <div
                  className="d-flex align-items-center text-white fw-medium rounded-end-3"
                  style={{
                    backgroundColor: "#1F41BB",
                    padding: "0 16px",
                    height: "36px",
                    fontSize: "14px",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  Manual Booking
                </div>
              </button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col xs={12}>
          <div
            className="bg-white rounded shadow-sm p-2 p-md-3 d-flex flex-column"
            style={{ minHeight: "75vh" }}
          >
            <h6 className="mb-md-3 mb-2 tabel-title fs-6">
              {tab === 0
                ? "All Bookings"
                : tab === 1
                  ? "Upcoming Bookings"
                  : "Completed Bookings"}
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : bookings?.length > 0 ? (
              <>
                <div
                  className=" flex-grow-1"
                  style={{
                    overflowY: "auto",
                    overflowX: "auto",
                    flex: "1 1 auto",
                    maxHeight: "calc(100vh - 300px)",
                  }}
                >
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead>
                      <tr className="text-center">
                        <th className="d-lg-table-cell">Sr No.</th>
                        <th className="d-none d-lg-table-cell">User Name</th>
                        <th className="d-lg-none">User</th>
                        <th className="d-none d-md-table-cell">Contact</th>
                        <th>Date</th>
                        <th className="d-none d-lg-table-cell">Court No</th>
                        <th className="d-lg-none">Court</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((item, idx) => (
                        <tr
                          key={item?._id}
                          className="table-data border-bottom align-middle text-center"
                        >
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            {idx + 1 + (currentPage - 1) * defaultLimit}
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            {item?.userId?.name
                              ? item?.userId?.name.charAt(0).toUpperCase() +
                              item?.userId?.name?.slice(1)
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
                              <span className="text-muted small ms-2">
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
                              </span>
                            </div>
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "80px" }}
                          >
                            {item?.slot?.[0]?.courtName || "-"}
                          </td>
                          <td className="text-truncate">
                            {item?.bookingStatus === "in-progress" ? (
                              "Request"
                            ) : item?.bookingStatus === "refunded" ? (
                              "Cancelled"
                            ) : item?.bookingStatus === "rejected" ? (
                              <span style={{ color: "red" }}>Rejected</span>
                            ) : item?.bookingStatus ? (
                              item?.bookingStatus.charAt(0).toUpperCase() +
                              item?.bookingStatus?.slice(1)
                            ) : (
                              ""
                            )}
                          </td>
                          <td style={{ cursor: "pointer" }}>
                            {loadingBookingId === item?._id ? (
                              <ButtonLoading color="blue" size={8} />
                            ) : (
                              <div className="d-flex justify-content-center gap-1">
                                {tab !== 2 &&
                                  item?.bookingStatus !== "rejected" &&
                                  item?.bookingStatus !== "completed" &&
                                  item?.bookingStatus !== "in-progress" &&
                                  item?.bookingType !== "open Match" &&
                                  item?.bookingStatus !== "cancelled" && (
                                    <OverlayTrigger
                                      placement="left"
                                      overlay={<Tooltip>Cancel</Tooltip>}
                                    >
                                      <MdOutlineCancel
                                        onClick={() =>
                                          handleBookingDetails(
                                            item?._id,
                                            "cancel"
                                          )
                                        }
                                        className="text-danger"
                                        style={{ cursor: "pointer" }}
                                        size={16}
                                      />
                                    </OverlayTrigger>
                                  )}

                                <OverlayTrigger
                                  placement="bottom"
                                  overlay={<Tooltip>View Details</Tooltip>}
                                >
                                  <FaEye
                                    className="text-primary"
                                    onClick={() =>
                                      handleBookingDetails(item?._id, "details")
                                    }
                                    size={16}
                                  />
                                </OverlayTrigger>
                              </div>
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
                              ? item?.userId?.name.charAt(0).toUpperCase() +
                              item?.userId?.name?.slice(1)
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
                            {formatTime(
                              renderSlotTimes(item?.slot[0]?.slotTimes)
                            )}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Court:</span>
                          <span className="mobile-card-value">
                            {item?.slot?.[0]?.courtName || "-"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Actions:</span>
                          <div className="mobile-card-value">
                            {loadingBookingId === item?._id ? (
                              <ButtonLoading color="blue" size={8} />
                            ) : (
                              <div className="d-flex gap-2">
                                {tab !== 2 &&
                                  item?.bookingStatus !== "rejected" &&
                                  item?.bookingStatus !== "completed" &&
                                  item?.bookingStatus !== "in-progress" &&
                                  item?.bookingStatus !== "cancelled" && (
                                    <MdOutlineCancel
                                      onClick={() =>
                                        handleBookingDetails(
                                          item?._id,
                                          "cancel"
                                        )
                                      }
                                      className="text-danger"
                                      size={18}
                                    />
                                  )}
                                <FaEye
                                  className="text-primary"
                                  onClick={() =>
                                    handleBookingDetails(item?._id, "details")
                                  }
                                  size={18}
                                />
                              </div>
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
                {tab === 0
                  ? "bookings"
                  : tab === 1
                    ? "upcoming bookings"
                    : "completed bookings"}{" "}
                found!
              </div>
            )}

            {totalItems > defaultLimit && (
              <div
                className="pt-3 d-flex justify-content-center align-items-center border-top"
                style={{
                  marginTop: "auto",
                  backgroundColor: "white",
                }}
              >
                <Pagination
                  totalRecords={totalItems}
                  defaultLimit={defaultLimit}
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      <BookingDetailsModal
        show={showBookingDetails}
        handleClose={() => setShowBookingDetails(false)}
        bookingDetails={getBookingDetailsData?.booking || {}}
      />
      <BookingCancelModal
        show={showBookingCancel}
        onHide={() => setShowBookingCancel(false)}
        bookingDetails={getBookingDetailsData?.booking || {}}
        loading={updateBookingLoading}
        cancelBooking={(reason) => {
          dispatch(
            updateBookingStatus({
              id: getBookingDetailsData?.booking?._id,
              status: "cancelled",
              cancellationReason: reason,
            })
          )
            .unwrap()
            .then(() => {
              dispatch(
                getBookingByStatus({
                  ownerId,
                  page: currentPage,
                  limit: defaultLimit,
                })
              );
              setShowBookingCancel(false);
            });
        }}
      />
    </Container>
  );
};

export default Booking;
