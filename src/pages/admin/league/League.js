import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Dropdown } from "react-bootstrap";
import { FaUsers, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HiOutlineTrophy } from "react-icons/hi2";
import { BsRecordCircle } from "react-icons/bs";
import { IoCashOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLeagues } from '../../../redux/admin/league/thunk';
 
const League = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { leagues, loading } = useSelector(state => state.league);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        dispatch(getLeagues());
    }, [dispatch]);

    const leaguesData = Array.isArray(leagues) ? leagues : [];
    const totalParticipants = leaguesData.reduce((sum, league) => sum + league.clubs.reduce((clubSum, club) => clubSum + club.totalRegistrations, 0), 0);
    const activeLeagues = leaguesData.filter(l => l.status === 'active').length;
    const totalRevenue = leaguesData.reduce((sum, league) => sum + league.totalPaymentReceived, 0);
 
  const statsCards = [
    { title: "Total Leagues", cardBorder: "1px solid #1F41BB1A", value: leaguesData.length, iconBg: '#1F41BB1A', icon: <HiOutlineTrophy style={{ color: '#1F41BB' }} size={20} />, bgColor: "#f3f4f6", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #E0E3F2 121.05%)' },
    { title: "Active Leagues", cardBorder: "1px solid #0596691A", value: activeLeagues, iconBg: '#D1FAE5', icon: <BsRecordCircle style={{ color: '#059669' }} size={20} />, bgColor: "#d1fae5", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #D1FAE5 121.05%)' },
    { title: "Total Participants", cardBorder: "1px solid #D977061A", value: totalParticipants, iconBg: '#FEF3C7', icon: <FaUsers className="text-warning" size={20} />, bgColor: "#fef3c7", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #FEF3C7 121.05%)' },
    { title: "Revenue (MTD)", cardBorder: "1px solid #9333EA1A", value: `₹ ${totalRevenue.toLocaleString()}`, iconBg: '#F3E8FF', icon: <IoCashOutline style={{ color: '#9333EA' }} size={20} />, bgColor: "#e0e7ff", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #F3E8FF 121.05%)' },
  ];
 
  const filteredLeagues = statusFilter === "all" ? leaguesData : leaguesData.filter(l => l.status === statusFilter.toLowerCase());
 
  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { bg: "#f3f4f6", text: "#6b7280", label: "Draft" },
      active: { bg: "#dcfce7", text: "#16a34a", label: "Active" },
      completed: { bg: "#dbeafe", text: "#2563eb", label: "Completed" },
      cancelled: { bg: "#fee2e2", text: "#dc2626", label: "Cancelled" },
    };
    const config = statusMap[status] || statusMap.draft;
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.text,
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "500"
      }}>
        {config.label}
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
          onClick={()=>navigate('/admin/new-league')}
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
                <Dropdown.Item onClick={() => setStatusFilter("draft")}>Draft</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("active")}>Active</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("completed")}>Completed</Dropdown.Item>
                <Dropdown.Item onClick={() => setStatusFilter("cancelled")}>Cancelled</Dropdown.Item>
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
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center" }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeagues.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                    No leagues found
                  </td>
                </tr>
              ) : (
                filteredLeagues.map((league) => (
                  <tr key={league._id}>
                    <td style={{ padding: "12px" }}>{league.leagueName}</td>
                    <td style={{ padding: "12px" }}>{new Date(league.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: "12px" }}>{league.clubs.length}</td>
                    <td style={{ padding: "12px" }}>{league.clubs.reduce((sum, club) => sum + club.totalRegistrations, 0)}</td>
                    <td style={{ padding: "12px" }}>{getStatusBadge(league.status)}</td>
                    <td style={{ padding: "12px" }}>
                      <div className="d-flex gap-2">
                        <FaEye style={{ cursor: "pointer", color: "#6b7280" }} onClick={() => navigate(`/admin/new-league/${league._id}`)} />
                        <FaEdit style={{ cursor: "pointer", color: "#6b7280" }} onClick={() => navigate(`/admin/new-league/${league._id}`)} />
                        <FaTrash style={{ cursor: "pointer", color: "#6b7280" }} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};
 
export default League;