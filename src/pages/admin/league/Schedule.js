import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";

const Schedule = () => {
  const [selectedClub, setSelectedClub] = useState("Terrafort");
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [dateForm, setDateForm] = useState({ date: "", venue: "", selectType: "" });

  const clubs = [
    { name: "Terrafort", location: "Chandigarh" },
    { name: "Padel Haus", location: "Chandigarh" },
    { name: "Courtline", location: "Chandigarh" },
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
    console.log("Creating date:", dateForm);
    setShowDateModal(false);
    setDateForm({ date: "", venue: "", selectType: "" });
  };

  return (
    <Container fluid className="px-0 bg-white px-md-4">
      <Row className="mb-5 mt-4">
        <Col xs={12} className="px-0">
          <div className="bg-white shadow-sm rounded p-2 p-md-3" style={{ minHeight: "75vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fs-6">League/ Match Schedule</h6>
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

            <div className="mb-3">
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <span className="text-muted small">Clubs</span>
                {clubs.map((club) => (
                  <Button
                    key={club.name}
                    size="sm"
                    variant={selectedClub === club.name ? "primary" : "light"}
                    onClick={() => setSelectedClub(club.name)}
                    className="d-flex align-items-center gap-2"
                    style={{
                      borderRadius: "20px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "500",
                      backgroundColor: selectedClub === club.name ? "#1F41BB" : "#f8f9fa",
                      border: "none",
                      color: selectedClub === club.name ? "white" : "#333"
                    }}
                  >
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: selectedClub === club.name ? "white" : "#1F41BB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: selectedClub === club.name ? "#1F41BB" : "white"
                    }}>
                      {club.name.charAt(0)}
                    </div>
                    <div className="text-start">
                      <div style={{ fontSize: "13px", fontWeight: "600" }}>{club.name}</div>
                      <div style={{ fontSize: "10px", opacity: 0.8 }}>{club.location}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="d-flex align-items-center gap-2">
                <FaCalendarAlt style={{ color: "#1F41BB" }} />
                <span className="fw-semibold">Home Team: {selectedClub}</span>
                <span className="text-muted small">(Date: 10/08/2026)</span>
              </div>
            </div>

            <div style={{ overflowX: "auto", maxHeight: "calc(100vh - 450px)", overflowY: "auto" }}>
              <Table responsive borderless size="sm" className="custom-table">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
                  <tr className="text-center">
                    <th>Match No.</th>
                    <th>Home</th>
                    <th></th>
                    <th>Away</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="table-data border-bottom align-middle text-center">
                      <td>{match.matchNo}</td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#1F41BB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {match.home.charAt(0)}
                          </div>
                          <div className="text-start">
                            <div style={{ fontSize: "13px", fontWeight: "600" }}>{match.home}</div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>{match.homeVenue}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{
                          width: "32px",
                          height: "32px",
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
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#059669",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {match.away.charAt(0)}
                          </div>
                          <div className="text-start">
                            <div style={{ fontSize: "13px", fontWeight: "600" }}>{match.away}</div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>{match.awayVenue}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => handleAddDate(match)}
                          style={{
                            color: "#1F41BB",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}
                        >
                          {match.time}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <Button variant="outline-secondary" size="sm" style={{ borderRadius: "8px", padding: "8px 24px" }}>
                Back
              </Button>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  style={{
                    backgroundColor: "white",
                    color: "#1F41BB",
                    border: "1px solid #1F41BB",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: "500"
                  }}
                >
                  Save and Next Date
                </Button>
                <Button
                  size="sm"
                  style={{
                    backgroundColor: "#1F41BB",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 24px",
                    fontWeight: "500"
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
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
