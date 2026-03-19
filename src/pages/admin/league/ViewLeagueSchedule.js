import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';
import { Tabs, Tab } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getAllSchedules, exportLeagueSchedulesPDF, getLeagueById } from '../../../redux/admin/league/thunk';
import { clearCurrentLeague } from '../../../redux/admin/league/slice';
import { IoLocationOutline } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DataLoading } from '../../../helpers/loading/Loaders';
import PointsTable from './PointsTable';

const VSMatchCard = ({ match, category, roundType }) => {
  const getPlayerAvatar = (player) => {
    if (player?.avatar) return player.avatar;
    const name = player?.playerName || player?.name || 'P';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=32&background=e3f2fd&color=1976d2`;
  };

  const getTeamPlayers = (team) => {
    if (!team?.players?.length) return [];
    return team.players.slice(0, 2); // Show max 2 players
  };
  return (
    <div
      className="mb-3 shadow-sm rounded-3 position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(100.97deg, rgb(253, 253, 255) 0%, rgb(158, 186, 255) 317.27%)',
        padding: '30px 16px 16px 16px',
        border: '1px solid #1F41BB1A',
        minHeight: '110px'
      }}
    >
      <div className="vs-date-badge">
        {match?.time}
      </div>
      <Row className="align-items-center">
        {/* Team A */}
        <Col xs={4} className="text-start">
          <div className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1F41BB' }}>
            Team A
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
                <span style={{ fontSize: '12px' }}>
                  {player?.playerName || player?.name || 'Player'}
                </span>
              </div>
            ))}
          </div>
        </Col>

        {/* Center - Date and VS */}
        <Col xs={4} className="text-center">
          {/* <small className='fw-semibold text-capitalize' style={{ fontSize: '0.7rem' }}>{roundType}</small> */}
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
          <small className='fw-semibold' style={{ fontSize: '0.7rem' }}>{category} - <span className='text-capitalize'>{roundType}</span></small>
        </Col>

        {/* Team B */}
        <Col xs={4} className="text-end">
          <div className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1F41BB' }}>
            Team B
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            {getTeamPlayers(match.teamB).map((player, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '12px' }}>
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
const DateSection = ({ dateGroup }) => {
  // Flatten all matches from all schedules into one list, attaching category/venue metadata
  const allMatchCols = (dateGroup.schedules || []).flatMap((schedule) =>
    (schedule.matches || []).map((match) => ({
      match,
      category: schedule.categoryType,
      roundType: schedule.roundType,
      venue: schedule.venue,
      key: match._id,
    }))
  );

  return (
    <div className="mb-4">
      {/* Date Header */}
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

      {/* All matches in a single flat row grid */}
      <Row className="g-2">
        {allMatchCols.map(({ match, category, roundType, venue, key }) => (
          <Col key={key} xs={12} sm={6} md={4} lg={3} xl={3}>
            <VSMatchCard match={match} category={category} roundType={roundType} venue={venue} />
          </Col>
        ))}
      </Row>
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
  const { schedules, loadingSchedules, loadingExport, currentLeague } = useSelector(state => state.league);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    categoryType: '',
    roundType: '',
    startDate: null,
    endDate: null
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
      endDate: null
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
      // Clear previous league data before loading new one
      dispatch(clearCurrentLeague());
      dispatch(getLeagueById(leagueId));
    }
  }, [leagueId, dispatch])

  useEffect(() => {
    const params = { leagueId };

    if (filters.categoryType) params.categoryType = filters.categoryType;
    if (filters.roundType) params.roundType = filters.roundType;

    // Only add date filters if both dates are selected or neither is selected
    const hasStartDate = filters.startDate;
    const hasEndDate = filters.endDate;

    if (hasStartDate && hasEndDate) {
      // Both dates selected - add both to params
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
      // Neither date selected - call API without date filters
      dispatch(getAllSchedules(params));
    }
    // If only one date is selected, don't call API
  }, [dispatch, leagueId, filters]);

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

  const hasActiveFilters = filters.categoryType || filters.roundType || filters.startDate || filters.endDate;

  // New API format: { data: [{ date, schedules[] }], pagination: {} }
  // Fall back gracefully if the old flat-array format is ever returned
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
                {/* Tabs and Filters in same row */}
                <div className="d-flex justify-content-between align-items-center p-0">
                  {/* Tabs Section */}
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
                      {/* <Tab label="Bracket" /> */}
                    </Tabs>
                  </div>

                  {/* Filters Section - Only show on Schedules tab */}
                  {activeTab === 0 && (
                    <div className="d-flex gap-2 align-items-center">
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
                          onClick={() => setFilters({ categoryType: '', roundType: '', startDate: null, endDate: null })}
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

              {activeTab === 2 && <TournamentBracket />}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ViewLeagueSchedule;