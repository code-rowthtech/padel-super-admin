import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Nav } from 'react-bootstrap';
import { FaCalendarAlt, FaEdit, FaPlus } from 'react-icons/fa';
import { IoTennisballOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const LeagueSchedule = () => {
  const [selectedVenue, setSelectedVenue] = useState('');
  const [showClubs, setShowClubs] = useState(false);
  const [selectedClubs, setSelectedClubs] = useState(['Terrakort']);
  const navigate = useNavigate();

  const clubs = [
    { name: 'Terrakort', icon: 'TK' },
    { name: 'Padel Haus', icon: 'PH' },
    { name: 'Courtline', icon: 'CL' },
    { name: 'Padel Haus', icon: 'PH' },
    { name: 'Courtline', icon: 'CL' },
    { name: 'Padel Haus', icon: 'PH' },
  ];

  const toggleClub = (clubName) => {
    if (selectedClubs.includes(clubName)) {
      setSelectedClubs(selectedClubs.filter(c => c !== clubName));
    } else {
      setSelectedClubs([...selectedClubs, clubName]);
    }
  };

  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      <h4 className="fw-semibold mb-4 pb-3 border-bottom">League/ Match Schedule</h4>

      <div className="border rounded-3 p-4" style={{ backgroundColor: "#F1F5F94D" }}>
        <div className="d-flex align-items-center mb-4">
          <FaCalendarAlt size={20} className="me-2" />
          <h5 className="mb-0 fw-semibold">Day one schedule</h5>
        </div>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold mb-2">Date</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="MM/DD/YY"
                  className="py-3"
                  style={{ backgroundColor: '#F5F5F5', border: 'none', paddingRight: '40px' }}
                />
                <FaCalendarAlt
                  size={18}
                  className="position-absolute text-muted"
                  style={{ right: '15px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold mb-2">Venue</Form.Label>
              <div
                onClick={() => setShowClubs(!showClubs)}
                className="py-3 d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: '#F5F5F5',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: selectedVenue ? '#000' : '#6c757d' }}>
                  {selectedVenue || 'Select Type'}
                </span>
                <span>▼</span>
              </div>
            </Form.Group>

            {showClubs && (
              <Row className="mt-3">
                <Col xs={8}>
                  <div className="bg-white rounded-3 shadow-sm" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">Clubs</span>
                      <span className="badge bg-secondary rounded-pill">(6)</span>
                    </div>
                    {clubs.map((club, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleClub(club.name)}
                        className={`d-flex align-items-center p-3 border-bottom ${selectedClubs.includes(club.name) ? 'bg-primary text-white' : ''
                          }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${selectedClubs.includes(club.name) ? 'bg-white text-primary' : 'bg-dark text-white'
                            }`}
                          style={{ width: '40px', height: '40px', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          {club.icon}
                        </div>
                        <span className="fw-semibold">{club.name}</span>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col xs={4} className="d-flex align-items-start">
                  <Button
                    onClick={() => {
                      navigate('/admin/league/schedule-match');
                    }} className="w-100 py-3 fw-semibold"
                    style={{
                      backgroundColor: '#1F41BB',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
        </Row>


      </div>


    </Container>
  );
};

export default LeagueSchedule;
