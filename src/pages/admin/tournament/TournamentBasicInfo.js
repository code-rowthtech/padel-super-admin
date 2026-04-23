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
  const { states, sponsorCategories } = useSelector(state => state.league);
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
  const [sponsors, setSponsors] = useState([{ name: '', category: '', image: null, url: '' }]);
  const [titleSponsorBanner, setTitleSponsorBanner] = useState(null);
  const [umpires, setUmpires] = useState([{ email: '', password: '' }]);
  const [showPasswords, setShowPasswords] = useState([false]);
  const [errors, setErrors] = useState({});
  const [umpireErrors, setUmpireErrors] = useState([{ email: '', password: '' }]);

  useEffect(() => {
    if (!id) {
      setFormData({ tournamentName: '', stateId: '', startDate: '', endDate: '', sportType: 'padel', seasonType: '', status: 'active', tournamentStatus: true });
      setLeagueLogo(null); setWebLogo(null); setOurLogo(null); setSponsors([{ name: '', category: '', image: null, url: '' }]); setTitleSponsorBanner(null); setUmpires([{ email: '', password: '' }]); setShowPasswords([false]); setErrors({});
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
      if (currentTournament.titleSponsor?.titleSponsorBanner) setTitleSponsorBanner(currentTournament.titleSponsor.titleSponsorBanner);

      const allSponsors = [];
      if (currentTournament.titleSponsor?.name) {
        allSponsors.push({
          name: currentTournament.titleSponsor.name,
          category: currentTournament.titleSponsor.categoryId || '',
          image: currentTournament.titleSponsor.logo || null,
          url: currentTournament.titleSponsor.url || ''
        });
      }
      if (currentTournament.sponsors?.length > 0) {
        currentTournament.sponsors.forEach(sponsor => {
          allSponsors.push({
            name: sponsor.name,
            category: sponsor.categoryId || '',
            image: sponsor.logo || null,
            url: sponsor.url || ''
          });
        });
      }
      if (allSponsors.length > 0) setSponsors(allSponsors);

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

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
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
        } else if (u.password && !validatePassword(u.password)) {
          errs.password = 'Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character';
        }
      }
      return errs;
    });

    const tier1Sponsors = [];
    sponsors.forEach((sponsor, index) => {
      if (sponsor.name.trim()) {
        if (!sponsor.category) e[`sponsor_${index}_category`] = 'Category is required when sponsor name is entered';
        if (!sponsor.image) e[`sponsor_${index}_image`] = 'Logo is required when sponsor name is entered';

        if (sponsor.category) {
          const selectedCategory = sponsorCategories.find(cat => cat._id === sponsor.category);
          if (selectedCategory && selectedCategory.name === 'Tier 1') {
            tier1Sponsors.push(index);
          }
        }
      }
    });

    if (tier1Sponsors.length > 1) {
      tier1Sponsors.forEach(index => {
        e[`sponsor_${index}_tier1`] = 'Only one Tier 1 sponsor is allowed';
      });
    }

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

    if (sponsors[0]?.name) {
      fd.append('titleSponsor[name]', sponsors[0].name);
      if (sponsors[0].category) fd.append('titleSponsor[categoryId]', sponsors[0].category);
      if (sponsors[0].url) fd.append('titleSponsor[url]', sponsors[0].url);
      if (sponsors[0].image instanceof File) {
        fd.append('titleSponsorLogo', sponsors[0].image);
      } else if (sponsors[0].image && typeof sponsors[0].image === 'string') {
        fd.append('titleSponsor[logo]', sponsors[0].image);
      }
      if (titleSponsorBanner instanceof File) {
        fd.append('titleSponsorBanner', titleSponsorBanner);
      } else if (titleSponsorBanner && typeof titleSponsorBanner === 'string') {
        fd.append('titleSponsor[titleSponsorBanner]', titleSponsorBanner);
      }
    }

    sponsors.slice(1).filter(s => s.name).forEach((sponsor, index) => {
      fd.append(`sponsors[${index}][name]`, sponsor.name);
      if (sponsor.category) fd.append(`sponsors[${index}][categoryId]`, sponsor.category);
      if (sponsor.url) fd.append(`sponsors[${index}][url]`, sponsor.url);
      if (sponsor.image instanceof File) {
        fd.append(`sponsorLogo_${index}`, sponsor.image);
      } else if (sponsor.image && typeof sponsor.image === 'string') {
        fd.append(`sponsors[${index}][logo]`, sponsor.image);
      }
    });

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
                  onChange={e => {
                    const value = e.target.value;
                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                    set('tournamentName', capitalized);
                  }}
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
                  placeholder="Enter season type (e.g. Summer 2024)"
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

        {/* ── Section 2: Sponsors ── */}
        <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <h6 className="mb-0 fw-semibold" style={{ fontSize: '15px', color: '#1a1a1a' }}>Sponsors</h6>
              <span style={{ backgroundColor: '#E0E7FF', color: '#1F41BB', borderRadius: '12px', padding: '2px 12px', fontSize: '11px', fontWeight: '600', marginLeft: '12px' }}>Tier 1: Max 1 | Tier 2 & 3: Multiple</span>
            </div>
            <button
              type="button"
              className="d-flex align-items-center position-relative p-0 border-0"
              style={{ borderRadius: '20px 10px 10px 20px', background: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
              onClick={() => setSponsors([...sponsors, { name: '', category: '', image: null, url: '' }])}
            >
              <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: 'relative', left: '10px' }}>
                <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: '#1F41BB', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px' }}>
                  <span className="mb-1">+</span>
                </div>
              </div>
              <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: '0 14px', height: '32px', fontSize: '13px', color: '#1F41BB', border: '1px solid #1F41BB' }}>
                Add Sponsor
              </div>
            </button>
          </div>
          {sponsors.map((sponsor, index) => (
            <div key={index} className="mb-3 p-3 rounded-2" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label style={{ ...labelStyle, marginBottom: 0 }}>
                  {index === 0 ? 'Title Sponsor Name' : `Sponsor Name ${index}`}
                </Form.Label>
                {index > 0 && (
                  <RiDeleteBin6Fill
                    size={18}
                    color="#ef4444"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSponsors(sponsors.filter((_, i) => i !== index));
                      const newErrors = { ...errors };
                      delete newErrors[`sponsor_${index}_category`];
                      delete newErrors[`sponsor_${index}_image`];
                      delete newErrors[`sponsor_${index}_tier1`];
                      setErrors(newErrors);
                    }}
                  />
                )}
              </div>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={sponsor.name}
                      onChange={e => {
                        const updated = [...sponsors];
                        updated[index].name = e.target.value;
                        setSponsors(updated);
                        if (!e.target.value.trim()) {
                          const newErrors = { ...errors };
                          delete newErrors[`sponsor_${index}_category`];
                          delete newErrors[`sponsor_${index}_image`];
                          setErrors(newErrors);
                        }
                      }}
                      style={inputStyle(false)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Select
                      value={sponsor.category}
                      onChange={e => {
                        const updated = [...sponsors];
                        updated[index].category = e.target.value;
                        setSponsors(updated);
                        const newErrors = { ...errors };
                        delete newErrors[`sponsor_${index}_category`];
                        delete newErrors[`sponsor_${index}_tier1`];
                        setErrors(newErrors);
                      }}
                      style={inputStyle(errors[`sponsor_${index}_category`] || errors[`sponsor_${index}_tier1`])}
                    >
                      <option value="">Select Category</option>
                      {Array.isArray(sponsorCategories) && sponsorCategories.map(cat => {
                        if (index === 0 && cat?.name !== 'Tier 1') return null;
                        if (index > 0 && cat?.name === 'Tier 1') return null;
                        return <option key={cat?._id} value={cat?._id}>{cat?.name}</option>;
                      })}
                    </Form.Select>
                    {errors[`sponsor_${index}_category`] && (
                      <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                        {errors[`sponsor_${index}_category`]}
                      </div>
                    )}
                    {errors[`sponsor_${index}_tier1`] && (
                      <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                        {errors[`sponsor_${index}_tier1`]}
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="URL"
                      value={sponsor.url || ''}
                      onChange={e => {
                        const updated = [...sponsors];
                        updated[index].url = e.target.value;
                        setSponsors(updated);
                      }}
                      style={inputStyle(false)}
                    />
                  </Form.Group>
                </Col>
                <Col md={index === 0 ? 2 : 4}>
                  <Form.Group>
                    <input
                      type="file"
                      id={`sponsorFile_${index}`}
                      accept="image/png,image/jpeg"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const updated = [...sponsors];
                        updated[index].image = e.target.files[0];
                        setSponsors(updated);
                        if (errors[`sponsor_${index}_image`]) {
                          const newErrors = { ...errors };
                          delete newErrors[`sponsor_${index}_image`];
                          setErrors(newErrors);
                        }
                      }}
                    />
                    <div style={{ position: 'relative' }}>
                      <div
                        onClick={() => document.getElementById(`sponsorFile_${index}`).click()}
                        style={{
                          border: errors[`sponsor_${index}_image`] ? '2px dashed #dc3545' : '2px dashed #D1D5DB',
                          borderRadius: '8px',
                          padding: '8px',
                          textAlign: 'center',
                          backgroundColor: '#FAFAFA',
                          cursor: 'pointer',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#6B7280'
                        }}
                      >
                        {sponsor.image ? (
                          <span style={{ color: '#1F41BB', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sponsor.image.name || 'Logo'}
                          </span>
                        ) : (
                          <span>Sponsor Logo</span>
                        )}
                      </div>
                      {sponsor.image && (
                        <FiEye
                          size={20}
                          color="#1F41BB"
                          style={{ position: 'absolute', top: '-8px', right: '-8px', cursor: 'pointer', background: '#e8edff', borderRadius: '50%', padding: '4px' }}
                          onClick={e => {
                            e.stopPropagation();
                            window.open(sponsor.image instanceof File ? URL.createObjectURL(sponsor.image) : sponsor.image, '_blank');
                          }}
                        />
                      )}
                    </div>
                    {errors[`sponsor_${index}_image`] && (
                      <div className="text-danger mt-1" style={{ fontSize: '12px' }}>{errors[`sponsor_${index}_image`]}</div>
                    )}
                  </Form.Group>
                </Col>
                {index === 0 && (
                  <Col md={2}>
                    <Form.Group>
                      <input
                        type="file"
                        id="titleSponsorBanner"
                        accept="image/png,image/jpeg"
                        style={{ display: 'none' }}
                        onChange={e => setTitleSponsorBanner(e.target.files[0])}
                      />
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => document.getElementById('titleSponsorBanner').click()}
                          style={{
                            border: '2px dashed #D1D5DB',
                            borderRadius: '8px',
                            padding: '8px',
                            textAlign: 'center',
                            backgroundColor: '#FAFAFA',
                            cursor: 'pointer',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#6B7280'
                          }}
                        >
                          {titleSponsorBanner ? (
                            <span style={{ color: '#1F41BB', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {titleSponsorBanner.name || 'Banner'}
                            </span>
                          ) : (
                            <span>Sponsor Banner</span>
                          )}
                        </div>
                        {titleSponsorBanner && (
                          <FiEye
                            size={20}
                            color="#1F41BB"
                            style={{ position: 'absolute', top: '-8px', right: '-8px', cursor: 'pointer', background: '#e8edff', borderRadius: '50%', padding: '4px' }}
                            onClick={e => {
                              e.stopPropagation();
                              window.open(titleSponsorBanner instanceof File ? URL.createObjectURL(titleSponsorBanner) : titleSponsorBanner, '_blank');
                            }}
                          />
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </div>
          ))}
        </div>

        {/* ── Section 3: Umpires ── */}
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
                        updated[index].email = e.target.value.toLowerCase();
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

        {/* ── Section 4: Logos ── */}
        <div className="p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <p className="fw-semibold mb-3" style={{ fontSize: '13px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tournament Logos
          </p>
          <Row className="g-3">
            <Col md={4} sm={6}>
              <LogoUpload inputId="leagueLogo" label="Tournament Logo" value={leagueLogo} onChange={setLeagueLogo} />
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
