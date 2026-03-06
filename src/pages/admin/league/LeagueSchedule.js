import React, { useState, useRef } from 'react'
import { Container, Row, Col, Button, Dropdown, Form, Nav, Modal, InputGroup } from 'react-bootstrap'
import { FiEdit2, FiChevronDown, FiPlus } from 'react-icons/fi'
import { MdClose } from 'react-icons/md'
import { BsCalendar } from 'react-icons/bs'
import { AiOutlineHome, AiOutlineTeam } from 'react-icons/ai'
import './LeagueScheduleMatch.css'
import { vs_image } from '../../../assets/files'
import { IoCalendarClearOutline } from "react-icons/io5";
import { BiExport } from "react-icons/bi";
import { VscEye } from "react-icons/vsc";
import { LuPencilLine } from "react-icons/lu";



const LeagueSchedule = () => {
  const [selectedClub, setSelectedClub] = useState('Terrakort')
  const [activeTab, setActiveTab] = useState('levelA')
  const [showModal, setShowModal] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [selectedAway, setSelectedAway] = useState({})
  const [expandedTeam, setExpandedTeam] = useState(null)
  const dateInputRef = useRef(null)

  const clubs = [
    { id: 1, name: 'Terrakort', logo: 'TK', location: 'Chandigarh' },
    { id: 2, name: 'Padel Haus', logo: 'PH', location: 'Chandigarh' },
    { id: 3, name: 'Courtline', logo: 'CL', location: 'Chandigarh' },
  ]

  const matches = [1, 2, 3, 4]
  const awayTeams = [
    { name: 'Courtline', logo: 'CL' },
    { name: 'Padel Haus', logo: 'PH' },
    { name: 'Terrakort', logo: 'TK' }
  ]

  const handleDateChange = (e) => {
    const date = new Date(e.target.value)
    const formatted = (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
      date.getDate().toString().padStart(2, '0') + '/' +
      date.getFullYear().toString().slice(-2)
    setFormDate(formatted)
  }

  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>League/ Match Schedule</h4>
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => setShowModal(true)} className='btn' style={{ padding: '8px 18px', border: '1px dashed rgba(37, 37, 37, 1)', color: "rgba(37, 37, 37, 1)", background: "transparent" }}><FiPlus size={18} /> Add Date</button>
              <Button variant="primary" style={{ padding: '8px 20px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none' }}>Export Schedule</Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className='border-top' style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Col md={2} className='p-0 border-end pe-1' style={{ backgroundColor: "#FBFCFE", display: 'flex', flexDirection: 'column', padding: '16px !important' }}>
          <div className="clubs-tabs">
            <div className="d-flex pt-1 border-bottom py-3 justify-content-between align-items-center mb-3">
              <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>Clubs</span>
              <span style={{ color: '#666', fontSize: '12px' }}>({clubs.length})</span>
            </div>
            <div className="clubs-list" style={{ gap: '0' }}>
              {clubs.map((club, index) => (
                <div
                  key={index}
                  className={`club-item ${selectedClub === club.name ? 'active' : ''}`}
                  onClick={() => setSelectedClub(club.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: selectedClub === club.name ? '8px' : '0',
                    cursor: 'pointer',
                    background: selectedClub === club.name ? 'rgba(31, 65, 187, 1)' : 'transparent',
                    color: selectedClub === club.name ? 'white' : '#1a1a1a',
                    borderBottom: selectedClub === club.name ? 'none' : '1px solid #e0e0e0',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: selectedClub === club.name ? 'white' : '#1a1a1a',
                    color: selectedClub === club.name ? 'rgba(31, 65, 187, 1)' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {club.logo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{club.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>◆ {club.location}</div>
                  </div>
                  <AiOutlineHome size={20} />
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col md={8} style={{ overflowY: 'auto' }}>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="level-tabs border-0 mb-3">
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

          <div className="home-team-header mb-3">
            <span className='' style={{ fontWeight: '600', color: "rgba(37, 37, 37, 0.8)" }}>Home Team: </span>
            <span style={{ fontWeight: '600' }}>Terrakort</span>
            <span className='ps-1' style={{ color: '#666', fontSize: '13px', marginLeft: '8px' }}>(Date: 10/08/2026)</span>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '8px', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#e8e8e8' }}>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Match No.</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Home</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>
                    <div className='rounded-3' style={{ width: '34px', height: '34px', background: 'rgba(37, 37, 37, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '0 auto' }}>VS</div>
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Away</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((matchNum, index) => (
                  <tr className='text-center' key={matchNum} style={{ backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>0{matchNum}</td>
                    <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                      <div className='d-flex justify-content-center gap-2' >
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'rgba(31, 65, 187, 1)' }}>TK</div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Terrakort</div>
                          <div style={{ fontSize: '10px', background: 'linear-gradient(270deg, rgba(0, 58, 255, 0.1) 0%, rgba(7, 40, 154, 0.1) 100%)', color: 'rgba(31, 65, 187, 1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px', fontWeight: "600" }}>Warriors</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', border: '2px solid white', zIndex: 2 }}>E</div>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginTop: '-8px', marginLeft: "6px", border: '2px solid white', zIndex: 1 }}>K</div>
                        </div>
                        <div className='mt-1' style={{ fontSize: '11px', color: '#666' }}>
                          <div>Eleanor Pena</div>
                          <div>Kristin Watson</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                      <div className='rounded-3  text-white' style={{ backgroundColor: "#1F41BB", opacity: "10%", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto' }}>VS</div>
                    </td>
                    <td className='text-center' style={{ padding: '14px 12px', borderBottom: '1px solid #ddd', position: 'relative', backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                      <Dropdown>
                        <Dropdown.Toggle as="div" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', justifyContent: 'center' }}>
                          {selectedAway[matchNum] ? (
                            <>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}><LuPencilLine size={18} /></div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{selectedAway[matchNum].name}</div>
                                <div style={{ fontSize: '10px', background: 'linear-gradient(270deg, rgba(0, 58, 255, 0.1) 0%, rgba(7, 40, 154, 0.1) 100%)', color: 'rgba(31, 65, 187, 1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px', fontWeight: "600" }}>Warriors</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', border: '2px solid white', zIndex: 2 }}>E</div>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginTop: '-8px', marginLeft: "6px", border: '2px solid white', zIndex: 1 }}>K</div>
                              </div>
                              <div className='mt-1' style={{ fontSize: '11px', color: '#666' }}>
                                <div>Eleanor Pena</div>
                                <div>Kristin Watson</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'rgba(31, 65, 187, 1)', fontWeight: 'bold' }}>+</div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Add Club</div>
                                <div style={{ fontSize: '10px', background: 'linear-gradient(270deg, rgba(0, 58, 255, 0.1) 0%, rgba(7, 40, 154, 0.1) 100%)', color: 'rgba(31, 65, 187, 1)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px', fontWeight: "600" }}>Warriors</div>
                              </div>
                            </>
                          )}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ minWidth: '250px' }}>
                          {awayTeams.map((team, idx) => (
                            <div key={idx}>
                              <Dropdown.Item as="div" onClick={() => setExpandedTeam(expandedTeam === idx ? null : idx)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'white' }}>{team.logo}</div>
                                <span style={{ flex: 1, textAlign: 'left' }}>{team.name}</span>
                                <span>›</span>
                              </Dropdown.Item>
                              {expandedTeam === idx && (
                                <div style={{ backgroundColor: '#f9f9f9', borderLeft: '2px solid #ddd' }}>
                                  <Dropdown.Item onClick={() => { setSelectedAway({ ...selectedAway, [matchNum]: team }); setExpandedTeam(null); }} style={{ paddingLeft: '32px' }}>Team A</Dropdown.Item>
                                  <Dropdown.Item onClick={() => { setSelectedAway({ ...selectedAway, [matchNum]: team }); setExpandedTeam(null); }} style={{ paddingLeft: '32px' }}>Team B</Dropdown.Item>
                                  <Dropdown.Item onClick={() => { setSelectedAway({ ...selectedAway, [matchNum]: team }); setExpandedTeam(null); }} style={{ paddingLeft: '32px' }}>Team C</Dropdown.Item>
                                </div>
                              )}
                            </div>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                    <td className='' style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}> <p className='p-1 border rounded-3' style={{ backgroundColor: 'rgba(251, 252, 254, 1)' }}>09:00 Am</p> </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Row className="mt-4">
            <Col className="d-flex justify-content-between">
              <Button variant="light" style={{ padding: '10px 30px', border: '1px solid #ddd' }}>Back</Button>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" style={{ padding: '10px 24px',color:"rgba(31, 65, 187, 1)",border:"1px solid rgba(31, 65, 187, 1)" ,fontWeight:"600"}}>Save and Next Date</Button>
                <Button variant="primary" style={{ padding: '10px 40px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none', boxShadow: '0px 0px 20.9px 0px rgba(31, 65, 187, 0.5)' ,fontWeight:"600"}}>Save</Button>
              </div>
            </Col>
          </Row>
        </Col>

        <Col md={2} className='d-flex flex-column' style={{ backgroundColor: "#FBFCFE", padding: '16px', gap: '12px' }}>
          <div className='border rounded-3' style={{ background: 'rgba(251, 252, 254, 1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div className='d-flex justify-content-between align-items-center gap-2 mb-2'>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>10 Aug, 2026</span>
              <div style={{ width: '28px', height: '27px', borderRadius: '6px', background: 'rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                <BiExport size={18} />
              </div>
            </div>
            <div className="d-flex justify-content-between flex-column text-start">
              <div className='mb-0 text-start mb-2' style={{ fontSize: '13px', color: '#666', }}>
                <p className='mb-0 text-start m-0'>Matches: 04</p>
              </div>
              <div className='d-flex gap-3 justify-content-between' style={{ fontSize: '13px', color: '#666', }}>
                <p>Venue: 01</p>
                <VscEye size={16} className='' style={{ color: '#999' }} />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header className="border-bottom d-flex justify-content-between align-items-center" style={{ padding: '20px' }}>
          <Modal.Title style={{ fontWeight: '600', fontSize: '20px', color: 'rgba(37, 37, 37, 1)' }}> <IoCalendarClearOutline size={18} /> Day one schedule</Modal.Title>
          <MdClose size={24} onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} />
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Date</Form.Label>
              <InputGroup>
                <Form.Control
                  ref={dateInputRef}
                  type="date"
                  className='py-3'
                  onChange={handleDateChange}
                  style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
                />
                <InputGroup.Text onClick={() => dateInputRef.current?.click()} style={{ borderRadius: '0 6px 6px 0', border: '1px solid #ddd', background: 'rgba(204, 210, 221, 0.43)', cursor: 'pointer' }}>
                  <BsCalendar size={18} color="#666" />
                </InputGroup.Text>
              </InputGroup>
              <Form.Control
                type="text"
                placeholder="MM/DD/YY"
                value={formDate}
                readOnly
                style={{ marginTop: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Venue</Form.Label>
              <Form.Select
                value={formVenue}
                className='py-3'
                onChange={(e) => setFormVenue(e.target.value)}
                style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              >
                <option>Select Type</option>
                <option value="venue1">Venue 1</option>
                <option value="venue2">Venue 2</option>
              </Form.Select>
            </Form.Group>
            <Button
              variant="primary"
              className="w-100"
              style={{ padding: '12px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none', fontWeight: '600' }}
              onClick={() => setShowModal(false)}
            >
              Create Date
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default LeagueSchedule
