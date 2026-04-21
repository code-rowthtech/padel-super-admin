import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FiUpload, FiEye, FiEyeOff } from 'react-icons/fi';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createTournament, updateTournament } from '../../../redux/admin/tournament/thunk';

const inputStyle = (err) => ({
  backgroundColor: '',
  border: err ? '1px solid #dc3545' : '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '14px',
});
const labelStyle = { fontSize: '14px', fontWeight: '500', color: '#374151' };

const LogoUpload = ({ inputId, label, value, onChange }) => (
  <div style={{ position: 'relative' }}>
    <input
      type="file"
      id={inputId}
      accept="image/png,image/jpeg"
      style={{ display: 'none' }}
      onChange={e => onChange(e.target.files[0])}
    />
    <div
      onClick={() => document.getElementById(inputId).click()}
      style={{
        border: '2px dashed #D1D5DB',
        borderRadius: '10px',
        padding: '24px 16px',
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
        cursor: 'pointer',
        minHeight: '130px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'border-color 0.2s',
      }}
    >
      {value ? (
        <img
          src={value instanceof File ? URL.createObjectURL(value) : value}
          alt={label}
          style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px' }}
        />
      ) : (
        <FiUpload size={26} color="#9CA3AF" />
      )}
      <div style={{ fontSize: '12px', color: '#6B7280' }}>
        {value ? (
          <span style={{ color: '#1F41BB', fontWeight: '500' }}>{value.name || label}</span>
        ) : (
          <>
            <span style={{ color: '#1F41BB', fontWeight: '500' }}>Upload</span> or drag & drop
          </>
        )}
      </div>
      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>PNG, JPEG · max 10 MB</div>
    </div>
    {value && (
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
        <FiEye
          size={20}
          color="#1F41BB"
          style={{ cursor: 'pointer', background: '#e8edff', borderRadius: '50%', padding: '3px' }}
          onClick={e => {
            e.stopPropagation();
            window.open(value instanceof File ? URL.createObjectURL(value) : value, '_blank');
          }}
        />
        <RiDeleteBin6Fill
          size={20}
          color="#ef4444"
          style={{ cursor: 'pointer', background: '#fee2e2', borderRadius: '50%', padding: '3px' }}
          onClick={e => { e.stopPropagation(); onChange(null); }}
        />
      </div>
    )}
    <Form.Label style={{ ...labelStyle, fontSize: '12px', marginTop: '6px', marginBottom: 0, display: 'block', textAlign: 'center' }}>
      {label}
    </Form.Label>
  </div>
);

