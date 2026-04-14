import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { IoTrophyOutline } from 'react-icons/io5';
import { FiSettings, FiChevronRight } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateTournament } from '../../../redux/admin/tournament/thunk';

const DEFAULT_SETTINGS = {
  numberOfSets: 3, numberOfGames: 1, advantagesWithGoldenPoint: true,
  gamesToStartTiebreak: 1, goldenPoint: true, pointsInTiebreak: 1,
  tiebreakOnFinalSet: true, goldenPointInTiebreak: false, matchWinPoints: 1,
};

const TournamentRules = ({ onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, currentTournament, tournamentId } = useSelector(state => state.tournament);

  const [matchRules, setMatchRules] = useState({
    regularRound: { status: true, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
    quarterfinal: { status: false, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
    semifinal: { status: false, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
    final: { status: true, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
  });
  const [useRegularSettings, setUseRegularSettings] = useState({ quarterfinal: true, semifinal: true, final: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) {
      setMatchRules({
        regularRound: { status: true, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
        quarterfinal: { status: false, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
        semifinal: { status: false, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
        final: { status: true, setsFormat: '', settings: { ...DEFAULT_SETTINGS } },
      });
      setUseRegularSettings({ quarterfinal: true, semifinal: true, final: true });
      setErrors({});
    }
  }, [id]);

  useEffect(() => {
    if (currentTournament && id && currentTournament.matchRules) {
      const rules = currentTournament.matchRules;
      const merge = (rd) => ({ ...rd, settings: { ...DEFAULT_SETTINGS, ...(rd?.settings || {}) } });
      const regularRound = merge(rules.regularRound || { status: true, setsFormat: '' });
      setMatchRules({
        regularRound,
        quarterfinal: rules.quarterfinal ? merge(rules.quarterfinal) : { status: false, setsFormat: '', settings: { ...regularRound.settings } },
        semifinal: rules.semifinal ? merge(rules.semifinal) : { status: false, setsFormat: '', settings: { ...regularRound.settings } },
        final: rules.final ? merge(rules.final) : { status: false, setsFormat: '', settings: { ...regularRound.settings } },
      });
      setUseRegularSettings({
        quarterfinal: !rules.quarterfinal || JSON.stringify(rules.quarterfinal.settings) === JSON.stringify(rules.regularRound?.settings),
        semifinal: !rules.semifinal || JSON.stringify(rules.semifinal.settings) === JSON.stringify(rules.regularRound?.settings),
        final: !rules.final || JSON.stringify(rules.final.settings) === JSON.stringify(rules.regularRound?.settings),
      });
    }
  }, [currentTournament, id]);

  const handleCounter = (field, inc, round = 'regularRound') => {
    setMatchRules(prev => ({
      ...prev,
      [round]: {
        ...prev[round],
        settings: {
          ...prev[round].settings,
          [field]: inc ? (prev[round].settings[field] || 1) + 1 : Math.max(1, (prev[round].settings[field] || 1) - 1),
        },
      },
    }));
    if (errors[`${round}_${field}`]) setErrors(prev => { const e = { ...prev }; delete e[`${round}_${field}`]; return e; });
  };

  const handleSwitch = (field, value, round = 'regularRound') => {
    setMatchRules(prev => ({ ...prev, [round]: { ...prev[round], settings: { ...prev[round].settings, [field]: value } } }));
  };

  const toggleRoundSettings = (round) => {
    setUseRegularSettings(prev => ({ ...prev, [round]: !prev[round] }));
    if (useRegularSettings[round]) {
      setMatchRules(prev => ({ ...prev, [round]: { status: true, setsFormat: '', settings: { ...prev.regularRound.settings } } }));
    }
  };

  const handleSubmit = async () => {
    const idToUpdate = id || tournamentId;
    if (!idToUpdate) return;

    const newErrors = {};
    const validateRound = (round, settings, prefix) => {
      if (isNaN(parseInt(settings?.numberOfSets)) || parseInt(settings?.numberOfSets) < 3) newErrors[`${prefix}numberOfSets`] = true;
      if (isNaN(parseInt(settings?.numberOfGames)) || parseInt(settings?.numberOfGames) < 1) newErrors[`${prefix}numberOfGames`] = true;
    };
    validateRound('regularRound', matchRules.regularRound.settings, 'regularRound_');
    if (matchRules.quarterfinal.status && !useRegularSettings.quarterfinal) validateRound('quarterfinal', matchRules.quarterfinal.settings, 'quarterfinal_');
    if (matchRules.semifinal.status && !useRegularSettings.semifinal) validateRound('semifinal', matchRules.semifinal.settings, 'semifinal_');
    if (matchRules.final.status && !useRegularSettings.final) validateRound('final', matchRules.final.settings, 'final_');

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    const payload = { id: idToUpdate };
    const addRule = (round, data) => {
      payload[`matchRules[${round}][status]`] = data.status;
      payload[`matchRules[${round}][setsFormat]`] = data.setsFormat || '';
      if (data.settings) Object.entries(data.settings).forEach(([k, v]) => { payload[`matchRules[${round}][settings][${k}]`] = v; });
    };

    addRule('regularRound', matchRules.regularRound);
    addRule('quarterfinal', matchRules.quarterfinal.status ? (useRegularSettings.quarterfinal ? matchRules.regularRound : matchRules.quarterfinal) : { ...matchRules.quarterfinal, status: false });
    addRule('semifinal', matchRules.semifinal.status ? (useRegularSettings.semifinal ? matchRules.regularRound : matchRules.semifinal) : { ...matchRules.semifinal, status: false });
    addRule('final', matchRules.final.status ? (useRegularSettings.final ? matchRules.regularRound : matchRules.final) : { ...matchRules.final, status: false });

    const result = await dispatch(updateTournament({ tournamentData: payload }));
    if (result.meta.requestStatus === 'fulfilled') navigate('/admin/tournament/creation');
  };

  const Counter = ({ label, field, round, required }) => (
    <div className="d-flex justify-content-between rounded align-items-center p-2" style={{ backgroundColor: '#E7EAF070', minHeight: '48px', border: errors[`${round}_${field}`] ? '1px solid #dc3545' : 'none' }}>
      <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: 0 }}>{label} {required && <span className="text-danger">*</span>}</Form.Label>
      <div className="d-flex align-items-center gap-2">
        <Button variant="light" size="sm" onClick={() => handleCounter(field, false, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>-</Button>
        <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '20px', textAlign: 'center' }}>{matchRules[round]?.settings?.[field] ?? DEFAULT_SETTINGS[field]}</span>
        <Button variant="light" size="sm" onClick={() => handleCounter(field, true, round)} style={{ borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#666', padding: '4px 12px' }}>+</Button>
      </div>
    </div>
  );

  const SwitchRow = ({ label, field, round }) => (
    <div className="d-flex justify-content-between rounded align-items-center p-2" style={{ backgroundColor: '#E7EAF070', minHeight: '48px' }}>
      <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: 0 }}>{label}</Form.Label>
      <Form.Check type="switch" id={`${field}-${round}`} checked={matchRules[round]?.settings?.[field] || false} onChange={e => handleSwitch(field, e.target.checked, round)} />
    </div>
  );

  const RoundSettings = ({ round }) => (
    <>
      <style>{`.form-check-input:checked { background-color: #34C759 !important; border-color: #34C759 !important; box-shadow: none !important; } .form-check-input:focus { box-shadow: none !important; }`}</style>
      <Row className="mb-3">
        <Col md={4} className="mb-3"><Counter label="Number Of Sets" field="numberOfSets" round={round} required />{errors[`${round}_numberOfSets`] && <small className="text-danger">Must be at least 3</small>}</Col>
        <Col md={4} className="mb-3"><Counter label="Games to Start Tiebreak" field="gamesToStartTiebreak" round={round} /></Col>
        <Col md={4} className="mb-3"><Counter label="Points in Tiebreak" field="pointsInTiebreak" round={round} /></Col>
      </Row>
      <Row className="mb-3">
        <Col md={4} className="mb-3"><Counter label="Number of Games" field="numberOfGames" round={round} required />{errors[`${round}_numberOfGames`] && <small className="text-danger">Must be at least 1</small>}</Col>
        <Col md={4} className="mb-3"><SwitchRow label="Golden Point" field="goldenPoint" round={round} /></Col>
        <Col md={4} className="mb-3"><SwitchRow label="Tiebreak on Final Set" field="tiebreakOnFinalSet" round={round} /></Col>
      </Row>
      <Row className="mb-3">
        <Col md={4} className="mb-3"><SwitchRow label="Advantages with Golden Point" field="advantagesWithGoldenPoint" round={round} /></Col>
        <Col md={4} className="mb-3"><SwitchRow label="Golden Point in Tiebreak" field="goldenPointInTiebreak" round={round} /></Col>
        <Col md={4} className="mb-3"><Counter label="Match Win Points" field="matchWinPoints" round={round} /></Col>
      </Row>
    </>
  );

  const RoundToggle = ({ round, label }) => (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: 0 }}>{label}</Form.Label>
        <Form.Check type="switch" id={`${round}-status`} checked={matchRules[round].status}
          onChange={e => setMatchRules(prev => ({ ...prev, [round]: { ...prev[round], status: e.target.checked } }))} />
      </div>
      {matchRules[round].status && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px 16px', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleRoundSettings(round)}>
            <span style={{ fontSize: '14px', color: '#666' }}>{useRegularSettings[round] ? 'Same as regular rounds' : 'Custom settings'}</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FiSettings size={20} style={{ color: '#666' }} />
              <FiChevronRight size={20} style={{ color: '#666' }} />
            </div>
          </div>
          {!useRegularSettings[round] && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <RoundSettings round={round} />
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="h-100 overflow-hidden">
      <div style={{ height: '90%', overflowX: 'hidden', overflowY: 'scroll' }}>
        <div style={{ marginBottom: '24px', backgroundColor: '#F1F5F94D', padding: '16px', borderRadius: '12px' }}>
          <h6 className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
            <IoTrophyOutline size={20} /> Match Rules
          </h6>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Regular Round Settings</Form.Label>
          </Form.Group>
          <RoundSettings round="regularRound" />
          <RoundToggle round="quarterfinal" label="Quarterfinal Sets" />
          <RoundToggle round="semifinal" label="Semifinal Sets" />
          <RoundToggle round="final" label="Final Sets" />
        </div>
      </div>

      <div style={{ height: '10%' }} className="text-end overflow-hidden mt-4">
        <button onClick={onBack} className="border-0 rounded-pill me-3 px-5 py-2" style={{ backgroundColor: '#E5E7EB', color: '#374151', fontSize: '16px', fontWeight: '600' }}>Back</button>
        <button onClick={handleSubmit} disabled={loading} className="border-0 rounded-pill py-2 text-white" style={{ backgroundColor: '#3DBE64', width: '10rem', fontSize: '16px', fontWeight: '600' }}>
          {loading ? 'Saving...' : 'Save Tournament'}
        </button>
      </div>
    </div>
  );
};

export default TournamentRules;
