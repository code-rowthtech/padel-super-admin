import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { IoTrophyOutline } from 'react-icons/io5';
import { FiSettings, FiChevronRight } from 'react-icons/fi';
import { RiMoneyRupeeCircleFill } from 'react-icons/ri';
import { AiOutlinePlus } from 'react-icons/ai';

const RuleSettings = ({ onBack }) => {
    const [settings, setSettings] = useState({
        numberOfSets: 3,
        gamesToStartTiebreak: 3,
        pointInTiebreak: 3,
        numberOfGames: 3,
        advantagesWithGoldenPoint: 3,
        matchWinPoints: 2
    });

    const [prizeDistribution, setPrizeDistribution] = useState([{ label: '1st Price', value: '' }, { label: '2nd Price', value: '' }, { label: '3rd Price', value: '' }]);
    const [teamRewards, setTeamRewards] = useState([{ label: 'Bounty', value: '' }, { label: 'Team of the League', value: '' }]);

    const handleCounterChange = (field, increment) => {
        setSettings(prev => ({
            ...prev,
            [field]: increment ? prev[field] + 1 : Math.max(0, prev[field] - 1)
        }));
    };

    const addPrize = () => {
        setPrizeDistribution([...prizeDistribution, { label: `${prizeDistribution.length + 1}th Price`, value: '' }]);
    };

    const addTeamReward = () => {
        setTeamRewards([...teamRewards, { label: 'New Reward', value: '' }]);
    };

    return (
        <>
            <style>
                {`
                    .form-check-input:checked {
                        background-color: #34C759 !important;
                        border-color: #34C759 !important;
                        box-shadow: none !important;
                    }
                    .form-check-input:focus {
                        box-shadow: none !important;
                    }
                `}
            </style>

            <div style={{ marginBottom: '24px', backgroundColor: '#F1F5F94D', padding: '16px', borderRadius: '12px' }}>
                <h6 className='d-flex align-items-center gap-2 mb-3' style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                    <IoTrophyOutline size={20} /> Match Rules
                </h6>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Regular Round Sets</Form.Label>
                    <div style={{ position: 'relative' }}>
                        <Form.Select style={{ borderRadius: '8px', padding: '10px 40px 10px 12px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                            <option>Select Sets Format</option>
                        </Form.Select>
                        <FiSettings size={18} style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} />
                    </div>
                </Form.Group>

                <h6 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>Settings</h6>

                <Row className="mb-3">
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Number Of Sets</Form.Label>
                            <div className='d-flex align-items-center gap-2'>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfSets', false)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                                <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings.numberOfSets}</span>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfSets', true)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Games to Start Tiebreak</Form.Label>
                            <div className='d-flex align-items-center gap-2'>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('gamesToStartTiebreak', false)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                                <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings.gamesToStartTiebreak}</span>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('gamesToStartTiebreak', true)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Point in Tiebreak</Form.Label>
                            <div className='d-flex align-items-center gap-2'>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('pointInTiebreak', false)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                                <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings.pointInTiebreak}</span>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('pointInTiebreak', true)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Number of Games</Form.Label>
                            <div className='d-flex align-items-center gap-2'>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfGames', false)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                                <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings.numberOfGames}</span>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfGames', true)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Golden Point</Form.Label>
                            <Form.Check type="switch" id="golden-point" defaultChecked />
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Tiebreak on Final Set</Form.Label>
                            <Form.Check type="switch" id="tiebreak-final" defaultChecked />
                        </div>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Advantages with golden Point</Form.Label>
                            <div className='d-flex align-items-center gap-2'>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('advantagesWithGoldenPoint', false)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                                <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings.advantagesWithGoldenPoint}</span>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('advantagesWithGoldenPoint', true)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Golden Point in Tiebreak</Form.Label>
                            <Form.Check type="switch" id="golden-point-tiebreak" />
                        </div>
                    </Col>
                    <Col md={4} className="mb-3">
                        <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Match Win Points</Form.Label>
                            <div className='d-flex align-items-center gap-2'>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('matchWinPoints', false)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                                <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings.matchWinPoints}</span>
                                <Button variant="light" size="sm" onClick={() => handleCounterChange('matchWinPoints', true)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className='d-flex align-items-center justify-content-between mb-3'>
                    <h6 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0', color: '#1a1a1a' }}>Sets Configuration</h6>
                    <Form.Check type="switch" id="sets-config" defaultChecked />
                </div>

                <div className="mb-3">
                    <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Quarterfinal Sets</Form.Label>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Same as regular rounds:</span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <FiSettings size={20} style={{ color: '#666', cursor: 'pointer' }} />
                            <FiChevronRight size={20} style={{ color: '#666', cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>SemiFinal Sets</Form.Label>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Same as regular rounds:</span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <FiSettings size={20} style={{ color: '#666', cursor: 'pointer' }} />
                            <FiChevronRight size={20} style={{ color: '#666', cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Final Sets</Form.Label>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Same as regular rounds:</span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <FiSettings size={20} style={{ color: '#666', cursor: 'pointer' }} />
                            <FiChevronRight size={20} style={{ color: '#666', cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '24px', backgroundColor: '#F1F5F94D', padding: '16px', borderRadius: '12px' }}>
                <div className='d-flex align-items-center justify-content-between mb-3'>
                    <h6 className='d-flex align-items-center gap-2 mb-0' style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        <RiMoneyRupeeCircleFill size={20} /> Prize Distribution
                    </h6>
                    <button onClick={addPrize} className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }}>
                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                <span className="mb-1">+</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>
                            Prize
                        </div>
                    </button>
                </div>

                <Row className="mb-3">
                    {prizeDistribution.map((prize, index) => (
                        <Col md={4} className="mb-3" key={index}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{prize.label}</Form.Label>
                                <Form.Control type="text" placeholder="Enter Amount" value={prize.value} onChange={(e) => {
                                    const updated = [...prizeDistribution];
                                    updated[index].value = e.target.value;
                                    setPrizeDistribution(updated);
                                }} style={{ borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }} />
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </div>

            <div style={{ marginBottom: '24px', backgroundColor: '#F1F5F94D', padding: '16px', borderRadius: '12px' }}>
                <div className='d-flex align-items-center justify-content-between mb-3'>
                    <h6 className='d-flex align-items-center gap-2 mb-0' style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        <IoTrophyOutline size={20} /> Team Rewards
                    </h6>
                    <button onClick={addTeamReward} className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }}>
                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                <span className="mb-1">+</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>
                            Prize
                        </div>
                    </button>
                </div>

                <Row className="mb-3">
                    {teamRewards.map((reward, index) => (
                        <Col md={6} className="mb-3" key={index}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{reward.label}</Form.Label>
                                <Form.Control type="text" placeholder="Enter Amount" value={reward.value} onChange={(e) => {
                                    const updated = [...teamRewards];
                                    updated[index].value = e.target.value;
                                    setTeamRewards(updated);
                                }} style={{ borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }} />
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
                <button onClick={onBack} className='border-0 rounded-pill' style={{ backgroundColor: '#E5E7EB', color: '#374151', padding: '12px 32px', fontSize: '16px', fontWeight: '600' }}>Back</button>
                <button className='border-0 rounded-pill text-white' style={{ backgroundColor: '#3DBE64', padding: '12px 32px', fontSize: '16px', fontWeight: '600' }}>Create League</button>
            </div>
        </>
    );
};

export default RuleSettings;
