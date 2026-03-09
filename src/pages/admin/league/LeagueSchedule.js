import React, { useState, useRef, useEffect } from 'react'
import { Container, Row, Col, Button, Dropdown, Form, Nav, Modal, InputGroup } from 'react-bootstrap'
import { FiEdit2, FiChevronDown, FiPlus } from 'react-icons/fi'
import { MdClose } from 'react-icons/md'
import { BsCalendar } from 'react-icons/bs'
import { AiOutlineHome, AiOutlineTeam } from 'react-icons/ai'
import './LeagueScheduleMatch.css'
import { vs_image } from '../../../assets/files'
import { IoCalendarClearOutline } from "react-icons/io5";
import { BiExport } from "react-icons/bi";
import { VscEye } from "react-icons/vsc";
import { LuPencilLine } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { getLeagues, getLeagueClubs, getClubTeams, saveSchedule } from '../../../redux/admin/league/thunk';



const LeagueSchedule = () => {
  const dispatch = useDispatch();
  const { leagues, leagueClubs, clubTeams, loadingClubs } = useSelector(state => state.league);
  const [activeTab, setActiveTab] = useState('levelA')
  const [showModal, setShowModal] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formHomeVenue, setFormHomeVenue] = useState('')
  const [formAwayVenue, setFormAwayVenue] = useState('')
  const [selectedAway, setSelectedAway] = useState({})
  const [expandedTeam, setExpandedTeam] = useState(null)
  const dateInputRef = useRef(null)
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [currentPage] = useState(1)
  const defaultLimit = 15
  const [matchesByCategory, setMatchesByCategory] = useState({
    levelA: [],
    levelB: [],
    mixed: [],
    female: []
  })
  const [matchTimes, setMatchTimes] = useState({})
  const [clubTeamsData, setClubTeamsData] = useState({})
  const [selectedTeams, setSelectedTeams] = useState({})
  const [loadingTeamsState, setLoadingTeamsState] = useState({})

  useEffect(() => {
    dispatch(getLeagues({ page: currentPage, limit: defaultLimit }));
  }, [dispatch, currentPage]);

  const leaguesData = Array.isArray(leagues?.data) ? leagues.data : [];

  useEffect(() => {
    if (leaguesData.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(leaguesData[0]._id);
    }
  }, [leaguesData, selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueId) {
      dispatch(getLeagueClubs(selectedLeagueId));
    }
  }, [dispatch, selectedLeagueId]);

  const clubs = leagueClubs.map((club, index) => ({
    id: club.clubId || index + 1,
    name: club.clubName || 'Unknown Club',
    logo: club.clubName ? club.clubName.substring(0, 2).toUpperCase() : 'UC',
    location: 'Unknown Location',
    categories: club.categories || []
  }));

  // Get available categories from first match's home venue or use all categories
  const currentMatches = matchesByCategory[activeTab] || [];
  const firstMatch = currentMatches[0];
  const homeClubData = leagueClubs.find(club => club.clubName === firstMatch?.homeVenue);
  const availableCategories = homeClubData?.categories || [];

  const fetchTeamsForClub = async (clubName, categoryType, matchId, venue) => {
    const club = clubs.find(c => c.name === clubName);
    console.log('fetchTeamsForClub called:', { clubName, categoryType, club, selectedLeagueId, matchId, venue });
    
    if (!club || !selectedLeagueId) {
      console.log('Early return - missing club or leagueId');
      return;
    }
    
    const key = `${club.id}_${categoryType}`;
    console.log('Generated key:', key);
    
    if (clubTeamsData[key]) {
      console.log('Data already exists for key:', key, clubTeamsData[key]);
      return;
    }
    
    setLoadingTeamsState(prev => ({ ...prev, [key]: true }));
    
    try {
      console.log('Dispatching getClubTeams with:', { leagueId: selectedLeagueId, clubId: club.id, categoryType });
      
      const response = await dispatch(getClubTeams({ 
        leagueId: selectedLeagueId, 
        clubId: club.id, 
        categoryType 
      }));
      
      console.log('API Response:', response);
      
      let teamsData = [];
      if (response.payload) {
        console.log(response,'responseresponseresponsevresponseresponse')
        if (response.payload.data && Array.isArray(response.payload.data)) {
          teamsData = response.payload.data;
        } else if (Array.isArray(response.payload)) {
          teamsData = response.payload;
        }
      }
      
      console.log('Extracted teams data:', teamsData);
      setClubTeamsData(prev => ({ ...prev, [key]: teamsData }));
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoadingTeamsState(prev => ({ ...prev, [key]: false }));
    }
  };

  const getTeamsForClub = (clubName, categoryType) => {
    const club = clubs.find(c => c.name === clubName);
    if (!club) {
      console.log('getTeamsForClub - club not found:', clubName);
      return [];
    }
    const key = `${club.id}_${categoryType}`;
    const teams = clubTeamsData[key] || [];
    console.log('getTeamsForClub result:', { clubName, categoryType, key, teams: teams.length, clubTeamsData });
    return teams;
  };

  const isLoadingTeams = (clubName, categoryType) => {
    const club = clubs.find(c => c.name === clubName);
    if (!club) return false;
    const key = `${club.id}_${categoryType}`;
    const loading = loadingTeamsState[key] || false;
    console.log('isLoadingTeams:', { clubName, categoryType, key, loading, loadingTeamsState });
    return loading;
  };

  const handleDropdownToggle = (clubName, categoryType, matchId, venue) => {
    fetchTeamsForClub(clubName, categoryType, matchId, venue);
  };

  const handleTeamSelection = (matchId, venue, teamId) => {
    setSelectedTeams(prev => ({
      ...prev,
      [`${matchId}_${venue}`]: teamId
    }));
  };

  const getSelectedTeam = (matchId, venue) => {
    const teamId = selectedTeams[`${matchId}_${venue}`];
    if (!teamId) return null;
    
    // Find team in clubTeamsData
    for (const key in clubTeamsData) {
      const teams = clubTeamsData[key] || [];
      const team = teams.find(t => t._id === teamId);
      if (team) return team;
    }
    return null;
  };

  useEffect(() => {
    if (clubTeams && clubTeams.length > 0) {
      const categoryTypeMap = {
        'levelA': 'Level A',
        'levelB': 'Level B',
        'mixed': 'Mixed',
        'female': 'Female'
      };

      currentMatches.forEach(match => {
        const homeClub = clubs.find(c => c.name === match.homeVenue);
        if (homeClub) {
          const key = `${homeClub.id}_${categoryTypeMap[activeTab]}`;
          setClubTeamsData(prev => ({ ...prev, [key]: clubTeams }));
        }
      });
    }
  }, [clubTeams, currentMatches, clubs, activeTab]);

  const handleLeagueChange = (e) => {
    setSelectedLeagueId(e.target.value);
  };

  // const matches = [1, 2, 3, 4]
  const awayTeams = [
    { name: 'Courtline', logo: 'CL' },
    { name: 'Padel Haus', logo: 'PH' },
    { name: 'Terrakort', logo: 'TK' }
  ]

  const handleDateChange = (e) => {
    const date = new Date(e.target.value)
    const formatted = (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
      date.getDate().toString().padStart(2, '0') + '/' +
      date.getFullYear().toString().slice(-2)
    setFormDate(formatted)
  }

  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateEndTime = (startTime, duration = 60) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleCreateDate = () => {
    if (formDate && formHomeVenue) {
      const startTime = '09:00';
      const duration = 60;
      const currentMatches = matchesByCategory[activeTab] || [];
      const newMatch = {
        id: currentMatches.length + 1,
        date: formDate,
        homeVenue: formHomeVenue,
        awayVenue: formAwayVenue || null,
        time: startTime,
        duration: duration,
        endTime: calculateEndTime(startTime, duration)
      };
      setMatchesByCategory(prev => ({
        ...prev,
        [activeTab]: [...currentMatches, newMatch]
      }));
      setShowModal(false);
      // Reset form
      setFormDate('');
      setFormHomeVenue('');
      setFormAwayVenue('');
    }
  }

  const handleTimeChange = (matchId, time) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const updatedMatches = currentMatches.map(match =>
      match.id === matchId ? { ...match, time, endTime: calculateEndTime(time, match.duration || 60) } : match
    );
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: updatedMatches
    }));
  }

  const handleDurationChange = (matchId, duration) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const updatedMatches = currentMatches.map(match =>
      match.id === matchId ? { ...match, duration: parseInt(duration), endTime: calculateEndTime(match.time, parseInt(duration)) } : match
    );
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: updatedMatches
    }));
  }

  const handleAwayVenueChange = (matchId, awayVenue) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const updatedMatches = currentMatches.map(match =>
      match.id === matchId ? { ...match, awayVenue } : match
    );
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: updatedMatches
    }));
  }

  const handleSaveSchedule = async () => {
    const currentMatches = matchesByCategory[activeTab] || [];
    if (!selectedLeagueId || currentMatches.length === 0) {
      alert('Please select a league and add matches before saving.');
      return;
    }

    const categoryTypeMap = {
      'levelA': 'Level A',
      'levelB': 'Level B',
      'mixed': 'Mixed',
      'female': 'Female'
    };

    const currentCategoryType = categoryTypeMap[activeTab];
    const firstMatch = currentMatches[0];
    const homeClub = clubs.find(club => club.name === firstMatch.homeVenue);

    if (!homeClub) {
      alert('Home club not found.');
      return;
    }

    const payload = {
      leagueId: selectedLeagueId,
      categoryType: currentCategoryType,
      homeClubId: homeClub.id,
      date: firstMatch.date,
      venue: firstMatch.homeVenue,
      matches: currentMatches.map((match, index) => {
        const selectedHomeTeam = getSelectedTeam(match.id, 'home');
        const selectedAwayTeam = getSelectedTeam(match.id, 'away');
        const homeClubData = clubs.find(club => club.name === match.homeVenue);
        const awayClubData = clubs.find(club => club.name === match.awayVenue);

        return {
          matchNo: index + 1,
          homeTeam: selectedHomeTeam ? {
            clubId: homeClubData?.id,
            teamName: selectedHomeTeam.teamName,
            players: selectedHomeTeam.players?.map(player => ({
              playerId: player.playerId,
              playerName: player.playerName
            })) || []
          } : null,
          // awayTeam: selectedAwayTeam ? {
          //   clubId: awayClubData?.id,
          //   teamName: selectedAwayTeam.teamName,
          //   players: selectedAwayTeam.players?.map(player => ({
          //     playerId: player.playerId,
          //     playerName: player.playerName
          //   })) || []
          // } : null,
          awayTeam:{
            clubId:"698f51c701d813cc174c9215",teamName:"Team A",players:[{playerId:"69aea58326d00754a7b539a6",playerName:'Test 11'},{playerId:"69aea59326d00754a7b53a5c",playerName:'Test 33'}]
          },
          time: convertTo12Hour(match.time),
          startTime: convertTo12Hour(match.time),
          endTime: convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60)),
          duration: match.duration || 60,
          status: 'scheduled'
        };
      })
    };

    dispatch(saveSchedule(payload));
  };

  const getAvailableAwayClubs = (homeVenue) => {
    return clubs.filter(club => club.name !== homeVenue)
  }

  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>League/ Match Schedule</h4>
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => setShowModal(true)} className='btn' style={{ padding: '8px 18px', border: '1px dashed rgba(37, 37, 37, 1)', color: "rgba(37, 37, 37, 1)", background: "transparent" }}><FiPlus size={18} /> Add Date</button>
              <Button variant="primary" style={{ padding: '8px 20px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none' }}>Export Schedule</Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className='border-top' style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Col md={2} className='p-0 border-end pe-1' style={{ backgroundColor: "#FBFCFE", display: 'flex', flexDirection: 'column', padding: '16px !important' }}>
          <div className="clubs-tabs">
            <div className="d-flex pt-1 border-bottom py-3 justify-content-between align-items-center mb-3">
              <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '14px' }}>Clubs</span>
              <span style={{ color: '#666', fontSize: '12px' }}>({clubs.length})</span>
            </div>
            <div className="mb-3">
              <select
                className="form-select form-select-sm"
                value={selectedLeagueId}
                onChange={handleLeagueChange}
              >
                <option value="">Select League</option>
                {leaguesData.map((league) => (
                  <option key={league._id} value={league._id}>
                    {league.leagueName}
                  </option>
                ))}
              </select>
            </div>
            <div className="clubs-list" style={{ gap: '0' }}>
              {loadingClubs ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : clubs.length === 0 ? (
                <div className="text-center text-muted py-3" style={{ fontSize: '14px' }}>
                  {selectedLeagueId ? 'No clubs found' : 'Select a league'}
                </div>
              ) : (
                clubs.map((club, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#1a1a1a',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {club.logo}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{club.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>◆ {club.location}</div>
                    </div>
                    <AiOutlineHome size={20} />
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        <Col md={8} style={{ overflowY: 'auto' }}>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="level-tabs border-0 mb-3">
            {availableCategories.map((category) => {
              const tabKey = {
                'Level A': 'levelA',
                'Level B': 'levelB',
                'Mixed': 'mixed',
                'Female': 'female'
              }[category.categoryType];

              if (!tabKey) return null;

              return (
                <Nav.Item key={tabKey}>
                  <Nav.Link eventKey={tabKey} className={activeTab === tabKey ? 'active' : ''}>
                    {category.categoryType} <span>({category.playerCount})</span>
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>

          {currentMatches.length > 0 ? (
            <>
              <div className="home-team-header mb-3">
                <span style={{ fontWeight: '600', color: "rgba(37, 37, 37, 0.8)" }}>Match Schedule</span>
              </div>

              <div style={{ overflowX: 'auto', borderRadius: '8px', padding: '0', position: 'relative' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e8e8e8' }}>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Match No.</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Home</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>
                        <div className='rounded-3' style={{ width: '34px', height: '34px', background: 'rgba(37, 37, 37, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '0 auto' }}>VS</div>
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Away</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Start Time</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Duration</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMatches.map((match, index) => {
                      const homeClub = clubs.find(club => club.name === match.homeVenue);
                      const awayClub = clubs.find(club => club.name === match.awayVenue);
                      const selectedHomeTeam = getSelectedTeam(match.id, 'home');
                      const selectedAwayTeam = getSelectedTeam(match.id, 'away');
                      return (
                        <tr className='text-center' key={match.id} style={{ backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                          <td style={{ padding: '14px 12px', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', borderBottom: '1px solid #ddd' }}>0{match.id}</td>
                          <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                            <div className='d-flex justify-content-center align-items-center gap-2'>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'rgba(31, 65, 187, 1)' }}>
                                {homeClub?.logo || 'H'}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                  {selectedHomeTeam ? selectedHomeTeam.teamName : match.homeVenue}
                                </div>
                                <div style={{ fontSize: '10px', color: '#666' }}>
                                  {selectedHomeTeam ? match.homeVenue : ''}
                                </div>
                              </div>
                              <Dropdown onToggle={() => handleDropdownToggle(match.homeVenue, {
                                'levelA': 'Level A',
                                'levelB': 'Level B',
                                'mixed': 'Mixed',
                                'female': 'Female'
                              }[activeTab], match.id, 'home')}>
                                <Dropdown.Toggle as="div" style={{ cursor: 'pointer', marginLeft: '8px' }}>
                                  <div style={{ fontSize: '12px', color: 'rgba(31, 65, 187, 1)', fontWeight: '600' }}>›</div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ zIndex: 9999, position: 'fixed' }}>
                                  {isLoadingTeams(match.homeVenue, {
                                    'levelA': 'Level A',
                                    'levelB': 'Level B',
                                    'mixed': 'Mixed',
                                    'female': 'Female'
                                  }[activeTab]) ? (
                                    [...Array(4)].map((_, idx) => (
                                      <Dropdown.Item key={idx} disabled>
                                        <div className='d-flex align-items-center gap-2'>
                                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f0f0f0' }} className="placeholder-glow">
                                            <span className="placeholder w-100 h-100 rounded-circle"></span>
                                          </div>
                                          <div className="flex-grow-1">
                                            <div className="placeholder-glow">
                                              <span className="placeholder col-8" style={{ height: '12px' }}></span>
                                            </div>
                                            <div className="placeholder-glow mt-1">
                                              <span className="placeholder col-6" style={{ height: '10px' }}></span>
                                            </div>
                                          </div>
                                        </div>
                                      </Dropdown.Item>
                                    ))
                                  ) : (
                                    getTeamsForClub(match.homeVenue, {
                                      'levelA': 'Level A',
                                      'levelB': 'Level B',
                                      'mixed': 'Mixed',
                                      'female': 'Female'
                                    }[activeTab]).map((team, idx) => (
                                      <Dropdown.Item key={idx} onClick={() => handleTeamSelection(match.id, 'home', team._id)}>
                                        <div className='d-flex align-items-center gap-2'>
                                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                            {team.teamName?.charAt(0) || 'T'}
                                          </div>
                                          <div>
                                            <div style={{ fontSize: '12px', fontWeight: '600' }}>{team.teamName}</div>
                                            <div style={{ fontSize: '10px', color: '#666' }}>
                                              {team.players?.slice(0, 2).map(p => p.playerName).join(', ')}
                                              {team.players?.length > 2 && ` +${team.players.length - 2} more`}
                                            </div>
                                          </div>
                                        </div>
                                      </Dropdown.Item>
                                    ))
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                            <div className='rounded-3 text-white' style={{ backgroundColor: "#1F41BB", opacity: "0.1", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto', color: '#1F41BB' }}>VS</div>
                          </td>
                          <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                            {match.awayVenue ? (
                              <div className='d-flex justify-content-center align-items-center gap-2'>
                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                  {awayClub?.logo || 'A'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                    {selectedAwayTeam ? selectedAwayTeam.teamName : match.awayVenue}
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#666' }}>
                                    {selectedAwayTeam ? match.awayVenue : ''}
                                  </div>
                                </div>
                                <Dropdown onToggle={() => handleDropdownToggle(match.awayVenue, {
                                  'levelA': 'Level A',
                                  'levelB': 'Level B',
                                  'mixed': 'Mixed',
                                  'female': 'Female'
                                }[activeTab], match.id, 'away')}>
                                  <Dropdown.Toggle as="div" style={{ cursor: 'pointer', marginLeft: '8px' }}>
                                    <div style={{ fontSize: '12px', color: 'rgba(31, 65, 187, 1)', fontWeight: '600' }}>›</div>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu style={{ zIndex: 9999, position: 'fixed' }}>
                                    {isLoadingTeams(match.awayVenue, {
                                      'levelA': 'Level A',
                                      'levelB': 'Level B',
                                      'mixed': 'Mixed',
                                      'female': 'Female'
                                    }[activeTab]) ? (
                                      [...Array(4)].map((_, idx) => (
                                        <Dropdown.Item key={idx} disabled>
                                          <div className='d-flex align-items-center gap-2'>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f0f0f0' }} className="placeholder-glow">
                                              <span className="placeholder w-100 h-100 rounded-circle"></span>
                                            </div>
                                            <div className="flex-grow-1">
                                              <div className="placeholder-glow">
                                                <span className="placeholder col-8" style={{ height: '12px' }}></span>
                                              </div>
                                              <div className="placeholder-glow mt-1">
                                                <span className="placeholder col-6" style={{ height: '10px' }}></span>
                                              </div>
                                            </div>
                                          </div>
                                        </Dropdown.Item>
                                      ))
                                    ) : (
                                      getTeamsForClub(match.awayVenue, {
                                        'levelA': 'Level A',
                                        'levelB': 'Level B',
                                        'mixed': 'Mixed',
                                        'female': 'Female'
                                      }[activeTab]).map((team, idx) => (
                                        <Dropdown.Item key={idx} onClick={() => handleTeamSelection(match.id, 'away', team._id)}>
                                          <div className='d-flex align-items-center gap-2'>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                              {team.teamName?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                              <div style={{ fontSize: '12px', fontWeight: '600' }}>{team.teamName}</div>
                                              <div style={{ fontSize: '10px', color: '#666' }}>
                                              {team.players?.slice(0, 2).map(p => p.playerName).join(', ')}
                                              {team.players?.length > 2 && ` +${team.players.length - 2} more`}
                                            </div>
                                            </div>
                                          </div>
                                        </Dropdown.Item>
                                      ))
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                            ) : (
                              <Dropdown>
                                <Dropdown.Toggle as="div" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', justifyContent: 'center' }}>
                                  <div className='d-flex align-items-center gap-2'>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'rgba(31, 65, 187, 1)', fontWeight: 'bold' }}>+</div>
                                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Add Club</div>
                                  </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ zIndex: 9999 }}>
                                  {getAvailableAwayClubs(match.homeVenue).map((club, idx) => (
                                    <Dropdown.Item key={idx} onClick={() => handleAwayVenueChange(match.id, club.name)}>
                                      <div className='d-flex align-items-center gap-2'>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'white' }}>
                                          {club.logo}
                                        </div>
                                        {club.name}
                                      </div>
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                            <input
                              type="time"
                              value={match.time}
                              onChange={(e) => handleTimeChange(match.id, e.target.value)}
                              className="form-control form-control-sm"
                              style={{ width: '100px', margin: '0 auto' }}
                            />
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                            <select
                              value={match.duration || 60}
                              onChange={(e) => handleDurationChange(match.id, e.target.value)}
                              className="form-select form-select-sm"
                              style={{ width: '80px', margin: '0 auto' }}
                            >
                              <option value={30}>30m</option>
                              <option value={60}>1h</option>
                              <option value={90}>1.5h</option>
                              <option value={120}>2h</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            {convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center text-muted py-5">
              <p>Please add a match to create schedule</p>
            </div>
          )}

          <Row className="mt-4">
            <Col className="d-flex justify-content-between">
              <Button variant="light" style={{ padding: '10px 30px', border: '1px solid #ddd' }}>Back</Button>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" style={{ padding: '10px 24px', color: "rgba(31, 65, 187, 1)", border: "1px solid rgba(31, 65, 187, 1)", fontWeight: "600" }}>Save and Next Date</Button>
                <Button variant="primary" style={{ padding: '10px 40px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none', boxShadow: '0px 0px 20.9px 0px rgba(31, 65, 187, 0.5)', fontWeight: "600" }} onClick={handleSaveSchedule}>Save</Button>
              </div>
            </Col>
          </Row>
        </Col>

        <Col md={2} className='d-flex flex-column' style={{ backgroundColor: "#FBFCFE", padding: '16px', gap: '12px' }}>
          <div className='border rounded-3' style={{ background: 'rgba(251, 252, 254, 1)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div className='d-flex justify-content-between align-items-center gap-2 mb-2'>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>10 Aug, 2026</span>
              <div style={{ width: '28px', height: '27px', borderRadius: '6px', background: 'rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                <BiExport size={18} />
              </div>
            </div>
            <div className="d-flex justify-content-between flex-column text-start">
              <div className='mb-0 text-start mb-2' style={{ fontSize: '13px', color: '#666', }}>
                <p className='mb-0 text-start m-0'>Matches: {String(currentMatches.length).padStart(2, '0')}</p>
              </div>
              <div className='d-flex gap-3 justify-content-between' style={{ fontSize: '13px', color: '#666', }}>
                <p>Venue: 01</p>
                <VscEye size={16} className='' style={{ color: '#999' }} />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header className="border-bottom d-flex justify-content-between align-items-center" style={{ padding: '20px' }}>
          <Modal.Title style={{ fontWeight: '600', fontSize: '20px', color: 'rgba(37, 37, 37, 1)' }}> <IoCalendarClearOutline size={18} /> Day one schedule</Modal.Title>
          <MdClose size={24} onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} />
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Date</Form.Label>
              <InputGroup>
                <Form.Control
                  ref={dateInputRef}
                  type="date"
                  className='py-3'
                  onChange={handleDateChange}
                  style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
                />
                <InputGroup.Text onClick={() => dateInputRef.current?.click()} style={{ borderRadius: '0 6px 6px 0', border: '1px solid #ddd', background: 'rgba(204, 210, 221, 0.43)', cursor: 'pointer' }}>
                  <BsCalendar size={18} color="#666" />
                </InputGroup.Text>
              </InputGroup>
              <Form.Control
                type="text"
                placeholder="MM/DD/YY"
                value={formDate}
                readOnly
                style={{ marginTop: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Home Venue</Form.Label>
              <Form.Select
                value={formHomeVenue}
                className='py-3'
                onChange={(e) => setFormHomeVenue(e.target.value)}
                style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              >
                <option value="">Select Home Venue</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.name}>
                    {club.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Away Venue (Optional)</Form.Label>
              <Form.Select
                value={formAwayVenue}
                className='py-3'
                onChange={(e) => setFormAwayVenue(e.target.value)}
                style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              >
                <option value="">Select Away Venue (Optional)</option>
                {clubs.filter(club => club.name !== formHomeVenue).map((club) => (
                  <option key={club.id} value={club.name}>
                    {club.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button
              variant="primary"
              className="w-100"
              style={{ padding: '12px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none', fontWeight: '600' }}
              onClick={handleCreateDate}
              disabled={!formDate || !formHomeVenue}
            >
              Create Match
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default LeagueSchedule