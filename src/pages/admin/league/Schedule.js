import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Nav } from "react-bootstrap";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";

const Schedule = () => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [dateForm, setDateForm] = useState({ date: "", venue: "", selectType: "" });

  const tabs = [
    { name: "All", count: 28 },
    { name: "Level A", count: 6 },
    { name: "Level B", count: 6 },
    { name: "Mixed", count: 6 },
    { name: "Female", count: 6 },
  ];

  const clubs = [
    { name: "Terrakort", location: "6 Chandigarh" },
    { name: "Padel Haus", location: "6 Chandigarh" },
    { name: "Courtline", location: "6 Chandigarh" },
  ];

  const matches = [
    { id: 1, matchNo: "01", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 2, matchNo: "02", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 3, matchNo: "03", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 4, matchNo: "04", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 5, matchNo: "05", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 6, matchNo: "06", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 7, matchNo: "07", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 8, matchNo: "08", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 9, matchNo: "09", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
    { id: 10, matchNo: "10", home: "Terrafort", homeVenue: "Venue A", away: "Aadi Club", awayVenue: "Team - A", time: "09:00 Am" },
  ];

  const handleAddDate = (match) => {
    setSelectedMatch(match);
    setShowDateModal(true);
  };

  const handleCreateDate = () => {
    setShowDateModal(false);
    setDateForm({ date: "", venue: "", selectType: "" });
  };

  return (
    <Container fluid className="px-0 bg-white h-100">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h5 className="mb-0 fw-semibold">League/ Match Schedule</h5>
        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative" style={{ width: "250px" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontSize: "14px"
              }}
            />
            <Form.Control
              type="text"
              placeholder="Type to search..."
              style={{
                paddingLeft: "36px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}
            />
          </div>
          <Button
            size="sm"
            style={{
              border: "1px dashed #1F41BB",
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1F41BB"
            }}
          >
            + Add date
          </Button>
          <Button
            size="sm"
            style={{
              backgroundColor: "#1F41BB",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            Export Schedule
          </Button>
        </div>
      </div>

      <Row className="g-0" style={{ height: "calc(100vh - 120px)" }}>
        <Col md={3} className="border-end">
          <div className="p-3">
            <div className="d-flex gap-2 align-items-center mb-3">
              <span className="text-muted small fw-medium">Clubs</span>
              <span className="text-muted small">(All)</span>
            </div>
            <div className="d-flex flex-column gap-2">
              {clubs.map((club) => (
                <div
                  key={club.name}
                  className="d-flex align-items-center gap-2 p-2 border-bottom"
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#6b7280"
                  }}>
                    {club.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>{club.name}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{club.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="p-3">
            <Nav variant="pills" className="gap-2 mb-3">
              {tabs.map((tab) => (
                <Nav.Item key={tab.name}>
                  <Nav.Link
                    active={selectedTab === tab.name}
                    onClick={() => setSelectedTab(tab.name)}
                    style={{
                      backgroundColor: selectedTab === tab.name ? "#1F41BB" : "transparent",
                      color: selectedTab === tab.name ? "white" : "#6b7280",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "500"
                    }}
                  >
                    {tab.name} ({tab.count})
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            <div style={{ overflowY: "auto", maxHeight: "70vh" }}>
              <Table responsive borderless className="mb-0">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f9fafb", zIndex: 1 }}>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Match No.</th>
                    <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Home</th>
                    <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px", textAlign: "center" }}></th>
                    <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Away</th>
                    <th style={{ fontSize: "13px", fontWeight: "600", padding: "12px" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} style={{ borderBottom: "1px solid #f3f4f6", height: "72px" }}>
                      <td style={{ fontSize: "13px", padding: "12px", fontWeight: "500" }}>{match.matchNo}</td>
                      <td style={{ padding: "12px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#1F41BB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold"
                          }}>
                            {match.home.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{match.home}</div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>{match.homeVenue}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto"
                        }}>
                          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#6b7280" }}>VS</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#059669",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "bold"
                          }}>
                            {match.away.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>{match.away}</div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>{match.awayVenue}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: "13px", color: "#6b7280" }}>{match.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Col>

        <Col md={3} className="border-start">
          <div className="p-3">
            {/* Empty right panel for match details */}
          </div>
        </Col>
      </Row>

      {/* Date Modal */}
      <Modal show={showDateModal} onHide={() => setShowDateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px", fontWeight: "600" }}>Day one schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "14px", fontWeight: "500" }}>Date</Form.Label>
              <Form.Control
                type="date"
                value={dateForm.date}
                onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
                style={{ fontSize: "14px" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "14px", fontWeight: "500" }}>Venue</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter venue"
                value={dateForm.venue}
                onChange={(e) => setDateForm({ ...dateForm, venue: e.target.value })}
                style={{ fontSize: "14px" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "14px", fontWeight: "500" }}>Select Type</Form.Label>
              <Form.Select
                value={dateForm.selectType}
                onChange={(e) => setDateForm({ ...dateForm, selectType: e.target.value })}
                style={{ fontSize: "14px" }}
              >
                <option value="">Select type</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleCreateDate}
            style={{
              backgroundColor: "#1F41BB",
              border: "none",
              borderRadius: "8px",
              padding: "8px 24px",
              fontWeight: "500",
              width: "100%"
            }}
          >
            Create Date
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Schedule;
