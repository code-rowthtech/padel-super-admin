import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Nav, Modal, Form, Button, Offcanvas, Table, Spinner } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiCheck, FiX, FiEdit2, FiUsers } from 'react-icons/fi';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { getTournaments, saveTournamentSchedule, updateTournamentSchedule, getTournamentSchedules, getPlayersByCategoryGender, addTournamentPlayers, deleteTournamentSchedule, getTournamentTeams, exportScheduleCSV, importScheduleFromCSV } from '../../../redux/admin/tournament/thunk';
import { showError, showSuccess } from '../../../helpers/Toast';
import { DataLoading } from '../../../helpers/loading/Loaders';
import '../league/LeagueScheduleMatch.css';
import { ownerAxios } from '../../../helpers/api/apiCore';
import PlayerImportResultModal from '../../../components/PlayerImportResultModal';
import DeleteScheduleModal from '../league/components/DeleteScheduleModal';

// ─── pure helpers (module-level, never recreated) ────────────────────────────

const convertTo12Hour = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
};

const calcEndTime = (start, dur = 60) => {
  if (!start) return '';
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + Number(dur);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const EMPTY_PLAYER = () => ({ playerId: '', playerName: '', phoneNumber: '' });
const EMPTY_TEAM = (name = 'Team A') => ({ teamName: name, players: [EMPTY_PLAYER(), EMPTY_PLAYER()] });
const EMPTY_MATCH = (id, teamAName = 'Team A', teamBName = 'Team B') => ({
  id, date: '', venue: '', venueClubId: '',
  time: '09:00', duration: 60,
  endTime: calcEndTime('09:00', 60),
  teamA: EMPTY_TEAM(teamAName),
  teamB: EMPTY_TEAM(teamBName),
});

// Dynamic rounds will be calculated based on selectedTournament.matchRules
const ROUND_CONFIG = {
  regularRound: { key: 'regular', label: 'Regular' },
  quarterfinal: { key: 'quarterfinal', label: 'Quarter-Final' },
  semifinal: { key: 'semifinal', label: 'Semi-Final' },
  final: { key: 'final', label: 'Final' },
};

// ─── TeamSelector — for selecting from existing teams ───────────────────────

const TeamSelector = ({ team, matchId, side, onUpdateMatch, availableTeams }) => {
  return (
    <div style={{ minWidth: 220 }}>
      <select
        className="form-select text-center rounded-2 form-select-sm text-capitalize"
        value={team.teamId || ''}
        onChange={e => {
          const selectedTeam = availableTeams.find(t => t._id === e.target.value);
          if (selectedTeam) {
            onUpdateMatch(matchId, prev => ({
              ...prev,
              [side]: {
                teamId: selectedTeam._id,
                teamName: selectedTeam.teamName,
                players: selectedTeam.players.map(p => ({
                  playerId: p.playerId,
                  playerName: p.playerName,
                  phoneNumber: p.phoneNumber
                }))
              }
            }));
          }
        }}
        style={{ fontSize: 13, minWidth: '220px', margin: '0 auto' }}
      >
        <option value="">Select {side === 'teamA' ? 'Team A' : 'Team B'}</option>
        {availableTeams.map(t => (
          <option key={t._id} value={t._id} className="text-capitalize">
            {t.teamName} • {t.players.map(p => p.playerName).join(' & ')}
          </option>
        ))}
      </select>
      {!team.teamId && team.teamName && !['Team A', 'Team B'].includes(team.teamName) && (
        <div className='fw-semibold' style={{ marginTop: '6px', textAlign: 'center', color: '#1F41BB', fontSize: 13 }}>
          {team.teamName}
        </div>
      )}
      {team.players && team.players.length > 0 && team.players.some(p => p.playerName) && (
        <div className='fw-semibold' style={{ marginTop: '6px', textAlign: 'center', color: '#1F41BB', fontSize: 14 }}>
          {team.players.map(p => p.playerName).join(' & ')}
        </div>
      )}
    </div>
  );
};

const TeamDisplay = ({ team }) => (
  <div style={{ minWidth: 200 }}>
    <div style={{
      fontWeight: 600,
      fontSize: 13,
      color: '#1F2937',
      marginBottom: 4,
      textAlign: 'center'
    }}>
      {team?.teamName || '—'}
    </div>
    {team?.players && team.players.length > 0 && (
      <div style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>
        {team.players.map(p => p.playerName).join(' & ')}
      </div>
    )}
  </div>
);

// ─── TableHead — module-level ────────────────────────────────────────────────

const TableHead = () => (
  <thead>
    <tr style={{ backgroundColor: '#e8e8e8' }}>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '50px' }}>#</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '220px' }}>Team A</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '60px' }}>
        <div style={{ width: 34, height: 34, borderRadius: 6, background: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, margin: '0 auto' }}>VS</div>
      </th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '220px' }}>Team B</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '120px' }}>Date</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '120px' }}>Venue</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '100px' }}>Start</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '90px' }}>Duration</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '100px' }}>End</th>
      <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center', whiteSpace: 'nowrap', width: '80px' }}>Actions</th>
    </tr>
  </thead>
);

// ─── MatchRow — module-level, receives all callbacks as stable props ──────────

