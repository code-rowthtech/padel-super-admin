import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Stack,
  Badge,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  deletePackage,
  getAllPackages,
  updatePackage,
} from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";

const Packages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    packageData,
    packageLoading,
    updatePackageLoading,
    deletePackageLoading,
  } = useSelector((state) => state.package);

  const [selectedPlan, setSelectedPlan] = useState("Pro");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

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

  const packages = packageData?.packages || [];

  useEffect(() => {
    dispatch(getAllPackages({ search: "" }));
  }, [dispatch]);

  const handleEditPackage = useCallback(
    (pkg) => {
      navigate("/admin/package-details", { state: pkg });
    },
    [navigate]
  );

  const handleToggleStatus = useCallback(
    async (pkg) => {
      try {
        setToggleLoadingId(pkg?._id);
        await dispatch(
          updatePackage({ _id: pkg?._id, isActive: !pkg?.isActive })
        )
          .unwrap()
          .then(() => {
            dispatch(getAllPackages({ search: "" }));
          });
      } catch (error) {
        console.error("Error updating package status:", error);
      } finally {
        setToggleLoadingId(null);
      }
    },
    [dispatch]
  );

  // Open modal instead of direct delete
  const confirmDeletePackage = (pkg) => {
    setPackageToDelete(pkg);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!packageToDelete) return;
    try {
      await dispatch(deletePackage({ _id: packageToDelete._id }))
        .unwrap()
        .then(() => {
          dispatch(getAllPackages({ search: "" }));
          setShowDeleteModal(false);
          setPackageToDelete(null);
        });
    } catch (error) {
      console.error("Error Deleting package:", error);
    }
  };

  return (
    <Container
      fluid
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="py-1">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{packageToDelete?.packageName}</strong>?
        </Modal.Body>
        <Modal.Footer className="py-1">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Header */}
      <Row className="mb-4 justify-content-end align-items-center">
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
        <Col sm={5}>
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
        <Col sm={4}>
          {packageLoading ? (
            <DataLoading height="60vh" />
          ) : (
            <Row className="g-3">
              {packages?.length > 0 ? (
                packages.map((pkg, index) => (
                  <Col xs={12} key={pkg?._id}>
                    <Card
                      className={`${
                        selectedPackage === index
                          ? "border-2 border-primary shadow"
                          : "shadow-sm"
                      }`}
                      style={{
                        borderRadius: "8px",
                        backgroundColor: "#F8FAFF",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedPackage(index)}
                    >
                      <Card.Body className="p-3 d-flex justify-content-between align-items-start">
                        {/* Left Section (Price + Info) */}
                        <div>
                          <div
                            className="fw-bold mb-1"
                            style={{
                              fontSize: "32px",
                              lineHeight: "1",
                              color: "#1F41BB",
                            }}
                          >
                            ₹{pkg?.price}
                          </div>
                          <h5
                            className="fw-bold mb-1"
                            style={{ fontSize: "16px", color: "#0f172a" }}
                          >
                            {pkg?.packageName}
                          </h5>
                          <p
                            className="text-muted mb-0"
                            style={{ fontSize: "14px", lineHeight: "1.4" }}
                          >
                            {pkg?.description}
                          </p>
                        </div>

                        {/* Right Section (Icons + Details + Toggle) */}
                        <div className="d-flex flex-column align-items-end">
                          {/* Icons */}
                          <div className="d-flex mb-2">
                            <i
                              className="bi bi-pencil"
                              style={{
                                fontSize: "18px",
                                cursor: "pointer",
                                color: "#1F41BB",
                                marginRight: "8px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPackage(pkg);
                              }}
                            ></i>
                            <i
                              className="bi bi-trash text-danger"
                              style={{ fontSize: "18px", cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeletePackage(pkg);
                              }}
                            ></i>
                          </div>

                          {/* Toggle */}
                          <div className="d-flex align-items-center mb-2">
                            {pkg?._id === toggleLoadingId &&
                            updatePackageLoading ? (
                              <ButtonLoading color="blue" size={10} />
                            ) : (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(pkg);
                                }}
                                style={{
                                  position: "relative",
                                  width: "34px",
                                  height: "16px",
                                  borderRadius: "22px",
                                  backgroundColor: pkg.isActive
                                    ? "#22c55e"
                                    : "#e2e8f0",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "1.4px",
                                    left: pkg.isActive
                                      ? "calc(100% - 16px)"
                                      : "2px",
                                    width: "13px",
                                    height: "13px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    transition: "all 0.3s ease",
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>

                          {/* Slots + Validity */}
                          <div
                            className="text-end"
                            style={{ fontSize: "12px", color: "#475569" }}
                          >
                            <div className="mb-1">
                              Slots:{" "}
                              <strong style={{ color: "#0f172a" }}>
                                {pkg?.numberOfSlots} Hrs
                              </strong>
                            </div>
                            <div>
                              Validity:{" "}
                              <strong style={{ color: "#0f172a" }}>
                                {pkg?.validity
                                  ? `${pkg?.validity} ${
                                      pkg?.validity > 1 ? "Days" : "Day"
                                    }`
                                  : "N/A"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <div
                  className="d-flex text-danger justify-content-center align-items-center w-100"
                  style={{ height: "20vh", fontSize: "16px" }}
                >
                  No Packages were found
                </div>
              )}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Packages;
