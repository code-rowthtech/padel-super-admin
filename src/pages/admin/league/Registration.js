import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Registration = () => {
  const [selectedClub, setSelectedClub] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState({ "0": true });

  const clubs = [
    {
      name: "Terrakort",
      levels: { "Level A": "02/04", "Level B": "02/04", "Mixed": "02/04", "Female": "0/04" },
      categories: [
        {
          name: "Level A",
          registrations: [
            { name: "Virat Kohli", phone: "9999999999", email: "daghir525.arya@gmail.com", status: "Paid" },
            { name: "Virat Kohli", phone: "9999999999", email: "daghir525.arya@gmail.com", status: "Pending" },
            { name: "Virat Kohli", phone: "9999999999", email: "daghir525.arya@gmail.com", status: "Paid" },
            { name: "Virat Kohli", phone: "9999999999", email: "daghir525.arya@gmail.com", status: "Pending" },
          ]
        },
        { name: "Level B", registrations: [] },
        { name: "Mixed", registrations: [] },
        { name: "Female", registrations: [] },
      ]
    },
    {
      name: "Padel Haus",
      levels: { "Level A": "02/04", "Level B": "02/04", "Mixed": "02/04", "Female": "0/04" },
      categories: [
        { name: "Level A", registrations: [] },
        { name: "Level B", registrations: [] },
        { name: "Mixed", registrations: [] },
        { name: "Female", registrations: [] },
      ]
    },
    {
      name: "Courtline",
      levels: { "Level A": "02/04", "Level B": "02/04", "Mixed": "02/04", "Female": "0/04" },
      categories: [
        { name: "Level A", registrations: [] },
        { name: "Level B", registrations: [] },
        { name: "Mixed", registrations: [] },
        { name: "Female", registrations: [] },
      ]
    },
  ];

  const toggleCategory = (catIdx) => {
    setExpandedCategory(prev => prev[catIdx] ? {} : { [catIdx]: true });
  };

  const getStatusBadge = (status) => {
    const config = status === "Paid"
      ? { bg: "#dcfce7", text: "#16a34a" }
      : { bg: "#fef3c7", text: "#d97706" };
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.text,
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500"
      }}>
        {status}
      </span>
    );
  };

  return (
    <Container fluid className="px-0 h-100 bg-white px-md-4 py-0">
      <Row className="h-100" style={{ overflow: "visible" }}>
        <Col md={3} className="mb-3 h-100 shadow-sm px-0 mb-md-0" style={{ position: "relative", zIndex: 10, overflow: "visible" }}>
          <div className="small fw-medium d-flex align-items-center p-3 gap-1">
            <span className="">Clubs</span>
            <span className=" ">(15)</span>
          </div>
          <div className="d-flex flex-column" style={{ overflow: "visible" }}>
            {clubs.map((club, idx) => (
              <Card
                key={idx}
                onClick={() => setSelectedClub(idx)}
                className="shadow-sm position-relative border-top border-bottom rounded-0"
                style={{
                  backgroundColor: selectedClub === idx ? "#1F41BB" : "white",
                  color: selectedClub === idx ? "white" : "#333",
                  cursor: "pointer",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                  overflow: "visible"
                }}
              >
                <Card.Body className="p-3">
                  <div className="fw-semibold mb-2" style={{ color: selectedClub === idx ? "white" : "#1F41BB" }}>{club.name}</div>
                  <div className="d-flex gap-2 small" style={{ fontSize: "12px" }}>
                    {Object.entries(club.levels).map(([levelName, levelValue]) => (
                      <p key={levelName} className="d-flex gap-1 flex-fill align-items-center flex-column">
                        <span> {levelName}</span>
                        <span style={{ background: selectedClub === idx ? '#FFFFFF1A' : '' }}
                          className={`py-1 rounded-1 fw-semibold px-3 ${selectedClub === idx ? '' : 'border border-1'}`}>{levelValue}</span>
                      </p>
                    ))}
                  </div>
                </Card.Body>
                {selectedClub === idx && (
                  <BsFillCaretRightFill
                    className="position-absolute"
                    style={{
                      right: "-4%",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 100
                    }}
                    size={30}
                    color="#1F41BB"
                  />
                )}
              </Card>
            ))}
          </div>
        </Col>

        <Col md={9}>
          <div className="d-flex flex-column gap-3">
            {clubs[selectedClub].categories.map((category, catIdx) => (
              <Card key={catIdx} className="border rounded shadow-sm" style={{ overflow: "hidden" }}>
                <div
                  onClick={() => toggleCategory(catIdx)}
                  style={{
                    backgroundColor: "#FBFCFE",
                    padding: "14px 20px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: expandedCategory[catIdx] ? "1px solid #e5e7eb" : "none"
                  }}
                >
                  <small className="fw-semibold rounded-2 px-3" style={{ color: "#1F41BB", background: 'linear-gradient(270deg, rgba(0, 58, 255, 0.1) 0%, rgba(7, 40, 154, 0.1) 100%)' }}>
                    Game Category: {category.name}
                  </small>
                  {expandedCategory[catIdx] ?
                    <FaChevronUp size={14} style={{ color: "#6b7280" }} /> :
                    <FaChevronDown size={14} style={{ color: "#6b7280" }} />
                  }
                </div>
                {expandedCategory[catIdx] && (
                  <div className="p-3">
                    {category.registrations.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-borderless mb-0">
                          <thead>
                            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                              <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Player Name</th>
                              <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Phone Number</th>
                              <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Email</th>
                              <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.registrations.map((reg, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ fontSize: "13px", padding: "12px" }}>{reg.name}</td>
                                <td style={{ fontSize: "13px", padding: "12px" }}>{reg.phone}</td>
                                <td style={{ fontSize: "13px", padding: "12px" }}>{reg.email}</td>
                                <td style={{ padding: "12px" }}>{getStatusBadge(reg.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-4" style={{ fontSize: "14px" }}>
                        No registrations yet
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Registration;
