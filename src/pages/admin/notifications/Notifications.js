import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
} from "react-bootstrap";
import { MdNotificationsActive, MdSend } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAdminBulkNotifications } from "../../../redux/admin/notifiction/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import NotificationModal from "./NotificationModal";

const Notifications = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const { bulkNotifications, bulkNotificationsLoading: loading } =
    useSelector((state) => state.notificationData);

  useEffect(() => {
    dispatch(getAdminBulkNotifications());
  }, [dispatch]);

  const handleModalClose = (refreshList) => {
    setShowModal(false);
    if (refreshList) {
      dispatch(getAdminBulkNotifications());
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // API response shape: { success, notifications: [...] }
  const notificationList = Array.isArray(bulkNotifications)
    ? bulkNotifications
    : bulkNotifications?.notifications || [];

  return (
    <Container fluid className="px-0 bg-white px-md-4">
      <Row className="mb-5">
        <Col xs={12} className="px-0">
          <div
            className="bg-white shadow-sm rounded p-2 p-md-3 d-flex flex-column"
            style={{ minHeight: "75vh" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
              <h6 className="mb-0 tabel-title fs-6">Manage Notifications</h6>
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onClick={() => setShowModal(true)}
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
                      fontSize: "18px",
                    }}
                  >
                    <MdSend size={16} />
                  </div>
                </div>
                <div
                  className="d-flex align-items-center fw-medium rounded-end-3"
                  style={{
                    padding: "0 16px",
                    height: "36px",
                    fontSize: "14px",
                    fontFamily: "Nunito, sans-serif",
                    color: "#1F41BB",
                    border: "1px solid #1F41BB",
                  }}
                >
                  Send Notification
                </div>
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <DataLoading height="60vh" />
            ) : notificationList.length === 0 ? (
              <div
                className="d-flex flex-column text-muted justify-content-center align-items-center"
                style={{ height: "60vh" }}
              >
                <MdNotificationsActive
                  size={56}
                  style={{ opacity: 0.15, color: "#1F41BB" }}
                />
                <p className="mt-3 mb-0 fw-medium">No notifications sent yet.</p>
                <small>Use the button above to send your first notification.</small>
              </div>
            ) : (
              <div
                className="flex-grow-1"
                style={{
                  overflowY: "auto",
                  overflowX: "auto",
                  flex: "1 1 auto",
                  maxHeight: "calc(100vh - 300px)",
                }}
              >
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr className="text-center">
                      <th>Sr No.</th>
                      <th>Title</th>
                      <th className="d-none d-lg-table-cell">Message</th>
                      <th>Recipients</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationList.map((notif, idx) => (
                      <tr
                        key={idx}
                        className="table-data border-bottom align-middle text-center"
                      >
                        <td>{idx + 1}</td>
                        <td
                          className="text-truncate fw-medium"
                          style={{ maxWidth: "180px" }}
                        >
                          {notif.title || "—"}
                        </td>
                        <td
                          className="d-none d-lg-table-cell text-truncate text-muted"
                          style={{ maxWidth: "300px" }}
                        >
                          {notif.message || "—"}
                        </td>
                        <td>
                          <span
                            style={{
                              backgroundColor: "#1F41BB1A",
                              color: "#1F41BB",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {notif.totalRecipients ?? (notif.sentTo?.length || 0)}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: "13px" }}>
                          {formatDate(notif.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <NotificationModal show={showModal} onClose={handleModalClose} />
    </Container>
  );
};

export default Notifications;
