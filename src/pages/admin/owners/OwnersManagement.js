import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import { FaEdit, FaTrash, FaBan, FaCheckCircle, FaPlus } from "react-icons/fa";
import { ownerApi } from "../../../helpers/api/apiCore";
import {
  SUPER_ADMIN_GET_ALL_OWNERS,
  SUPER_ADMIN_CREATE_OWNER,
  SUPER_ADMIN_UPDATE_OWNER,
  SUPER_ADMIN_SUSPEND_OWNER,
  SUPER_ADMIN_ACTIVATE_OWNER,
  SUPER_ADMIN_DELETE_OWNER,
} from "../../../helpers/api/apiEndpoint";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { showSuccess, showError } from "../../../helpers/Toast";

const OwnersManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    domainLink: "",
  });
  const [errors, setErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await ownerApi.get(SUPER_ADMIN_GET_ALL_OWNERS);
      setOwners(response.data?.data?.owners || []);
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to fetch owners");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (owner = null) => {
    if (owner) {
      setSelectedOwner(owner);
      setFormData({
        name: owner.name || "",
        email: owner.email || "",
        password: "",
        phoneNumber: owner.phoneNumber || "",
        domainLink: owner.domainLink || "",
      });
    } else {
      setSelectedOwner(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        domainLink: "",
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOwner(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      domainLink: "",
    });
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = "Invalid email format";
    }
    if (!selectedOwner && !formData.password.trim()) {
      errs.password = "Password is required for new owner";
    }
    if (!formData.phoneNumber) errs.phoneNumber = "Phone number is required";
    if (!formData.domainLink.trim()) errs.domainLink = "Domain link is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setActionLoading(true);
      if (selectedOwner) {
        // Update owner - exclude password if empty, and exclude countryCode
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        delete updateData.countryCode; // Remove countryCode from update
        await ownerApi.put(`${SUPER_ADMIN_UPDATE_OWNER}/${selectedOwner._id}`, updateData);
        showSuccess("Owner updated successfully");
      } else {
        // Create owner - exclude countryCode
        const createData = { ...formData };
        delete createData.countryCode; // Remove countryCode from create
        await ownerApi.post(SUPER_ADMIN_CREATE_OWNER, createData);
        showSuccess("Owner created successfully");
      }
      handleCloseModal();
      fetchOwners();
    } catch (error) {
      showError(error?.response?.data?.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (ownerId) => {
    try {
      setActionLoading(true);
      await ownerApi.put(`${SUPER_ADMIN_SUSPEND_OWNER}/${ownerId}`);
      showSuccess("Owner suspended successfully");
      fetchOwners();
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to suspend owner");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (ownerId) => {
    try {
      setActionLoading(true);
      await ownerApi.put(`${SUPER_ADMIN_ACTIVATE_OWNER}/${ownerId}`);
      showSuccess("Owner activated successfully");
      fetchOwners();
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to activate owner");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await ownerApi.delete(`${SUPER_ADMIN_DELETE_OWNER}/${selectedOwner._id}`);
      showSuccess("Owner deleted successfully");
      setShowDeleteModal(false);
      setSelectedOwner(null);
      fetchOwners();
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to delete owner");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container fluid className="px-0 px-md-4 mt-md-0 mt-2">
      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Owners Management</h4>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <FaPlus className="me-2" />
              Create Owner
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <div className="bg-white rounded shadow-sm p-md-3 p-2">
            <h6 className="mb-3 tabel-title">Owners List</h6>
            {loading ? (
              <DataLoading height="400px" />
            ) : owners.length === 0 ? (
              <div
                className="d-flex text-danger justify-content-center align-items-center"
                style={{ height: "60vh" }}
              >
                No owners found
              </div>
            ) : (
              <>
                <div className="custom-scroll-container d-none d-md-block">
                  <Table
                    responsive
                    borderless
                    size="sm"
                    className="custom-table"
                  >
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Domain</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {owners.map((owner) => (
                        <tr
                          key={owner._id}
                          className="table-data border-bottom align-middle text-center"
                        >
                          <td className="text-truncate" style={{ maxWidth: "150px" }}>
                            {owner.name || "N/A"}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: "200px" }}>
                            {owner.email}
                          </td>
                          <td className="d-none d-md-table-cell small">
                            {owner.countryCode || ""} {owner.phoneNumber || "N/A"}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: "200px" }}>
                            <a
                              href={owner.domainLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              {owner.domainLink || "N/A"}
                            </a>
                          </td>
                          <td>
                            {owner.isSuspended ? (
                              <Badge bg="danger">Suspended</Badge>
                            ) : owner.isActive ? (
                              <Badge bg="success">Active</Badge>
                            ) : (
                              <Badge bg="secondary">Inactive</Badge>
                            )}
                          </td>
                          <td style={{ cursor: "pointer" }}>
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleOpenModal(owner)}
                                disabled={actionLoading}
                                className="p-1"
                                style={{ minWidth: "32px" }}
                              >
                                <FaEdit size={14} />
                              </Button>
                              {owner.isSuspended ? (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleActivate(owner._id)}
                                  disabled={actionLoading}
                                  className="p-1"
                                  style={{ minWidth: "32px" }}
                                >
                                  <FaCheckCircle size={14} />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => handleSuspend(owner._id)}
                                  disabled={actionLoading}
                                  className="p-1"
                                  style={{ minWidth: "32px" }}
                                >
                                  <FaBan size={14} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => {
                                  setSelectedOwner(owner);
                                  setShowDeleteModal(true);
                                }}
                                disabled={actionLoading}
                                className="p-1"
                                style={{ minWidth: "32px" }}
                              >
                                <FaTrash size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="mobile-card-table d-block d-md-none">
                  {owners.map((owner) => (
                    <div key={owner._id} className="card mb-2">
                      <div className="card-body">
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Name:</span>
                          <span className="mobile-card-value">{owner.name || "N/A"}</span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Email:</span>
                          <span className="mobile-card-value">{owner.email}</span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Phone:</span>
                          <span className="mobile-card-value">
                            {owner.countryCode || ""} {owner.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Domain:</span>
                          <span className="mobile-card-value">
                            <a
                              href={owner.domainLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              {owner.domainLink || "N/A"}
                            </a>
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Status:</span>
                          <span className="mobile-card-value">
                            {owner.isSuspended ? (
                              <Badge bg="danger">Suspended</Badge>
                            ) : owner.isActive ? (
                              <Badge bg="success">Active</Badge>
                            ) : (
                              <Badge bg="secondary">Inactive</Badge>
                            )}
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Actions:</span>
                          <div className="mobile-card-value">
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleOpenModal(owner)}
                                disabled={actionLoading}
                                className="p-1"
                              >
                                <FaEdit size={14} />
                              </Button>
                              {owner.isSuspended ? (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleActivate(owner._id)}
                                  disabled={actionLoading}
                                  className="p-1"
                                >
                                  <FaCheckCircle size={14} />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => handleSuspend(owner._id)}
                                  disabled={actionLoading}
                                  className="p-1"
                                >
                                  <FaBan size={14} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => {
                                  setSelectedOwner(owner);
                                  setShowDeleteModal(true);
                                }}
                                disabled={actionLoading}
                                className="p-1"
                              >
                                <FaTrash size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedOwner ? "Edit Owner" : "Create Owner"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password {selectedOwner ? "(leave blank to keep current)" : "*"}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                isInvalid={!!errors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Domain Link *</Form.Label>
              <Form.Control
                type="text"
                placeholder="http://example.com"
                value={formData.domainLink}
                onChange={(e) => setFormData({ ...formData, domainLink: e.target.value })}
                isInvalid={!!errors.domainLink}
              />
              <Form.Control.Feedback type="invalid">{errors.domainLink}</Form.Control.Feedback>
              <Form.Text className="text-muted">
                The domain where this owner's frontend will be hosted
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <ButtonLoading size={8} /> : selectedOwner ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Owner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete owner <strong>{selectedOwner?.name || selectedOwner?.email}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? <ButtonLoading size={8} /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OwnersManagement;
