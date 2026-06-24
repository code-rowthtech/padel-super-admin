import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { ButtonLoading } from "../../helpers/loading/Loaders";

const ReasonActionModal = ({
  show,
  title,
  description,
  reason,
  onReasonChange,
  onHide,
  onConfirm,
  confirmText = "Confirm",
  confirmVariant = "danger",
  loading = false,
  placeholder = "Enter reason",
}) => (
  <Modal show={show} onHide={loading ? undefined : onHide} centered backdrop="static">
    <Modal.Header closeButton={!loading} className="border-0 pb-0">
      <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {description && (
        <div className="text-muted mb-3" style={{ fontSize: 13 }}>
          {description}
        </div>
      )}
      <Form.Group>
        <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>Reason</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          autoFocus
          value={reason}
          disabled={loading}
          placeholder={placeholder}
          onChange={(event) => onReasonChange(event.target.value)}
          style={{ fontSize: 13, resize: "none" }}
        />
      </Form.Group>
    </Modal.Body>
    <Modal.Footer className="border-0 pt-0">
      <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
        Cancel
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={loading || reason.trim().length < 3}
      >
        {loading ? <ButtonLoading size={7} /> : confirmText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ReasonActionModal;
