import { Modal, Table, Badge } from "react-bootstrap";

const SlotDetailsModal = ({ show, onHide, slotData, day }) => {
  if (!slotData || !slotData.slotTimes) {
    return null;
  }

  const slotTimes = slotData.slotTimes;
  const businessHours = slotData.businessHours?.[0];

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {day} - Slot Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {businessHours && (
          <div className="mb-3">
            <p className="mb-1">
              <strong>Business Hours:</strong> {businessHours.time}
            </p>
          </div>
        )}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Time</th>
              <th>Price (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {slotTimes.map((slot) => (
              <tr key={slot._id}>
                <td>{slot.time}</td>
                <td className="fw-bold">{slot.amount}</td>
                <td>
                  <Badge
                    bg={
                      slot.availabilityStatus === "available"
                        ? "success"
                        : "danger"
                    }
                  >
                    {slot.availabilityStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default SlotDetailsModal;
