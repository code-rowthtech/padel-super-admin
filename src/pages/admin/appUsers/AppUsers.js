import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Card, Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAppUsers, getDeviceTypeCount, updateCustomerStatus, deleteCustomer } from "../../../redux/admin/appUsers/thunk";
import { DataLoading, ButtonLoading } from "../../../helpers/loading/Loaders";
import Pagination from "../../../helpers/Pagination";
import { FaApple, FaAndroid, FaUsers, FaTrash, FaUserSlash, FaUserCheck } from "react-icons/fa";

const AppUsers = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const defaultLimit = 20;

  const { users, deviceCounts, loading, actionLoading } = useSelector((state) => state.appUsers);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, user: null });

  const usersData = users?.data || [];
  const totalItems = users?.total || 0;
  const iphoneUsers = deviceCounts?.response?.ios || 0;
  const androidUsers = deviceCounts?.response?.android || 0;
  const totalDeviceUsers = iphoneUsers + androidUsers;

  useEffect(() => {
    dispatch(getAppUsers({ page: currentPage, limit: defaultLimit }));
    dispatch(getDeviceTypeCount());
  }, [dispatch, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openConfirm = (type, user) => setConfirmModal({ show: true, type, user });
  const closeConfirm = () => setConfirmModal({ show: false, type: null, user: null });

  const handleConfirm = async () => {
    const { type, user } = confirmModal;
    if (type === "status") {
      const result = await dispatch(updateCustomerStatus({ id: user._id, isActive: !user.isActive }));
      if (result.type === "appUsers/updateCustomerStatus/fulfilled") {
        dispatch(getAppUsers({ page: currentPage, limit: defaultLimit }));
      }
    } else if (type === "delete") {
      const result = await dispatch(deleteCustomer(user._id));
      if (result.type === "appUsers/deleteCustomer/fulfilled") {
        dispatch(getAppUsers({ page: currentPage, limit: defaultLimit }));
      }
    }
    closeConfirm();
  };

  const statsCards = [
    { title: "iPhone Users", cardBorder: "1px solid #1F41BB1A", value: iphoneUsers, iconBg: '#1F41BB1A', icon: <FaApple style={{ color: '#1F41BB' }} size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #E0E3F2 121.05%)' },
    { title: "Android Users", cardBorder: "1px solid #0596691A", value: androidUsers, iconBg: '#D1FAE5', icon: <FaAndroid style={{ color: '#059669' }} size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #D1FAE5 121.05%)' },
    { title: "Total Users", cardBorder: "1px solid #D977061A", value: totalItems, iconBg: '#FEF3C7', icon: <FaUsers style={{ color: '#D97706' }} size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #FEF3C7 121.05%)' },
  ];

  return (
    <Container fluid className="px-0 bg-white px-md-4 h-100" style={{ display: 'flex', flexDirection: 'column' }}>
      <Row className="mb-0" style={{ flexShrink: 0 }}>
        {statsCards.map((card, idx) => (
          <Col key={idx} md={4} sm={6} className="mb-0 py-4">
            <Card style={{ background: card?.tileBg, border: card?.cardBorder, boxShadow: '0px 0px 8.8px 0px #0000001A' }} className="border-0 h-100 rounded-4">
              <Card.Body className="d-flex flex-column gap-3">
                <p className="rounded-2 m-0 d-flex align-items-center justify-content-center p-2" style={{ background: card?.iconBg, width: 'fit-content' }}>
                  {card.icon}
                </p>
                <small className="text-muted fw-semibold fs-6 m-0">{card.title}</small>
                <h5 className="m-0 fw-bold">{card.value.toLocaleString()}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mb-0" style={{ flex: 1, minHeight: 0 }}>
        <Col xs={12} className="px-0" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div
            className="bg-white rounded shadow-sm p-2 p-md-3 d-flex flex-column"
            style={{ height: '100%' }}>
            {loading ? (
              <DataLoading height="60vh" />
            ) : usersData?.length > 0 ? (
              <>
                <div
                  className="flex-grow-1"
                  style={{
                    overflowY: "auto",
                    overflowX: "auto",
                    flex: "1 1 auto",
                    minHeight: 0
                  }}
                >
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                      <tr className="text-center">
                        <th className="d-lg-table-cell">Sr No.</th>
                        <th className="d-none d-lg-table-cell">User Name</th>
                        <th className="d-lg-none">User</th>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.map((user, idx) => (
                        <tr
                          key={user?._id}
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
                            style={{ maxWidth: "150px" }}
                          >
                            {user?.name
                              ? user.name.charAt(0).toUpperCase() +
                              user.name.slice(1)
                              : "N/A"}
                          </td>
                          <td className="small">
                            {user?.countryCode || ""} {user?.phoneNumber || "N/A"}
                          </td>
                          <td>
                            <div
                              onClick={() => openConfirm("status", user)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                cursor: "pointer",
                                width: 42,
                                height: 22,
                                borderRadius: 999,
                                backgroundColor: user?.isActive ? "#198754" : "#adb5bd",
                                padding: "2px 3px",
                                transition: "background-color 0.25s",
                                justifyContent: user?.isActive ? "flex-end" : "flex-start",
                              }}
                            >
                              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                            </div>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="p-1"
                              style={{ minWidth: "32px" }}
                              onClick={() => openConfirm("delete", user)}
                            >
                              <FaTrash size={13} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="mobile-card-table d-block d-md-none">
                  {usersData?.map((user) => (
                    <div key={user?._id} className="card mb-2">
                      <div className="card-body">
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Name:</span>
                          <span className="mobile-card-value">
                            {user?.name
                              ? user.name.charAt(0).toUpperCase() +
                              user.name.slice(1)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Email:</span>
                          <span className="mobile-card-value">
                            {user?.email || "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Phone:</span>
                          <span className="mobile-card-value">
                            {user?.countryCode || ""} {user?.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Status:</span>
                          <span className="mobile-card-value">
                            <div
                              onClick={() => openConfirm("status", user)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                cursor: "pointer",
                                width: 42,
                                height: 22,
                                borderRadius: 999,
                                backgroundColor: user?.isActive ? "#198754" : "#adb5bd",
                                padding: "2px 3px",
                                transition: "background-color 0.25s",
                                justifyContent: user?.isActive ? "flex-end" : "flex-start",
                              }}
                            >
                              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                            </div>
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Actions:</span>
                          <span className="mobile-card-value">
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="p-1"
                              onClick={() => openConfirm("delete", user)}
                            >
                              <FaTrash size={13} />
                            </Button>
                          </span>
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
                No users found!
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Modal show={confirmModal.show} onHide={closeConfirm} centered>
        <Modal.Body className="text-center px-4 pt-4 pb-3">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: confirmModal.type === "delete" ? "#FEE2E2" : confirmModal.user?.isActive ? "#FEF3C7" : "#D1FAE5",
            }}
          >
            {confirmModal.type === "delete" ? (
              <FaTrash size={26} color="#DC2626" />
            ) : confirmModal.user?.isActive ? (
              <FaUserSlash size={26} color="#D97706" />
            ) : (
              <FaUserCheck size={26} color="#059669" />
            )}
          </div>

          <h5 className="fw-bold mb-2">
            {confirmModal.type === "delete"
              ? "Delete User"
              : confirmModal.user?.isActive
                ? "Deactivate User"
                : "Activate User"}
          </h5>

          <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
            {confirmModal.type === "delete" ? (
              <>Are you sure you want to permanently delete{" "}<strong className="text-dark">{confirmModal.user?.name}</strong>?{" "}This action <span className="text-danger fw-semibold">cannot be undone</span>.</>
            ) : confirmModal.user?.isActive ? (
              <>Are you sure you want to <span className="fw-">deactivate</span>{" "}<strong className="text-dark">{confirmModal.user?.name}</strong>? They will lose access to the app.</>
            ) : (
              <>Are you sure you want to <span className="fw">activate</span>{" "}<strong className="text-dark">{confirmModal.user?.name}</strong>? They will regain access to the app.</>
            )}
          </p>
        </Modal.Body>

        <Modal.Footer className="border-0 justify-content-center gap-2 px-4 pb-4 pt-1">
          <Button
            variant="outline-secondary"
            onClick={closeConfirm}
            style={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            // variant={confirmModal.type === "delete" ? "danger" : confirmModal.user?.status ? "warning" : "success"}
            onClick={handleConfirm}
            disabled={actionLoading}
            style={{ minWidth: 100 }}
          >
            {actionLoading ? <ButtonLoading size={8} /> : confirmModal.type === "delete" ? "Delete" : confirmModal.user?.isActive ? "Deactivate" : "Activate"}
          </Button>
        </Modal.Footer>
      </Modal>

      {totalItems > defaultLimit && (
        <Row style={{ flexShrink: 0 }}>
          <Col xs={12} className="px-0">
            <div
              className="pt-3 pb-3 d-flex justify-content-center align-items-center bg-white"
            >
              <Pagination
                totalRecords={totalItems}
                defaultLimit={defaultLimit}
                handlePageChange={handlePageChange}
                currentPage={currentPage}
              />
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AppUsers;