const MatchRow = ({ match, index, editable, isEditing, onUpdateMatch, onDelete, onCancelEdit, onEditExisting, onSaveExisting, availableTeams, allMatches }) => {
  const m = match;
  return (
    <tr style={{ backgroundColor: index % 2 === 1 ? 'rgba(242,242,242,0.7)' : '#fff', verticalAlign: 'middle' }}>
      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #ddd', width: '50px' }}>
        {String(index + 1).padStart(2, '0')}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', width: '220px', textAlign: 'center' }}>
        {editable
          ? <TeamSelector team={m.teamA} matchId={m.id} side="teamA" onUpdateMatch={onUpdateMatch} availableTeams={availableTeams} />
          : <TeamDisplay team={m.teamA} />}
      </td>

      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '60px' }}>
        <div className='rounded-3 text-white' style={{ backgroundColor: "#1F41BB", opacity: "0.1", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto', color: '#1F41BB' }}>VS</div>
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', width: '220px', textAlign: 'center' }}>
        {editable
          ? <TeamSelector team={m.teamB} matchId={m.id} side="teamB" onUpdateMatch={onUpdateMatch} availableTeams={availableTeams} />
          : <TeamDisplay team={m.teamB} />}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center', width: '120px' }}>
        {editable
          ? <input type="date" className="form-control form-control-sm" value={m.date}
            min={new Date().toISOString().split('T')[0]}
            style={{ width: 140, margin: '0 auto', fontSize: 12 }}
            onChange={e => onUpdateMatch(m.id, prev => ({ ...prev, date: e.target.value }))} />
          : <span style={{ fontSize: 12, color: '#555' }}>{m.date ? new Date(m.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center', width: '120px' }}>
        {editable
          ? <input className="form-control form-control-sm" value={m.venue} placeholder="Venue"
            style={{ width: 140, margin: '0 auto', fontSize: 12, backgroundColor: '#F3F4F6', border: 'none' }}
            onChange={e => onUpdateMatch(m.id, prev => ({ ...prev, venue: e.target.value }))} />
          : <span style={{ fontSize: 12, color: '#555' }}>{m.venue || '—'}</span>}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center', width: '100px' }}>
        {editable
          ? <input type="time" className="form-control form-control-sm" value={m.time}
            style={{ width: 100, margin: '0 auto', fontSize: 12 }}
            onChange={e => onUpdateMatch(m.id, prev => ({ ...prev, time: e.target.value, endTime: calcEndTime(e.target.value, prev.duration) }))} />
          : <span style={{ fontSize: 12, color: '#555' }}>{convertTo12Hour(m.time)}</span>}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center', width: '90px' }}>
        {editable
          ? <select className="form-select form-select-sm" value={m.duration}
            style={{ width: 80, margin: '0 auto', fontSize: 12 }}
            onChange={e => onUpdateMatch(m.id, prev => ({ ...prev, duration: +e.target.value, endTime: calcEndTime(prev.time, +e.target.value) }))}>
            <option value={30}>30m</option>
            <option value={60}>1h</option>
            <option value={90}>1.5h</option>
            <option value={120}>2h</option>
          </select>
          : <span style={{ fontSize: 12, color: '#555' }}>{m.duration}m</span>}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center', fontSize: 12, color: '#555', width: '100px' }}>
        {convertTo12Hour(m.endTime || calcEndTime(m.time, m.duration))}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center', width: '80px' }}>
        {!match.isExisting ? (
          <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => onDelete(match.id, match)}><FiTrash2 size={15} /></Button>
        ) : isEditing ? (
          <div className="d-flex gap-1 justify-content-center">
            <Button variant="link" size="sm" className="p-0 text-success" onClick={() => onSaveExisting(match)}><FiCheck size={15} /></Button>
            <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => onCancelEdit(match.id)}><FiX size={15} /></Button>
          </div>
        ) : (
          <div className="d-flex gap-1 justify-content-center">
            <Button variant="link" size="sm" className="p-0" style={{ color: '#1F41BB' }} onClick={() => onEditExisting(match)}><FiEdit2 size={15} /></Button>
            <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => onDelete(match.id, match)}><FiTrash2 size={15} /></Button>
          </div>
        )}
      </td>
    </tr>
  );
};

// ─── AddDateModal — module-level ─────────────────────────────────────────────

