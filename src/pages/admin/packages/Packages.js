import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Stack,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Packages = () => {
  const [selectedPlan, setSelectedPlan] = useState("Pro");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  const packages = [
    {
      price: 1800,
      title: "Beginner Pack",
      description: "Perfect for newcomers or a weekend tryout.",
      slots: "3 Hrs",
      validity: "3 Days",
    },
    {
      price: 5000,
      title: "Regular Player",
      description: "Ideal for players who book a few sessions a week.",
      slots: "10 Hrs",
      validity: "10 Days",
    },
    {
      price: 9500,
      title: "Weekend Warrior",
      description: "Great for consistent weekend or evening players.",
      slots: "20 Hrs",
      validity: "20 Days",
    },
    {
      price: 1750,
      title: "Champion",
      description: "Best value for club members or serious competitors.",
      slots: "40 Hrs",
      validity: "60 Days",
    },
    {
      price: 9500,
      title: "Weekend Warrior",
      description: "Great for consistent weekend or evening players.",
      slots: "20 Hrs",
      validity: "20 Days",
    },
    {
      price: 1750,
      title: "Champion",
      description: "Best value for club members or serious competitors.",
      slots: "40 Hrs",
      validity: "60 Days",
    },
  ];

  return (
    <Container
      fluid
      className="py-4"
      style={{ backgroundColor: "#f8fafc", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <Row className="mb-4 justify-content-between align-items-center">
        <Col xs="auto">
          <h3 className="fw-bold text-dark mb-0">Packages</h3>
        </Col>
        <Col xs="auto">
          <button
            className="d-flex align-items-center position-relative p-0 border-0"
            style={{
              borderRadius: "20px 10px 10px 20px",
              background: "none",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/admin/package-details")}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              className="p-1 rounded-circle bg-light"
              style={{ position: "relative", left: "10px" }}
            >
              <div
                className="d-flex justify-content-center align-items-center text-white fw-bold"
                style={{
                  backgroundColor: "#194DD5",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "20px",
                }}
              >
                +
              </div>
            </div>

            <div
              className="d-flex align-items-center text-white fw-medium"
              style={{
                backgroundColor: "#194DD5",
                padding: "0 16px",
                height: "36px",
                fontSize: "14px",
                fontFamily: "Nunito, sans-serif",
              }}
            >
              Add Package
            </div>
          </button>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left: Plan Cards */}
        <Col lg={4} xl={3}>
          <Stack gap={3}>
            {/* Pro Plan */}
            <Card
              className={`border-0 shadow-sm ${
                selectedPlan === "Pro" ? "border-2 border-primary" : ""
              }`}
              style={{
                borderRadius: "12px",
                backgroundColor: "#fff",
                cursor: "pointer",
                position: "relative",
                height: "auto",
              }}
              onClick={() => setSelectedPlan("Pro")}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <i
                    className="bi bi-gear-fill text-primary"
                    style={{
                      fontSize: "20px",
                      padding: "6px",
                      backgroundColor: "#eef2ff",
                      borderRadius: "50%",
                    }}
                  ></i>
                  <Form.Check
                    type="switch"
                    checked={selectedPlan === "Pro"}
                    readOnly
                    style={{ "--bs-switch-bg": "#22c55e" }}
                  />
                </div>
                <h4
                  className="fw-bold mb-1"
                  style={{ fontSize: "16px", color: "#0f172a" }}
                >
                  Pro
                </h4>
                <p className="text-muted mb-2" style={{ fontSize: "12px" }}>
                  Unleash the Power of Your Business with Pro Plan.
                </p>
                <p
                  className="fw-bold mb-3"
                  style={{ fontSize: "24px", color: "#0f172a" }}
                >
                  $34{" "}
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    per month
                  </span>
                </p>
                <ul
                  className="list-unstyled mb-3"
                  style={{ fontSize: "12px", color: "#334155" }}
                >
                  {[
                    "Enhanced Analytics",
                    "Custom Domain",
                    "E-commerce Integration",
                    "Priority Support",
                    "Advanced Security",
                  ].map((feature, i) => (
                    <li key={i} className="d-flex align-items-center mb-2">
                      <i
                        className="bi bi-check-lg text-success me-2"
                        style={{ fontSize: "14px" }}
                      ></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="dark"
                  size="sm"
                  className="w-100"
                  style={{
                    borderRadius: "8px",
                    padding: "8px 0",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Edit Package
                </Button>
              </Card.Body>
            </Card>

            {/* Business Plan */}
            <Card
              className={`border-0 shadow-sm ${
                selectedPlan === "Business" ? "border-2 border-primary" : ""
              }`}
              style={{
                borderRadius: "12px",
                backgroundColor:
                  "linear-gradient(135deg, #f4f7ff 0%, #e8efff 100%)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={() => setSelectedPlan("Business")}
            >
              {/* Background Circle */}
              <div
                style={{
                  position: "absolute",
                  width: "220px",
                  height: "220px",
                  backgroundColor: "rgba(76, 111, 255, 0.1)",
                  borderRadius: "50%",
                  top: "50%",
                  right: "-70px",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              ></div>
              <Card.Body
                className="p-3"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <i
                    className="bi bi-gem text-primary"
                    style={{
                      fontSize: "20px",
                      padding: "6px",
                      backgroundColor: "#eef2ff",
                      borderRadius: "50%",
                    }}
                  ></i>
                  <Form.Check
                    type="switch"
                    checked={selectedPlan === "Business"}
                    readOnly
                    style={{ "--bs-switch-bg": "#22c55e" }}
                  />
                </div>
                <h4
                  className="fw-bold mb-1"
                  style={{ fontSize: "16px", color: "#0f172a" }}
                >
                  Business{" "}
                  <Badge
                    bg="primary"
                    style={{
                      fontSize: "9px",
                      padding: "2px 6px",
                      borderRadius: "100px",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Best Offer
                  </Badge>
                </h4>
                <p className="text-muted mb-2" style={{ fontSize: "12px" }}>
                  Take Your Business to the Next Level with Business Plan.
                </p>
                <p
                  className="fw-bold mb-3"
                  style={{ fontSize: "24px", color: "#0f172a" }}
                >
                  $56{" "}
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    per month
                  </span>
                </p>
                <ul
                  className="list-unstyled mb-3"
                  style={{ fontSize: "12px", color: "#334155" }}
                >
                  {[
                    "Advanced Marketing Tools",
                    "Customizable Templates",
                    "Multi-user Access",
                    "Third-party Integrations",
                    "24/7 Priority Support",
                  ].map((feature, i) => (
                    <li key={i} className="d-flex align-items-center mb-2">
                      <i
                        className="bi bi-check-lg text-success me-2"
                        style={{ fontSize: "14px" }}
                      ></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="dark"
                  size="sm"
                  className="w-100"
                  style={{
                    borderRadius: "8px",
                    padding: "8px 0",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Edit Package
                </Button>
              </Card.Body>
            </Card>
          </Stack>
        </Col>

        {/* Right: Package List */}
        <Col lg={8} xl={9}>
          <Row className="g-3">
            {packages.map((pkg, index) => (
              <Col key={index} xs={12}>
                <Card
                  className={`border-0 shadow-sm ${
                    selectedPackage === index ? "border-2 border-primary" : ""
                  }`}
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setSelectedPackage(index)}
                >
                  <Card.Body className="d-flex align-items-center p-3">
                    <div
                      className="price-section fw-bold text-primary"
                      style={{ minWidth: "80px", fontSize: "20px" }}
                    >
                      ₹ {pkg.price}
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6
                        className="mb-1 fw-semibold"
                        style={{ fontSize: "16px", color: "#0f172a" }}
                      >
                        {pkg.title}
                      </h6>
                      <p
                        className="text-muted mb-2"
                        style={{ fontSize: "12px" }}
                      >
                        {pkg.description}
                      </p>
                      <div
                        className="d-flex gap-4"
                        style={{ fontSize: "12px", color: "#64748b" }}
                      >
                        <span>
                          Slots:{" "}
                          <strong style={{ color: "#0f172a" }}>
                            {pkg.slots}
                          </strong>
                        </span>
                        <span>
                          Validity:{" "}
                          <strong style={{ color: "#0f172a" }}>
                            {pkg.validity}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-center gap-2">
                      <i
                        className="bi bi-pencil text-primary"
                        style={{ fontSize: "16px", cursor: "pointer" }}
                      ></i>
                      <Form.Check
                        type="switch"
                        defaultChecked
                        style={{ "--bs-switch-bg": "#22c55e" }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Packages;
