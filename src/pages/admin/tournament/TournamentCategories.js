import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { updateTournament } from '../../../redux/admin/tournament/thunk';

const TAG_OPTIONS = ["Men's Doubles", "Women's Doubles", 'Mixed Doubles'];

const DEFAULT_CATEGORY = [
  { categoryType: '', maxParticipants: 16, tag: "Men's Doubles" },
  { categoryType: '', maxParticipants: 16, tag: "Women's Doubles" },
  { categoryType: '', maxParticipants: 16, tag: 'Mixed Doubles' },
];

const inputStyle = { backgroundColor: '', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', fontSize: '14px' };
const labelStyle = { fontSize: '14px', fontWeight: '500', color: '#374151' };

const SectionHeader = ({ title, onAdd, addLabel }) => (
  <div className="d-flex align-items-center justify-content-between mb-3">
    <h6 className="mb-0 fw-semibold" style={{ fontSize: '15px', color: '#1a1a1a' }}>{title}</h6>
    <button
      type="button"
      className="d-flex align-items-center position-relative p-0 border-0"
      style={{ borderRadius: '20px 10px 10px 20px', background: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
      onClick={onAdd}>
      <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: 'relative', left: '10px' }}>
        <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: '#1F41BB', width: '32px', height: '32px', borderRadius: '50%', fontSize: '18px' }}>
          <span className="mb-1">+</span>
        </div>
      </div>
      <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: '0 14px', height: '32px', fontSize: '13px', color: '#1F41BB', border: '1px solid #1F41BB' }}>
        {addLabel}
      </div>
    </button>
  </div>
);

