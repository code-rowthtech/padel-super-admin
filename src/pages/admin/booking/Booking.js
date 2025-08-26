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
import { formatDate } from "../../../helpers/Formatting";
import { MdOutlineCancel } from "react-icons/md";
import { resetBookingData } from "../../../redux/admin/booking/slice";
import Pagination from "../../../helpers/Pagination";
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
    <Container fluid className="px-4">
      {/* Tabs & Manual Booking Button */}
      <Row className="mb-3">
        <Col
          md={12}
          className="d-flex justify-content-between align-items-center"
        >
          <Box
            sx={{
              bgcolor: "white",
              borderBottom: 1,
              borderColor: "divider",
              paddingRight: 5,
              paddingLeft: 5,
            }}
          >
            <AppBar
              position="static"
              color="default"
              elevation={0}
              sx={{ bgcolor: "white" }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 500,
                    textTransform: "none",
                    fontSize: "15px",
                    color: "#555", // inactive tab color
                  },
                  "& .Mui-selected": {
                    color: "#1a4ed8", // active tab color
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#1a4ed8",
                    height: "3px",
                    borderRadius: "2px",
                  },
                }}
              >
                <Tab label="Upcoming" style={{ width: "150px" }} />
                <Tab label="Completed" style={{ width: "150px" }} />
              </Tabs>
            </AppBar>
          </Box>

          <button
            className="d-flex align-items-center position-relative p-0 border-0"
            style={{
              borderRadius: "20px 10px 10px 20px",
              background: "none",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/admin/manualbooking")}
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
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="mb-3 tabel-title">
              {tab === 0 ? "Upcoming Bookings" : "Completed Bookings"}
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : bookings.length > 0 ? (
              <div className="custom-scroll-container">
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr className="text-center">
                      <th>User Name</th>
                      <th>Booking Date</th>
                      {/* <th>Contact</th> */}
                      {/* <th>Booking</th> */}
                      <th>Court No</th>
                      {/* <th>Slot</th>
                      <th>Amount</th> */}
                      {/* <th>Date/Time</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings?.map((item) => (
                      <tr key={item?._id} className="table-data border-bottom">
                        <td>
                          {item?.userId?.name
                            ?.slice(0, 1)
                            ?.toUpperCase()
                            ?.concat(item?.userId?.name?.slice(1)) || "N/A"}
                        </td>
                        <td>{formatDate(item?.bookingDate)}</td>

                        {/* <td>
                          {item?.userId?.countryCode || ""}{" "}
                          {item?.userId?.phoneNumber || "N/A"}
                        </td> */}
                        {/* <td>
                          {item?.bookingType
                            ?.slice(0, 1)
                            ?.toUpperCase()
                            ?.concat(item?.bookingType?.slice(1)) || "-"}
                        </td> */}
                        <td>{item?.slot?.[0]?.courtName || "-"}</td>
                        {/* <td>
                          {item?.slot[0]?.businessHours?.[0]?.day || ""}{" "}
                          {renderSlotTimes(item?.slot?.[0]?.slotTimes)}
                        </td>
                        <td>₹{item?.totalAmount}</td> */}
                        {/* <td>
                          {format(
                            new Date(item?.createdAt),
                            "dd/MM/yyyy | hh:mm a"
                          )}
                        </td> */}
                        <td style={{ cursor: "pointer" }}>
                          {loadingBookingId === item?._id ? (
                            <ButtonLoading color="blue" size={7} />
                          ) : (
                            <>
                              {tab !== 1 && (
                                <OverlayTrigger
                                  placement="left"
                                  overlay={<Tooltip>Cancel</Tooltip>}
                                >
                                  <MdOutlineCancel
                                    onClick={() =>
                                      handleBookingDetails(item?._id, "cancel")
                                    }
                                    className="text-danger me-1"
                                    style={{ cursor: "pointer" }}
                                    size={18}
                                  />
                                </OverlayTrigger>
                              )}
                              <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip>View Details</Tooltip>}
                              >
                                <FaEye
                                  className="text-primary ms-1"
                                  onClick={() =>
                                    handleBookingDetails(item?._id, "details")
                                  }
                                  size={18}
                                />
                              </OverlayTrigger>
                            </>
                          )}
                        </td>
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
