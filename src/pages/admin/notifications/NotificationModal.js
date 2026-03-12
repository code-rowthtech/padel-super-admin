import React, { useState } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { sendBulkNotification } from "../../../redux/admin/notifiction/thunk";
import { MdNotificationsActive } from "react-icons/md";

const NotificationModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const { sendBulkLoading } = useSelector((state) => state.notificationData);

  const [form, setForm] = useState({ title: "", message: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.message.trim()) newErrors.message = "Message is required.";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Get createdBy from localStorage
    let createdBy = null;
    try {
      const ownerRaw = localStorage.getItem("padel_owner");
      const ownerParsed = ownerRaw ? JSON.parse(ownerRaw) : null;
      createdBy = ownerParsed?._id || null;
    } catch {
      createdBy = null;
    }

    const result = await dispatch(
      sendBulkNotification({
        title: form.title.trim(),
        message: form.message.trim(),
        createdBy,
      })
    );

    if (sendBulkNotification.fulfilled.match(result)) {
      setForm({ title: "", message: "" });
      setErrors({});
      onClose(true); // pass true to trigger list refresh
    }
  };

  const handleClose = () => {
    if (!sendBulkLoading) {
      setForm({ title: "", message: "" });
      setErrors({});
      onClose(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header
        closeButton
        style={{
          borderBottom: "1px solid #f0f0f0",
          padding: "20px 24px 16px",
        }}
      >
        <Modal.Title
          style={{
            fontSize: "16px",
            fontWeight: "600",
            fontFamily: "Poppins",
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              background: "rgba(31, 65, 187, 0.1)",
              borderRadius: "8px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MdNotificationsActive size={20} color="#1F41BB" />
          </span>
          Send Notifications
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "24px" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label
              style={{
                fontSize: "13px",
                fontWeight: "500",
                fontFamily: "Poppins",
                color: "#374151",
              }}
            >
              Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. New Feature Announcement"
              isInvalid={!!errors.title}
              style={{
                fontSize: "14px",
                fontFamily: "Poppins",
                borderRadius: "8px",
                padding: "10px 14px",
                border: errors.title
                  ? "1px solid #dc3545"
                  : "1px solid #dee2e6",
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label
              style={{
                fontSize: "13px",
                fontWeight: "500",
                fontFamily: "Poppins",
                color: "#374151",
              }}
            >
              Message <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Enter the notification message..."
              isInvalid={!!errors.message}
              style={{
                fontSize: "14px",
                fontFamily: "Poppins",
                borderRadius: "8px",
                padding: "10px 14px",
                border: errors.message
                  ? "1px solid #dc3545"
                  : "1px solid #dee2e6",
                resize: "none",
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="light"
              onClick={handleClose}
              disabled={sendBulkLoading}
              style={{
                fontSize: "13px",
                fontFamily: "Poppins",
                padding: "8px 20px",
                borderRadius: "8px",
                fontWeight: "500",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendBulkLoading}
              style={{
                background: "rgb(31, 65, 187)",
                border: "none",
                fontSize: "13px",
                fontFamily: "Poppins",
                padding: "8px 24px",
                borderRadius: "8px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(31, 65, 187, 0.3)",
                minWidth: "130px",
              }}
            >
              {sendBulkLoading ? (
                <>
                  <Spinner
                    size="sm"
                    animation="border"
                    className="me-2"
                  />
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NotificationModal;
