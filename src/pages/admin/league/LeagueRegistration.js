import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const LeagueRegistration = () => {
  const [selectedClub, setSelectedClub] = useState('Terrakort');
  const [expandedCategories, setExpandedCategories] = useState({ 'Level A': true });

  const clubs = [
    { name: 'Terrakort', levelA: '02/04', levelB: '02/04', mixed: '02/04', female: '04' },
    { name: 'Padel Haus', levelA: '02/04', levelB: '02/04', mixed: '02/04', female: '04' },
    { name: 'Courtline', levelA: '02/04', levelB: '02/04', mixed: '02/04', female: '04' },
  ];

  const categories = [
    { id: 'Level A', label: 'Game Category: Level A' },
    { id: 'Level B', label: 'Game Category: Level B' },
    { id: 'Mixed', label: 'Game Category: Mixed' },
    { id: 'Female', label: 'Game Category: Female' },
  ];

  const players = [
    { name: 'Virat Kohli', phone: '9999999999', email: 'dvghv525.sliya@gmail.com', status: 'Paid' },
    { name: 'Virat Kohli', phone: '9999999999', email: 'dvghv525.sliya@gmail.com', status: 'Pending' },
    { name: 'Virat Kohli', phone: '9999999999', email: 'dvghv525.sliya@gmail.com', status: 'Paid' },
    { name: 'Virat Kohli', phone: '9999999999', email: 'dvghv525.sliya@gmail.com', status: 'Pending' },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: "100vh" }}>
      <h4 className="fw-semibold mb-4">League/ Registration</h4>
      <Row className='border-top' style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Left Sidebar - Clubs */}
        <Col lg={3} md={4} className="d-flex p-0 flex-column" style={{ minHeight: '100%' }}>
          <div className="rounded-start ps-0 border-end flex-grow-1 shadow-sm" style={{ backgroundColor: "#FBFCFE" }}>
            <div className="p-3" style={{borderBottom:"2px solid #868282"}}>
              <div className="fw-semibold">Clubs <span className="text-muted fw-normal">(10)</span></div>
            </div>

            {clubs.map((club, idx) => (
              <div
                key={club.name}
                onClick={() => setSelectedClub(club.name)}
                className={`p-3 position-relative ${selectedClub === club.name ? ' text-white' : 'bg-white border-bottom'}`}
                style={{
                  cursor: 'pointer',
                  borderBottom: idx < clubs.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: selectedClub === club.name ? '#1F41BB' : ''
                }}
              >
                {selectedClub === club.name && (
                  <div style={{
                    position: 'absolute',
                    right: '-1px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '12px solid transparent',
                    borderBottom: '12px solid transparent',
                    borderRight: '12px solid white'
                  }} />
                )}
                <div className="fw-bold mb-2">{club.name}</div>
                <Row className="g-2 small">
                  <Col xs={3} className="text-center">
                    <div className={selectedClub === club.name ? 'text-white' : 'text-muted'} style={{ fontSize: '11px' }}>Level A</div>
                    <div className="fw-semibold">{club.levelA}</div>
                  </Col>
                  <Col xs={3} className="text-center">
                    <div className={selectedClub === club.name ? 'text-white' : 'text-muted'} style={{ fontSize: '11px' }}>Level B</div>
                    <div className="fw-semibold">{club.levelB}</div>
                  </Col>
                  <Col xs={3} className="text-center">
                    <div className={selectedClub === club.name ? 'text-white' : 'text-muted'} style={{ fontSize: '11px' }}>Mixed</div>
                    <div className="fw-semibold">{club.mixed}</div>
                  </Col>
                  <Col xs={3} className="text-center">
                    <div className={selectedClub === club.name ? 'text-white' : 'text-muted'} style={{ fontSize: '11px' }}>Female</div>
                    <div className="fw-semibold">{club.female}</div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Col>

        {/* Right Content - Categories */}
        <Col lg={9} md={8} className='pt-2'>
          {categories.map((category) => (
            <div key={category.id} className=" rounded-3 shadow-sm mb-3" style={{backgroundColor:"#FBFCFE"}}>
              <div
                onClick={() => toggleCategory(category.id)}
                className="d-flex justify-content-between align-items-center p-3 rounded-3"
                style={{ cursor: 'pointer' }}
              >
                <div className="div rounded-3 p-2" style={{ width: "auto" ,backgroundColor:"#D9D9D980"}}>
                  <h6 className="mb-0  fw-semibold" style={{
                    background: 'linear-gradient(270deg, #003AFF 0%, #07289A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{category.label}</h6>
                </div>
                <button className="btn rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', padding: 0,backgroundColor:"#626262" }}>
                  {expandedCategories[category.id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
              </div>

              {expandedCategories[category.id] && (
                <div className="table-responsive p-2">
                  <table className="table table-hover mb-0 p-2">
                    <thead className="" style={{ backgroundColor: "#D9D9D980" }}>
                      <tr>
                        <th className="py-3 text-muted  " style={{borderRadius:"10px 0px 0px 0px", fontSize: '14px', fontWeight: "500", backgroundColor: "#D9D9D980" }}>Player Name</th>
                        <th className="py-3 text-muted " style={{ fontSize: '14px', fontWeight: "500", backgroundColor: "#D9D9D980" }}>Phone Number</th>
                        <th className="py-3 text-muted " style={{ fontSize: '14px', fontWeight: "500", backgroundColor: "#D9D9D980" }}>Email</th>
                        <th className="py-3 text-muted " style={{borderRadius:"0px 10px 0px 0px", fontSize: '14px', fontWeight: "500", backgroundColor: "#D9D9D980" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, idx) => (
                        <tr key={idx}>
                          <td className="py-3" style={{ fontSize: '12px', fontWeight: "500", backgroundColor: idx % 2 === 1 ? '#F2F2F2B2' : '#FFFFFF' }}>{player.name}</td>
                          <td className="py-3" style={{ fontSize: '12px', fontWeight: "500", backgroundColor: idx % 2 === 1 ? '#F2F2F2B2' : '#FFFFFF' }}>{player.phone}</td>
                          <td className="py-3" style={{ fontSize: '12px', fontWeight: "500", backgroundColor: idx % 2 === 1 ? '#F2F2F2B2' : '#FFFFFF' }}>{player.email}</td>
                          <td className="py-3" style={{ fontSize: '12px', fontWeight: "500", backgroundColor: idx % 2 === 1 ? '#F2F2F2B2' : '#FFFFFF' }}>
                            <span className={`badge rounded-pill `} style={{ fontSize: '12px' ,backgroundColor : player.status === 'Paid' ? '#D8F2E0' : '#FEF3C7',color:player.status === 'Paid' ? '#3DBE64' : '#FF9B27' }}>
                              {player.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default LeagueRegistration;
