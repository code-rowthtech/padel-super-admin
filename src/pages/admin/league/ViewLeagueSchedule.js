import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Table } from 'react-bootstrap';
import { Tabs, Tab } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  getAllSchedules,
  exportLeagueSchedulesPDF,
  getLeagueById,
  createLivestream,
  createQuickPoint,
  getQuickPoints,
  updateQuickPoint,
} from '../../../redux/admin/league/thunk';
import { clearCurrentLeague } from '../../../redux/admin/league/slice';
import { IoCopyOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DataLoading } from '../../../helpers/loading/Loaders';
import PointsTable from './PointsTable';

const VSMatchCard = ({ match, category, roundType, matchId, isLive, onClick, scheduleId }) => {
  const [copied, setCopied] = React.useState(false);

  const getPlayerAvatar = (player) => {
    if (player?.avatar) return player.avatar;
    const name = player?.playerName || player?.name || 'P';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=32&background=e3f2fd&color=1976d2`;
  };

  const getTeamPlayers = (team) => {
    if (!team?.players?.length) return [];
    return team.players.slice(0, 2); // Show max 2 players
  };

  const handleCopyScheduleId = (e) => {
    e.stopPropagation();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(matchId);
    } else {
      const el = document.createElement('textarea');
      el.value = matchId;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClick}
      className="mb-3 shadow-sm rounded-3 position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(100.97deg, rgb(253, 253, 255) 0%, rgb(158, 186, 255) 317.27%)',
        padding: '30px 16px 16px 16px',
        border: isLive ? '1px solid #22c55e44' : '1px solid #1F41BB1A',
        height: '10.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="vs-date-badge" >
        {match?.startTime}
      </div>
      <Row className="align-items-center" style={{ flex: 1 }}>
        {/* Team A */}
        <Col xs={4} className="text-start">
          <div className="fw-bold text-capitalize mb-1" style={{ fontSize: '14px', color: '#1F41BB' }}>
            {match?.teamA?.clubId?.clubName || 'Team A'}
          </div>
          <div className="d-flex flex-column gap-1">
            {getTeamPlayers(match.teamA).map((player, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <img
                  src={getPlayerAvatar(player)}
                  alt={player?.playerName || player?.name || 'Player'}
                  className="rounded-circle"
                  style={{ width: '24px', height: '24px' }}
                />
                <span className='text-capitalize' style={{ fontSize: '12px' }}>
                  {player?.playerName || player?.name || 'Player'}
                </span>
              </div>
            ))}
          </div>
        </Col>

        {/* Center - Date and VS */}
        <Col xs={4} className="text-center">
          {isLive && (
            <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e',
                display: 'inline-block', animation: 'livePulse 1.2s ease-in-out infinite'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e', letterSpacing: '0.5px' }}>LIVE</span>
            </div>
          )}
          <div
            className="d-flex align-items-center justify-content-center mx-auto"
            style={{
              width: "40px",
              height: "40px",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "2px",
              color: "transparent",
              WebkitTextStroke: "1.5px #1F41BB",
            }}

          >
            VS
          </div>
          <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {match?.score && (match.score.teamA?.sets > 0 || match.score.teamB?.sets > 0) && (
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold" style={{ fontSize: '16px', color: match.winner === 'teamA' ? '#22c55e' : '#1F41BB' }}>
                  {match.score.teamA?.sets || 0}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>-</span>
                <span className="fw-bold" style={{ fontSize: '16px', color: match.winner === 'teamB' ? '#22c55e' : '#1F41BB' }}>
                  {match.score.teamB?.sets || 0}
                </span>
              </div>
            )}
          </div>
          <small className='fw-semibold text-nowrap' style={{ fontSize: '0.7rem' }}>{category} - <span className='text-capitalize'>{roundType}</span></small>
          {matchId && (
            <div
              className="  d-flex align-items-center gap-1"
              style={{ top: '8px', right: '8px', fontSize: '10px', color: '#6b7280', padding: '4px 8px', borderRadius: '4px' }}
            >
              <span style={{ fontFamily: 'monospace', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {matchId}
              </span>
              <IoCopyOutline
                size={12}
                style={{ cursor: 'pointer', color: copied ? '#22c55e' : '#6b7280', flexShrink: 0 }}
                onClick={handleCopyScheduleId}
                title="Copy Schedule ID"
              />
            </div>
          )}
        </Col>

        {/* Team B */}
        <Col xs={4} className="text-end">
          <div className="fw-bold text-capitalize mb-1" style={{ fontSize: '14px', color: '#1F41BB' }}>
            {match?.teamB?.clubId?.clubName || 'Team B'}
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            {getTeamPlayers(match.teamB).map((player, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <span className='text-capitalize' style={{ fontSize: '12px' }}>
                  {player?.playerName || player?.name || 'Player'}
                </span>
                <img
                  src={getPlayerAvatar(player)}
                  alt={player?.playerName || player?.name || 'Player'}
                  className="rounded-circle"
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00.000Z'));
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateUTC = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const todayUTC = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const tomorrowUTC = new Date(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate());

  if (dateUTC.getTime() === todayUTC.getTime()) return 'Today';
  if (dateUTC.getTime() === tomorrowUTC.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
};

// Renders a date group: one date heading + all matches across all schedule entries in one flat Row
const DateSection = ({ dateGroup, onMatchClick }) => {
  const allMatchCols = (dateGroup.schedules || []).flatMap((schedule) =>
    (schedule.matches || []).map((match) => ({
      match,
      schedule,
      category: schedule.categoryType,
      roundType: schedule.roundType,
      venue: schedule.venue,
      isLive: schedule.matchStatus === 'live' || match.status === 'live',
      key: match._id,
    }))
  );

  return (
    <div className="mb-4">
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <h6 className="mb-0 fw-bold" style={{ color: '#2c3e50', fontSize: '16px' }}>
            {formatDate(dateGroup.date)}
          </h6>
          {dateGroup.schedules?.[0]?.leagueId?.leagueName && (
            <span className="fw-medium text-muted d-none d-sm-inline" style={{ fontSize: '12px' }}>
              {dateGroup.schedules[0].leagueId.leagueName}
            </span>
          )}
        </div>
      </div>

      <Row className="g-2">
        {allMatchCols.map(({ match, schedule, category, roundType, venue, isLive, key }) => (
          <Col key={key} xs={12} sm={6} md={4} lg={3} xl={3}>
            <VSMatchCard match={match} category={category} roundType={roundType} venue={venue} isLive={isLive} scheduleId={schedule._id} matchId={schedule?.matchId} onClick={() => onMatchClick(match, schedule)} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

const QuickiePointTab = ({ leagueId }) => {
  const dispatch = useDispatch();
  const { schedules, loadingSchedules, quickPoints, loadingQuickPoints } = useSelector(state => state.league);
  const [formData, setFormData] = useState({ date: '', matchId: '', teamId: '', points: 1 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (leagueId) {
      dispatch(getAllSchedules({ leagueId }));
      dispatch(getQuickPoints(leagueId));
    }
  }, [dispatch, leagueId]);

  const schedulesData = Array.isArray(schedules?.data) ? schedules.data : Array.isArray(schedules) ? schedules : [];

  const dateOptions = useMemo(() => {
    const seen = new Set();
    return schedulesData.reduce((acc, s) => {
      if (s.date && !seen.has(s.date)) { seen.add(s.date); acc.push(s.date); }
      return acc;
    }, []);
  }, [schedulesData]);

  const matchesForDate = useMemo(() => {
    if (!formData.date) return [];
    const dateGroup = schedulesData.find(s => s.date === formData.date);
    if (!dateGroup) return [];
    return (dateGroup.schedules || []).flatMap(schedule =>
      (schedule.matches || []).map(match => ({
        matchId: match._id,
        label: `${match.teamA?.clubId?.clubName || 'TBD'} vs ${match.teamB?.clubId?.clubName || 'TBD'} · ${schedule.roundType.charAt(0).toUpperCase() + schedule.roundType.slice(1)} @ ${schedule.playTime || 'TBD'}`,
        teamA: match.teamA,
        teamB: match.teamB,
        scheduleId: schedule._id,
        categoryType: schedule.categoryType,
        roundType: schedule.roundType,
      }))
    );
  }, [formData.date, schedulesData]);


  const teamsForMatch = useMemo(() => {
    if (!formData.matchId) return [];
    const match = matchesForDate.find(m => m.matchId === formData.matchId);
    if (!match) return [];
    const toTeam = (team, fallback) => ({
      _id: team._id,
      clubId: team.clubId?._id,
      clubType: team.clubId?.clubName || '',
      teamName: team.teamName || fallback,
      players: (team.players || []).map(p => ({ playerId: p.playerId, playerName: p.playerName || p.name })),
    });
    const teams = [];
    if (match.teamA?._id) teams.push(toTeam(match.teamA, 'Team A'));
    if (match.teamB?._id) teams.push(toTeam(match.teamB, 'Team B'));
    return teams;
  }, [formData.matchId, matchesForDate]);

  const handleDateChange = (e) => setFormData({ date: e.target.value, matchId: '', teamId: '', points: 1 });
  const handleMatchChange = (e) => setFormData(prev => ({ ...prev, matchId: e.target.value, teamId: '', points: 1 }));

  const handleSubmit = () => {
    const selectedMatch = matchesForDate.find(m => m.matchId === formData.matchId);
    const selectedTeam = teamsForMatch.find(t => t._id === formData.teamId);
    const payload = {
      leagueId,
      clubId: selectedTeam?.clubId,
      scheduleId: selectedMatch?.scheduleId,
      matchId: formData.matchId,
      quickPoint: Number(formData.points),
      date: formData.date,
      teamId: selectedTeam?._id,
      team: selectedTeam ? { clubId: selectedTeam.clubId, clubType: selectedTeam.clubType, teamName: selectedTeam.teamName, players: selectedTeam.players } : undefined,
    };
    if (editingId) {
      dispatch(updateQuickPoint({ id: editingId, ...payload })).then(res => {
        if (!res.error) { setEditingId(null); setFormData({ date: '', matchId: '', teamId: '', points: 1 }); }
      });
    } else {
      dispatch(createQuickPoint(payload)).then(res => {
        if (!res.error) setFormData(prev => ({ ...prev, teamId: '', points: 1 }));
      });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      date: item.date,
      matchId: item.matchId || '',
      teamId: item.teamId || item.team?.teamId || item.team?._id || '',
      points: item.quickPoint,
    });
  };


  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ date: '', matchId: '', teamId: '', points: 1 });
  };

  return (
    <div className="py-2">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="align-items-end g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Date</Form.Label>
                <Form.Select size="sm" value={formData.date} onChange={handleDateChange} disabled={loadingSchedules}>
                  <option value="">{loadingSchedules ? 'Loading...' : 'Select Date'}</option>
                  {dateOptions.map(date => (
                    <option key={date} value={date}>{formatDate(date)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Match</Form.Label>
                <Form.Select size="sm" value={formData.matchId} onChange={handleMatchChange} disabled={!formData.date && !editingId}>
                  <option value="">Select Match</option>
                  {matchesForDate.map(m => (
                    <option key={m.matchId} value={m.matchId}>{m.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Team</Form.Label>
                <Form.Select size="sm" value={formData.teamId} onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))} disabled={!formData.matchId && !editingId}>
                  <option value="">Select Team</option>
                  {teamsForMatch.map(t => (
                    <option key={t._id} value={t._id}>{t.teamName} - {t.clubType} ({t.players.map(p => p.playerName).join(' & ')})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Points</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  min={1}
                  disabled={!formData.teamId && !editingId}
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                  onBlur={(e) => { const val = Number(e.target.value); if (!val || val < 1) setFormData(prev => ({ ...prev, points: 1 })); }}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex gap-2">
              <Button variant="primary" size="sm" className="w-100" onClick={handleSubmit} disabled={!formData.teamId || loadingQuickPoints}>
                {loadingQuickPoints ? '...' : editingId ? 'Update' : 'Add Point'}
              </Button>
              {editingId && (
                <Button variant="outline-secondary" size="sm" onClick={handleCancelEdit}>Cancel</Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <div className="bg-white shadow-sm rounded p-2 p-md-3">
          <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'auto' }}>
            <Table responsive borderless size="sm" className="custom-table">
              <thead>
                <tr className="text-center">
                  <th>Sr No.</th>
                  <th>Date</th>
                  <th>Team</th>
                  <th>Club</th>
                  <th>Points</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingQuickPoints ? (
                  <tr><td colSpan="6" className="text-center py-4"><DataLoading /></td></tr>
                ) : quickPoints.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No quickie points added yet</td></tr>
                ) : (
                  quickPoints.map((item, idx) => (
                    <tr key={item._id} className="table-data border-bottom align-middle text-center">
                      <td>{idx + 1}</td>
                      <td>{formatDate(item.date)}</td>
                      <td className="text-truncate" style={{ maxWidth: '150px' }}>{item.team?.teamName}</td>
                      <td className="text-truncate" style={{ maxWidth: '150px' }}>{item.team?.clubType}</td>
                      <td className="fw-bold text-primary">{item.quickPoint}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <FaEdit
                            size={15}
                            style={{ cursor: 'pointer', color: '#6b7280' }}
                            onClick={() => handleEdit(item)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
};

const TournamentBracket = () => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="text-center py-5">
          <div style={{ fontSize: '48px', color: '#dee2e6', marginBottom: '16px' }}>
            🏆
          </div>
          <h5 className="mb-2">Tournament Bracket</h5>
          <p className="text-muted mb-0">
            Tournament bracket visualization coming soon...
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

const ViewLeagueSchedule = () => {
  const dispatch = useDispatch();
  const { leagueId } = useParams();
  const { schedules, loadingSchedules, loadingExport, currentLeague, loadingLivestream } = useSelector(state => state.league);
  const [activeTab, setActiveTab] = useState(0);
  const [livestreamModal, setLivestreamModal] = useState({ show: false, match: null });
  const [livestreamForm, setLivestreamForm] = useState({ streamKey: '' });
  const [copied, setCopied] = useState(false);
  const [filters, setFilters] = useState({
    categoryType: '',
    roundType: '',
    startDate: null,
    endDate: null,
    matchStatus: ''
  });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    leagueId: leagueId,
    venueClubId: '',
    clubId: '',
    startDate: '',
    endDate: ''
  });

  // Reset state when leagueId changes
  useEffect(() => {
    setActiveTab(0);
    setFilters({
      categoryType: '',
      roundType: '',
      startDate: null,
      endDate: null,
      matchStatus: ''
    });
    setShowExportDropdown(false);
    setExportFilters({
      leagueId: leagueId,
      venueClubId: '',
      clubId: '',
      startDate: '',
      endDate: ''
    });
  }, [leagueId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearCurrentLeague());
    };
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    if (!currentLeague?.clubs?.length) return [];
    const categories = new Set();
    currentLeague.clubs.forEach(club => {
      // Handle both nested clubId and direct club structure
      const clubData = club?.clubId || club;
      clubData?.participationLimit?.categoryLimits?.forEach(limit => {
        if (limit.categoryType) categories.add(limit.categoryType);
      });

      // Also check if participationLimit is directly on the club object in currentLeague scope
      club.participationLimit?.categoryLimits?.forEach(limit => {
        if (limit.categoryType) categories.add(limit.categoryType);
      });
    });
    return Array.from(categories);
  }, [currentLeague?.clubs]);

  const roundTypeOptions = useMemo(() => {
    if (!currentLeague?.matchRules) return [];
    const rounds = [];
    if (currentLeague.matchRules.regularRound?.status) rounds.push('regular');
    if (currentLeague.matchRules.quarterfinal?.status) rounds.push('quarterfinal');
    if (currentLeague.matchRules.semifinal?.status) rounds.push('semifinal');
    if (currentLeague.matchRules.final?.status) rounds.push('final');
    return rounds;
  }, [currentLeague?.matchRules]);

  useEffect(() => {
    if (leagueId) {
      dispatch(clearCurrentLeague());
      dispatch(getLeagueById(leagueId));
    }
  }, [leagueId, dispatch])

  useEffect(() => {
    const params = { leagueId };
    if (filters.categoryType) params.categoryType = filters.categoryType;
    if (filters.roundType) params.roundType = filters.roundType;
    if (filters.matchStatus) params.matchStatus = filters.matchStatus;
    const hasStartDate = filters.startDate;
    const hasEndDate = filters.endDate;

    if (hasStartDate && hasEndDate) {
      const startYear = filters.startDate.getFullYear();
      const startMonth = String(filters.startDate.getMonth() + 1).padStart(2, '0');
      const startDay = String(filters.startDate.getDate()).padStart(2, '0');
      params.startDate = `${startYear}-${startMonth}-${startDay}`;
      const endYear = filters.endDate.getFullYear();
      const endMonth = String(filters.endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(filters.endDate.getDate()).padStart(2, '0');
      params.endDate = `${endYear}-${endMonth}-${endDay}`;
      dispatch(getAllSchedules(params));
    } else if (!hasStartDate && !hasEndDate) {
      dispatch(getAllSchedules(params));
    }
  }, [dispatch, leagueId, filters]);

  const handleMatchClick = (match, schedule) => {
    setLivestreamModal({ show: true, match, schedule });
    setLivestreamForm({ streamKey: schedule?.streamKey || '' });
  };

  const handleCopy = (text) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLivestreamSubmit = () => {
    dispatch(createLivestream({
      scheduleId: livestreamModal.schedule?._id,
      streamKey: livestreamForm.streamKey,
    })).then((res) => {
      if (!res.error) {
        setLivestreamModal({ show: false, match: null, schedule: null });
        dispatch(getAllSchedules({ leagueId }));
      }
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExportSubmit = () => {
    dispatch(exportLeagueSchedulesPDF(exportFilters));
    setShowExportDropdown(false);
  };

  const hasActiveFilters = filters.categoryType || filters.roundType || filters.startDate || filters.endDate || filters.matchStatus;

  const schedulesData = Array.isArray(schedules?.data)
    ? schedules.data
    : Array.isArray(schedules)
      ? schedules
      : [];

  return (
    <div style={{ backgroundColor: 'white', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container fluid className="p-3 p-md-4 pb-md-0" style={{ flex: '0 0 auto' }}>
        {/* Header with Tabs and Filters - Fixed */}
        <Row className="mb-4">
          <Col>
            <div className="border-0 ">
              <div className="p-0">
                <div className="d-flex justify-content-between align-items-center p-0">
                  <div>
                    <Tabs
                      value={activeTab}
                      onChange={(_, v) => setActiveTab(v)}
                      indicatorColor="primary"
                      textColor="primary"
                      sx={{
                        "& .MuiTab-root": {
                          fontSize: { xs: "13px", sm: "14px", md: "15px" },
                          fontWeight: "600",
                          textTransform: "none",
                          padding: { xs: "8px 16px", md: "12px 24px" },
                          minHeight: "auto"
                        },
                      }}
                    >
                      <Tab label={`Schedules (${schedulesData.length})`} />
                      <Tab label="Points Table" />
                      <Tab label="Quickie Point" />
                      {/* <Tab label="Bracket" /> */}
                    </Tabs>
                  </div>
                  {activeTab === 0 && (
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Select
                        size="sm"
                        value={filters.matchStatus}
                        onChange={(e) => handleFilterChange('matchStatus', e.target.value)}
                        style={{ width: '120px', fontSize: '12px' }}
                      >
                        <option value="">All</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live</option>
                        <option value="finished">Finished</option>
                      </Form.Select>

                      <Form.Select
                        size="sm"
                        value={filters.categoryType}
                        onChange={(e) => handleFilterChange('categoryType', e.target.value)}
                        style={{ width: '140px', fontSize: '12px' }}
                      >
                        <option value="">All Categories</option>
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>

                      <Form.Select
                        size="sm"
                        value={filters.roundType}
                        onChange={(e) => handleFilterChange('roundType', e.target.value)}
                        style={{ width: '120px', fontSize: '12px' }}
                      >
                        <option value="">All Rounds</option>
                        {roundTypeOptions.map(round => (
                          <option key={round} value={round}>
                            {round.charAt(0).toUpperCase() + round.slice(1)}
                          </option>
                        ))}
                      </Form.Select>
                      <DatePicker
                        selected={filters.startDate}
                        onChange={(dates) => {
                          const [start, end] = dates;
                          setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
                        }}
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        selectsRange
                        placeholderText="Select date range"
                        className="form-control form-control-sm"
                        style={{ fontSize: '12px', width: '180px' }}
                        dateFormat="yyyy-MM-dd"
                      />
                      {hasActiveFilters && (
                        <button
                          className="btn btn-outline-danger text-danger fw-semibold btn-sm"
                          onClick={() => setFilters({ categoryType: '', roundType: '', startDate: null, endDate: null, matchStatus: '' })}
                          style={{ fontSize: '12px' }}
                        >
                          Clear
                        </button>
                      )}

                      <div className="position-relative">
                        <Button
                          className="export-btn btn-primary btn-sm"
                          onClick={handleExport}
                          disabled={loadingExport}
                          style={{ fontSize: '12px' }}
                        >
                          {loadingExport ? 'Exporting...' : 'Export Schedule'}
                        </Button>
                        {showExportDropdown && (
                          <div className="position-absolute bg-white border rounded shadow-sm p-3" style={{ top: '100%', right: 0, zIndex: 1000, minWidth: '300px' }}>
                            <div className="mb-2">
                              <label className="form-label" style={{ fontSize: '12px' }}>Venue Club ID</label>
                              <select
                                className="form-control form-control-sm"
                                value={exportFilters.venueClubId}
                                onChange={(e) => setExportFilters(prev => ({ ...prev, venueClubId: e.target.value }))}
                                style={{ fontSize: '12px' }}
                              >
                                <option value="">Select Venue Club</option>
                                {currentLeague?.clubs?.map(club => {
                                  // Handle both data structures: nested clubId object or direct club object
                                  const clubData = club?.clubId || club;
                                  const clubId = clubData?._id || clubData?.clubId;
                                  const clubName = clubData?.clubName || clubData?.name;
                                  return (
                                    <option key={clubId} value={clubId}>{clubName}</option>
                                  );
                                })}
                              </select>
                            </div>
                            <div className="mb-2">
                              <label className="form-label" style={{ fontSize: '12px' }}>Club ID</label>
                              <select
                                className="form-control form-control-sm"
                                value={exportFilters.clubId}
                                onChange={(e) => setExportFilters(prev => ({ ...prev, clubId: e.target.value }))}
                                style={{ fontSize: '12px' }}
                              >
                                <option value="">Select Club</option>
                                {currentLeague?.clubs?.map(club => {
                                  // Handle both data structures: nested clubId object or direct club object
                                  const clubData = club?.clubId || club;
                                  const clubId = clubData?._id || clubData?.clubId;
                                  const clubName = clubData?.clubName || clubData?.name;
                                  return (
                                    <option key={clubId} value={clubId}>{clubName}</option>
                                  );
                                })}
                              </select>
                            </div>
                            <div className="mb-2">
                              <label className="form-label" style={{ fontSize: '12px' }}>Start Date</label>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={exportFilters.startDate}
                                onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                style={{ fontSize: '12px' }}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label" style={{ fontSize: '12px' }}>End Date</label>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={exportFilters.endDate}
                                onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                style={{ fontSize: '12px' }}
                              />
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={handleExportSubmit}
                                disabled={loadingExport}
                                style={{ fontSize: '12px' }}
                              >
                                Export
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setShowExportDropdown(false)}
                                style={{ fontSize: '12px' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Scrollable Content */}
      <div style={{ flex: '1 1 auto', overflow: 'auto' }}>
        <Container fluid className="px-3 px-md-4">
          <Row>
            <Col>
              {activeTab === 0 && (
                <div>
                  {loadingSchedules ? (
                    <Card className="text-center py-5 border-0 shadow-sm">
                      <Card.Body>
                        <DataLoading />
                        <div className="mt-3 text-muted">Loading match schedules...</div>
                      </Card.Body>
                    </Card>
                  ) : schedulesData.length > 0 ? (
                    <div>
                      {schedulesData.map((dateGroup, index) => (
                        <DateSection
                          key={dateGroup.date || index}
                          dateGroup={dateGroup}
                          onMatchClick={handleMatchClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center py-5 shadow-none">
                      <Card.Body>
                        <h5 className="mb-2">No Matches Scheduled</h5>
                        <p className="text-muted mb-0">
                          There are no match schedules available for this league yet.
                        </p>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 1 && (
                <PointsTable leagueId={leagueId} />
              )}

              {activeTab === 2 && (
                <QuickiePointTab leagueId={leagueId} />
              )}

              {activeTab === 3 && <TournamentBracket />}
            </Col>
          </Row>
        </Container>
      </div>

      <Modal show={livestreamModal.show} onHide={() => setLivestreamModal({ show: false, match: null, schedule: null })} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f3f4f6', padding: '1.25rem 1.5rem', background: '#f9fafb', borderRadius: '16px 16px 0 0' }}>
          <Modal.Title style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Setup Livestream
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Scoreboard URL
            </Form.Label>
            {!livestreamModal.schedule?.scoreboardUrl ? (
              <div className="alert alert-info mb-0" style={{ fontSize: '13px', padding: '10px' }}>
                The scoreboard URL will be available once the match begins.
              </div>
            ) : (
              <div className="input-group">
                <Form.Control
                  value={livestreamModal.schedule?.scoreboardUrl || ''}
                  readOnly
                  style={{ fontSize: '13px', background: '#f9fafb' }}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy scoreboard URL"
                  onClick={() => handleCopy(livestreamModal.schedule?.scoreboardUrl || '')}
                  style={{ transition: 'color 0.2s', color: copied ? '#22c55e' : undefined }}
                >
                  {copied
                    ? <IoCheckmarkOutline size={16} color="#22c55e" />
                    : <IoCopyOutline size={16} />}
                </button>
              </div>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Stream Key <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              value={livestreamForm.streamKey}
              onChange={(e) => setLivestreamForm(prev => ({ ...prev, streamKey: e.target.value }))}
              placeholder="Enter your stream key"
              style={{ fontSize: '14px' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.5rem', background: '#f9fafb', borderRadius: '0 0 16px 16px' }}>
          <Button variant="secondary" onClick={() => setLivestreamModal({ show: false, match: null, schedule: null })} style={{ fontSize: '13px', fontWeight: 500 }}>Cancel</Button>
          <Button variant="primary" onClick={handleLivestreamSubmit} disabled={loadingLivestream || !livestreamForm.streamKey} style={{ fontSize: '13px', fontWeight: 500 }}>
            {loadingLivestream ? 'Submitting...' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewLeagueSchedule;