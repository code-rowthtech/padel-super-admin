import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Button, Dropdown } from "react-bootstrap";
import { FaUsers, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiOutlineTrophy } from "react-icons/hi2";
import { BsRecordCircle } from "react-icons/bs";
import { IoCashOutline } from "react-icons/io5";
 
const League = () => {
  const [statusFilter, setStatusFilter] = useState("all");
 
  const statsCards = [
    { title: "Total Leagues", cardBorder: "1px solid #1F41BB1A", value: "11", iconBg: '#1F41BB1A', icon: <HiOutlineTrophy style={{ color: '#1F41BB' }} size={20} />, bgColor: "#f3f4f6", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #E0E3F2 121.05%)' },
    { title: "Active Leagues", cardBorder: "1px solid #0596691A", value: "02", iconBg: '#D1FAE5', icon: <BsRecordCircle style={{ color: '#059669' }} size={20} />, bgColor: "#d1fae5", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #D1FAE5 121.05%)' },
    { title: "Total Participants", cardBorder: "1px solid #D977061A", value: "2400", iconBg: '#FEF3C7', icon: <FaUsers className="text-warning" size={20} />, bgColor: "#fef3c7", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #FEF3C7 121.05%)' },
    { title: "Revenue (MTD)", cardBorder: "1px solid #9333EA1A", value: "₹ 40,000", iconBg: '#F3E8FF', icon: <IoCashOutline style={{ color: '#9333EA' }} size={20} />, bgColor: "#e0e7ff", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #F3E8FF 121.05%)' },
  ];
 
  const leaguesData = [
    { name: "Indian Premier League", startDate: "Jun 12, 2026", clubs: 20, participants: "Adams", status: "Ongoing" },
    { name: "Indian Premier League", startDate: "Jun 12, 2026", clubs: 10, participants: "Ardelage", status: "Upcoming" },
    { name: "Indian Premier League", startDate: "Jun 12, 2026", clubs: 45, participants: "Arthur", status: "Completed" },
    { name: "Indian Premier League", startDate: "Jun 12, 2026", clubs: 5, participants: "Banner", status: "Ongoing" },
  ];
 
  const getStatusBadge = (status) => {
    const colors = {
      Ongoing: { bg: "#dcfce7", text: "#16a34a" },
      Upcoming: { bg: "#fef3c7", text: "#ca8a04" },
      Completed: { bg: "#dbeafe", text: "#2563eb" },
    };
    return (
      <span style={{
        backgroundColor: colors[status]?.bg,
        color: colors[status]?.text,
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
    <Container fluid className="p-4 bg-white" style={{ minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-bold">League Dashboard</h4>
        <button
          className="d-flex align-items-center position-relative p-0 border-0"
          style={{
            borderRadius: "20px 10px 10px 20px",
            background: "none",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.3s ease",
            flexShrink: 0,
          }}
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
            className="p-md-1 p-2 rounded-circle bg-light"
            style={{ position: "relative", left: "10px" }}
          >
            <div
              className="d-flex justify-content-center align-items-center text-white fw-bold"
              style={{
                backgroundColor: "#1F41BB",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                fontSize: "20px",
              }}
            >
              <span className="mb-1">+</span>
            </div>
          </div>
          <div
            className="d-flex align-items-center fw-medium rounded-end-3"
            style={{
              padding: "0 16px",
              height: "36px",
              fontSize: "14px",
              fontFamily: "Nunito, sans-serif",
              color:"#1F41BB",border:"1px solid #1F41BB"
            }}
          >
            New League
          </div>
        </button>
      </div>
 
      <Row className="mb-4">
        {statsCards.map((card, idx) => (
          <Col key={idx} md={3} sm={6} className="mb-3 ">
            <Card style={{ background: card?.tileBg, border: card?.cardBorder, boxShadow: '0px 0px 8.8px 0px #0000001A' }} className="border-0  h-100 rounded-4">
              <Card.Body className="d-flex  flex-column gap-3">
                <p className="rounded-2 m-0 d-flex align-items-center justify-content-center p-2" style={{ background: card?.iconBg, width: 'fit-content' }}>
                  {card.icon}
                </p>
                <small className="text-muted fw-semibold fs-6 m-0">{card.title}</small>
                <h5 className="m-0 fw-bold">{card.value}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
 
      <Card className="border-0" style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-bold">Manage League</h6>
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm" style={{ borderRadius: "6px" }}>
                Status
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setStatusFilter("all")}>All</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("Ongoing")}>Ongoing</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("Upcoming")}>Upcoming</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("Completed")}>Completed</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
 
          <Table responsive hover className="mb-0">
            <thead style={{ backgroundColor: "#f9fafb" }}>
              <tr>
                <th style={{ fontWeight: "600", fontSize: "14px", padding: "12px" }}>League Name</th>
                <th style={{ fontWeight: "600", fontSize: "14px", padding: "12px" }}>Start Date</th>
                <th style={{ fontWeight: "600", fontSize: "14px", padding: "12px" }}>Clubs</th>
                <th style={{ fontWeight: "600", fontSize: "14px", padding: "12px" }}>Participants</th>
                <th style={{ fontWeight: "600", fontSize: "14px", padding: "12px" }}>Status</th>
                <th style={{ fontWeight: "600", fontSize: "14px", padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaguesData.map((league, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "12px" }}>{league.name}</td>
                  <td style={{ padding: "12px" }}>{league.startDate}</td>
                  <td style={{ padding: "12px" }}>{league.clubs}</td>
                  <td style={{ padding: "12px" }}>{league.participants}</td>
                  <td style={{ padding: "12px" }}>{getStatusBadge(league.status)}</td>
                  <td style={{ padding: "12px" }}>
                    <div className="d-flex gap-2">
                      <FaEye style={{ cursor: "pointer", color: "#6b7280" }} />
                      <FaEdit style={{ cursor: "pointer", color: "#6b7280" }} />
                      <FaTrash style={{ cursor: "pointer", color: "#6b7280" }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};
 
export default League;