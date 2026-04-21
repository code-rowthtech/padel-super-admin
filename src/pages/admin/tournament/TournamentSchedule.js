import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Nav, Modal, Form, Button, Offcanvas, Table } from 'react-bootstrap';
import { FiPlus, FiTrash2, FiCheck, FiX, FiEdit2, FiUsers } from 'react-icons/fi';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { getTournaments, saveTournamentSchedule, getTournamentSchedules } from '../../../redux/admin/tournament/thunk';
import { showError, showSuccess } from '../../../helpers/Toast';
import { DataLoading } from '../../../helpers/loading/Loaders';
import '../league/LeagueScheduleMatch.css';
import { ownerAxios } from '../../../helpers/api/apiCore';

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
const EMPTY_TEAM = () => ({ teamName: 'Team A', players: [EMPTY_PLAYER(), EMPTY_PLAYER()] });
const EMPTY_MATCH = (id) => ({
  id, date: '', venue: '', venueClubId: '',
  time: '09:00', duration: 60,
  endTime: calcEndTime('09:00', 60),
  teamA: { teamName: 'Team A', players: [EMPTY_PLAYER(), EMPTY_PLAYER()] },
  teamB: { teamName: 'Team B', players: [EMPTY_PLAYER(), EMPTY_PLAYER()] },
});

const ROUNDS = [
  { key: 'regular', label: 'Regular' },
  { key: 'quarterfinal', label: 'Quarter-Final' },
  { key: 'semifinal', label: 'Semi-Final' },
  { key: 'final', label: 'Final' },
];

// ─── TeamInput — defined at module level so identity is stable ───────────────

const TeamInput = ({ team, matchId, side, onUpdateMatch, availablePlayers, allMatches, currentMatch }) => {
  // Get all selected player IDs from the current match
  const getSelectedPlayerIds = () => {
    const ids = new Set();
    if (currentMatch.teamA?.players) {
      currentMatch.teamA.players.forEach(p => p.playerId && ids.add(p.playerId));
    }
    if (currentMatch.teamB?.players) {
      currentMatch.teamB.players.forEach(p => p.playerId && ids.add(p.playerId));
    }
    return ids;
  };

  // Get players already scheduled at the same time
  const getPlayersScheduledAtSameTime = () => {
    const ids = new Set();
    if (!currentMatch.date || !currentMatch.time) return ids;

    const currentDate = currentMatch.date;
    const currentTime = currentMatch.time;

    allMatches.forEach(match => {
      if (match.id === matchId) return; // Skip current match
      if (match.date === currentDate && match.time === currentTime) {
        match.teamA?.players?.forEach(p => p.playerId && ids.add(p.playerId));
        match.teamB?.players?.forEach(p => p.playerId && ids.add(p.playerId));
      }
    });
    return ids;
  };

  const selectedInMatch = getSelectedPlayerIds();
  const scheduledAtSameTime = getPlayersScheduledAtSameTime();

  return (
    <div style={{ minWidth: 200, maxWidth: 220 }}>
      <input
        className="form-control form-control-sm mb-2"
        placeholder={`${side === 'teamA' ? 'Team A' : 'Team B'} Name`}
        value={team.teamName}
        onChange={e => onUpdateMatch(matchId, prev => ({
          ...prev,
          [side]: { ...prev[side], teamName: e.target.value }
        }))}
        style={{ fontSize: 12, backgroundColor: '#F3F4F6', border: 'none' }}
      />
      {team.players.map((p, i) => {
        const currentPlayerId = p.playerId;
        return (
          <div key={i} className="mb-2">
            <select
              className="form-select form-select-sm"
              value={p.playerId}
              onChange={e => {
                const selectedPlayer = availablePlayers.find(pl => pl._id === e.target.value);
                onUpdateMatch(matchId, prev => {
                  const players = [...prev[side].players];
                  players[i] = {
                    playerId: selectedPlayer?._id || '',
                    playerName: selectedPlayer?.playerName || '',
                    phoneNumber: selectedPlayer?.phoneNumber || ''
                  };
                  return { ...prev, [side]: { ...prev[side], players } };
                });
              }}
              style={{ fontSize: 11, backgroundColor: '#F3F4F6', border: 'none', maxWidth: '220px' }}
            >
              <option value="">Select Player {i + 1}</option>
              {availablePlayers.map(player => {
                const isSelectedInMatch = selectedInMatch.has(player._id) && player._id !== currentPlayerId;
                const isScheduledAtSameTime = scheduledAtSameTime.has(player._id);
                const isDisabled = isSelectedInMatch || isScheduledAtSameTime;

                return (
                  <option
                    key={player._id}
                    value={player._id}
                    disabled={isDisabled}
                  >
                    {player.playerName} ({player.phoneNumber || 'N/A'})
                  </option>
                );
              })}
            </select>
          </div>
        );
      })}
    </div>
  );
};

