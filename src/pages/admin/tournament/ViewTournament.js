import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Button, Offcanvas, Modal } from 'react-bootstrap';
import { Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentById, getTournamentSchedules, getPlayersByCategoryGender, addTournamentPlayers } from '../../../redux/admin/tournament/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';
import { ownerAxios } from '../../../helpers/api/apiCore';
import { showError, showSuccess } from '../../../helpers/Toast';
import PlayerImportResultModal from '../../../components/PlayerImportResultModal';
import { IoCopyOutline, IoCheckmarkOutline } from 'react-icons/io5';

const VSMatchCard = ({ match, category, venue, scheduleId, matchId, isLive, onClick }) => {
  const [copied, setCopied] = React.useState(false);

  const getTeamPlayers = (team) => {
    if (!team?.players?.length) return [];
    return team.players.slice(0, 2);
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
      <div className="vs-date-badge">
        {match?.startTime || match?.time}
      </div>
      <Row className="align-items-center" style={{ flex: 1 }}>
        {/* Team A */}
        <Col xs={4} className="text-start">
          <div className="fw-bold text-capitalize mb-1" style={{ fontSize: '14px', color: '#1F41BB' }}>
            {match?.teamA?.teamName || 'Team A'}
          </div>
          <div className="d-flex flex-column gap-1">
            {getTeamPlayers(match.teamA).map((player, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <span className='text-capitalize' style={{ fontSize: '12px' }}>
                  {player?.playerName || 'Player'}
                </span>
              </div>
            ))}
          </div>
        </Col>

        {/* Center - VS */}
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
          <small className='fw-semibold text-nowrap' style={{ fontSize: '0.7rem' }}>{category}</small>
          {matchId && (
            <div
              className="d-flex align-items-center gap-1"
              style={{ fontSize: '10px', color: '#6b7280', padding: '4px 8px', borderRadius: '4px' }}
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
            {match?.teamB?.teamName || 'Team B'}
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            {getTeamPlayers(match.teamB).map((player, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <span className='text-capitalize' style={{ fontSize: '12px' }}>
                  {player?.playerName || 'Player'}
                </span>
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

const DateSection = ({ dateGroup, tournamentName, onMatchClick }) => {
  return (
    <div className="mb-4">
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <h6 className="mb-0 fw-bold" style={{ color: '#2c3e50', fontSize: '16px' }}>
            {formatDate(dateGroup.date)}
          </h6>
          {tournamentName && (
            <span className="fw-medium text-muted d-none d-sm-inline" style={{ fontSize: '12px' }}>
              {tournamentName}
            </span>
          )}
        </div>
      </div>

      <Row className="g-2">
        {dateGroup.schedules.map((schedule) => (
          schedule.matches?.map((match) => (
            <Col key={match._id} xs={12} sm={6} md={4} lg={3} xl={3}>
              <VSMatchCard
                match={match}
                category={schedule.categoryType}
                venue={schedule.venue}
                scheduleId={schedule._id}
                matchId={schedule?.matchId}
                isLive={schedule.matchStatus === 'live' || match.status === 'live'}
                onClick={() => onMatchClick(match, schedule)}
              />
            </Col>
          ))
        ))}
      </Row>
    </div>
  );
};

const ROUND_CONFIG = {
  regularRound: { key: 'regular', label: 'Regular' },
  quarterfinal: { key: 'quarterfinal', label: 'Quarter-Final' },
  semifinal: { key: 'semifinal', label: 'Semi-Final' },
  final: { key: 'final', label: 'Final' },
};

const SchedulesTab = ({ tournamentId, categories, selectedRound, categoryId, onMatchClick }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tournamentName, setTournamentName] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, [tournamentId, selectedRound, categoryId]);

  const fetchSchedules = async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const params = { tournamentId, roundType: selectedRound };
      if (categoryId) {
        const selectedCategory = categories.find(cat => cat._id === categoryId);
        if (selectedCategory) {
          params.categoryType = selectedCategory.categoryType;
          params.tag = selectedCategory.tag;
        }
      }
      const response = await ownerAxios.get('/api/tournament-schedules/getSchedules', {
        params
      });
      const data = response.data?.data || [];
      setSchedules(data);
      if (data.length > 0 && data[0].tournamentId?.tournamentName) {
        setTournamentName(data[0].tournamentId.tournamentName);
      }
    } catch (error) {
      showError('Failed to load schedules');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Group schedules by date
  const groupedByDate = React.useMemo(() => {
    const groups = {};
    schedules.forEach(schedule => {
      const date = schedule.date?.split('T')[0];
      if (!date) return;
      if (!groups[date]) {
        groups[date] = { date, schedules: [] };
      }
      groups[date].schedules.push(schedule);
    });
    return Object.values(groups).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [schedules]);

  return (
    <div className="py-2">
      {/* Schedules Content */}
      {loading ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <DataLoading />
            <div className="mt-3 text-muted">Loading schedules...</div>
          </Card.Body>
        </Card>
      ) : groupedByDate.length > 0 ? (
        <div>
          {groupedByDate.map((dateGroup, index) => (
            <DateSection
              key={dateGroup.date || index}
              dateGroup={dateGroup}
              tournamentName={tournamentName}
              onMatchClick={onMatchClick}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-5 shadow-none">
          <Card.Body>
            <h5 className="mb-2">No Schedules Found</h5>
            <p className="text-muted mb-0">
              There are no schedules for this selection yet.
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

const PlayersTab = ({ tournamentId, filters, handleFilterChange, clearFilters, hasActiveFilters, categories, refreshTrigger }) => {
  const dispatch = useDispatch();
  const { players, loadingPlayers, playersPagination } = useSelector(state => state.tournament);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!tournamentId) return;
    const params = { tournamentId, page: currentPage, limit: itemsPerPage };

    // Find the selected category from filters using _id
    if (filters.categoryType) {
      const selectedCategory = categories.find(cat => cat._id === filters.categoryType);
      if (selectedCategory) {
        params.categoryType = selectedCategory.categoryType;

        // Add gender based on tag
        if (selectedCategory.tag === "Men's Doubles") {
          params.gender = "Male";
        } else if (selectedCategory.tag === "Women's Doubles") {
          params.gender = "Female";
        }
        // For Mixed Doubles and Hybrid, don't send gender (means all)
      }
    }

    // Override with explicit gender filter if provided
    if (filters.gender) {
      params.gender = filters.gender;
    }

    dispatch(getPlayersByCategoryGender(params));
  }, [tournamentId, filters, refreshTrigger, currentPage, dispatch, categories]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalItems = playersPagination?.total || 0;
  const totalPages = playersPagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="py-2">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          {/* Players Table */}
          <div style={{ position: 'relative', maxHeight: 'calc(100vh - 300px)', overflow: 'hidden' }}>
            <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
              <Table responsive borderless size="sm" className="custom-table" style={{ marginBottom: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>
                  <tr className="text-center">
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Sr No.</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }} className="text-start">Player Name</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Phone Number</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Email</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Gender</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPlayers ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <DataLoading />
                      </td>
                    </tr>
                  ) : players.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No players found
                      </td>
                    </tr>
                  ) : (
                    players.map((player, idx) => (
                      <tr key={player._id} className="table-data border-bottom align-middle text-center">
                        <td style={{ padding: '12px', fontSize: '13px' }}>{startIndex + idx + 1}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }} className="text-start">
                          <div className="fw-semibold text-capitalize">{player.playerName}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{player.phoneNumber || '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{player.email || '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <span className="badge" style={{
                            backgroundColor: player.gender === 'Male' ? '#dbeafe' : player.gender === 'Female' ? '#fce7f3' : '#f3f4f6',
                            color: player.gender === 'Male' ? '#1e40af' : player.gender === 'Female' ? '#be185d' : '#6b7280',
                            fontSize: '11px',
                            padding: '4px 8px'
                          }}>
                            {player.gender}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <span className="badge" style={{
                            backgroundColor: player.playerStatus === 'active' ? '#dcfce7' : '#fee2e2',
                            color: player.playerStatus === 'active' ? '#16a34a' : '#dc2626',
                            fontSize: '11px',
                            padding: '4px 8px',
                            textTransform: 'capitalize'
                          }}>
                            {player.playerStatus || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalItems > itemsPerPage && (
            <div className="d-flex justify-content-between align-items-center mt-3 px-2">
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} players
              </div>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                    border: '1px solid #e5e7eb',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    fontSize: '12px',
                    padding: '4px 12px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className="btn btn-sm"
                        onClick={() => handlePageChange(page)}
                        style={{
                          backgroundColor: currentPage === page ? '#1F41BB' : '#fff',
                          border: '1px solid #e5e7eb',
                          color: currentPage === page ? '#fff' : '#374151',
                          fontSize: '12px',
                          padding: '4px 12px',
                          minWidth: '32px'
                        }}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} style={{ padding: '4px 8px', color: '#9ca3af' }}>...</span>;
                  }
                  return null;
                })}
                <button
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                    border: '1px solid #e5e7eb',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    fontSize: '12px',
                    padding: '4px 12px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

const ViewTournament = () => {
  const dispatch = useDispatch();
  const { tournamentId } = useParams();
  const { currentTournament, loadingTournament } = useSelector(state => state.tournament);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    categoryType: '',
    gender: ''
  });
  const [showPlayersOffcanvas, setShowPlayersOffcanvas] = useState(false);
  const [refreshPlayers, setRefreshPlayers] = useState(0);
  const [selectedRound, setSelectedRound] = useState('regular');
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [livestreamModal, setLivestreamModal] = useState({ show: false, match: null, schedule: null });
  const [livestreamForm, setLivestreamForm] = useState({ streamKey: '' });
  const [copied, setCopied] = useState(false);
  const [loadingLivestream, setLoadingLivestream] = useState(false);

  const categories = currentTournament?.category || [];

  const dynamicRounds = React.useMemo(() => {
    if (!currentTournament?.matchRules) return [];
    return Object.entries(currentTournament.matchRules)
      .filter(([_, rule]) => rule.status)
      .map(([key, _]) => ROUND_CONFIG[key])
      .filter(Boolean);
  }, [currentTournament]);

  // Reset selectedRound if current one is not available in dynamicRounds
  useEffect(() => {
    if (dynamicRounds.length > 0) {
      const isCurrentRoundAvailable = dynamicRounds.find(r => r.key === selectedRound);
      if (!isCurrentRoundAvailable) {
        setSelectedRound(dynamicRounds[0].key);
      }
    }
  }, [dynamicRounds, selectedRound]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ categoryType: '', gender: '' });
  };

  const hasActiveFilters = filters.categoryType || filters.gender;

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

  const handleLivestreamSubmit = async () => {
    setLoadingLivestream(true);
    try {
      const response = await ownerAxios.post('/api/tournament-schedules/livestream', {
        scheduleId: livestreamModal.schedule?._id,
        streamKey: livestreamForm.streamKey,
      });
      if (response.data) {
        showSuccess('Livestream setup successful');
        setLivestreamModal({ show: false, match: null, schedule: null });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to setup livestream');
    } finally {
      setLoadingLivestream(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      dispatch(getTournamentById(tournamentId));
    }
  }, [tournamentId, dispatch]);

  return (
    <div className='h-100' style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
      <Container fluid className="p-3 p-md-2 pb-md-0" style={{ flex: '0 0 auto' }}>
        <Row className="mb-0">
          <Col>
            <div className="border-0">
              <div className="p-0">
                {/* Tabs */}
                <div className="d-flex flex-wrap justify-content-between align-items-center">
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
                    <Tab label="Players" />
                    <Tab label="Schedules" />
                    {/* <Tab label="Bracket" /> */}
                  </Tabs>

                  {/* Filters - Show on both tabs */}
                  <div className="d-flex gap-2 align-items-center">
                    {activeTab === 0 && (
                      <>
                        <Form.Select
                          size="sm"
                          value={filters.categoryType}
                          onChange={(e) => handleFilterChange('categoryType', e.target.value)}
                          style={{ width: '220px', fontSize: '12px' }}
                        >
                          <option value="">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.categoryType} ({cat.tag})</option>
                          ))}
                        </Form.Select>

                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="btn text-danger fw-semibold btn-sm"
                            style={{ fontSize: '12px', border: '1px solid #dc3545' }}
                          >
                            Clear
                          </button>
                        )}

                        <button
                          onClick={() => setShowPlayersOffcanvas(true)}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: '#1F41BB',
                            color: 'white',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '6px 16px'
                          }}
                        >
                          Add Player
                        </button>
                      </>
                    )}
                    {activeTab === 1 && (
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Select
                          size="sm"
                          value={filters.categoryType}
                          onChange={(e) => handleFilterChange('categoryType', e.target.value)}
                          style={{ width: '220px', fontSize: '12px' }}
                        >
                          <option value="">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.categoryType} ({cat.tag})</option>
                          ))}
                        </Form.Select>

                        <div className="d-flex gap-2">
                          {dynamicRounds.map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => setSelectedRound(key)}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: selectedRound === key ? '#1F41BB' : '#f8f9fa',
                                color: selectedRound === key ? 'white' : '#666',
                                border: 'none',
                                fontWeight: 600,
                                fontSize: '13px',
                                padding: '6px 16px',
                                borderRadius: '6px'
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="btn text-danger fw-semibold btn-sm"
                            style={{ fontSize: '12px', border: '1px solid #dc3545' }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Scrollable Content */}
      <div style={{ flex: '1 1 auto', overflow: 'auto' }}>
        <Container fluid className="px-0">
          <Row>
            <Col>
              {loadingTournament ? (
                <Card className="text-center py-5 border-0 shadow-sm">
                  <Card.Body>
                    <DataLoading />
                    <div className="mt-3 text-muted">Loading tournament details...</div>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  {activeTab === 0 && <PlayersTab tournamentId={tournamentId} filters={filters} handleFilterChange={handleFilterChange} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} categories={categories} refreshTrigger={refreshPlayers} />}
                  {activeTab === 1 && <SchedulesTab tournamentId={tournamentId} categories={categories} selectedRound={selectedRound} categoryId={filters.categoryType} onMatchClick={handleMatchClick} />}
                  {activeTab === 2 && (
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <div className="text-center py-5">
                          <div style={{ fontSize: '48px', color: '#dee2e6', marginBottom: '16px' }}>🏆</div>
                          <h5 className="mb-2">Tournament Bracket</h5>
                          <p className="text-muted mb-0">Tournament bracket visualization coming soon...</p>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add Players Offcanvas */}
      <ManagePlayersOffcanvas
        show={showPlayersOffcanvas}
        onHide={() => setShowPlayersOffcanvas(false)}
        tournamentId={tournamentId}
        categories={categories}
        onPlayersAdded={() => setRefreshPlayers(prev => prev + 1)}
        onImportResult={(result) => {
          setImportResult(result);
          setShowImportResultModal(true);
        }}
      />

      {/* Import Result Modal */}
      <PlayerImportResultModal
        show={showImportResultModal}
        onHide={() => setShowImportResultModal(false)}
        result={importResult}
      />

      {/* Livestream Modal */}
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

const ManagePlayersOffcanvas = ({ show, onHide, tournamentId, categories = [], onPlayersAdded, onImportResult }) => {
  const dispatch = useDispatch();
  const { addingPlayers } = useSelector(state => state.tournament);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [players, setPlayers] = useState([{
    playerName: '',
    phoneNumber: '',
    email: '',
    gender: ''
  }]);

  // Reset category when offcanvas opens
  useEffect(() => {
    if (show) {
      setSelectedCategoryId(categories.length > 0 ? categories[0]._id : '');
    }
  }, [show, categories]);

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
    if (!selectedCategoryId) {
      showError('Please select a category');
      return false;
    }
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

    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
    const result = await dispatch(addTournamentPlayers({
      tournamentId,
      players,
      ...(selectedCategory && {
        categoryType: selectedCategory.categoryType,
        tag: selectedCategory.tag
      })
    }));

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
          Add Players to Tournament
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body style={{ padding: '20px', overflowY: 'auto' }}>
        {/* Category Dropdown */}
        {categories.length > 0 && (
          <div className="mb-3">
            <Form.Label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Category <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={{ fontSize: 13, border: '1px solid #ddd', borderRadius: '8px' }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryType} ({cat.tag})
                </option>
              ))}
            </Form.Select>
          </div>
        )}

        <div className="mb-3 d-flex justify-content-between align-items-center">
          <span style={{ fontSize: 14, color: '#666' }}>Add multiple players at once</span>
          <Button
            size="sm"
            onClick={addPlayer}
            style={{ backgroundColor: '#1F41BB', border: 'none', fontSize: 13, padding: '6px 12px' }}
          >
            Add Another
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
                    Remove
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

export default ViewTournament;
