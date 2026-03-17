import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';

const ConfirmationModal = ({
  show,
  onHide,
  title,
  message,
  onConfirm,
  onSave,
  confirmText = "Proceed",
  saveText = "Save & Proceed"
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="border-bottom d-flex justify-content-between align-items-center" style={{ padding: '20px' }}>
        <Modal.Title style={{ fontWeight: '600', fontSize: '18px', color: 'rgba(37, 37, 37, 1)' }}>
          {title}
        </Modal.Title>
        <MdClose size={24} onClick={onHide} style={{ cursor: 'pointer' }} />
      </Modal.Header>
      <Modal.Body style={{ padding: '20px' }}>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
          {message}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-top-0" style={{ padding: '0 20px 20px' }}>
        <div className="d-flex gap-2 w-100">
          {onSave && (
            <Button
              variant="primary"
              onClick={onSave}
              style={{
                flex: 1,
                backgroundColor: 'rgba(31, 65, 187, 1)',
                border: 'none'
              }}
            >
              {saveText}
            </Button>
          )}
          <Button
            variant="outline-danger"
            onClick={onConfirm}
            style={{ flex: 1 }}
          >
            {confirmText}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;