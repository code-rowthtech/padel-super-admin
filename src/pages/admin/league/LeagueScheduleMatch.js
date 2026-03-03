import React, { useState } from 'react'
import { Container, Row, Col, Button, Dropdown, Form, Nav } from 'react-bootstrap'
import { FiEdit2, FiChevronDown } from 'react-icons/fi'
import './LeagueScheduleMatch.css'

const LeagueScheduleMatch = () => {
    const [selectedClub, setSelectedClub] = useState('Terrakort')
    const [selectedDate, setSelectedDate] = useState('10')
    const [selectedMonth, setSelectedMonth] = useState('Aug, 2026')
    const [activeTab, setActiveTab] = useState('levelA')

    const clubs = [
        { id: 1, name: 'Terrakort', logo: 'TK' },
        { id: 2, name: 'Padel Haus', logo: 'PH' },
        { id: 3, name: 'Courtline', logo: 'CL' },
        { id: 4, name: 'Padel Haus', logo: 'PH' },
        { id: 5, name: 'Courtline', logo: 'CL' },
        { id: 6, name: 'Padel Haus', logo: 'PH' }
    ]

    const matches = [1, 2, 3, 4]

    return (
        <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>League/ Match Schedule</h4>
                        <div className="d-flex align-items-center gap-3">
                            <Form.Control
                                type="date"
                                value="2026-08-10"
                                className='border'
                                style={{ boxShadow: "none", width: 'auto', fontSize: '14px', color: '#666', border: 'none', background: 'transparent' }}
                            />
                            <Dropdown >
                                <Dropdown.Toggle variant="link" className="text-decoration-none d-flex align-items-center border gap-2" style={{ color: '#4361EE', fontWeight: '500' }}>
                                    {selectedClub ? selectedClub : 'Select'} <FiChevronDown />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {clubs.map((club, index) => (
                                        <Dropdown.Item key={index} onClick={() => setSelectedClub(club.name)}>
                                            {club.name}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className='border-top '>
                <Col md={3} className='p-0 border-end pe-1' style={{ backgroundColor: "#FBFCFE" }}>
                    <div className="clubs-tabs">
                        <div className="d-flex pt-1 border-bottom py-3 justify-content-between align-items-center mb-3">
                            <span style={{ fontWeight: '600', color: '#1a1a1a' }}>Clubs</span>
                            <span style={{ color: '#666', fontSize: '14px' }}>(6)</span>
                        </div>
                        <div className="clubs-list ">
                            {clubs.map((club, index) => (
                                <div
                                    key={index}
                                    className={`club-item border-bottom rounded-0 ${selectedClub === club.name ? 'active' : ''}`}
                                    onClick={() => setSelectedClub(club.name)}
                                >
                                    <div className="club-logo">{club.logo}</div>
                                    <span>{club.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>

                <Col md={7}>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="level-tabs border-0 mb-2">
                        <Nav.Item>
                            <Nav.Link eventKey="levelA" className={activeTab === 'levelA' ? 'active' : ''}>Level A <span>(6)</span></Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="levelB" className={activeTab === 'levelB' ? 'active' : ''}>Level B <span>(6)</span></Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="mixed" className={activeTab === 'mixed' ? 'active' : ''}>Mixed <span>(6)</span></Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="female" className={activeTab === 'female' ? 'active' : ''}>Female <span>(6)</span></Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="allPlayer" className={activeTab === 'allPlayer' ? 'active' : ''}>All Player <span>(24)</span></Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <div className="home-team-header mb-4">
                        <span className='text-dark' style={{ fontSize: '14px' }}>Home Team: </span>
                        <span style={{ color: '#4361EE', fontWeight: '600' }}>Terrakort</span>
                    </div>

                    <div className="matches-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}>
                        {matches.map((matchNum) => (
                            <div
                                key={matchNum}
                                className="match-card"
                                style={{
                                    background: 'linear-gradient(0deg, rgba(204, 210, 221, 0.43), rgba(204, 210, 221, 0.43)), linear-gradient(100.97deg, #FDFDFF 0%, #9EBAFF 317.27%)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Left - Home Team */}
                                    <div className="team-section home" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <div className="team-logo-wrapper" style={{ position: 'relative', width: '56px', height: '56px' }}>
                                            <div className='rounded-circle d-flex justify-content-center align-items-center text-white'
                                                style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    background: '#3B82F6', // example blue - change to your real color
                                                    fontWeight: 'bold',
                                                    fontSize: '20px',
                                                }}
                                            >
                                                TK
                                            </div>
                                            <span
                                                className="team-badge home-badge"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '-6px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: '#10B981',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                HOME
                                            </span>
                                        </div>

                                        <div className="team-info">
                                            <div style={{ fontWeight: 600, fontSize: '16px', color: '#1F2937' }}>Terrakort</div>
                                            <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Warriors <FiEdit2 size={12} style={{ color: '#6B7280' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center - Match number + VS */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                color: '#6B7280',
                                                background: 'rgba(255,255,255,0.7)',
                                                padding: '2px 10px',
                                                borderRadius: '12px',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            Match {matchNum}
                                        </div>
                                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#4B5563' }}>VS</div>
                                    </div>

                                    {/* Right - Away Team (Add Club) */}
                                    <div className="team-section away" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                                        <div className="team-info" style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, fontSize: '16px', color: '#1F2937' }}>Add Club</div>
                                            <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                Team A <FiEdit2 size={12} style={{ color: '#6B7280' }} />
                                            </div>
                                        </div>

                                        <div className="team-logo-wrapper add-club" style={{ position: 'relative', width: '56px', height: '56px' }}>
                                            <div className='rounded-circle d-flex justify-content-center align-items-center text-white'
                                                style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    background: '#E5E7EB',
                                                    border: '2px dashed #9CA3AF',
                                                    flexDirection: 'column',
                                                    color: '#6B7280',
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                <span>+</span>
                                            </div>
                                            <span
                                                className="team-badge away-badge"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '-6px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: '#EF4444',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                AWAY
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>

                <Col md={2} className='d-flex justify-content-center' style={{ backgroundColor: "#FBFCFE" }}>
                    <div className="">
                        <div className="text-center mb-3" style={{ fontWeight: '600', color: '#1a1a1a' }}>Date</div>
                        <div className="date-display mb-3 py-2 text-white rounded-3 text-center">
                            <div className="date-number">{selectedDate}</div>
                            <div className="date-month">{selectedMonth}</div>
                        </div>
                        <button className="add-date-btn rounded-3 gap-0 p-0 d-flex flex-column">
                            <span className='mb-0 '>+</span>
                            <span className='date-month'>Add date</span>
                        </button>
                    </div>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col className="d-flex justify-content-between">
                    <Button variant="light" style={{ padding: '10px 30px', border: '1px solid #ddd' }}>Back</Button>
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" style={{ padding: '10px 24px' }}>Save and Next Date</Button>
                        <Button variant="primary" style={{ padding: '10px 40px', backgroundColor: '#4361EE', border: 'none' }}>Save</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default LeagueScheduleMatch
