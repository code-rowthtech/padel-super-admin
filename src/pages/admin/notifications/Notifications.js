import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { MdNotificationsActive, MdSend, MdOutlineReplay } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getAdminBulkNotifications, resendBulkNotification } from "../../../redux/admin/notifiction/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import NotificationModal from "./NotificationModal";
import Pagination from "../../../helpers/Pagination";

const Notifications = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [resendTarget, setResendTarget] = useState(null);
  const [resending, setResending] = useState(false);

  const { bulkNotifications, bulkNotificationsLoading: loading, bulkNotificationsPagination: pagination } =
    useSelector((state) => state.notificationData);

  useEffect(() => {
    dispatch(getAdminBulkNotifications({ page: currentPage, notificationType: typeFilter || undefined }));
  }, [dispatch, currentPage, typeFilter]);

  const handleResendConfirm = async () => {
    setResending(true);
    await dispatch(resendBulkNotification(resendTarget._id));
    setResending(false);
    setResendTarget(null);
  };

  const handleModalClose = (refreshList) => {
    setShowModal(false);
    if (refreshList) {
      dispatch(getAdminBulkNotifications({ page: currentPage, notificationType: typeFilter || undefined }));
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

  const notificationList = bulkNotifications?.notifications || [];

  return (
    <Container fluid className="px-0 h-100 bg-white px-md-4">
      <Row className="mb-5">
        <Col xs={12} className="px-0">
          <div
            className="bg-white rounded p-2 p-md-3 d-flex flex-column"
            style={{ minHeight: "80vh" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
              <h6 className="mb-0 tabel-title fs-6">Manage Notifications</h6>
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative d-flex align-items-center">
                  <select
                    value={typeFilter}
                    className="px-3 bg-white fw-light rounded-3 border border-secondary"
                    onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                      appearance: 'none',
                      height: "36px",
                      width: '10rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">All</option>
                    <option value="instant">Instant</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <IoChevronDown size={14} style={{ position: "absolute", right: "10px", pointerEvents: "none", color: "#1F41BB" }} />
                </div>
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
                      <th>Type</th>
                      <th>Recipients</th>
                      <th>Date</th>
                      <th>Send Time</th>
                      <th>Actions</th>
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
                              backgroundColor: notif.notificationType === "scheduled" ? "#FFF3CD" : "#E8F5E9",
                              color: notif.notificationType === "scheduled" ? "#856404" : "#2E7D32",
                              padding: "3px 10px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "500",
                            }}
                          >
                            {notif.notificationType === "scheduled" ? "Scheduled" : "Instant"}
                          </span>
                        </td>
                        <td>
                          {notif.notificationType === "scheduled" ? (
                            <span className="text-muted">—</span>
                          ) : (
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
                          )}
                        </td>
                        <td className="text-muted" style={{ fontSize: "13px" }}>
                          {formatDate(notif.createdAt)}
                        </td>
                        <td className="text-muted" style={{ fontSize: "13px" }}>
                          {notif.notificationType === "scheduled" && notif.sendTime ? notif.sendTime : "—"}
                        </td>
                        <td>
                          {notif.notificationType === "scheduled" ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Scheduled notification — resend not available</Tooltip>}
                            >
                              <span style={{ display: "inline-block" }}>
                                <MdOutlineReplay size={18} style={{ color: "#ccc", cursor: "not-allowed" }} />
                              </span>
                            </OverlayTrigger>
                          ) : (
                            <button
                              title="Resend"
                              onClick={() => setResendTarget(notif)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#1F41BB" }}
                            >
                              <MdOutlineReplay size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {!loading && pagination?.totalPages > 1 && (
              <Pagination
                totalRecords={pagination.totalItems}
                defaultLimit={pagination.itemsPerPage}
                handlePageChange={setCurrentPage}
                currentPage={currentPage}
              />
            )}
          </div>
        </Col>
      </Row>

      <NotificationModal show={showModal} onClose={handleModalClose} />

      {resendTarget && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={() => !resending && setResendTarget(null)}
        >
          <div
            className="bg-white rounded p-4"
            style={{ maxWidth: "420px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h6 className="mb-2 fw-semibold">Resend Notification</h6>
            <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
              Are you sure you want to resend{resendTarget.title ? <> <strong>"{resendTarget.title}"</strong></> : ""} to all original recipients?
            </p>
            <p className="mb-3" style={{ fontSize: "13px", color: "#888" }}>
              This will re-deliver the notification to{" "}
              <strong>{resendTarget.totalRecipients ?? (resendTarget.sentTo?.length || 0)}</strong> recipient(s).
            </p>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" size="sm" onClick={() => setResendTarget(null)} disabled={resending}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={resending}
                style={{ backgroundColor: "#1F41BB", border: "none" }}
                onClick={handleResendConfirm}
              >
                {resending ? "Resending..." : "Yes, Resend"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Notifications;
