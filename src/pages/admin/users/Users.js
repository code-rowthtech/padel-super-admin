import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getBookingByStatus,
  getBookingDetailsById,
  updateBookingStatus,
} from "../../../redux/thunks";
import { FaEye } from "react-icons/fa";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { formatDate } from "../../../helpers/Formatting";
import { MdOutlineCancel } from "react-icons/md";
import { resetBookingData } from "../../../redux/admin/booking/slice";
import Pagination from "../../../helpers/Pagination";
import UserModal from "./modal/UserModal";

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const Owner = getOwnerFromSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
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

  // Fetch bookings on tab change
  useEffect(() => {
    dispatch(resetBookingData());
    dispatch(
      getBookingByStatus({ status, ownerId: Owner?._id, page: currentPage })
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
  const selectedUser = {};
  return (
    <Container fluid className="px-4">
      {/* Tabs & Manual Booking Button */}
      <Row className="mb-3">
        <Col
          md={12}
          className="d-flex justify-content-between align-items-center"
        >
          <h3>Users</h3>
          {!Owner?.generatedBy && (
            <button
              className="d-flex align-items-center position-relative p-0 border-0"
              style={{
                borderRadius: "20px 10px 10px 20px",
                background: "none",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() => setShowUserModal(true)}
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
                Add User
              </div>
            </button>
          )}
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : bookings.length > 0 ? (
              <div className="custom-scroll-container">
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr className="text-center">
                      <th>User</th>
                      <th>Contact</th>
                      <th>Booking Type</th>
                      <th>Court Name</th>
                      <th>Slot Time</th>
                      <th>Booking Amount</th>
                      <th>Booking Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings?.map((item) => (
                      <tr key={item._id} className="table-data border-bottom">
                        <td>{item?.userId?.name || "N/A"}</td>
                        <td>
                          {item?.userId?.countryCode || ""}{" "}
                          {item?.userId?.phoneNumber || "N/A"}
                        </td>
                        <td>{item?.bookingType || "-"}</td>
                        <td>{item?.slot[0]?.courtName || "-"}</td>
                        <td>
                          <OverlayTrigger
                            placement="left"
                            overlay={
                              <Tooltip>
                                {renderSlotTimes(item?.slot[0]?.slotTimes)}
                              </Tooltip>
                            }
                          >
                            <b>
                              {renderSlotTimes(
                                item?.slot[0]?.slotTimes.slice(0, 4)
                              )}
                            </b>
                          </OverlayTrigger>
                        </td>
                        <td>₹{item?.totalAmount}</td>
                        <td>{formatDate(item?.bookingDate)}</td>
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
                No User's were Found !
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
      <UserModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        userData={selectedUser}
      />
    </Container>
  );
};

export default Users;
