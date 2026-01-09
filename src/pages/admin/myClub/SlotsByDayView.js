import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";

const SlotsByDayView = ({ PricingData, onSlotClick }) => {
  if (!PricingData || !PricingData[0]?.slot) {
    return <div>No slot data available</div>;
  }

  const slots = PricingData[0].slot;

  return (
    <div>
      <h5 className="mb-4" style={{ fontWeight: 600, color: "#1F2937" }}>
        View Slots by Day
      </h5>
      <Row>
        {slots.map((slot) => {
          const day = slot.businessHours?.[0]?.day;
          const slotCount = slot.slotTimes?.length || 0;
          const avgPrice =
            slot.slotTimes?.length > 0
              ? Math.round(
                  slot.slotTimes.reduce((sum, s) => sum + (s.amount || 0), 0) /
                    slot.slotTimes.length
                )
              : 0;

          return (
            <Col xs={12} sm={6} md={4} lg={3} key={slot._id} className="mb-3">
              <Card
                onClick={() => onSlotClick(slot, day)}
                style={{
                  cursor: "pointer",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1F2937",
                      marginBottom: "12px",
                    }}
                  >
                    {day}
                  </Card.Title>
                  <div className="mb-2">
                    <Badge bg="info" className="me-2">
                      {slotCount} slots
                    </Badge>
                    <Badge bg="success">₹{avgPrice} avg</Badge>
                  </div>
                  <small className="text-muted">
                    {slot.businessHours?.[0]?.time || "N/A"}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default SlotsByDayView;
