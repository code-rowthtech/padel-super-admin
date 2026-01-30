import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ownerApi } from "../../../../helpers/api/apiCore";
import { SUPER_ADMIN_CREATE_CLUB_PAYMENT } from "../../../../helpers/api/apiEndpoint";

export const CreatePaymentModal = ({ show, handleClose, selectedClubId = "", selectedBookingIds = [], totalAmount = 0, onCreated }) => {
  const [formData, setFormData] = useState({
    clubId: selectedClubId || "",
    amount: totalAmount || "",
    description: "",
    status: "paid",
    paidDate: new Date(),
    invoice: null,
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, clubId: selectedClubId || "" }));
  }, [selectedClubId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClubId) return;
    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("clubId", selectedClubId);
      payload.append("amount", totalAmount || formData.amount);
      selectedBookingIds.forEach((id) => payload.append("bookingIds", id));
      payload.append("status", formData.status);
      payload.append("paidDate", formData.paidDate.toISOString());
      if (formData.description) payload.append("description", formData.description);
      if (formData.invoice) payload.append("invoice", formData.invoice);

      await ownerApi.post(SUPER_ADMIN_CREATE_CLUB_PAYMENT, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated && onCreated();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, invoice: e.target.files[0] });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Amount <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              value={totalAmount || formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={totalAmount > 0}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Invoice (Optional)</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Date <span className="text-danger">*</span>
            </Form.Label>
            <DatePicker
              selected={formData.paidDate}
              onChange={(date) => setFormData({ ...formData, paidDate: date })}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || !selectedClubId}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
