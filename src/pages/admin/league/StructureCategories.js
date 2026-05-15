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
    const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '' });
    const [registrationFee, setRegistrationFee] = useState('');
    const [isFeeEnabled, setIsFeeEnabled] = useState(false);
    const [categories, setCategories] = useState([
        { name: 'Advanced', registeredCount: 2, isDefault: true },
        { name: 'Intermediate', registeredCount: 2, isDefault: true },
        { name: 'Women’s', registeredCount: 2, isDefault: true },
        { name: 'Mixed Doubles', registeredCount: 2, isDefault: true },
        { name: 'Hybrid', registeredCount: 2, isDefault: true }
    ]);

    // Reset form when switching between create/update modes
    useEffect(() => {
        if (!id) {
            // Reset to initial state for create mode
            setRegistrationDates({ startDate: '', endDate: '' });
            setDateErrors({ startDate: '', endDate: '' });
            setRegistrationFee('');
            setIsFeeEnabled(false);
            setCategories([
                { name: 'Advanced', registeredCount: 2, isDefault: true },
                { name: 'Intermediate', registeredCount: 2, isDefault: true },
                { name: 'Women’s', registeredCount: 2, isDefault: true },
                { name: 'Mixed Doubles', registeredCount: 2, isDefault: true },
                { name: 'Hybrid', registeredCount: 2, isDefault: true }
            ]);
        }
    }, [id]);

    useEffect(() => {
        if (currentLeague && Object.keys(currentLeague).length > 0 && id) {
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
                setCategories(limits.map((limit, idx) => ({
                    name: limit.categoryType,
                    registeredCount: limit.maxParticipants,
                    isDefault: idx < 5
                })));
            }
        } else if (!id) {
            // Ensure clean state for create mode
            setRegistrationDates({ startDate: '', endDate: '' });
            setDateErrors({ startDate: '', endDate: '' });
            setRegistrationFee('');
            setIsFeeEnabled(false);
            setCategories([
                { name: 'Advanced', registeredCount: 2, isDefault: true },
                { name: 'Intermediate', registeredCount: 2, isDefault: true },
                { name: 'Women’s', registeredCount: 2, isDefault: true },
                { name: 'Mixed Doubles', registeredCount: 2, isDefault: true },
                { name: 'Hybrid', registeredCount: 2, isDefault: true }
            ]);
        }
    }, [currentLeague, id]);

    const today = new Date().toISOString().split('T')[0];

    const updateCategoryValue = (index, value) => {
        const updated = [...categories];
        let newValue = Math.max(2, value);
        if (newValue % 2 !== 0) {
            newValue = value > updated[index].registeredCount ? newValue + 1 : newValue - 1;
        }
        updated[index].registeredCount = Math.max(2, newValue);
        setCategories(updated);
    };

    const updateCategoryName = (index, name) => {
        const updated = [...categories];
        updated[index].name = name;
        setCategories(updated);
    };

    const deleteCategory = (index) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const leagueIdToUpdate = id || leagueId;
        if (!leagueIdToUpdate) return;

        // Validate required fields
        const errors = { startDate: '', endDate: '' };
        if (!registrationDates.startDate) {
            errors.startDate = 'Start date is required';
        }
        if (!registrationDates.endDate) {
            errors.endDate = 'End date is required';
        }

        setDateErrors(errors);
        if (errors.startDate || errors.endDate) {
            return;
        }

        const updatePayload = { id: leagueIdToUpdate };

        if (registrationDates.startDate && registrationDates.endDate) {
            updatePayload['registration[startDate]'] = registrationDates.startDate;
            updatePayload['registration[endDate]'] = registrationDates.endDate;
            updatePayload['registration[isEnabled]'] = isFeeEnabled;
            if (isFeeEnabled && registrationFee) {
                updatePayload['registration[fee]'] = Number(registrationFee);
            }
        }

        // Participation limits for all clubs
        const clubs = currentLeague?.clubs || [];
        clubs.forEach((club, index) => {
            const clubId = club.clubId?._id || club.clubId;
            if (clubId) {
                updatePayload[`clubs[${index}][clubId]`] = clubId;
                if (club.ownerId) updatePayload[`clubs[${index}][ownerId]`] = club.ownerId;
                categories.forEach((cat, catIndex) => {
                    updatePayload[`clubs[${index}][participationLimit][categoryLimits][${catIndex}][categoryType]`] = cat.name;
                    updatePayload[`clubs[${index}][participationLimit][categoryLimits][${catIndex}][maxParticipants]`] = cat.registeredCount;
                });
            }
        });

        const result = await dispatch(updateLeague({ leagueData: updatePayload }));
        if (result.meta.requestStatus === 'fulfilled') onNext();
    };

    return (
        <div className='h-100 overflow-hidden'>
            <div className='p-2 rounded' style={{ backgroundColor: "#F1F5F94D", height: '90%', overflowX: 'hidden', }}>
                <div className="d-flex align-items-center mb-4">
                    <BsInfoCircle size={20} className="me-2" />
                    <h5 className="mb-0 fw-semibold">Players Registration / Fee</h5>
                </div>

                <Row className="mb-4">
                    <Col md={4} className="mb-3">
                        <Form.Group>
                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="date"
                                min={today}
                                value={registrationDates.startDate}
                                onChange={(e) => {
                                    setRegistrationDates({ ...registrationDates, startDate: e.target.value });
                                    if (dateErrors.startDate) setDateErrors({ ...dateErrors, startDate: '' });
                                }}
                                style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                                isInvalid={!!dateErrors.startDate}
                            />
                            {dateErrors.startDate && <Form.Control.Feedback type="invalid">{dateErrors.startDate}</Form.Control.Feedback>}
                        </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Form.Group>
                            <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>End Date <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="date"
                                min={registrationDates.startDate || today}
                                value={registrationDates.endDate}
                                onChange={(e) => {
                                    setRegistrationDates({ ...registrationDates, endDate: e.target.value });
                                    if (dateErrors.endDate) setDateErrors({ ...dateErrors, endDate: '' });
                                }}
                                style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }}
                                isInvalid={!!dateErrors.endDate}
                            />
                            {dateErrors.endDate && <Form.Control.Feedback type="invalid">{dateErrors.endDate}</Form.Control.Feedback>}
                        </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Form.Group>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <Form.Label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: 0 }}>Registration fee {isFeeEnabled && <span className="text-danger">*</span>}</Form.Label>
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
                            <Form.Control type="number" placeholder="₹ 0" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} disabled={!isFeeEnabled} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px' }} />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0 fw-semibold">Participation Limit</h5>
                    <button type="button" className="d-flex align-items-center position-relative p-0 border-0" style={{ borderRadius: "20px 10px 10px 20px", background: "none", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", flexShrink: 0 }} onClick={(e) => { e.preventDefault(); setCategories([...categories, { name: 'New Category', registeredCount: 2, isDefault: false }]); }}>
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

                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'auto' }}>
                    <div className="d-flex align-items-center" style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', minWidth: 'fit-content' }}>
                        <div style={{ minWidth: '200px', padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>Game Category</div>
                        {categories.map((cat, index) => (
                            <div key={index} style={{ width: '180px', padding: '8px 16px', borderLeft: '1px solid #E5E7EB', textAlign: 'center', position: 'relative' }}>
                                <Form.Control
                                    type="text"
                                    value={cat.name}
                                    onChange={(e) => updateCategoryName(index, e.target.value)}
                                    disabled={cat.isDefault}
                                    style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center', border: 'none', backgroundColor: 'transparent', padding: '4px', cursor: cat.isDefault ? 'not-allowed' : 'text' }}
                                />
                                {!cat.isDefault && (
                                    <button
                                        onClick={() => deleteCategory(index)}
                                        style={{ position: 'absolute', top: '8px', right: '8px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >×</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="d-flex align-items-center" style={{ minWidth: 'fit-content' }}>
                        <div style={{ minWidth: '200px', padding: '12px 16px', fontSize: '14px' }}>Max Participants per club</div>
                        {categories.map((cat, index) => (
                            <div key={index} style={{ width: '180px', padding: '12px 16px', textAlign: 'center', borderLeft: '1px solid #E5E7EB' }}>
                                <div className="d-flex align-items-center justify-content-center shadow-sm gap-2 ps-0 pe-0 p-2 rounded-3" style={{ backgroundColor: "#F1F5F94D" }}>
                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, cat.registeredCount - 1)}><AiOutlineMinus size={14} /></Button>
                                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>{cat.registeredCount}</span>
                                    <Button size="sm" variant="light" style={{ width: '30px', height: '30px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => updateCategoryValue(index, cat.registeredCount + 1)}><AiOutlinePlus size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ height: '10%' }} className="text-end overflow-hidden mt-4">
                <button className='border-0 me-3 rounded-pill px-5 py-2' style={{ backgroundColor: '#E5E7EB', color: '#374151', fontSize: '16px', fontWeight: '600' }} onClick={onBack}>Back</button>
                <button className='border-0 rounded-pill py-2 text-white' disabled={loading} style={{ backgroundColor: '#3DBE64', width: '10rem', fontSize: '16px', fontWeight: '600' }} onClick={handleSubmit}>{loading ? 'Updating...' : 'Next'}</button>
            </div>
        </div>
    );
};

export default StructureCategories;
