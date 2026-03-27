import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { sendBulkNotification, createScheduledNotification } from "../../../redux/admin/notifiction/thunk";
import { getLeaguesIDS } from "../../../redux/admin/league/thunk";
import { MdNotificationsActive } from "react-icons/md";

const EMPTY_FORM = {
  title: "", message: "", notificationType: "all", leagueId: "",
  isScheduled: false, startDate: "", endDate: "", sendTime: "",
};

const inputStyle = (hasError) => ({
  fontSize: "14px", fontFamily: "Poppins", borderRadius: "8px",
  padding: "10px 14px", border: `1px solid ${hasError ? "#dc3545" : "#dee2e6"}`,
});

const labelStyle = { fontSize: "13px", fontWeight: "500", fontFamily: "Poppins", color: "#374151" };

const NotificationModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const { sendBulkLoading } = useSelector((state) => state.notificationData);
  const { leaguesIDS } = useSelector((state) => state.league);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) dispatch(getLeaguesIDS());
  }, [show, dispatch]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    if (form.notificationType === "league" && !form.leagueId) e.leagueId = "League selection is required.";
    if (form.isScheduled) {
      if (!form.startDate) e.startDate = "Start date is required.";
      if (!form.endDate) e.endDate = "End date is required.";
      if (!form.sendTime) e.sendTime = "Send time is required.";
      if (form.startDate && form.endDate && form.endDate < form.startDate)
        e.endDate = "End date must be after start date.";
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    let createdBy = null;
    try {
      const ownerParsed = JSON.parse(localStorage.getItem("padel_owner") || "null");
      createdBy = ownerParsed?._id || null;
    } catch { createdBy = null; }

    let result;

    if (form.isScheduled) {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        sendTime: form.sendTime,
      };
      if (form.notificationType === "all") payload.type = "all";
      else payload.leagueId = form.leagueId;

      result = await dispatch(createScheduledNotification(payload));
      if (createScheduledNotification.fulfilled.match(result)) {
        setForm(EMPTY_FORM); setErrors({}); onClose(true);
      }
    } else {
      const payload = { title: form.title.trim(), message: form.message.trim(), createdBy };
      if (form.notificationType === "all") payload.type = "all";
      else payload.leagueId = form.leagueId;

      result = await dispatch(sendBulkNotification(payload));
      if (sendBulkNotification.fulfilled.match(result)) {
        setForm(EMPTY_FORM); setErrors({}); onClose(true);
      }
    }
  };

  const handleClose = () => {
    if (!sendBulkLoading) { setForm(EMPTY_FORM); setErrors({}); onClose(false); }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton style={{ borderBottom: "1px solid #f0f0f0", padding: "20px 24px 16px" }}>
        <Modal.Title style={{ fontSize: "16px", fontWeight: "600", fontFamily: "Poppins", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ background: "rgba(31, 65, 187, 0.1)", borderRadius: "8px", padding: "6px", display: "flex", alignItems: "center" }}>
            <MdNotificationsActive size={20} color="#1F41BB" />
          </span>
          Send Notifications
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "24px" }}>
        <Form onSubmit={handleSubmit}>
          {/* Notification For */}
          <Form.Group className="mb-3">
            <Form.Label style={labelStyle}>
              Notification For <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex gap-3 mb-2">
              <Form.Check type="radio" id="all-users" name="notificationType" value="all"
                checked={form.notificationType === "all"} onChange={handleChange}
                label="All Users" style={{ fontSize: "14px", fontFamily: "Poppins" }} />
              <Form.Check type="radio" id="specific-league" name="notificationType" value="league"
                checked={form.notificationType === "league"} onChange={handleChange}
                label="Specific League" style={{ fontSize: "14px", fontFamily: "Poppins" }} />
            </div>
            {form.notificationType === "league" && (
              <Form.Select name="leagueId" value={form.leagueId} onChange={handleChange}
                isInvalid={!!errors.leagueId} style={inputStyle(errors.leagueId)}>
                <option value="">Select League</option>
                {leaguesIDS.map((league) => (
                  <option key={league._id} value={league._id}>{league.leagueName}</option>
                ))}
              </Form.Select>
            )}
            {errors.leagueId && <div className="invalid-feedback d-block">{errors.leagueId}</div>}
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label style={labelStyle}>Title <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. New Feature Announcement" isInvalid={!!errors.title}
              style={inputStyle(errors.title)} />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>

          {/* Message */}
          <Form.Group className="mb-3">
            <Form.Label style={labelStyle}>Message <span className="text-danger">*</span></Form.Label>
            <Form.Control as="textarea" rows={4} name="message" value={form.message} onChange={handleChange}
              placeholder="Enter the notification message..." isInvalid={!!errors.message}
              style={{ ...inputStyle(errors.message), resize: "none" }} />
            <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
          </Form.Group>

          {/* Schedule toggle */}
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="isScheduled"
              name="isScheduled"
              label={<span style={labelStyle}>Schedule Notification</span>}
              checked={form.isScheduled}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Scheduled fields */}
          {form.isScheduled && (
            <>
              <Row className="mb-3">
                <Col>
                  <Form.Label style={labelStyle}>Start Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" name="startDate" value={form.startDate} onChange={handleChange}
                    isInvalid={!!errors.startDate} style={inputStyle(errors.startDate)}
                    min={new Date().toISOString().slice(0, 10)} />
                  <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                </Col>
                <Col>
                  <Form.Label style={labelStyle}>End Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" name="endDate" value={form.endDate} onChange={handleChange}
                    isInvalid={!!errors.endDate} style={inputStyle(errors.endDate)}
                    min={form.startDate || new Date().toISOString().slice(0, 10)} />
                  <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}>Send Time <span className="text-danger">*</span></Form.Label>
                <Form.Control type="time" name="sendTime" value={form.sendTime} onChange={handleChange}
                  isInvalid={!!errors.sendTime} style={inputStyle(errors.sendTime)}
                  step="60" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" />
                <Form.Control.Feedback type="invalid">{errors.sendTime}</Form.Control.Feedback>
              </Form.Group>
            </>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" onClick={handleClose} disabled={sendBulkLoading}
              style={{ fontSize: "13px", fontFamily: "Poppins", padding: "8px 20px", borderRadius: "8px", fontWeight: "500" }}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendBulkLoading}
              style={{ background: "rgb(31, 65, 187)", border: "none", fontSize: "13px", fontFamily: "Poppins", padding: "8px 24px", borderRadius: "8px", fontWeight: "500", boxShadow: "0 4px 12px rgba(31, 65, 187, 0.3)", minWidth: "130px" }}>
              {sendBulkLoading ? (
                <><Spinner size="sm" animation="border" className="me-2" />Sending...</>
              ) : (
                form.isScheduled ? "Schedule Notification" : "Send Notification"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NotificationModal;