const TeamDisplay = ({ team }) => (
  <div style={{ minWidth: 180 }}>
    <div style={{ fontWeight: 600, fontSize: 13, color: '#1F2937', marginBottom: 2 }}>{team?.teamName || '—'}</div>
    {team?.players?.map((p, i) => (
      <div key={i} style={{ fontSize: 11, color: '#6B7280', lineHeight: '1.5' }}>
        {p.playerName || `Player ${i + 1}`}{p.phoneNumber ? ` · ${p.phoneNumber}` : ''}
      </div>
    ))}
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

const MatchRow = ({ match, index, editable, isEditing, onUpdateMatch, onDelete, onCancelEdit, onEditExisting, availablePlayers, allMatches }) => {
  const m = match;
  return (
    <tr style={{ backgroundColor: index % 2 === 1 ? 'rgba(242,242,242,0.7)' : '#fff', verticalAlign: 'middle' }}>
      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #ddd', width: '50px' }}>
        {String(index + 1).padStart(2, '0')}
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', width: '220px', textAlign: 'center' }}>
        {editable
          ? <TeamInput team={m.teamA} matchId={m.id} side="teamA" onUpdateMatch={onUpdateMatch} availablePlayers={availablePlayers} allMatches={allMatches} currentMatch={m} />
          : <TeamDisplay team={m.teamA} />}
      </td>

      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '60px' }}>
        <div style={{ width: 34, height: 34, borderRadius: 6, background: '#1F41BB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, margin: '0 auto', color: '#fff' }}>VS</div>
      </td>

      <td style={{ padding: '12px', borderBottom: '1px solid #ddd', width: '220px', textAlign: 'center' }}>
        {editable
          ? <TeamInput team={m.teamB} matchId={m.id} side="teamB" onUpdateMatch={onUpdateMatch} availablePlayers={availablePlayers} allMatches={allMatches} currentMatch={m} />
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
          <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => onDelete(match.id)}><FiTrash2 size={15} /></Button>
        ) : isEditing ? (
          <div className="d-flex gap-1 justify-content-center">
            <Button variant="link" size="sm" className="p-0 text-success"><FiCheck size={15} /></Button>
            <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => onCancelEdit(match.id)}><FiX size={15} /></Button>
          </div>
        ) : (
          <Button variant="link" size="sm" className="p-0" style={{ color: '#1F41BB' }} onClick={() => onEditExisting(match)}><FiEdit2 size={15} /></Button>
        )}
      </td>
    </tr>
  );
};

// ─── AddDateModal — module-level ─────────────────────────────────────────────

const AddDateModal = ({ show, onHide, onConfirm }) => {
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');

  const handleConfirm = () => {
    if (!date) { showError('Please select a date'); return; }
    onConfirm({ date, venue });
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
        <Form.Group className="mb-4">
          <Form.Label style={{ fontWeight: 600, fontSize: 14 }}>Venue</Form.Label>
          <Form.Control type="text" placeholder="e.g. Court 1 - Main Arena" value={venue}
            onChange={e => setVenue(e.target.value)}
            style={{ backgroundColor: 'rgba(204,210,221,0.43)', border: '1px solid #ddd', boxShadow: 'none' }} />
        </Form.Group>
        <Button className="w-100" style={{ backgroundColor: '#1F41BB', border: 'none', fontWeight: 600, padding: 12 }}
          onClick={handleConfirm} disabled={!date}>
          Add Match Row
        </Button>
      </Modal.Body>
    </Modal>
  );
};

// ─── ManagePlayersOffcanvas — module-level ───────────────────────────────────

