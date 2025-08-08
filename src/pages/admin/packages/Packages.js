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

  const plans = [
    {
      id: "pro",
      title: "Pro",
      description: "Unleash the Power of Your Business with Pro Plan.",
      price: "$34",
      features: [
        "Enhanced Analytics",
        "Custom Domain",
        "E-commerce Integration",
        "Priority Support",
        "Advanced Security",
      ],
    },
    {
      id: "business",
      title: "Business",
      description: "Take Your Business to the Next Level with Business Plan.",
      price: "$56",
      features: [
        "Advanced Marketing Tools",
        "Customizable Templates",
        "Multi-user Access",
        "Third-party Integrations",
        "24/7 Priority Support",
      ],
    },
  ];

  const packages = [
    {
      id: 1,
      price: "₹1800",
      title: "Beginner Pack",
      description: "Perfect for newcomers or a weekend tryout.",
      slots: "2 Hrs",
      validity: "3 Days",
    },
    {
      id: 2,
      price: "₹5000",
      title: "Regular Player",
      description: "Ideal for players who book a few sessions a week.",
      slots: "10 Hrs",
      validity: "50 Days",
    },
    {
      id: 3,
      price: "₹9500",
      title: "Weekend Warrior",
      description: "Great for consistent weekend or evening players.",
      slots: "30 Hrs",
      validity: "30 Days",
    },
    {
      id: 4,
      price: "₹1750",
      title: "Champion",
      description: "Best value for club members or serious competitors.",
      slots: "40 Hrs",
      validity: "30 Days",
    },
  ];

  return (
    <Container
      fluid
      className="py-4"
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
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
              Packages
            </div>
          </button>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left: Plans */}
        <Col sm={7}>
          <Stack gap={3} className="d-flex flex-row">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-0 shadow-sm ${
                  selectedPlan === plan.title ? "border-2 border-primary" : ""
                }`}
                style={{
                  borderRadius: "16px",
                  background:
                    plan.title === "Business"
                      ? "linear-gradient(135deg, #f4f7ff 0%, #e8efff 100%)"
                      : "#fff",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => setSelectedPlan(plan.title)}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <i
                      className={`bi ${
                        plan.title === "Business" ? "bi-gem" : "bi-gear-fill"
                      } text-primary`}
                      style={{
                        fontSize: "20px",
                        padding: "6px",
                        backgroundColor: "#eef2ff",
                        borderRadius: "50%",
                      }}
                    ></i>
                    <Form.Check
                      type="switch"
                      checked={selectedPlan === plan.title}
                      readOnly
                      style={{ "--bs-switch-bg": "#22c55e" }}
                    />
                  </div>
                  <h4 className="fw-bold mb-1" style={{ fontSize: "16px" }}>
                    {plan.title}{" "}
                    {plan.title === "Business" && (
                      <Badge
                        bg="primary"
                        style={{
                          fontSize: "10px",
                          marginLeft: "4px",
                          textTransform: "uppercase",
                          padding: "3px 6px",
                          borderRadius: "100px",
                        }}
                      >
                        Best Offer
                      </Badge>
                    )}
                  </h4>
                  <p
                    className="text-muted mb-2"
                    style={{ fontSize: "12px", lineHeight: "1.4" }}
                  >
                    {plan.description}
                  </p>
                  <p className="fw-bold mb-3" style={{ fontSize: "24px" }}>
                    {plan.price}{" "}
                    <span className="text-muted" style={{ fontSize: "12px" }}>
                      per month
                    </span>
                  </p>
                  <ul
                    className="list-unstyled mb-3"
                    style={{ fontSize: "12px", color: "#334155" }}
                  >
                    {plan.features.map((feature, i) => (
                      <li key={i} className="d-flex align-items-center mb-2">
                        <i className="bi bi-check-sm text-success me-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={
                      plan.title === "Business" ? "dark" : "outline-dark"
                    }
                    size="sm"
                    className="w-100"
                    style={{
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Edit Package
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </Stack>
        </Col>

        {/* Right: Packages */}
        <Col sm={5}>
          <Row className="g-3">
            {packages.map((pkg, index) => (
              <Col xs={12} key={pkg.id}>
                <Card
                  className={`border-0 shadow-sm ${
                    selectedPackage === index ? "border-2 border-primary" : ""
                  }`}
                  style={{
                    borderRadius: "16px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedPackage(index)}
                >
                  <Card.Body className="d-flex align-items-center p-3">
                    <div
                      className="fw-bold text-primary"
                      style={{ fontSize: "20px", minWidth: "90px" }}
                    >
                      {pkg.price}
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="fw-bold mb-1">{pkg.title}</h6>
                      <p
                        className="text-muted mb-1"
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
                        style={{ fontSize: "16px" }}
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
