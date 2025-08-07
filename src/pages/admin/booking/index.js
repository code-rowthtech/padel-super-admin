import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  getBookingByStatus,
  getBookingDetailsById,
} from "../../../redux/thunks";
import { FaEye } from "react-icons/fa";
import {
  ButtonLoading,
  DataLoading,
  Loading,
} from "../../../helpers/loading/Loaders";
import { BookingDetailsModal } from "./manual booking/BookingModal";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { formatDate } from "../../../helpers/Formatting";
const Booking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  const {
    getBookingData,
    getBookingLoading,
    getBookingDetailsData,
    getBookingDetailsLoading,
  } = useSelector((state) => state.booking);
  const [tab, setTab] = useState(0);
  const ownerId = getUserFromSession()?._id;
  const [loadingBookingId, setLoadingBookingId] = useState(null);

  useEffect(() => {
    const status = tab === 0 ? "upcoming" : "completed";
    dispatch(getBookingByStatus({ status, ownerId }));
  }, [tab]);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const bookings = getBookingData?.bookings || [];
  const bookingDetails = getBookingDetailsData?.booking || [];

  const handleBookingDetails = async (id) => {
    setLoadingBookingId(id); // Start loading for this ID
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      setShowBookingDetails(true);
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingBookingId(null); // Stop loading
    }
  };

  return (
    <Container fluid className="mt-4 px-4">
      <Row className="mb-3">
        <Col
          md={12}
          className="d-flex justify-content-between align-items-center"
        >
          {/* Tabs */}
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
                <Tab className="fw-medium table-data" label="Upcoming" />
                <Tab className="fw-medium table-data" label="Completed" />
              </Tabs>
            </AppBar>
          </Box>

          {/* Manual Booking Button */}
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
                  backgroundColor: "#194DD5",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "20px",
                }}
              >
                +
              </div>
            </div>

            <div
              className="d-flex align-items-center text-white fw-medium"
              style={{
                backgroundColor: "#194DD5",
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
            ) : (
              <div
                className="custom-scroll-container"
                style={{ maxHeight: "290px", overflowY: "auto" }}
              >
                {bookings?.length > 0 ? (
                  <Table responsive borderless size="sm">
                    <thead>
                      <tr className="text-center">
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          User
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Contact
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Booking Type
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Court Name
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Slot Time
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Booking Amount
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Booking Date
                        </th>
                        <th
                          className="py-2 ps-4"
                          style={{
                            backgroundColor: "#D0D6EA",
                            fontWeight: "400",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((item, index) => (
                        <tr key={index} className="text-center">
                          <td className="py-2 ps-4 table-data border-bottom">
                            {item?.userId?.name || "N/A"}
                          </td>
                          <td className="py-2 ps-4 table-data border-bottom">
                            {item?.userId?.countryCode || ""}{" "}
                            {item?.userId?.phoneNumber || "N/A"}
                          </td>
                          <td className="py-2 ps-4 table-data border-bottom">
                            {item?.bookingType || "-"}
                          </td>
                          <td className="py-2 ps-4 table-data border-bottom">
                            {item?.slot[0]?.courtName || "-"}
                          </td>
                          <td className="py-2 ps-4 table-data border-bottom">
                            {item?.slot[0]?.slotTimes?.length
                              ? item?.slot[0]?.slotTimes
                                  ?.map((slot) => slot.time)
                                  .join(", ")
                              : "-"}
                          </td>
                          <td className="py-2 ps-4 table-data border-bottom">
                            ₹{item?.totalAmount}
                          </td>
                          <td className="py-2 ps-4 table-data border-bottom">
                            {formatDate(item?.bookingDate)}
                          </td>
                          <td
                            className="py-2 ps-4 table-data border-bottom"
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
                    No {tab === 0 ? "Upcoming Bookings" : "Completed Bookings"}{" "}
                    were Found !
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
      <BookingDetailsModal
        show={showBookingDetails}
        handleClose={() => setShowBookingDetails(false)}
        bookingDetails={bookingDetails}
      />
    </Container>
  );
};

export default Booking;