const AddDateModal = ({ show, onHide, onConfirm, categories = [], activeTab, selectedRound }) => {
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);

  useEffect(() => {
    if (show) {
      if (selectedRound === 'final') {
        // For finals, default to either activeTab or all
        if (activeTab === 'all') {
          setSelectedCats(categories.map(c => c._id));
        } else {
          setSelectedCats([activeTab]);
        }
      } else {
        // For non-finals, default to ALL categories as requested
        setSelectedCats(categories.map(c => c._id));
      }
    }
  }, [show, activeTab, categories, selectedRound]);

  const handleConfirm = () => {
    if (!date) { showError('Please select a date'); return; }

    let catsToUse = selectedCats;
    if (selectedRound !== 'final') {
      catsToUse = categories.map(c => c._id);
    }

    if (catsToUse.length === 0) { showError('Please select at least one category'); return; }
    onConfirm({ date, venue, selectedCats: catsToUse });
    setDate(''); setVenue('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="border-bottom d-flex justify-content-between align-items-center" style={{ padding: 20 }}>
        <Modal.Title className="d-flex align-items-center gap-2" style={{ fontWeight: 600, fontSize: 18 }}>
          <IoCalendarClearOutline size={18} /> Add Match Date
        </Modal.Title>
        <MdClose size={22} onClick={onHide} style={{ cursor: 'pointer' }} />
      </Modal.Header>
      <Modal.Body style={{ padding: 20 }}>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600, fontSize: 14 }}>Date <span className="text-danger">*</span></Form.Label>
          <Form.Control type="date" value={date} min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            style={{ backgroundColor: 'rgba(204,210,221,0.43)', border: '1px solid #ddd', boxShadow: 'none' }} />
        </Form.Group>

        {selectedRound === 'final' && (
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: 600, fontSize: 14 }}>Categories <span className="text-danger">*</span></Form.Label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', backgroundColor: 'rgba(204,210,221,0.2)' }}>
              {categories.map(cat => (
                <Form.Check
                  key={cat._id}
                  type="checkbox"
                  id={`modal-cat-${cat._id}`}
                  label={`${cat.categoryType} (${cat.tag})`}
                  checked={selectedCats.includes(cat._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCats([...selectedCats, cat._id]);
                    } else {
                      setSelectedCats(selectedCats.filter(id => id !== cat._id));
                    }
                  }}
                  style={{ fontSize: 13 }}
                />
              ))}
            </div>
          </Form.Group>
        )}

        <Form.Group className="mb-4">
          <Form.Label style={{ fontWeight: 600, fontSize: 14 }}>Venue</Form.Label>
          <Form.Control type="text" placeholder="e.g. Court 1 - Main Arena" value={venue}
            onChange={e => setVenue(e.target.value)}
            style={{ backgroundColor: 'rgba(204,210,221,0.43)', border: '1px solid #ddd', boxShadow: 'none' }} />
        </Form.Group>
        <Button className="w-100" style={{ backgroundColor: '#1F41BB', border: 'none', fontWeight: 600, padding: 12 }}
          onClick={handleConfirm} disabled={!date || (selectedRound === 'final' && selectedCats.length === 0)}>
          Add Match Row
        </Button>
      </Modal.Body>
    </Modal>
  );
};

// ─── ManagePlayersOffcanvas — module-level ───────────────────────────────────