const ManagePlayersOffcanvas = ({ show, onHide, selectedTournamentId, activeCategory, onPlayersAdded }) => {
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
      if (!p.phoneNumber.trim()) {
        showError(`Player ${i + 1}: Phone number is required`);
        return false;
      }
      if (!/^[6-9]\d{9}$/.test(p.phoneNumber)) {
        showError(`Player ${i + 1}: Invalid phone number`);
        return false;
      }
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

    const payload = {
      tournamentId: selectedTournamentId,
      players: players.map(p => ({
        playerName: p.playerName.trim(),
        phoneNumber: p.phoneNumber.trim(),
        email: p.email.trim(),
        gender: p.gender.toLowerCase()
      }))
    };


    try {
      const response = await ownerAxios.post('/api/tournament-players/addPlayer', payload);
      showSuccess(`${players.length} player(s) created successfully`);

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
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create players');
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
                      onChange={(e) => updatePlayer(index, 'playerName', e.target.value)}
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
          >
            Create {players.length} Player{players.length > 1 ? 's' : ''}
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
  const { tournaments, loadingTournament, schedules, loadingSchedule } = useSelector(s => s.tournament);

  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedRound, setSelectedRound] = useState('regular');
  const [activeTab, setActiveTab] = useState('');
  const [matchesByCategory, setMatchesByCategory] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [showPlayersOffcanvas, setShowPlayersOffcanvas] = useState(false);

  const tournamentsData = Array.isArray(tournaments?.data) ? tournaments.data : [];
  const selectedTournament = tournamentsData.find(t => t._id === selectedTournamentId);
  const categories = selectedTournament?.category || [];

  useEffect(() => { dispatch(getTournaments({ page: 1, limit: 100 })); }, [dispatch]);

  useEffect(() => {
    if (tournamentsData.length > 0 && !selectedTournamentId) setSelectedTournamentId(tournamentsData[0]._id);
  }, [tournamentsData]);

  useEffect(() => {
    if (categories.length > 0) setActiveTab(categories[0].tag);
    else setActiveTab('');
  }, [selectedTournamentId]);

  useEffect(() => {
    if (selectedTournamentId) dispatch(getTournamentSchedules({ tournamentId: selectedTournamentId, roundType: selectedRound }));
  }, [dispatch, selectedTournamentId, selectedRound]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedTournamentId || !activeTab) return;
      setLoadingPlayers(true);
      try {
        const response = await ownerAxios.get('/api/tournament-players/getPlayersByCategoryGender', {
          params: { tournamentId: selectedTournamentId, categoryType: activeTab }
        });
        setAvailablePlayers(response.data?.data || []);
      } catch (error) {
        showError('Failed to load players');
        setAvailablePlayers([]);
      } finally {
        setLoadingPlayers(false);
      }
    };
    fetchPlayers();
  }, [selectedTournamentId, activeTab]);

  const refetchPlayers = useCallback(async () => {
    if (!selectedTournamentId || !activeTab) return;
    setLoadingPlayers(true);
    try {
      const response = await ownerAxios.get('/api/tournament-players/getPlayersByCategoryGender', {
        params: { tournamentId: selectedTournamentId, categoryType: activeTab }
      });
      setAvailablePlayers(response.data?.data || []);
    } catch (error) {
      showError('Failed to load players');
      setAvailablePlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  }, [selectedTournamentId, activeTab]);

  const existingMatches = React.useMemo(() => {
    const map = {};
    if (!Array.isArray(schedules)) return map;
    schedules.forEach(s => {
      const tag = s.categoryType;
      if (!map[tag]) map[tag] = [];
      (s.matches || []).forEach((m, i) => {
        const parseTime = (str) => {
          if (!str) return '09:00';
          const [t, mod] = str.split(' ');
          let [hh, mm] = t.split(':').map(Number);
          if (mod === 'PM' && hh !== 12) hh += 12;
          if (mod === 'AM' && hh === 12) hh = 0;
          return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        };
        map[tag].push({
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
  }, [schedules]);

  const currentNew = (matchesByCategory[activeTab] || []).filter(m => !m.isExisting);
  const currentExisting = existingMatches[activeTab] || [];

  // ── stable callbacks via useCallback ────────────────────────────────────────

  const handleAddDate = useCallback(({ date, venue }) => {
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), { ...EMPTY_MATCH(Date.now()), date, venue, availablePlayers }],
    }));
    setShowModal(false);
  }, [activeTab, availablePlayers]);

  const onUpdateMatch = useCallback((id, updater) => {
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || []).map(m => m.id === id ? updater(m) : m),
    }));
  }, [activeTab]);

  const onDelete = useCallback((id) => {
    setMatchesByCategory(prev => ({ ...prev, [activeTab]: (prev[activeTab] || []).filter(m => m.id !== id) }));
  }, [activeTab]);

  const onEditExisting = useCallback((match) => {
    setEditingId(match.id);
    setMatchesByCategory(prev => {
      const existing = prev[activeTab] || [];
      if (!existing.find(m => m.id === match.id)) return { ...prev, [activeTab]: [...existing, { ...match }] };
      return prev;
    });
  }, [activeTab]);

  const onCancelEdit = useCallback((id) => {
    setEditingId(null);
    setMatchesByCategory(prev => ({ ...prev, [activeTab]: (prev[activeTab] || []).filter(m => !(m.id === id && m.isExisting)) }));
  }, [activeTab]);

  const handleSave = async () => {
    if (!selectedTournamentId) { showError('No tournament selected'); return; }
    if (currentNew.length === 0) { showError('No new matches to save'); return; }
    for (let i = 0; i < currentNew.length; i++) {
      const m = currentNew[i];
      if (!m.date) { showError(`Match ${i + 1}: date is required`); return; }
      if (!m.teamA.teamName || !m.teamB.teamName) { showError(`Match ${i + 1}: both team names are required`); return; }
      for (let j = 0; j < 2; j++) {
        if (!m.teamA.players[j]?.playerName) { showError(`Match ${i + 1} Team A: player ${j + 1} name required`); return; }
        if (!m.teamB.players[j]?.playerName) { showError(`Match ${i + 1} Team B: player ${j + 1} name required`); return; }
        const phoneA = m.teamA.players[j]?.phoneNumber;
        const phoneB = m.teamB.players[j]?.phoneNumber;
        if (phoneA && (!/^[6-9]/.test(phoneA) || phoneA.length !== 10)) { showError(`Match ${i + 1} Team A player ${j + 1}: invalid phone number`); return; }
        if (phoneB && (!/^[6-9]/.test(phoneB) || phoneB.length !== 10)) { showError(`Match ${i + 1} Team B player ${j + 1}: invalid phone number`); return; }
      }
    }
    const payload = {
      tournamentId: selectedTournamentId,
      categoryType: activeTab,
      roundType: selectedRound,
      date: currentNew[0].date,
      venue: currentNew[0].venue,
      matches: currentNew.map((m, i) => ({
        matchNo: i + 1,
        startTime: convertTo12Hour(m.time),
        endTime: convertTo12Hour(m.endTime || calcEndTime(m.time, m.duration)),
        duration: m.duration,
        time: convertTo12Hour(m.time),
        teamA: { teamName: m.teamA.teamName, players: m.teamA.players.map(p => ({ playerId: p.playerId, playerName: p.playerName, phoneNumber: p.phoneNumber })) },
        teamB: { teamName: m.teamB.teamName, players: m.teamB.players.map(p => ({ playerId: p.playerId, playerName: p.playerName, phoneNumber: p.phoneNumber })) },
      })),
    };
    const result = await dispatch(saveTournamentSchedule(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setMatchesByCategory(prev => ({ ...prev, [activeTab]: [] }));
      dispatch(getTournamentSchedules({ tournamentId: selectedTournamentId, roundType: selectedRound }));
    }
  };

  return (
    <Container fluid className="p-4 pt-0 bg-white border h-100">
      <Row className="mb-0">
        <Col className="py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              {ROUNDS.map(({ key, label }) => (
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
              <button
                className="export-btn"
                onClick={() => setShowPlayersOffcanvas(true)}
                disabled={!selectedTournamentId || !activeTab}
                title="Add players to this category"
              >
                <FiUsers size={15} /> Manage Players
              </button>
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
                <Nav.Item key={cat.tag}>
                  <Nav.Link
                    eventKey={cat.tag}
                    className={activeTab === cat.tag ? 'active' : ''}
                    style={{ color: activeTab === cat.tag ? '#1F41BB' : '#666' }}
                  >
                    {cat.tag}
                    {(existingMatches[cat.tag] || []).length > 0 && (
                      <span className="fw-semibold ms-1" style={{ color: '#1F41BB' }}>({(existingMatches[cat.tag] || []).length})</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
              ))}
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
                        setMatchesByCategory(prev => ({
                          ...prev,
                          [activeTab]: [...(prev[activeTab] || []), { ...EMPTY_MATCH(Date.now()), date: last?.date || '', venue: last?.venue || '', availablePlayers }]
                        }));
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
                        {currentNew.map((m, i) => (
                          <MatchRow key={m.id} match={m} index={i} editable isEditing={false}
                            onUpdateMatch={onUpdateMatch} onDelete={onDelete}
                            onCancelEdit={onCancelEdit} onEditExisting={onEditExisting}
                            availablePlayers={availablePlayers} allMatches={[...currentNew, ...currentExisting]} />
                        ))}
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
                            availablePlayers={availablePlayers} allMatches={[...currentNew, ...currentExisting]} />
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

      <AddDateModal show={showModal} onHide={() => setShowModal(false)} onConfirm={handleAddDate} />
      <ManagePlayersOffcanvas
        show={showPlayersOffcanvas}
        onHide={() => setShowPlayersOffcanvas(false)}
        selectedTournamentId={selectedTournamentId}
        activeCategory={activeTab}
        onPlayersAdded={refetchPlayers}
      />
    </Container>
  );
};

export default TournamentSchedule;