const TournamentBasicInfo = ({ onNext }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { states } = useSelector(state => state.league);
  const { loading, currentTournament } = useSelector(state => state.tournament);

  const [formData, setFormData] = useState({
    tournamentName: '',
    stateId: '',
    startDate: '',
    endDate: '',
    sportType: 'padel',
    seasonType: '',
    status: 'active',
    tournamentStatus: true,
  });
  const [leagueLogo, setLeagueLogo] = useState(null);
  const [webLogo, setWebLogo] = useState(null);
  const [ourLogo, setOurLogo] = useState(null);
  const [umpires, setUmpires] = useState([{ email: '', password: '' }]);
  const [showPasswords, setShowPasswords] = useState([false]);
  const [errors, setErrors] = useState({});
  const [umpireErrors, setUmpireErrors] = useState([{ email: '', password: '' }]);

  useEffect(() => {
    if (!id) {
      setFormData({ tournamentName: '', stateId: '', startDate: '', endDate: '', sportType: 'padel', seasonType: '', status: 'active', tournamentStatus: true });
      setLeagueLogo(null); setWebLogo(null); setOurLogo(null); setUmpires([{ email: '', password: '' }]); setShowPasswords([false]); setErrors({});
    }
  }, [id]);

  useEffect(() => {
    if (currentTournament && id) {
      setFormData({
        tournamentName: currentTournament.tournamentName || '',
        stateId: currentTournament.stateId?._id || currentTournament.stateId || '',
        startDate: currentTournament.startDate ? new Date(currentTournament.startDate).toISOString().split('T')[0] : '',
        endDate: currentTournament.endDate ? new Date(currentTournament.endDate).toISOString().split('T')[0] : '',
        sportType: currentTournament.sportType || 'padel',
        seasonType: currentTournament.seasonType || '',
        status: currentTournament.status || 'active',
        tournamentStatus: currentTournament.tournamentStatus !== undefined ? currentTournament.tournamentStatus : true,
      });
      if (currentTournament.leagueLogo) setLeagueLogo(currentTournament.leagueLogo);
      if (currentTournament.webLogo) setWebLogo(currentTournament.webLogo);
      if (currentTournament.ourLogo) setOurLogo(currentTournament.ourLogo);
      const umpireData = currentTournament.umpire || currentTournament.umpires;
      if (umpireData && umpireData.length > 0) {
        setUmpires(umpireData.map(u => ({ email: u.email || '', password: '' })));
        setShowPasswords(new Array(umpireData.length).fill(false));
      }
    }
  }, [currentTournament, id]);

  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const e = {};
    if (!formData.tournamentName.trim()) e.tournamentName = 'Tournament name is required';
    if (!formData.stateId) e.stateId = 'Location is required';
    if (!formData.startDate) e.startDate = 'Start date is required';
    
    const umpireErrs = umpires.map((u, idx) => {
      const errs = { email: '', password: '' };
      if (u.email) {
        if (!validateEmail(u.email)) errs.email = 'Invalid email format';
        if (!u.password && !(currentTournament?.umpire?.[idx] || currentTournament?.umpires?.[idx])) {
          errs.password = 'Password is required';
        }
      }
      return errs;
    });
    
    setErrors(e);
    setUmpireErrors(umpireErrs);
    return Object.keys(e).length === 0 && !umpireErrs.some(err => err.email || err.password);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const fd = new FormData();
    if (id) fd.append('id', id);
    fd.append('tournamentName', formData.tournamentName);
    fd.append('stateId', formData.stateId);
    fd.append('startDate', formData.startDate);
    if (formData.endDate) fd.append('endDate', formData.endDate);
    fd.append('sportType', formData.sportType);
    fd.append('status', formData.status);
    fd.append('tournamentStatus', formData.tournamentStatus);
    if (formData.seasonType) fd.append('seasonType', formData.seasonType);
    if (leagueLogo instanceof File) fd.append('leagueLogo', leagueLogo);
    if (webLogo instanceof File) fd.append('webLogo', webLogo);
    if (ourLogo instanceof File) fd.append('ourLogo', ourLogo);
    umpires.forEach((umpire, index) => {
      if (umpire.email) {
        fd.append(`umpires[${index}][email]`, umpire.email);
        if (umpire.password) fd.append(`umpires[${index}][password]`, umpire.password);
      }
    });

    if (id) {
      const result = await dispatch(updateTournament({ tournamentData: fd }));
      if (result.meta.requestStatus === 'fulfilled') onNext();
    } else {
      const result = await dispatch(createTournament(fd));
      if (result.meta.requestStatus === 'fulfilled') {
        const newId = result.payload?.data?._id || result.payload?._id;
        if (newId) navigate(`/admin/new-tournament/${newId}`, { state: { step: 1 }, replace: true });
        else onNext();
      }
    }
  };

  return (
    <div className="h-100 overflow-hidden">
      <style>{`
        .form-check-input:checked { background-color: #34C759 !important; border-color: #34C759 !important; box-shadow: none !important; }
        .form-check-input:focus { box-shadow: none !important; }
        .logo-upload-box:hover { border-color: #1F41BB !important; }
      `}</style>

      <div className="px-1" style={{ height: '90%', overflowX: 'hidden', overflowY: 'auto' }}>

        {/* ── Section 1: Core Details ── */}
        <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <p className="fw-semibold mb-3" style={{ fontSize: '13px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tournament Details
          </p>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label style={labelStyle}>Tournament Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter tournament name"
                  value={formData.tournamentName}
                  onChange={e => set('tournamentName', e.target.value)}
                  style={inputStyle(errors.tournamentName)}
                />
                {errors.tournamentName && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{errors.tournamentName}</div>}
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Location <span className="text-danger">*</span></Form.Label>
                <Form.Select value={formData.stateId} onChange={e => set('stateId', e.target.value)} style={inputStyle(errors.stateId)}>
                  <option value="">Select State</option>
                  {Array.isArray(states) && states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </Form.Select>
                {errors.stateId && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{errors.stateId}</div>}
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Season Type</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Summer, Winter"
                  value={formData.seasonType}
                  onChange={e => set('seasonType', e.target.value)}
                  style={inputStyle(false)}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  value={formData.startDate}
                  onChange={e => set('startDate', e.target.value)}
                  style={inputStyle(errors.startDate)}
                />
                {errors.startDate && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{errors.startDate}</div>}
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={e => set('endDate', e.target.value)}
                  style={inputStyle(false)}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Sport Type</Form.Label>
                <Form.Select value={formData.sportType} onChange={e => set('sportType', e.target.value)} style={inputStyle(false)}>
                  <option value="padel">Padel</option>
                  <option value="pickle">Pickle</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={labelStyle}>Status</Form.Label>
                <Form.Select value={formData.status} onChange={e => set('status', e.target.value)} style={inputStyle(false)}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <div
                className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                style={{ backgroundColor: '#F3F4F6', border: 'none', maxWidth: '320px' }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Tournament Active</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Toggle to enable or disable this tournament</div>
                </div>
                <Form.Check
                  type="switch"
                  id="tournament-status-switch"
                  checked={formData.tournamentStatus}
                  onChange={e => set('tournamentStatus', e.target.checked)}
                  style={{ transform: 'scale(1.3)', marginLeft: '16px' }}
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* ── Section 2: Umpires ── */}
        <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0 fw-semibold" style={{ fontSize: '15px', color: '#1a1a1a' }}>Umpire Details</h6>
            {umpires.length < 4 && (
              <button
                type="button"
                className="d-flex align-items-center position-relative p-0 border-0"
                style={{ borderRadius: '20px 10px 10px 20px', background: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => {
                  setUmpires([...umpires, { email: '', password: '' }]);
                  setShowPasswords([...showPasswords, false]);
                  setUmpireErrors([...umpireErrors, { email: '', password: '' }]);
                }}
              >
                <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: 'relative', left: '10px' }}>
                  <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: '#1F41BB', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px' }}>
                    <span className="mb-1">+</span>
                  </div>
                </div>
                <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: '0 14px', height: '32px', fontSize: '13px', color: '#1F41BB', border: '1px solid #1F41BB' }}>
                  Add Umpire
                </div>
              </button>
            )}
          </div>
          {umpires.map((umpire, index) => (
            <div key={index} className="mb-3 p-3 rounded-2" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Umpire {index + 1}</span>
                {umpires.length > 1 && (
                  <RiDeleteBin6Fill
                    size={18}
                    color="#ef4444"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setUmpires(umpires.filter((_, i) => i !== index));
                      setShowPasswords(showPasswords.filter((_, i) => i !== index));
                      setUmpireErrors(umpireErrors.filter((_, i) => i !== index));
                    }}
                  />
                )}
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter umpire email"
                      value={umpire.email}
                      onChange={e => {
                        const updated = [...umpires];
                        updated[index].email = e.target.value;
                        setUmpires(updated);
                        if (umpireErrors[index]?.email) {
                          const updatedErrors = [...umpireErrors];
                          updatedErrors[index] = { ...updatedErrors[index], email: '' };
                          setUmpireErrors(updatedErrors);
                        }
                      }}
                      style={inputStyle(umpireErrors[index]?.email)}
                    />
                    {umpireErrors[index]?.email && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{umpireErrors[index].email}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>Password</Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        type={showPasswords[index] ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={umpire.password}
                        onChange={e => {
                          const updated = [...umpires];
                          updated[index].password = e.target.value;
                          setUmpires(updated);
                          if (umpireErrors[index]?.password) {
                            const updatedErrors = [...umpireErrors];
                            updatedErrors[index] = { ...updatedErrors[index], password: '' };
                            setUmpireErrors(updatedErrors);
                          }
                        }}
                        disabled={(currentTournament?.umpire?.[index] || currentTournament?.umpires?.[index])}
                        style={{ ...inputStyle(umpireErrors[index]?.password), paddingRight: '40px' }}
                      />
                      {!(currentTournament?.umpire?.[index] || currentTournament?.umpires?.[index]) && (
                        <div
                          onClick={() => {
                            const updated = [...showPasswords];
                            updated[index] = !updated[index];
                            setShowPasswords(updated);
                          }}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#6B7280'
                          }}
                        >
                          {showPasswords[index] ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </div>
                      )}
                    </div>
                    {umpireErrors[index]?.password && <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{umpireErrors[index].password}</div>}
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
        </div>

        {/* ── Section 3: Logos ── */}
        <div className="p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <p className="fw-semibold mb-3" style={{ fontSize: '13px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tournament Logos
          </p>
          <Row className="g-3">
            <Col md={4} sm={6}>
              <LogoUpload inputId="leagueLogo" label="League Logo" value={leagueLogo} onChange={setLeagueLogo} />
            </Col>
            <Col md={4} sm={6}>
              <LogoUpload inputId="webLogo" label="Web Logo" value={webLogo} onChange={setWebLogo} />
            </Col>
            <Col md={4} sm={6}>
              <LogoUpload inputId="ourLogo" label="Our Logo" value={ourLogo} onChange={setOurLogo} />
            </Col>
          </Row>
        </div>

      </div>

      <div style={{ height: '10%' }} className="text-end overflow-hidden mt-3">
        <button
          className="border-0 rounded-pill text-white py-2"
          disabled={loading}
          onClick={handleSubmit}
          style={{ backgroundColor: '#3DBE64', width: '10rem', fontSize: '16px', fontWeight: '600' }}
        >
          {loading ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update' : 'Next')}
        </button>
      </div>
    </div>
  );
};

export default TournamentBasicInfo;