const Counter = ({ value, onDecrement, onIncrement }) => (
  <div className="d-flex align-items-center justify-content-center gap-2 p-1 rounded-3" style={{ backgroundColor: '#fff' }}>
    <button type="button" className="btn btn-light btn-sm" style={{ width: '28px', height: '28px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => onDecrement(2)}>
      <AiOutlineMinus size={12} />
    </button>
    <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>{value}</span>
    <button type="button" className="btn btn-light btn-sm" style={{ width: '28px', height: '28px', padding: 0, border: '1px solid #E5E7EB' }} onClick={() => onIncrement(2)}>
      <AiOutlinePlus size={12} />
    </button>
  </div>
);

const TournamentCategories = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { loading, currentTournament, tournamentId } = useSelector(state => state.tournament);
  const [registration, setRegistration] = useState({ startDate: '', endDate: '', fee: '', isEnabled: false });
  const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '' });
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [categoryError, setCategoryError] = useState('');
  const [prizeDistribution, setPrizeDistribution] = useState([
    { position: '1st', amount: 0 },
    { position: '2nd', amount: 0 },
    { position: '3rd', amount: 0 },
  ]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!id) {
      setRegistration({ startDate: '', endDate: '', fee: '', isEnabled: false });
      setDateErrors({ startDate: '', endDate: '' });
      setCategory(DEFAULT_CATEGORY);
      setPrizeDistribution([{ position: '1st', amount: 0 }, { position: '2nd', amount: 0 }, { position: '3rd', amount: 0 }]);
    }
  }, [id]);

  useEffect(() => {
    if (currentTournament && id) {
      if (currentTournament.registration) {
        const reg = currentTournament.registration;
        setRegistration({
          startDate: reg.startDate ? reg.startDate.split('T')[0] : '',
          endDate: reg.endDate ? reg.endDate.split('T')[0] : '',
          fee: reg.fee ? reg.fee.toString() : '',
          isEnabled: reg.isEnabled || false,
        });
      }
      if (currentTournament.category?.length > 0) {
        setCategory(currentTournament.category.map(c => ({ categoryType: c.categoryType || '', maxParticipants: c.maxParticipants || 16, tag: c.tag || TAG_OPTIONS[0] })));
      }
      if (currentTournament.prizeDistribution?.length > 0) {
        setPrizeDistribution(currentTournament.prizeDistribution);
      }
    }
  }, [currentTournament, id]);

  const addPrize = () => {
    const n = prizeDistribution.length + 1;
    const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
    setPrizeDistribution([...prizeDistribution, { position: `${n}${suffix}`, amount: 0 }]);
  };

  const deletePrize = (index) => {
    const updated = prizeDistribution.filter((_, i) => i !== index);
    const reindexed = updated.map((prize, i) => {
      const n = i + 1;
      const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
      return { ...prize, position: `${n}${suffix}` };
    });
    setPrizeDistribution(reindexed);
  };

  const handleSubmit = async () => {
    const idToUpdate = id || tournamentId;
    if (!idToUpdate) return;

    const errs = { startDate: '', endDate: '' };
    if (!registration.startDate) errs.startDate = 'Start date is required';
    if (!registration.endDate) errs.endDate = 'End date is required';
    setDateErrors(errs);

    if (category.length === 0) {
      setCategoryError('At least one participation category is required');
      return;
    }

    const hasEmptyCategory = category.some(cat => !cat.categoryType.trim());
    if (hasEmptyCategory) {
      setCategoryError('All category names are required');
      return;
    }
    setCategoryError('');

    if (errs.startDate || errs.endDate) return;

    const payload = { id: idToUpdate };
    payload['registration[startDate]'] = registration.startDate;
    payload['registration[endDate]'] = registration.endDate;
    payload['registration[isEnabled]'] = registration.isEnabled;
    if (registration.fee) payload['registration[fee]'] = Number(registration.fee);

    category.forEach((cat, i) => {
      payload[`category[${i}][categoryType]`] = cat.categoryType;
      payload[`category[${i}][maxParticipants]`] = cat.maxParticipants;
      payload[`category[${i}][tag]`] = cat.tag;
    });

    prizeDistribution.filter(p => p.amount > 0).forEach((prize, i) => {
      payload[`prizeDistribution[${i}][position]`] = prize.position;
      payload[`prizeDistribution[${i}][amount]`] = prize.amount;
    });

    const result = await dispatch(updateTournament({ tournamentData: payload }));
    if (result.meta.requestStatus === 'fulfilled') onNext();
  };

  return (
    <div className="h-100 overflow-hidden">
      <style>{`
        .form-check-input:checked { background-color: #34C759 !important; border-color: #34C759 !important; box-shadow: none !important; }
        .form-check-input:focus { box-shadow: none !important; }
        .category-input:focus, .category-select:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>

      <div style={{ height: '90%', overflowX: 'hidden', overflowY: 'auto' }}>

        {/* ── Registration ── */}
        <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <p className="fw-semibold mb-3" style={{ fontSize: '13px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Registration Settings
          </p>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date" min={today} value={registration.startDate}
                  onChange={e => { setRegistration({ ...registration, startDate: e.target.value }); if (dateErrors.startDate) setDateErrors({ ...dateErrors, startDate: '' }); }}
                  style={inputStyle} isInvalid={!!dateErrors.startDate}
                />
                {dateErrors.startDate && <Form.Control.Feedback type="invalid">{dateErrors.startDate}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={labelStyle}>End Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date" min={registration.startDate || today} value={registration.endDate}
                  onChange={e => { setRegistration({ ...registration, endDate: e.target.value }); if (dateErrors.endDate) setDateErrors({ ...dateErrors, endDate: '' }); }}
                  style={inputStyle} isInvalid={!!dateErrors.endDate}
                />
                {dateErrors.endDate && <Form.Control.Feedback type="invalid">{dateErrors.endDate}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Form.Label style={{ ...labelStyle, marginBottom: 0 }}>
                    Registration Fee {registration.isEnabled && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Check
                    type="switch" id="reg-fee-switch"
                    checked={registration.isEnabled}
                    onChange={e => setRegistration({ ...registration, isEnabled: e.target.checked })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
                <Form.Control
                  type="number" placeholder="₹ 0"
                  value={registration.fee}
                  onChange={e => setRegistration({ ...registration, fee: e.target.value })}
                  disabled={!registration.isEnabled}
                  style={inputStyle}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* ── Participation Categories ── */}
        <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <SectionHeader
            title="Participation Categories"
            onAdd={() => { setCategory([...category, { categoryType: '', maxParticipants: 16, tag: TAG_OPTIONS[0] }]); setCategoryError(''); }}
            addLabel="Add"
          />
          {categoryError && <div className="text-danger mb-2" style={{ fontSize: '14px' }}>{categoryError}</div>}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <div className="d-flex" style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ flex: '2', padding: '10px 14px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Category</div>
              <div style={{ flex: '1', padding: '10px 14px', fontWeight: '600', fontSize: '13px', color: '#374151', borderLeft: '1px solid #E5E7EB', textAlign: 'center' }}>Max Participants</div>
              <div style={{ flex: '1', padding: '10px 14px', fontWeight: '600', fontSize: '13px', color: '#374151', borderLeft: '1px solid #E5E7EB' }}>Tag</div>
              <div style={{ width: '48px', padding: '10px 14px', borderLeft: '1px solid #E5E7EB' }} />
            </div>
            {category.map((cat, i) => (
              <div key={i} className="d-flex align-items-center" style={{ borderBottom: i < category.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                <div className='bg-white' style={{ flex: '2', padding: '8px 14px' }}>
                  <Form.Control
                    type="text" placeholder="Enter category name" value={cat.categoryType}
                    onChange={e => { const u = [...category]; u[i] = { ...u[i], categoryType: e.target.value }; setCategory(u); }}
                    style={{ fontSize: '14px', border: 'none', backgroundColor: '#FFFFFF', padding: '8px', outline: 'none', boxShadow: 'none' }}
                    className="category-input"
                  />
                </div>
                <div className='bg-white' style={{ flex: '1', padding: '8px 14px', borderLeft: '1px solid #E5E7EB' }}>
                  <Counter
                    value={cat.maxParticipants}
                    onDecrement={(step) => { const u = [...category]; u[i] = { ...u[i], maxParticipants: Math.max(2, cat.maxParticipants - step) }; setCategory(u); }}
                    onIncrement={(step) => { const u = [...category]; u[i] = { ...u[i], maxParticipants: cat.maxParticipants + step }; setCategory(u); }}
                  />
                </div>
                <div className='bg-white' style={{ flex: '1', padding: '8px 14px', borderLeft: '1px solid #E5E7EB' }}>
                  <Form.Select
                    value={cat.tag}
                    onChange={e => { const u = [...category]; u[i] = { ...u[i], tag: e.target.value }; setCategory(u); }}
                    style={{ fontSize: '14px', border: 'none', backgroundColor: '#FFFFFF', padding: '8px', outline: 'none', boxShadow: 'none' }}
                    className="category-select"
                  >
                    {TAG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Form.Select>
                </div>
                <div style={{ width: '48px', padding: '8px 14px', borderLeft: '1px solid #E5E7EB', textAlign: 'center' }}>
                  {category.length > 1 && <RiDeleteBin6Fill className="text-danger" style={{ cursor: 'pointer' }} size={16} onClick={() => { setCategory(category.filter((_, idx) => idx !== i)); setCategoryError(''); }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Prize Distribution ── */}
        <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <SectionHeader title="Prize Distribution" onAdd={addPrize} addLabel="Add Prize" />
          <Row className="g-3">
            {prizeDistribution.map((prize, i) => (
              <Col md={3} sm={6} key={i}>
                <div className="p-3 rounded-3 text-center position-relative" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                  {i >= 3 && (
                    <RiDeleteBin6Fill
                      className="text-danger"
                      style={{ cursor: 'pointer', position: 'absolute', top: '8px', right: '8px' }}
                      size={15}
                      onClick={() => deletePrize(i)}
                    />
                  )}
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {prize.position} Place
                  </div>
                  <Form.Control
                    type="text"
                    placeholder="₹ 0"
                    value={prize.amount ? Number(prize.amount).toLocaleString('en-IN') : ''}
                    onChange={e => { const u = prizeDistribution.map((p, idx) => idx === i ? { ...p, amount: Number(e.target.value.replace(/,/g, '')) || 0 } : p); setPrizeDistribution(u); }}
                    style={{ textAlign: 'center', fontWeight: '600', fontSize: '16px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px' }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>

      </div>

      <div style={{ height: '10%' }} className="text-end overflow-hidden mt-3">
        <button className="border-0 me-3 rounded-pill px-5 py-2" style={{ backgroundColor: '#E5E7EB', color: '#374151', fontSize: '16px', fontWeight: '600' }} onClick={onBack}>
          Back
        </button>
        <button className="border-0 rounded-pill py-2 text-white" disabled={loading} style={{ backgroundColor: '#3DBE64', width: '10rem', fontSize: '16px', fontWeight: '600' }} onClick={handleSubmit}>
          {loading ? 'Updating...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default TournamentCategories;
