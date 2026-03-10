import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { IoTrophyOutline } from 'react-icons/io5';
import { FiSettings, FiChevronRight } from 'react-icons/fi';
import { RiMoneyRupeeCircleFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateLeague } from '../../../redux/admin/league/thunk';

const RuleSettings = ({ onBack }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { loading, leagueId, currentLeague } = useSelector(state => state.league);
    const [matchRules, setMatchRules] = useState({
        regularRound: {
            status: true,
            setsFormat: '',
            settings: {
                numberOfSets: 3,
                numberOfGames: 3,
                advantagesWithGoldenPoint: true,
                gamesToStartTiebreak: 3,
                goldenPoint: true,
                pointsInTiebreak: 3,
                tiebreakOnFinalSet: true,
                goldenPointInTiebreak: false,
                matchWinPoints: 2
            }
        },
        quarterfinal: {
            status: false, setsFormat: '', settings: {
                numberOfSets: 3,
                numberOfGames: 3,
                advantagesWithGoldenPoint: true,
                gamesToStartTiebreak: 3,
                goldenPoint: true,
                pointsInTiebreak: 3,
                tiebreakOnFinalSet: true,
                goldenPointInTiebreak: false,
                matchWinPoints: 2
            }
        },
        semifinal: {
            status: false, setsFormat: '', settings: {
                numberOfSets: 3,
                numberOfGames: 3,
                advantagesWithGoldenPoint: true,
                gamesToStartTiebreak: 3,
                goldenPoint: true,
                pointsInTiebreak: 3,
                tiebreakOnFinalSet: true,
                goldenPointInTiebreak: false,
                matchWinPoints: 2
            }
        },
        final: {
            status: false, setsFormat: '', settings: {
                numberOfSets: 3,
                numberOfGames: 3,
                advantagesWithGoldenPoint: true,
                gamesToStartTiebreak: 3,
                goldenPoint: true,
                pointsInTiebreak: 3,
                tiebreakOnFinalSet: true,
                goldenPointInTiebreak: false,
                matchWinPoints: 2
            }
        }
    });

    const [prizeDistribution, setPrizeDistribution] = useState([
        { position: '1st', amount: 0 },
        { position: '2nd', amount: 0 },
        { position: '3rd', amount: 0 }
    ]);

    const [bounty, setBounty] = useState(0);
    const [teamOfLeague, setTeamOfLeague] = useState(0);
    const [setsConfigEnabled, setSetsConfigEnabled] = useState(true);
    const [errors, setErrors] = useState({});
    const [useRegularSettings, setUseRegularSettings] = useState({
        quarterfinal: true,
        semifinal: true,
        final: true
    });

    useEffect(() => {
        if (currentLeague && Object.keys(currentLeague).length > 0) {
            if (currentLeague.matchRules?.regularRound) {
                const rules = currentLeague.matchRules;
                setMatchRules({
                    regularRound: rules.regularRound,
                    quarterfinal: rules.quarterfinal || { status: false, setsFormat: '', settings: { ...rules.regularRound.settings } },
                    semifinal: rules.semifinal || { status: false, setsFormat: '', settings: { ...rules.regularRound.settings } },
                    final: rules.final || { status: false, setsFormat: '', settings: { ...rules.regularRound.settings } }
                });

                // Check if rounds have custom settings
                setUseRegularSettings({
                    quarterfinal: !rules.quarterfinal || JSON.stringify(rules.quarterfinal.settings) === JSON.stringify(rules.regularRound.settings),
                    semifinal: !rules.semifinal || JSON.stringify(rules.semifinal.settings) === JSON.stringify(rules.regularRound.settings),
                    final: !rules.final || JSON.stringify(rules.final.settings) === JSON.stringify(rules.regularRound.settings)
                });

                setSetsConfigEnabled(rules.quarterfinal?.status || rules.semifinal?.status || rules.final?.status || false);
            }
            if (currentLeague.prizeDistribution?.length > 0) {
                setPrizeDistribution(currentLeague.prizeDistribution);
            }
            setBounty(currentLeague.bounty || 0);
            setTeamOfLeague(currentLeague.teamOfLeague || 0);
        }
    }, [currentLeague]);

    const toggleRoundSettings = (round) => {
        setUseRegularSettings(prev => ({ ...prev, [round]: !prev[round] }));
        if (useRegularSettings[round]) {
            setMatchRules(prev => ({
                ...prev,
                [round]: {
                    status: true,
                    setsFormat: '',
                    settings: { ...prev.regularRound.settings }
                }
            }));
        }
    };

    const handleCounterChange = (field, increment, round = 'regularRound') => {
        const minValues = {
            numberOfSets: 3,
            numberOfGames: 1,
            gamesToStartTiebreak: 1,
            pointsInTiebreak: 1,
            matchWinPoints: 1
        };
        const minValue = minValues[field] || 1;

        setMatchRules(prev => ({
            ...prev,
            [round]: {
                ...prev[round],
                settings: {
                    ...prev[round]?.settings || {},
                    [field]: increment ? (prev[round]?.settings?.[field] || minValue) + 1 : Math.max(minValue, (prev[round]?.settings?.[field] || minValue) - 1)
                }
            }
        }));
        
        // Clear error for this field when user changes it
        if (errors[`${round}_${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${round}_${field}`];
                return newErrors;
            });
        }
    };

    const handleSwitchChange = (field, value, round = 'regularRound') => {
        setMatchRules(prev => ({
            ...prev,
            [round]: {
                ...prev[round],
                settings: {
                    ...prev[round].settings,
                    [field]: value
                }
            }
        }));
    };

    const addPrize = () => {
        const nextPosition = prizeDistribution.length + 1;
        const suffix = nextPosition === 1 ? 'st' : nextPosition === 2 ? 'nd' : nextPosition === 3 ? 'rd' : 'th';
        setPrizeDistribution([...prizeDistribution, { position: `${nextPosition}${suffix}`, amount: 0 }]);
    };

    const handlePrizeChange = (index, value) => {
        const updated = [...prizeDistribution];
        updated[index].amount = Number(value) || 0;
        setPrizeDistribution(updated);
    };

    const handleSubmit = async () => {
        const leagueIdToUpdate = id || leagueId;
        if (!leagueIdToUpdate) return;

        // Validation
        const newErrors = {};
        
        const validateRound = (round, settings, prefix = '') => {
            if (!settings || typeof settings !== 'object') return;
            
            console.log(`Validating ${prefix}:`, settings);
            
            const numSets = parseInt(settings.numberOfSets, 10);
            const numGames = parseInt(settings.numberOfGames, 10);
            const gamesToTiebreak = parseInt(settings.gamesToStartTiebreak, 10);
            const pointsTiebreak = parseInt(settings.pointsInTiebreak, 10);
            const matchWinPts = parseInt(settings.matchWinPoints, 10);
            
            console.log(`Parsed values - Sets: ${numSets}, Games: ${numGames}, Tiebreak: ${gamesToTiebreak}, Points: ${pointsTiebreak}, Win: ${matchWinPts}`);
            
            if (!numSets || numSets < 3) {
                newErrors[`${prefix}numberOfSets`] = true;
            }
            if (!numGames || numGames < 1) {
                newErrors[`${prefix}numberOfGames`] = true;
            }
            if (!gamesToTiebreak || gamesToTiebreak < 1) {
                newErrors[`${prefix}gamesToStartTiebreak`] = true;
            }
            if (!pointsTiebreak || pointsTiebreak < 1) {
                newErrors[`${prefix}pointsInTiebreak`] = true;
            }
            if (!matchWinPts || matchWinPts < 1) {
                newErrors[`${prefix}matchWinPoints`] = true;
            }
        };

        // Validate regular round
        validateRound('regularRound', matchRules.regularRound?.settings, 'regularRound_');

        // Validate other rounds if enabled and using custom settings
        if (matchRules.quarterfinal.status && !useRegularSettings.quarterfinal) {
            validateRound('quarterfinal', matchRules.quarterfinal?.settings, 'quarterfinal_');
        }
        if (matchRules.semifinal.status && !useRegularSettings.semifinal) {
            validateRound('semifinal', matchRules.semifinal?.settings, 'semifinal_');
        }
        if (matchRules.final.status && !useRegularSettings.final) {
            validateRound('final', matchRules.final?.settings, 'final_');
        }

        console.log('Validation errors:', newErrors);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});

        const updatePayload = { id: leagueIdToUpdate };

        // Match Rules
        const addMatchRuleToPayload = (round, roundData) => {
            updatePayload[`matchRules[${round}][status]`] = roundData.status;
            updatePayload[`matchRules[${round}][setsFormat]`] = roundData.setsFormat || '';
            if (roundData.settings) {
                Object.entries(roundData.settings).forEach(([key, value]) => {
                    updatePayload[`matchRules[${round}][settings][${key}]`] = value;
                });
            }
        };

        addMatchRuleToPayload('regularRound', matchRules.regularRound);
        
        // Always include all rounds with their current status
        addMatchRuleToPayload('quarterfinal', matchRules.quarterfinal.status ? 
            (useRegularSettings.quarterfinal ? matchRules.regularRound : matchRules.quarterfinal) : 
            { ...matchRules.quarterfinal, status: false }
        );
        
        addMatchRuleToPayload('semifinal', matchRules.semifinal.status ? 
            (useRegularSettings.semifinal ? matchRules.regularRound : matchRules.semifinal) : 
            { ...matchRules.semifinal, status: false }
        );
        
        addMatchRuleToPayload('final', matchRules.final.status ? 
            (useRegularSettings.final ? matchRules.regularRound : matchRules.final) : 
            { ...matchRules.final, status: false }
        );

        // Prize Distribution
        prizeDistribution.filter(p => p.amount > 0).forEach((prize, index) => {
            updatePayload[`prizeDistribution[${index}][position]`] = prize.position;
            updatePayload[`prizeDistribution[${index}][amount]`] = prize.amount;
        });

        // Team Rewards
        updatePayload.bounty = bounty;
        updatePayload.teamOfLeague = teamOfLeague;

        console.log('Final Payload:', updatePayload);
        const result = await dispatch(updateLeague({ leagueData: updatePayload }));
        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/admin/league');
        }
    };

    const RoundSettings = ({ round, settings }) => (
        <>
            <Row className="mb-3">
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px', border: errors[`${round}_numberOfSets`] ? '1px solid #dc3545' : 'none' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Number Of Sets</Form.Label>
                        <div className='d-flex align-items-center gap-2'>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfSets', false, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings?.numberOfSets || 3}</span>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfSets', true, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                        </div>
                    </div>
                    {errors[`${round}_numberOfSets`] && <small className="text-danger">Must be at least 3</small>}
                </Col>
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px', border: errors[`${round}_gamesToStartTiebreak`] ? '1px solid #dc3545' : 'none' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Games to Start Tiebreak</Form.Label>
                        <div className='d-flex align-items-center gap-2'>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('gamesToStartTiebreak', false, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings?.gamesToStartTiebreak || 1}</span>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('gamesToStartTiebreak', true, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                        </div>
                    </div>
                    {errors[`${round}_gamesToStartTiebreak`] && <small className="text-danger">Must be at least 1</small>}
                </Col>
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px', border: errors[`${round}_pointsInTiebreak`] ? '1px solid #dc3545' : 'none' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Point in Tiebreak</Form.Label>
                        <div className='d-flex align-items-center gap-2'>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('pointsInTiebreak', false, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings?.pointsInTiebreak || 1}</span>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('pointsInTiebreak', true, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                        </div>
                    </div>
                    {errors[`${round}_pointsInTiebreak`] && <small className="text-danger">Must be at least 1</small>}
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px', border: errors[`${round}_numberOfGames`] ? '1px solid #dc3545' : 'none' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Number of Games</Form.Label>
                        <div className='d-flex align-items-center gap-2'>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfGames', false, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings?.numberOfGames || 1}</span>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('numberOfGames', true, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                        </div>
                    </div>
                    {errors[`${round}_numberOfGames`] && <small className="text-danger">Must be at least 1</small>}
                </Col>
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Golden Point</Form.Label>
                        <Form.Check type="switch" id={`golden-point-${round}`} checked={settings?.goldenPoint || false} onChange={(e) => handleSwitchChange('goldenPoint', e.target.checked, round)} />
                    </div>
                </Col>
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Tiebreak on Final Set</Form.Label>
                        <Form.Check type="switch" id={`tiebreak-final-${round}`} checked={settings?.tiebreakOnFinalSet || false} onChange={(e) => handleSwitchChange('tiebreakOnFinalSet', e.target.checked, round)} />
                    </div>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Advantages with golden Point</Form.Label>
                        <Form.Check type="switch" id={`advantages-golden-point-${round}`} checked={settings?.advantagesWithGoldenPoint || false} onChange={(e) => handleSwitchChange('advantagesWithGoldenPoint', e.target.checked, round)} />
                    </div>
                </Col>
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Golden Point in Tiebreak</Form.Label>
                        <Form.Check type="switch" id={`golden-point-tiebreak-${round}`} checked={settings?.goldenPointInTiebreak || false} onChange={(e) => handleSwitchChange('goldenPointInTiebreak', e.target.checked, round)} />
                    </div>
                </Col>
                <Col md={4} className="mb-3">
                    <div className='d-flex justify-content-between rounded align-items-center p-2' style={{ backgroundColor: '#E7EAF070', minHeight: '48px', border: errors[`${round}_matchWinPoints`] ? '1px solid #dc3545' : 'none' }}>
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Match Win Points</Form.Label>
                        <div className='d-flex align-items-center gap-2'>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('matchWinPoints', false, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
                            <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{settings?.matchWinPoints || 1}</span>
                            <Button variant="light" size="sm" onClick={() => handleCounterChange('matchWinPoints', true, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
                        </div>
                    </div>
                    {errors[`${round}_matchWinPoints`] && <small className="text-danger">Must be at least 1</small>}
                </Col>
            </Row>
        </>
    );

    return (
        <div className='h-100 overflow-hidden'>
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
            <div style={{ height: '90%', overflowX: 'hidden', overflowY: 'scroll' }}>

                <div style={{ marginBottom: '24px', backgroundColor: '#F1F5F94D', padding: '16px', borderRadius: '12px' }}>
                    <h6 className='d-flex align-items-center gap-2 mb-3' style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        <IoTrophyOutline size={20} /> Match Rules
                    </h6>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Regular Round Sets Settings</Form.Label>
                        {/* <div style={{ position: 'relative' }}>
                        <Form.Select style={{ borderRadius: '8px', padding: '10px 40px 10px 12px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                            <option>Select Sets Format</option>
                        </Form.Select>
                        <FiSettings size={18} style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} />
                    </div> */}
                    </Form.Group>

                    {/* <h6 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>Settings</h6> */}

                    <RoundSettings round="regularRound" settings={matchRules.regularRound.settings} />

                    <div className="mb-3">
                        <div className='d-flex align-items-center justify-content-between mb-2'>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Quarterfinal Sets</Form.Label>
                            <Form.Check
                                type="switch"
                                id="quarterfinal-status"
                                checked={matchRules.quarterfinal.status}
                                onChange={(e) => setMatchRules(prev => ({ ...prev, quarterfinal: { ...prev.quarterfinal, status: e.target.checked } }))}
                            />
                        </div>
                        {matchRules.quarterfinal.status && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleRoundSettings('quarterfinal')}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>{useRegularSettings.quarterfinal ? 'Same as regular rounds' : 'Custom settings'}</span>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <FiSettings size={20} style={{ color: '#666' }} />
                                        <FiChevronRight size={20} style={{ color: '#666' }} />
                                    </div>
                                </div>
                                {!useRegularSettings.quarterfinal && (
                                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <RoundSettings round="quarterfinal" settings={matchRules.quarterfinal.settings} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mb-3">
                        <div className='d-flex align-items-center justify-content-between mb-2'>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>SemiFinal Sets</Form.Label>
                            <Form.Check
                                type="switch"
                                id="semifinal-status"
                                checked={matchRules.semifinal.status}
                                onChange={(e) => setMatchRules(prev => ({ ...prev, semifinal: { ...prev.semifinal, status: e.target.checked } }))}
                            />
                        </div>
                        {matchRules.semifinal.status && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleRoundSettings('semifinal')}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>{useRegularSettings.semifinal ? 'Same as regular rounds' : 'Custom settings'}</span>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <FiSettings size={20} style={{ color: '#666' }} />
                                        <FiChevronRight size={20} style={{ color: '#666' }} />
                                    </div>
                                </div>
                                {!useRegularSettings.semifinal && (
                                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <RoundSettings round="semifinal" settings={matchRules.semifinal.settings} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mb-3">
                        <div className='d-flex align-items-center justify-content-between mb-2'>
                            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '0' }}>Final Sets</Form.Label>
                            <Form.Check
                                type="switch"
                                id="final-status"
                                checked={matchRules.final.status}
                                onChange={(e) => setMatchRules(prev => ({ ...prev, final: { ...prev.final, status: e.target.checked } }))}
                            />
                        </div>
                        {matchRules.final.status && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleRoundSettings('final')}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>{useRegularSettings.final ? 'Same as regular rounds' : 'Custom settings'}</span>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <FiSettings size={20} style={{ color: '#666' }} />
                                        <FiChevronRight size={20} style={{ color: '#666' }} />
                                    </div>
                                </div>
                                {!useRegularSettings.final && (
                                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <RoundSettings round="final" settings={matchRules.final.settings} />
                                    </div>
                                )}
                            </>
                        )}
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
                                    <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{prize.position} Prize</Form.Label>
                                    <Form.Control type="number" placeholder="Enter Amount" value={prize.amount || ''} onChange={(e) => handlePrizeChange(index, e.target.value)} style={{ borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }} />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                </div>

                <div style={{ marginBottom: '24px', backgroundColor: '#F1F5F94D', padding: '16px', borderRadius: '12px' }}>
                    <h6 className='d-flex align-items-center gap-2 mb-3' style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        <IoTrophyOutline size={20} /> Team Rewards
                    </h6>

                    <Row className="mb-3">
                        <Col md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Bounty</Form.Label>
                                <Form.Control type="number" placeholder="Enter Amount" value={bounty || ''} onChange={(e) => setBounty(Number(e.target.value) || 0)} style={{ borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }} />
                            </Form.Group>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Group>
                                <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Team of the League</Form.Label>
                                <Form.Control type="number" placeholder="Enter Amount" value={teamOfLeague || ''} onChange={(e) => setTeamOfLeague(Number(e.target.value) || 0)} style={{ borderRadius: '8px', padding: '10px', fontSize: '14px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', boxShadow: 'none' }} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            <div style={{ height: '10%' }} className="text-end overflow-hidden mt-4">
                <button onClick={onBack} className='border-0 rounded-pill me-3 px-5 py-2' style={{ backgroundColor: '#E5E7EB', color: '#374151', fontSize: '16px', fontWeight: '600' }}>Back</button>
                <button onClick={handleSubmit} disabled={loading} className='border-0 rounded-pill py-2  text-white' style={{ backgroundColor: '#3DBE64', width: '10rem', fontSize: '16px', fontWeight: '600' }}>{loading ? 'Updating...' : 'Save League'}</button>
            </div>
        </div>
    );
};

export default RuleSettings;
