import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { BsInfoCircle } from 'react-icons/bs';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { updateLeague } from '../../../redux/admin/league/thunk';

const StructureCategories = ({ onNext, onBack }) => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { loading, leagueId, currentLeague } = useSelector(state => state.league);
    
    const [registrationDates, setRegistrationDates] = useState({ startDate: '', endDate: '' });
    const [registrationFee, setRegistrationFee] = useState('');
    const [isFeeEnabled, setIsFeeEnabled] = useState(false);
    const [categories, setCategories] = useState([
        { name: 'Level A', registeredCount: 2 },
        { name: 'Level B', registeredCount: 2 },
        { name: 'Mixed', registeredCount: 2 },
        { name: 'Female', registeredCount: 2 }
    ]);

    useEffect(() => {
        if (currentLeague && Object.keys(currentLeague).length > 0) {
            if (currentLeague.registration) {
                const reg = currentLeague.registration;
                setRegistrationDates({
                    startDate: reg.startDate ? reg.startDate.split('T')[0] : '',
                    endDate: reg.endDate ? reg.endDate.split('T')[0] : ''
                });
                if (reg.fee) {
                    setRegistrationFee(reg.fee.toString());
                    setIsFeeEnabled(reg.isEnabled || true);
                } else {
                    setIsFeeEnabled(reg.isEnabled || false);
                }
            }
            if (currentLeague.clubs?.[0]?.participationLimit?.categoryLimits?.length > 0) {
                const limits = currentLeague.clubs[0].participationLimit.categoryLimits;
                setCategories(limits.map(limit => ({
                    name: limit.categoryType,
                    registeredCount: limit.maxParticipants
                })));
            }
        }
    }, [currentLeague]);
    
    const today = new Date().toISOString().split('T')[0];

    const updateCategoryValue = (index, value) => {
        const updated = [...categories];
        const newValue = Math.max(0, value);
        updated[index].registeredCount = newValue % 2 === 0 ? newValue : newValue + 1;
        setCategories(updated);
    };

    const handleSubmit = async () => {
        const leagueIdToUpdate = id || leagueId;
        if (!leagueIdToUpdate) return;

        const clubs = currentLeague?.clubs || [];
        const { priceDistribution, bounty, teamOfLeague, matchRules, ...restLeague } = currentLeague;
        const updatePayload = {
            ...restLeague,
            id: leagueIdToUpdate,
            stateId: currentLeague.stateId?._id || currentLeague.stateId,
            clubs: clubs.filter(c => c.clubId).map(club => ({
                ...club,
                clubId: club.clubId?._id || club.clubId,
                categories: categories.map(cat => ({
                    name: cat.name,
                    registeredCount: cat.registeredCount
                })),
                participationLimit: {
                    maxParticipants: categories.reduce((sum, cat) => sum + cat.registeredCount, 0),
                    categoryLimits: categories.map(cat => ({
                        categoryType: cat.name,
                        maxParticipants: cat.registeredCount
                    }))
                }
            }))
        };

        if (registrationDates.startDate) {
            updatePayload.registration = {};
            if (registrationDates.startDate) updatePayload.registration.startDate = registrationDates.startDate;
            if (registrationDates.endDate) updatePayload.registration.endDate = registrationDates.endDate;
            if (isFeeEnabled && registrationFee) updatePayload.registration.fee = Number(registrationFee);
            updatePayload.registration.isEnabled = isFeeEnabled;
        }

        const cleanPayload = JSON.parse(JSON.stringify(updatePayload, (key, value) => 
            (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) ? undefined : value
        ));

        const result = await dispatch(updateLeague({ leagueData: cleanPayload }));
        if (result.meta.requestStatus === 'fulfilled') onNext();
    };

    return (
        <>
            <div className='p-2 rounded' style={{ backgroundColor: "#F1F5F94D" }}>
                <div className="d-flex align-items-center mb-4">
                    <BsInfoCircle size={20} className="me-2" />
                    <h5 className="mb-0 fw-semibold">Players Registration / Fee</h5>
                </div>

                <Row className="mb-4">
                    <Col md={4} className="mb-3">
                        <Form.Group>
                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                min={today}
                                value={registrationDates.startDate}
                                onChange={(e) => setRegistrationDates({ ...registrationDates, startDate: e.target.value })}
                                style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Form.Group>
                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                min={registrationDates.startDate || today}
                                value={registrationDates.endDate}
                                onChange={(e) => setRegistrationDates({ ...registrationDates, endDate: e.target.value })}
                                style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Form.Group>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: 0 }}>Registration fee</Form.Label>
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
                                <Form.Check type="switch" id="registration-fee-switch" checked={isFeeEnabled} onChange={(e) => setIsFeeEnabled(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                            </div>
                            <Form.Control type="number" placeholder="₹ 300" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} disabled={!isFeeEnabled} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0 fw-semibold">Participation Limit</h5>
                    <button type="button" className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={(e) => { e.preventDefault(); setCategories([...categories, { name: 'New Category', registeredCount: 2 }]); }}>
                        <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: "relative", left: "10px" }}>
                            <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: "#1F41BB", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px" }}>
                                <span className="mb-1">+</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: "0 16px", height: "36px", fontSize: "14px", fontFamily: "Nunito, sans-serif", color: "#1F41BB", border: "1px solid #1F41BB" }}>
                            Category
                        </div>
                    </button>
                </div>

                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                    <div className="d-flex align-items-center" style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <div style={{ flex: 1, padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>Game Category</div>
                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Level A</div>
                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Level B</div>
                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Mixed</div>
                        <div style={{ width: '180px', padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>Female</div>
                    </div>

                    <div className="d-flex align-items-center">
                        <div style={{ flex: 1, padding: '12px 16px', fontSize: '14px' }}>Max Participants per club</div>
                        <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                            <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(0, categories[0].registeredCount - 1)}><AiOutlineMinus size={14} /></Button>
                                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{categories[0].registeredCount}</span>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(0, categories[0].registeredCount + 1)}><AiOutlinePlus size={14} /></Button>
                            </div>
                        </div>
                        <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                            <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(1, categories[1].registeredCount - 1)}><AiOutlineMinus size={14} /></Button>
                                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{categories[1].registeredCount}</span>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(1, categories[1].registeredCount + 1)}><AiOutlinePlus size={14} /></Button>
                            </div>
                        </div>
                        <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                            <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(2, categories[2].registeredCount - 1)}><AiOutlineMinus size={14} /></Button>
                                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{categories[2].registeredCount}</span>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(2, categories[2].registeredCount + 1)}><AiOutlinePlus size={14} /></Button>
                            </div>
                        </div>
                        <div style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                            <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(3, categories[3].registeredCount - 1)}><AiOutlineMinus size={14} /></Button>
                                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{categories[3].registeredCount}</span>
                                <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(3, categories[3].registeredCount + 1)}><AiOutlinePlus size={14} /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-end gap-3 mt-4">
                <button className='border-0 rounded-pill' style={{ backgroundColor: '#E5E7EB', color: '#374151', padding: '12px 32px', fontSize: '16px', fontWeight: '600' }} onClick={onBack}>Back</button>
                <button className='border-0 rounded-pill text-white' disabled={loading} style={{ backgroundColor: '#3DBE64', padding: '12px 32px', fontSize: '16px', fontWeight: '600' }} onClick={handleSubmit}>{loading ? 'Updating...' : 'Next'}</button>
            </div>
        </>
    );
};

export default StructureCategories;
