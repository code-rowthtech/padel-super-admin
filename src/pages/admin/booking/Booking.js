import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
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

  // State
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingCancel, setShowBookingCancel] = useState(false);
  const [tab, setTab] = useState(0);
  const [loadingBookingId, setLoadingBookingId] = useState(null);

  const statusList = ["upcoming", "completed"];
  const status = statusList[tab];

  const {
    getBookingData,
    getBookingLoading,
    getBookingDetailsData,
    updateBookingLoading,
  } = useSelector((state) => state.booking);

  const bookings = getBookingData?.bookings || [];
  const bookingDetails = getBookingDetailsData?.booking || {};
  const defaultLimit = 10;
  // Fetch bookings on tab change
  useEffect(() => {
    dispatch(resetBookingData());
    dispatch(
      getBookingByStatus({
        status,
        ownerId,
        page: currentPage,
        limit: defaultLimit,
      })
    );
  }, [tab, currentPage]);

  const handleBookingDetails = async (id, type) => {
    setLoadingBookingId(id);
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      type === "details"
        ? setShowBookingDetails(true)
        : setShowBookingCancel(true);
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingBookingId(null);
    }
  };

  const renderSlotTimes = (slotTimes) =>
    slotTimes?.length ? slotTimes.map((slot) => slot.time).join(", ") : "-";
  const totalRecords = getBookingData?.totalItems || 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <Container fluid className="px-2 px-md-4">
      {/* Heading & Manual Booking Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4
          className="fw-bold mb-0"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
        >
          Bookings
        </h4>
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
            className="p-1 rounded-circle bg-light"
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

      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-lg-center gap-3">
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
                      minWidth: { xs: "100px", sm: "120px" },
                    },
                  }}
                >
                  <Tab className="fw-medium table-data" label="Upcoming" />
                  <Tab className="fw-medium table-data" label="Completed" />
                </Tabs>
              </AppBar>
            </Box>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div className="bg-white rounded shadow-sm p-2 p-md-3">
            <h6 className="mb-3 tabel-title fs-6">
              {tab === 0 ? "Upcoming Bookings" : "Completed Bookings"}
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : bookings.length > 0 ? (
              <>
                {/* Desktop Table */}
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
                              <span className="text-muted small ms-2">
                                {formatTime(
                                  renderSlotTimes(item?.slot[0]?.slotTimes)
                                )}
                              </span>
                            </div>
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "80px" }}
                          >
                            {item?.slot?.[0]?.courtName || "-"}
                          </td>
                          <td style={{ cursor: "pointer" }}>
                            {loadingBookingId === item?._id ? (
                              <ButtonLoading color="blue" size={8} />
                            ) : (
                              <div className="d-flex justify-content-center gap-1">
                                {tab !== 1 && (
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

                {/* Mobile Card Layout */}
                <div className="mobile-card-table d-block d-md-none">
                  {bookings?.map((item) => (
                    <div key={item?._id} className="card">
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
                                {tab !== 1 && (
                                  <MdOutlineCancel
                                    onClick={() =>
                                      handleBookingDetails(item?._id, "cancel")
                                    }
                                    className="text-danger"
                                    style={{ cursor: "pointer" }}
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
                No {tab === 0 ? "Upcoming Bookings" : "Completed Bookings"} were
                Found !
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          <Pagination
            totalRecords={totalRecords}
            defaultLimit={defaultLimit}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </Col>
      </Row>

      {/* Modals */}
      <BookingDetailsModal
        show={showBookingDetails}
        handleClose={() => setShowBookingDetails(false)}
        bookingDetails={bookingDetails}
      />
      <BookingCancelModal
        show={showBookingCancel}
        onHide={() => setShowBookingCancel(false)}
        bookingDetails={bookingDetails}
        loading={updateBookingLoading}
        cancelBooking={(reason) => {
          dispatch(
            updateBookingStatus({
              id: bookingDetails?._id,
              status: "in-progress",
              cancellationReason: reason,
            })
          )
            .unwrap()
            .then(() => {
              dispatch(getBookingByStatus({ status, ownerId }));
              setShowBookingCancel(false);
            });
        }}
      />
    </Container>
  );
};

export default Booking;