const ManagePlayersOffcanvas = ({ show, onHide, selectedTournamentId, activeCategory, onPlayersAdded, onImportResult }) => {
  const dispatch = useDispatch();
  const { addingPlayers } = useSelector(s => s.tournament);
  const [players, setPlayers] = useState([{
    playerName: '',
    phoneNumber: '',
    email: '',
    gender: ''
  }]);

  const addPlayer = () => {
    setPlayers([...players, {
      playerName: '',
      phoneNumber: '',
      email: '',
      gender: ''
    }]);
  };

  const removePlayer = (index) => {
    if (players.length === 1) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index, field, value) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const validatePlayers = () => {
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.playerName.trim()) {
        showError(`Player ${i + 1}: Name is required`);
        return false;
      }
      if (p.playerName.trim().length < 3) {
        showError(`Player ${i + 1}: Name must be at least 3 characters`);
        return false;
      }
      if (!/^[a-zA-Z\s]+$/.test(p.playerName.trim())) {
        showError(`Player ${i + 1}: Name must contain only alphabets`);
        return false;
      }
      if (!p.phoneNumber.trim()) {
        showError(`Player ${i + 1}: Phone number is required`);
        return false;
      }
      // if (!/^[6-9]\d{9}$/.test(p.phoneNumber)) {
      //   showError(`Player ${i + 1}: Invalid phone number`);
      //   return false;
      // }
      if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        showError(`Player ${i + 1}: Invalid email format`);
        return false;
      }
      if (!p.gender) {
        showError(`Player ${i + 1}: Gender is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePlayers()) return;

    const result = await dispatch(addTournamentPlayers({ tournamentId: selectedTournamentId, players }));

    if (result.meta.requestStatus === 'fulfilled') {
      const data = result.payload;

      // Reset form
      setPlayers([{
        playerName: '',
        phoneNumber: '',
        email: '',
        gender: ''
      }]);

      // Trigger refetch of players
      if (onPlayersAdded) {
        onPlayersAdded();
      }

      onHide();

      // Show result modal if there are added or skipped players
      if (onImportResult && (data?.added?.length > 0 || data?.skipped?.length > 0)) {
        onImportResult(data);
      }
    }
  };

  const handleClose = () => {
    setPlayers([{
      playerName: '',
      phoneNumber: '',
      email: '',
      gender: ''
    }]);
    onHide();
  };

  return (
    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '600px' }}>
      <Offcanvas.Header className="border-bottom" style={{ padding: '20px' }}>
        <Offcanvas.Title className="d-flex align-items-center gap-2" style={{ fontWeight: 600, fontSize: 18 }}>
          <FiUsers size={20} /> Add Players to {activeCategory}
        </Offcanvas.Title>
        {/* <MdClose size={24} onClick={handleClose} style={{ cursor: 'pointer' }} /> */}
      </Offcanvas.Header>
      <Offcanvas.Body style={{ padding: '20px', overflowY: 'auto' }}>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <span style={{ fontSize: 14, color: '#666' }}>Add multiple players at once</span>
          <Button
            size="sm"
            onClick={addPlayer}
            style={{ backgroundColor: '#1F41BB', border: 'none', fontSize: 13, padding: '6px 12px' }}
          >
            <FiPlus size={14} /> Add Another
          </Button>
        </div>

        <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          {players.map((player, index) => (
            <div key={index} className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa', position: 'relative' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1F41BB' }}>Player {index + 1}</span>
                {players.length > 1 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={() => removePlayer(index)}
                  >
                    <FiTrash2 size={16} />
                  </Button>
                )}
              </div>

              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>Player Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter player name"
                      value={player.playerName}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        updatePlayer(index, 'playerName', value);
                      }}
                      style={{ fontSize: 13, backgroundColor: '#fff', border: '1px solid #ddd' }}
                    />
                  </Form.Group>
                </Col>

                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>Phone Number <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="10-digit mobile number"
                      value={player.phoneNumber}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length === 0 || /^[6-9]/.test(value)) {
                          updatePlayer(index, 'phoneNumber', value);
                        }
                      }}
                      style={{ fontSize: 13, backgroundColor: '#fff', border: '1px solid #ddd' }}
                    />
                  </Form.Group>
                </Col>

                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email address"
                      value={player.email}
                      onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                      style={{ fontSize: 13, backgroundColor: '#fff', border: '1px solid #ddd' }}
                    />
                  </Form.Group>
                </Col>

                <Col xs={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>Gender <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={player.gender}
                      onChange={(e) => updatePlayer(index, 'gender', e.target.value)}
                      style={{ fontSize: 13, backgroundColor: '#fff', border: '1px solid #ddd' }}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mt-4">
          <Button
            className="flex-grow-1"
            style={{ backgroundColor: '#1F41BB', border: 'none', fontWeight: 600, padding: 12 }}
            onClick={handleSubmit}
            disabled={addingPlayers}
          >
            {addingPlayers ? 'Creating...' : `Create ${players.length} Player${players.length > 1 ? 's' : ''}`}
          </Button>
          <Button
            variant="outline-secondary"
            className="flex-grow-1"
            style={{ fontWeight: 600, padding: 12 }}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const TournamentSchedule = () => {
  const dispatch = useDispatch();
  const { tournaments, loadingTournament, schedules, loadingSchedule, players: availablePlayers, loadingPlayers, teamsData, loadingTeams, exportingScheduleCSV, importingScheduleCSV } = useSelector(s => s.tournament);

  const importFileRef = useRef(null);

  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedRound, setSelectedRound] = useState('regular');
  const [activeTab, setActiveTab] = useState('');
  const [matchesByCategory, setMatchesByCategory] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPlayersOffcanvas, setShowPlayersOffcanvas] = useState(false);
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(false);

  const tournamentsData = Array.isArray(tournaments?.data) ? tournaments.data : [];
  const selectedTournament = tournamentsData.find(t => t._id === selectedTournamentId);
  const categories = selectedTournament?.category || [];
  const availableTeams = teamsData?.teams || [];

  const dynamicRounds = React.useMemo(() => {
    if (!selectedTournament?.matchRules) return [];
    return Object.entries(selectedTournament.matchRules)
      .filter(([_, rule]) => rule.status)
      .map(([key, _]) => ROUND_CONFIG[key])
      .filter(Boolean);
  }, [selectedTournament]);

  // Update selectedRound if current one is not available in dynamicRounds
  useEffect(() => {
    if (dynamicRounds.length > 0) {
      const isCurrentRoundAvailable = dynamicRounds.find(r => r.key === selectedRound);
      if (!isCurrentRoundAvailable) {
        setSelectedRound(dynamicRounds[0].key);
      }
    }
  }, [dynamicRounds, selectedRound]);

  useEffect(() => { dispatch(getTournaments({ page: 1, limit: 100 })); }, [dispatch]);

  useEffect(() => {
    if (tournamentsData.length > 0 && !selectedTournamentId) setSelectedTournamentId(tournamentsData[0]._id);
  }, [tournamentsData]);

  useEffect(() => {
    if (categories.length > 0) setActiveTab('all');
    else setActiveTab('');
  }, [selectedTournamentId]);

  useEffect(() => {
    if (selectedTournamentId) {
      const params = { tournamentId: selectedTournamentId, roundType: selectedRound };
      if (activeTab && activeTab !== 'all') {
        const activeCategory = categories.find(cat => cat._id === activeTab);
        if (activeCategory) {
          params.categoryType = activeCategory.categoryType;
          params.tag = activeCategory.tag;
        }
      }
      dispatch(getTournamentSchedules(params));
    }
  }, [dispatch, selectedTournamentId, selectedRound, activeTab, categories]);

  // Fetch teams when tournament or category changes
  useEffect(() => {
    if (!selectedTournamentId || !activeTab) return;
    const selectedCategory = categories.find(cat => cat._id === activeTab);
    if (selectedCategory) {
      dispatch(getTournamentTeams({
        tournamentId: selectedTournamentId,
        categoryType: selectedCategory.categoryType,
        tag: selectedCategory.tag
      }));
    }
  }, [selectedTournamentId, activeTab, dispatch, categories]);

  const refetchPlayers = useCallback(async () => {
    if (!selectedTournamentId || !activeTab) return;
    dispatch(getPlayersByCategoryGender({ tournamentId: selectedTournamentId, categoryType: activeTab }));
  }, [selectedTournamentId, activeTab, dispatch]);

  const existingMatches = React.useMemo(() => {
    const map = {};
    if (!Array.isArray(schedules)) return map;
    schedules.forEach(s => {
      const category = categories.find(c => c.categoryType === s.categoryType && (s.tag ? c.tag === s.tag : true));
      const categoryId = category ? category._id : null;
      if (!categoryId) return;

      if (!map[categoryId]) map[categoryId] = [];
      (s.matches || []).forEach((m, i) => {
        const parseTime = (str) => {
          if (!str) return '09:00';
          const [t, mod] = str.split(' ');
          let [hh, mm] = t.split(':').map(Number);
          if (mod === 'PM' && hh !== 12) hh += 12;
          if (mod === 'AM' && hh === 12) hh = 0;
          return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        };
        map[categoryId].push({
          id: `existing_${s._id}_${i}`,
          scheduleId: s._id,
          date: s.date ? s.date.split('T')[0] : '',
          venue: s.venue || '',
          venueClubId: s.venueClubId || '',
          time: parseTime(m.startTime),
          duration: m.duration || 60,
          endTime: parseTime(m.endTime) || calcEndTime('09:00', m.duration || 60),
          teamA: m.teamA || EMPTY_TEAM(),
          teamB: m.teamB || EMPTY_TEAM(),
          isExisting: true,
        });
      });
    });
    return map;
  }, [schedules, categories]);

  const currentNew = activeTab === 'all'
    ? Object.keys(matchesByCategory).filter(key => key !== 'all').flatMap(key => (matchesByCategory[key] || []).filter(m => !m.isExisting))
    : (matchesByCategory[activeTab] || []).filter(m => !m.isExisting);

  // For existing matches, prefer the locally-edited copy from matchesByCategory
  // so that in-progress edits are reflected in the UI.
  const currentExisting = activeTab === 'all'
    ? Object.keys(existingMatches).filter(key => key !== 'all').flatMap(key => {
      const localEdits = matchesByCategory[key] || [];
      return (existingMatches[key] || []).map(m => {
        const edited = localEdits.find(lm => lm.id === m.id && lm.isExisting);
        return edited || m;
      });
    })
    : (existingMatches[activeTab] || []).map(m => {
      const localEdits = matchesByCategory[activeTab] || [];
      const edited = localEdits.find(lm => lm.id === m.id && lm.isExisting);
      return edited || m;
    });

  // ── stable callbacks via useCallback ────────────────────────────────────────

  const handleAddDate = useCallback(({ date, venue, selectedCats }) => {
    const catsToAdd = categories.filter(c => selectedCats.includes(c._id));
    const newMatchesByCategory = {};
    const isKnockout = ['quarterfinal', 'semifinal', 'final'].includes(selectedRound);

    catsToAdd.forEach(category => {
      const categoryId = category._id;
      const existingMatchesInCategory = matchesByCategory[categoryId] || [];
      const baseId = existingMatchesInCategory.length > 0 ? Math.max(...existingMatchesInCategory.map(m => m.id)) + 1 : Date.now() + Math.random();

      let teamAName = 'Team A';
      let teamBName = 'Team B';

      if (isKnockout) {
        const matchIndex = existingMatchesInCategory.length;
        teamAName = `Winner ${(matchIndex * 2) + 1}`;
        teamBName = `Winner ${(matchIndex * 2) + 2}`;
      }

      newMatchesByCategory[categoryId] = [
        ...existingMatchesInCategory,
        { ...EMPTY_MATCH(baseId, teamAName, teamBName), date, venue }
      ];
    });

    setMatchesByCategory(prev => ({ ...prev, ...newMatchesByCategory }));
    setShowModal(false);
  }, [categories, matchesByCategory, selectedRound]);

  const onUpdateMatch = useCallback((id, updater) => {
    setMatchesByCategory(prev => {
      const next = { ...prev };
      if (activeTab && activeTab !== 'all') {
        next[activeTab] = (next[activeTab] || []).map(m => m.id === id ? updater(m) : m);
      } else {
        // In 'all' tab, search across all category buckets
        Object.keys(next).forEach(catId => {
          next[catId] = (next[catId] || []).map(m => m.id === id ? updater(m) : m);
        });
      }
      return next;
    });
  }, [activeTab]);

  const onDelete = useCallback((id, match) => {
    if (match?.isExisting) {
      const scheduleId = id.toString().replace('existing_', '').split('_')[0];
      setScheduleToDelete({ scheduleId, match });
      setShowDeleteModal(true);
    } else {
      setMatchesByCategory(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(catId => {
          next[catId] = (next[catId] || []).filter(m => m.id !== id);
        });
        return next;
      });
    }
  }, []);

  const onEditExisting = useCallback((match) => {
    setEditingId(match.id);
    // Identify the correct category bucket for this existing match
    let categoryId = activeTab;
    if (activeTab === 'all') {
      categoryId = Object.keys(existingMatches).find(catId =>
        existingMatches[catId].some(m => m.id === match.id)
      );
    }
    if (!categoryId) return;

    setMatchesByCategory(prev => {
      const existing = prev[categoryId] || [];
      const withoutOld = existing.filter(m => !(m.id === match.id && m.isExisting));
      return { ...prev, [categoryId]: [...withoutOld, { ...match }] };
    });
  }, [activeTab, existingMatches]);

  const onCancelEdit = useCallback((id) => {
    setEditingId(null);
    setMatchesByCategory(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(catId => {
        next[catId] = (next[catId] || []).filter(m => !(m.id === id && m.isExisting));
      });
      return next;
    });
  }, []);

  const handleUpdateExistingMatch = async (match) => {
    if (!match.scheduleId) return;

    const buildTeamPayload = (team) => {
      const payload = { teamName: team.teamName };
      if (team.teamId) {
        payload.teamId = team.teamId;
        payload.players = (team.players || [])
          .filter(p => p.playerId)
          .map(p => ({ playerId: p.playerId, playerName: p.playerName, phoneNumber: p.phoneNumber }));
      }
      return payload;
    };

    const payload = {
      scheduleId: match.scheduleId,
      tournamentId: selectedTournamentId,
      roundType: selectedRound,
      date: match.date,
      venue: match.venue,
      matches: [{
        matchNo: parseInt(match.id.split('_').pop()) + 1,
        startTime: convertTo12Hour(match.time),
        endTime: convertTo12Hour(match.endTime || calcEndTime(match.time, match.duration)),
        duration: match.duration,
        time: convertTo12Hour(match.time),
        teamA: buildTeamPayload(match.teamA),
        teamB: buildTeamPayload(match.teamB),
      }]
    };

    const result = await dispatch(updateTournamentSchedule(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setEditingId(null);
      // Remove from local edits
      setMatchesByCategory(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(catId => {
          next[catId] = (next[catId] || []).filter(m => !(m.id === match.id && m.isExisting));
        });
        return next;
      });
      // Refresh
      const params = { tournamentId: selectedTournamentId, roundType: selectedRound };
      if (activeTab && activeTab !== 'all') {
        const activeCategory = categories.find(cat => cat._id === activeTab);
        if (activeCategory) {
          params.categoryType = activeCategory.categoryType;
          params.tag = activeCategory.tag;
        }
      }
      dispatch(getTournamentSchedules(params));
    }
  };

  const handleSave = async () => {
    if (!selectedTournamentId) { showError('No tournament selected'); return; }

    const isKnockout = ['quarterfinal', 'semifinal', 'final'].includes(selectedRound);

    // For knockout rounds: include any category with at least one unsaved match (teams optional)
    // For regular rounds: require both teams to be selected
    const categoriesToSave = categories.filter(cat => {
      const catMatches = (matchesByCategory[cat._id] || []).filter(m => !m.isExisting);
      if (catMatches.length === 0) return false;
      if (isKnockout) return true;
      return catMatches.some(m => m.teamA?.teamId && m.teamB?.teamId);
    });

    if (categoriesToSave.length === 0) {
      showError(isKnockout
        ? 'Please add at least one match before saving.'
        : 'Please select both teams for at least one match before saving.'
      );
      return;
    }

    // Validate dates for all matches
    for (const category of categoriesToSave) {
      const validMatches = (matchesByCategory[category._id] || [])
        .filter(m => !m.isExisting && (isKnockout || (m.teamA?.teamId && m.teamB?.teamId)));

      for (let i = 0; i < validMatches.length; i++) {
        if (!validMatches[i].date) {
          showError(`${category.categoryType} - Match ${i + 1}: date is required`);
          return;
        }
      }
    }

    // Save all categories
    for (const category of categoriesToSave) {
      const validCatMatches = (matchesByCategory[category._id] || [])
        .filter(m => !m.isExisting && (isKnockout || (m.teamA?.teamId && m.teamB?.teamId)));

      if (validCatMatches.length === 0) continue;

      const buildTeamPayload = (team) => {
        const payload = { teamName: team.teamName };
        if (team.teamId) {
          payload.teamId = team.teamId;
          payload.players = (team.players || [])
            .filter(p => p.playerId)
            .map(p => ({ playerId: p.playerId, playerName: p.playerName, phoneNumber: p.phoneNumber }));
        }
        return payload;
      };

      const payload = {
        tournamentId: selectedTournamentId,
        categoryType: category.categoryType,
        tag: category.tag,
        roundType: selectedRound,
        date: validCatMatches[0].date,
        venue: validCatMatches[0].venue,
        matches: validCatMatches.map((m, i) => ({
          matchNo: i + 1,
          startTime: convertTo12Hour(m.time),
          endTime: convertTo12Hour(m.endTime || calcEndTime(m.time, m.duration)),
          duration: m.duration,
          time: convertTo12Hour(m.time),
          teamA: buildTeamPayload(m.teamA),
          teamB: buildTeamPayload(m.teamB),
        })),
      };

      const result = await dispatch(saveTournamentSchedule(payload));
      if (result.meta.requestStatus !== 'fulfilled') {
        showError(`Failed to save schedule for ${category.categoryType}`);
        return;
      }
    }

    showSuccess(`Schedules saved successfully for ${categoriesToSave.length} ${categoriesToSave.length === 1 ? 'category' : 'categories'}`);

    // Clear all saved categories new matches
    categoriesToSave.forEach(cat => {
      setMatchesByCategory(prev => {
        const existingOnly = (prev[cat._id] || []).filter(m => m.isExisting);
        return { ...prev, [cat._id]: existingOnly };
      });
    });

    const params = { tournamentId: selectedTournamentId, roundType: selectedRound };
    if (activeTab && activeTab !== 'all') {
      const activeCategory = categories.find(cat => cat._id === activeTab);
      if (activeCategory) {
        params.categoryType = activeCategory.categoryType;
        params.tag = activeCategory.tag;
      }
    }
    dispatch(getTournamentSchedules(params));
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    setDeletingSchedule(true);
    const result = await dispatch(deleteTournamentSchedule(scheduleToDelete.scheduleId));
    setDeletingSchedule(false);

    if (result.type === 'tournament/deleteTournamentSchedule/fulfilled') {
      setShowDeleteModal(false);
      setScheduleToDelete(null);

      const params = { tournamentId: selectedTournamentId, roundType: selectedRound };
      if (activeTab && activeTab !== 'all') {
        const activeCategory = categories.find(cat => cat._id === activeTab);
        if (activeCategory) {
          params.categoryType = activeCategory.categoryType;
          params.tag = activeCategory.tag;
        }
      }
      dispatch(getTournamentSchedules(params));
    }
  };

  return (
    <Container fluid className="p-4 pt-0 bg-white border h-100">
      <Row className="mb-0">
        <Col className="py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              {dynamicRounds.map(({ key, label }) => (
                <button key={key} onClick={() => { setSelectedRound(key); setMatchesByCategory({}); }}
                  className={`round-tab ${selectedRound === key ? 'active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2">
              <select className="form-select form-select-sm league-select" value={selectedTournamentId}
                onChange={e => { setSelectedTournamentId(e.target.value); setMatchesByCategory({}); }}>
                <option value="">Select Tournament</option>
                {tournamentsData.map(t => <option key={t._id} value={t._id}>{t.tournamentName}</option>)}
              </select>
              {/* <button
                className="export-btn"
                disabled={!selectedTournamentId || exportingScheduleCSV}
                title="Export schedules as CSV"
                onClick={() => {
                  const tournament = tournamentsData.find(t => t._id === selectedTournamentId);
                  dispatch(exportScheduleCSV({ tournamentId: selectedTournamentId, tournamentName: tournament?.tournamentName || 'tournament' }));
                }}
              >
                {exportingScheduleCSV
                  ? <><Spinner size="sm" animation="border" className="me-1" />Exporting...</>
                  : <><FiDownload size={15} /> Export CSV</>}
              </button>
              <button
                className="export-btn"
                disabled={!selectedTournamentId || importingScheduleCSV}
                title="Import schedules from CSV"
                onClick={() => importFileRef.current?.click()}
              >
                {importingScheduleCSV
                  ? <><Spinner size="sm" animation="border" className="me-1" />Importing...</>
                  : <><FiUpload size={15} /> Import CSV</>}
              </button> */}
              <input
                ref={importFileRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const result = await dispatch(importScheduleFromCSV({ file, tournamentId: selectedTournamentId }));
                  e.target.value = '';
                  if (result.meta.requestStatus === 'fulfilled') {
                    const params = { tournamentId: selectedTournamentId, roundType: selectedRound };
                    if (activeTab && activeTab !== 'all') {
                      const activeCategory = categories.find(cat => cat._id === activeTab);
                      if (activeCategory) {
                        params.categoryType = activeCategory.categoryType;
                        params.tag = activeCategory.tag;
                      }
                    }
                    dispatch(getTournamentSchedules(params));
                  }
                }}
              />
              {/* <button
                className="export-btn"
                onClick={() => setShowPlayersOffcanvas(true)}
                disabled={!selectedTournamentId || !activeTab}
                title="Add players to this category"
              >
                <FiUsers size={15} /> Manage Players
              </button> */}
              <button className="export-btn" onClick={() => setShowModal(true)} disabled={!activeTab}>
                <FiPlus size={15} /> Add Date
              </button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="border-top" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Col style={{ overflowY: 'auto' }}>
          {categories.length > 0 && (
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="level-tabs border-0 mb-3">
              {categories.map(cat => (
                <Nav.Item key={cat._id}>
                  <Nav.Link
                    eventKey={cat._id}
                    className={activeTab === cat._id ? 'active' : ''}
                    style={{ color: activeTab === cat._id ? '#1F41BB' : '#666' }}
                  >
                    {cat.categoryType} ({cat.tag})
                    {(existingMatches[cat._id] || []).length > 0 && (
                      <span className="fw-semibold ms-1" style={{ color: '#1F41BB' }}>({(existingMatches[cat._id] || []).length})</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
              ))}
              {categories.length > 0 && (
                <Nav.Item>
                  <Nav.Link eventKey="all" className={activeTab === 'all' ? 'active' : ''}>
                    All <span className='fw-semibold' style={{ color: '#1F41BB' }}>
                      {Object.keys(existingMatches).reduce((acc, key) => acc + (existingMatches[key] || []).length, 0) > 0
                        ? `(${Object.keys(existingMatches).reduce((acc, key) => acc + (existingMatches[key] || []).length, 0)})`
                        : ''}
                    </span>
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          )}

          {loadingTournament || loadingSchedule ? (
            <DataLoading height="50vh" />
          ) : !selectedTournamentId ? (
            <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: '50vh' }}>Select a tournament to manage schedules</div>
          ) : categories.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: '50vh' }}>No categories found for this tournament</div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>

              {currentNew.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontWeight: 600, color: '#1F41BB', fontSize: 14 }}>New Matches (Unsaved)</span>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#1F41BB', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}
                      onClick={() => {
                        const last = currentNew[currentNew.length - 1];
                        // Add more rows only to current category/categories based on activeTab
                        const catsToAdd = activeTab === 'all' ? categories : categories.filter(c => c._id === activeTab);

                        const newMatchesByCategory = {};

                        catsToAdd.forEach(category => {
                          const categoryId = category._id;
                          const existingMatches = matchesByCategory[categoryId] || [];
                          const baseId = existingMatches.length > 0 ? Math.max(...existingMatches.map(m => m.id)) + 1 : Date.now() + Math.random();

                          newMatchesByCategory[categoryId] = [
                            ...existingMatches,
                            { ...EMPTY_MATCH(baseId), date: last?.date || '', venue: last?.venue || '' }
                          ];
                        });

                        setMatchesByCategory(prev => ({ ...prev, ...newMatchesByCategory }));
                      }}
                    >
                      <FiPlus size={13} /> Add More
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1160px' }}>
                      <colgroup>
                        <col style={{ width: '50px' }} />
                        <col style={{ width: '220px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '220px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '90px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '80px' }} />
                      </colgroup>
                      <TableHead />
                      <tbody>
                        {categories
                          .filter(cat => activeTab === 'all' || activeTab === cat._id)
                          .map((category) => {
                            const categoryMatches = (matchesByCategory[category._id] || []).filter(m => !m.isExisting);
                            if (categoryMatches.length === 0) return null;

                            return (
                              <React.Fragment key={category._id}>
                                {activeTab === 'all' && (
                                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <td colSpan="10" style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: 'rgba(31, 65, 187, 1)', borderBottom: '1px solid #ddd' }}>
                                      {category.categoryType} ({category.tag})
                                    </td>
                                  </tr>
                                )}
                                {categoryMatches.map((m, i) => (
                                  <MatchRow key={m.id} match={m} index={i} editable isEditing={false}
                                    onUpdateMatch={onUpdateMatch} onDelete={onDelete}
                                    onCancelEdit={onCancelEdit} onEditExisting={onEditExisting}
                                    availableTeams={availableTeams} allMatches={[...currentNew, ...currentExisting]} />
                                ))}
                              </React.Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <button className="export-btn" disabled={loadingSchedule} onClick={handleSave} style={{ padding: '6px 16px', fontSize: 13 }}>
                      {loadingSchedule ? 'Saving...' : 'Save Schedule'}
                    </button>
                  </div>
                </div>
              )}

              {currentExisting.length > 0 && (
                <div>
                  {currentNew.length > 0 && <div className="mb-2"><span style={{ fontWeight: 600, color: '#666', fontSize: 14 }}>Existing Schedules</span></div>}
                  <div style={{ overflowX: 'auto', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '1160px' }}>
                      <colgroup>
                        <col style={{ width: '50px' }} />
                        <col style={{ width: '220px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '220px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '90px' }} />
                        <col style={{ width: '100px' }} />
                        <col style={{ width: '80px' }} />
                      </colgroup>
                      <TableHead />
                      <tbody>
                        {currentExisting.map((m, i) => (
                          <MatchRow key={m.id} match={m} index={i}
                            editable={editingId === m.id} isEditing={editingId === m.id}
                            onUpdateMatch={onUpdateMatch} onDelete={onDelete}
                            onCancelEdit={onCancelEdit} onEditExisting={onEditExisting}
                            onSaveExisting={handleUpdateExistingMatch}
                            availableTeams={availableTeams} allMatches={[...currentNew, ...currentExisting]} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentNew.length === 0 && currentExisting.length === 0 && (
                <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: '40vh' }}>
                  No schedules yet. Click "Add Date" to create matches.
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      <AddDateModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onConfirm={handleAddDate}
        categories={categories}
        activeTab={activeTab}
        selectedRound={selectedRound}
      />
      <ManagePlayersOffcanvas
        show={showPlayersOffcanvas}
        onHide={() => setShowPlayersOffcanvas(false)}
        selectedTournamentId={selectedTournamentId}
        activeCategory={activeTab}
        onPlayersAdded={refetchPlayers}
        onImportResult={(result) => {
          setImportResult(result);
          setShowImportResultModal(true);
        }}
      />
      <PlayerImportResultModal
        show={showImportResultModal}
        onHide={() => setShowImportResultModal(false)}
        result={importResult}
      />
      <DeleteScheduleModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSchedule}
        scheduleData={scheduleToDelete}
        loading={deletingSchedule}
      />
    </Container>
  );
};

export default TournamentSchedule;
