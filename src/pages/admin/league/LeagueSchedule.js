import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Container, Row, Col, Button, Form, Nav, Modal, InputGroup, Dropdown } from 'react-bootstrap'
import { FiEdit2, FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi'
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
import { getLeagues, getLeagueClubs, getClubTeams, saveSchedule, getLeagueById } from '../../../redux/admin/league/thunk';
import { showError } from '../../../helpers/Toast';
import { FaAngleRight } from 'react-icons/fa'

const LeagueSchedule = () => {
  const dispatch = useDispatch();
  const { leagues, leagueClubs, loadingClubs, loadingSchedules, currentLeague } = useSelector(state => state.league);
  const [activeTab, setActiveTab] = useState('levelA')
  const [selectedRound, setSelectedRound] = useState('regularRound')
  const [showModal, setShowModal] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [isHomeVenue, setIsHomeVenue] = useState(true)
  const [selectedAway, setSelectedAway] = useState({})
  const [expandedTeam, setExpandedTeam] = useState(null)
  const dateInputRef = useRef(null)
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [currentPage] = useState(1)
  const defaultLimit = 15
  const [matchesByCategory, setMatchesByCategory] = useState({
    all: [],
    levelA: [],
    levelB: [],
    mixed: [],
    female: []
  })
  const [matchTimes, setMatchTimes] = useState({})
  const [clubTeamsData, setClubTeamsData] = useState({
    levelA: {},
    levelB: {},
    mixed: {},
    female: {}
  })
  const [selectedTeams, setSelectedTeams] = useState({
    levelA: {},
    levelB: {},
    mixed: {},
    female: {}
  })
  const [loadingTeamsState, setLoadingTeamsState] = useState({
    levelA: {},
    levelB: {},
    mixed: {},
    female: {}
  })
  const [openDropdown, setOpenDropdown] = useState(null)
  const [currentScheduleDate, setCurrentScheduleDate] = useState('')
  const [currentScheduleVenue, setCurrentScheduleVenue] = useState('')
  const [currentScheduleType, setCurrentScheduleType] = useState(true)

  useEffect(() => {
    const handleClickOutside = (event) => {
      setOpenDropdown(null);
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

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
      dispatch(getLeagueById(selectedLeagueId));
    }
  }, [dispatch, selectedLeagueId]);

  const clubs = leagueClubs.map((club, index) => ({
    id: club.clubId || index + 1,
    name: club.clubName || 'Unknown Club',
    logo: club.clubName ? club.clubName.substring(0, 2).toUpperCase() : 'UC',
    location: 'Unknown Location',
    categories: club.categories || []
  }));

  // Get available categories from selected league data
  const selectedLeague = leaguesData.find(league => league._id === selectedLeagueId);
  console.log(selectedLeague, 'selectedLeagueselectedLeagueselectedLeague')
  const availableCategories = selectedLeague?.clubs?.[0]?.participationLimit?.categoryLimits || [];
  // Get current matches - if 'all' tab, combine all categories
  const currentMatches = activeTab === 'all'
    ? [...matchesByCategory.levelA, ...matchesByCategory.levelB, ...matchesByCategory.mixed, ...matchesByCategory.female]
    : matchesByCategory[activeTab] || [];

  const fetchTeamsForClub = useCallback(async (clubName, categoryType) => {
    const club = clubs.find(c => c.name === clubName);

    if (!club || !selectedLeagueId || !clubName) {
      return;
    }

    const key = `${club.id}_${categoryType}`;
    const categoryKey = {
      'Level A': 'levelA',
      'Level B': 'levelB',
      'Mixed': 'mixed',
      'Female': 'female'
    }[categoryType] || activeTab;

    if (loadingTeamsState[categoryKey]?.[key] || clubTeamsData[categoryKey]?.[key]) {
      return;
    }

    setLoadingTeamsState(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], [key]: true }
    }));

    try {
      const response = await dispatch(getClubTeams({
        leagueId: selectedLeagueId,
        clubId: club.id,
        categoryType
      }));

      let teamsData = [];
      if (response.payload?.success && response.payload?.data) {
        teamsData = response.payload.data;
      } else if (Array.isArray(response.payload)) {
        teamsData = response.payload;
      }

      setClubTeamsData(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], [key]: teamsData }
      }));

    } catch (error) {
      setClubTeamsData(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], [key]: [] }
      }));
    } finally {
      setLoadingTeamsState(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], [key]: false }
      }));
    }
  }, [clubs, selectedLeagueId, loadingTeamsState, clubTeamsData, dispatch, activeTab]);

  const getTeamsForClub = (clubName, categoryType) => {
    const club = clubs.find(c => c.name === clubName);
    if (!club) {
      return [];
    }
    const key = `${club.id}_${categoryType}`;
    const teams = clubTeamsData[key] || [];
    return teams;
  };

  const isLoadingTeams = (clubName, categoryType) => {
    const club = clubs.find(c => c.name === clubName);
    if (!club) return false;
    const key = `${club.id}_${categoryType}`;
    const loading = loadingTeamsState[key] || false;
    return loading;
  };

  // const CustomClubDropdown = ({ matchId, venue, onClubSelect, availableClubs }) => {
  //   const dropdownId = `club_${matchId}_${venue}`;
  //   const isOpen = openDropdown === dropdownId;

  //   return (
  //     <div style={{ position: 'relative' }}>
  //       <div onClick={(e) => {
  //         e.stopPropagation();
  //         setOpenDropdown(isOpen ? null : dropdownId);
  //       }} style={{ cursor: 'pointer' }}>
  //         <div className='d-flex align-items-center gap-2'>
  //           <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'rgba(31, 65, 187, 1)', fontWeight: 'bold' }}>+</div>
  //           <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Add Club</div>
  //         </div>
  //       </div>
  //       {isOpen && (
  //         <div style={{
  //           position: 'absolute',
  //           top: '100%',
  //           left: 0,
  //           zIndex: 1000,
  //           backgroundColor: 'white',
  //           border: '1px solid #ddd',
  //           borderRadius: '6px',
  //           boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  //           minWidth: '200px',
  //           maxHeight: '200px',
  //           overflowY: 'auto'
  //         }}>
  //           {availableClubs.map((club, idx) => (
  //             <div 
  //               key={idx}
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 e.stopPropagation();
  //                 alert('Club selected: ' + club.name);
  //                 onClubSelect(club.name);
  //                 setOpenDropdown(null);
  //               }}
  //               style={{
  //                 padding: '8px 12px',
  //                 cursor: 'pointer',
  //                 borderBottom: idx < availableClubs.length - 1 ? '1px solid #f0f0f0' : 'none',
  //                 backgroundColor: 'white'
  //               }}
  //               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
  //               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
  //             >
  //               <div className='d-flex align-items-center gap-2'>
  //                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'white' }}>
  //                   {club.logo}
  //                 </div>
  //                 {club.name}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  const CustomClubDropdown = ({ matchId, venue, onClubSelect, availableClubs }) => {
    const handleClubSelect = (clubName) => {
      onClubSelect(clubName);
    };

    return (
      <Dropdown>
        <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
          <div className='d-flex align-items-center gap-2'>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'rgba(31, 65, 187, 1)', fontWeight: 'bold' }}>+</div>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Add Club</div>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {availableClubs.map((club, idx) => (
            <Dropdown.Item key={idx} onClick={() => handleClubSelect(club.name)}>
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
    );
  };

  const CustomTeamDropdown = ({ matchId, venue, clubName, categoryType, selectedTeam, onTeamSelect }) => {
    const dropdownId = `team_${matchId}_${venue}`;
    const isOpen = openDropdown === dropdownId;
    const club = clubs.find(c => c.name === clubName);
    const key = club ? `${club.id}_${categoryType}` : null;
    const teams = key ? (clubTeamsData[activeTab]?.[key] || []) : [];
    const isLoading = key ? (loadingTeamsState[activeTab]?.[key] || false) : false;

    const handleDropdownClick = (e) => {
      e.stopPropagation();
      if (!isOpen && clubName && key && !clubTeamsData[activeTab]?.[key] && !isLoading) {
        fetchTeamsForClub(clubName, categoryType);
      }
      setOpenDropdown(isOpen ? null : dropdownId);
    };

    const handleTeamClick = (e, team) => {
      e.preventDefault();
      e.stopPropagation();
      onTeamSelect(team._id);
      setOpenDropdown(null);
    };

    return (
      <div style={{ position: 'relative' }}>
        <div onClick={handleDropdownClick} style={{ cursor: 'pointer', marginLeft: '8px' }}>
          <FaAngleRight size={17} color='rgba(31, 65, 187, 1)' />
        </div>
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {isLoading ? (
              <div style={{ padding: '12px', textAlign: 'center' }}>
                <div className="spinner-border spinner-border-sm"></div>
              </div>
            ) : teams.length > 0 ? (
              teams.map((team) => (
                <div
                  key={team._id}
                  onMouseDown={(e) => handleTeamClick(e, team)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div className='d-flex align-items-center gap-2'>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#FFD700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
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
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                No teams found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleTeamSelection = (matchId, venue, teamId) => {
    setSelectedTeams(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [`${matchId}_${venue}`]: teamId
      }
    }));
  };

  const getSelectedTeam = (matchId, venue) => {
    const key = `${matchId}_${venue}`;
    const teamId = selectedTeams[activeTab]?.[key];

    if (!teamId) return null;

    const categoryData = clubTeamsData[activeTab] || {};
    for (const dataKey in categoryData) {
      const teams = categoryData[dataKey] || [];
      const team = teams.find(t => t._id === teamId);
      if (team) return team;
    }
    return null;
  };



  const handleDeleteMatch = (matchId) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const updatedMatches = currentMatches.filter(match => match.id !== matchId);
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: updatedMatches
    }));
    setSelectedTeams(prev => {
      const updated = { ...prev };
      if (updated[activeTab]) {
        delete updated[activeTab][`${matchId}_home`];
        delete updated[activeTab][`${matchId}_away`];
      }
      return updated;
    });
  };

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
    if (formDate && formVenue) {
      const startTime = '09:00';
      const duration = 60;
      const currentMatches = matchesByCategory[activeTab] || [];
      const venueClub = clubs.find(club => club.name === formVenue);
      const newMatchId = currentMatches.length > 0 ? Math.max(...currentMatches.map(m => m.id)) + 1 : 1;
      const newMatch = {
        id: newMatchId,
        date: formDate,
        venue: formVenue,
        venueClubId: venueClub?.id,
        homeVenue: selectedRound === 'regularRound' && isHomeVenue ? formVenue : null,
        awayVenue: selectedRound === 'regularRound' && !isHomeVenue ? formVenue : null,
        time: startTime,
        duration: duration,
        endTime: calculateEndTime(startTime, duration),
        isAwayMatch: selectedRound === 'regularRound' && !isHomeVenue
      };
      setMatchesByCategory(prev => ({
        ...prev,
        [activeTab]: [...currentMatches, newMatch]
      }));

      // Store current schedule info for "Save and Next Date"
      setCurrentScheduleDate(formDate);
      setCurrentScheduleVenue(formVenue);
      setCurrentScheduleType(isHomeVenue);

      setShowModal(false);

      if (selectedRound === 'regularRound') {
        const categoryType = {
          'levelA': 'Level A',
          'levelB': 'Level B',
          'mixed': 'Mixed',
          'female': 'Female'
        }[activeTab];
        const venueType = isHomeVenue ? 'home' : 'away';
        fetchTeamsForClub(formVenue, categoryType);
        setOpenDropdown(`team_${newMatchId}_${venueType}`);
      }

      // Reset form
      setFormDate('');
      setFormVenue('');
      setIsHomeVenue(true);
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

    const categoryType = {
      'levelA': 'Level A',
      'levelB': 'Level B',
      'mixed': 'Mixed',
      'female': 'Female'
    }[activeTab];
    fetchTeamsForClub(awayVenue, categoryType);
    setOpenDropdown(`team_${matchId}_away`);
  }

  const handleHomeVenueChange = (matchId, homeVenue) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const updatedMatches = currentMatches.map(match =>
      match.id === matchId ? { ...match, homeVenue } : match
    );
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: updatedMatches
    }));

    const categoryType = {
      'levelA': 'Level A',
      'levelB': 'Level B',
      'mixed': 'Mixed',
      'female': 'Female'
    }[activeTab];
    fetchTeamsForClub(homeVenue, categoryType);
    setOpenDropdown(`team_${matchId}_home`);
  }

  const handleSaveSchedule = async () => {
    const currentMatches = matchesByCategory[activeTab] || [];

    // Map selectedRound to roundType enum values
    const roundTypeMap = {
      'regularRound': 'regular',
      'quarterfinal': 'quarterfinal',
      'semifinal': 'semifinal',
      'final': 'final'
    };

    const roundType = roundTypeMap[selectedRound];

    // For regular rounds, require matches and teams
    if (roundType === 'regular') {
      if (!selectedLeagueId || currentMatches.length === 0) {
        showError('Please select a league and add matches before saving.');
        return;
      }

      // Validate teams are selected for all matches
      const incompleteMatches = [];
      currentMatches.forEach((match, index) => {
        const selectedHomeTeam = getSelectedTeam(match.id, 'home');
        const selectedAwayTeam = getSelectedTeam(match.id, 'away');

        if (match.homeVenue && !selectedHomeTeam) {
          incompleteMatches.push(`Match ${index + 1}: No team selected for ${match.homeVenue} (Home)`);
        }
        if (match.awayVenue && !selectedAwayTeam) {
          incompleteMatches.push(`Match ${index + 1}: No team selected for ${match.awayVenue} (Away)`);
        }
      });

      if (incompleteMatches.length > 0) {
        showError(`Please select teams or remove entries: ${incompleteMatches.join(', ')}`);
        return;
      }
    } else {
      // For knockout rounds, only require league selection
      if (!selectedLeagueId) {
        showError('Please select a league.');
        return;
      }
    }

    const categoryTypeMap = {
      'levelA': 'Level A',
      'levelB': 'Level B',
      'mixed': 'Mixed',
      'female': 'Female'
    };

    const currentCategoryType = categoryTypeMap[activeTab];

    // Base payload structure
    const payload = {
      leagueId: selectedLeagueId,
      categoryType: currentCategoryType,
      roundType: roundType
    };

    // Add match-specific fields when matches exist
    if (currentMatches.length > 0) {
      const firstMatch = currentMatches[0];
      const venueClub = clubs.find(club => club.name === firstMatch.venue);

      if (!venueClub) {
        showError('Venue club not found.');
        return;
      }

      payload.venueClubId = venueClub.id;
      payload.date = new Date(firstMatch.date).toISOString();
      payload.venue = firstMatch.venue;
      payload.matches = currentMatches.map((match, index) => {
        const selectedHomeTeam = getSelectedTeam(match.id, 'home');
        const selectedAwayTeam = getSelectedTeam(match.id, 'away');
        const homeClubData = clubs.find(club => club.name === match.homeVenue);
        const awayClubData = clubs.find(club => club.name === match.awayVenue);

        return {
          matchNo: index + 1,
          teamA: selectedHomeTeam ? {
            clubId: homeClubData?.id,
            ...(selectedRound === 'regularRound' ? { clubType: match.homeVenue === match.venue ? 'home' : 'away' } : {}),
            teamName: selectedHomeTeam.teamName,
            players: selectedHomeTeam.players?.map(player => ({
              playerId: player.playerId,
              playerName: player.playerName
            })) || []
          } : null,
          teamB: selectedAwayTeam ? {
            clubId: awayClubData?.id,
            ...(selectedRound === 'regularRound' ? { clubType: match.awayVenue === match.venue ? 'home' : 'away' } : {}),
            teamName: selectedAwayTeam.teamName,
            players: selectedAwayTeam.players?.map(player => ({
              playerId: player.playerId,
              playerName: player.playerName
            })) || []
          } : null,
          time: convertTo12Hour(match.time),
          startTime: convertTo12Hour(match.time),
          endTime: convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60)),
          duration: match.duration || 60,
          status: 'scheduled'
        };
      });
    }

    console.log(payload, 'payloadpayloadpayload')

    const result = await dispatch(saveSchedule(payload));
    if (result.type === 'league/saveSchedule/fulfilled') {
      // Clear everything on successful save
      setMatchesByCategory(prev => ({
        ...prev,
        [activeTab]: []
      }));
      setSelectedTeams(prev => ({
        ...prev,
        [activeTab]: {}
      }));
      setClubTeamsData(prev => ({
        ...prev,
        [activeTab]: {}
      }));
      setLoadingTeamsState(prev => ({
        ...prev,
        [activeTab]: {}
      }));
    }
  };

  const handleSaveAndNextDate = async () => {
    // Save current schedule first
    await handleSaveSchedule();

    // Pre-fill modal with current schedule info but increment date
    if (currentScheduleDate) {
      const currentDate = new Date(currentScheduleDate.split('/').reverse().join('-'));
      currentDate.setDate(currentDate.getDate() + 1);
      const nextDate = (currentDate.getMonth() + 1).toString().padStart(2, '0') + '/' +
        currentDate.getDate().toString().padStart(2, '0') + '/' +
        currentDate.getFullYear().toString().slice(-2);

      setFormDate(nextDate);
      setFormVenue(currentScheduleVenue);
      setIsHomeVenue(currentScheduleType);
    }

    // Clear current matches for new date
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: []
    }));

    // Clear selected teams
    setSelectedTeams(prev => ({
      ...prev,
      [activeTab]: {}
    }));

    // Open modal for next date
    setShowModal(true);
  };

  const getAvailableAwayClubs = (homeVenue) => {
    return clubs.filter(club => club.name !== homeVenue)
  }

  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      {/* <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className='d-flex gap-2'>
              {currentLeague?.matchRules && (
                <>
                  {currentLeague.matchRules.regularRound?.status && (
                    <Button
                      variant={selectedRound === 'regularRound' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedRound('regularRound')}
                    >
                      League
                    </Button>
                  )}
                  {currentLeague.matchRules.quarterfinal?.status && (
                    <Button
                      variant={selectedRound === 'quarterfinal' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedRound('quarterfinal')}
                    >
                      Quarter-Final
                    </Button>
                  )}
                  {currentLeague.matchRules.semifinal?.status && (
                    <Button
                      variant={selectedRound === 'semifinal' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedRound('semifinal')}
                    >
                      Semi-Final
                    </Button>
                  )}
                  {currentLeague.matchRules.final?.status && (
                    <Button
                      variant={selectedRound === 'final' ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedRound('final')}
                    >
                      Final
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="d-flex align-items-center gap-3">
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
              <button onClick={() => setShowModal(true)} className='btn' style={{ border: '1px dashed rgba(37, 37, 37, 1)', color: "rgba(37, 37, 37, 1)", background: "transparent" }}><FiPlus size={18} /> Add Date</button>
              <Button variant="primary" style={{ backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none' }}>Export Schedule</Button>
            </div>
          </div>
        </Col>
      </Row> */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

            {/* Round Tabs */}
            <div className="d-flex gap-2 flex-wrap">
              {currentLeague?.matchRules && (
                <>
                  {currentLeague.matchRules.regularRound?.status && (
                    <button
                      className={`round-tab ${selectedRound === "regularRound" ? "active" : ""}`}
                      onClick={() => setSelectedRound("regularRound")}
                    >
                      Regular Match
                    </button>
                  )}

                  {currentLeague.matchRules.quarterfinal?.status && (
                    <button
                      className={`round-tab ${selectedRound === "quarterfinal" ? "active" : ""}`}
                      onClick={() => setSelectedRound("quarterfinal")}
                    >
                      Quarter-Final
                    </button>
                  )}

                  {currentLeague.matchRules.semifinal?.status && (
                    <button
                      className={`round-tab ${selectedRound === "semifinal" ? "active" : ""}`}
                      onClick={() => setSelectedRound("semifinal")}
                    >
                      Semi-Final
                    </button>
                  )}

                  {currentLeague.matchRules.final?.status && (
                    <button
                      className={`round-tab ${selectedRound === "final" ? "active" : ""}`}
                      onClick={() => setSelectedRound("final")}
                    >
                      Final
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Right Controls */}
            <div className="d-flex align-items-center gap-2 flex-nowrap">

              <select
                className="form-select form-select-sm league-select"
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

              <button
                onClick={() => setShowModal(true)}
                className="export-btn"
              >
                <FiPlus size={16} /> Add Date
              </button>

              {/* <button className="export-btn">
                Export
              </button> */}

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
                    {category.categoryType}
                    {/* <span>({category.maxParticipants})</span> */}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
            <Nav.Item>
              <Nav.Link eventKey="all" className={activeTab === 'all' ? 'active' : ''}>
                All
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {currentMatches.length > 0 ? (
            <>
              <div className="home-team-header mb-3">
                <span style={{ fontWeight: '600', color: "rgba(37, 37, 37, 0.8)" }}>Match Schedule</span>
              </div>

              <div style={{ overflowX: 'auto', height: '50vh', borderRadius: '8px', padding: '0', position: 'relative' }}>
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
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Actions</th>
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
                            {match.homeVenue ? (
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
                                <CustomTeamDropdown
                                  matchId={match.id}
                                  venue="home"
                                  clubName={match.homeVenue}
                                  categoryType={{
                                    'levelA': 'Level A',
                                    'levelB': 'Level B',
                                    'mixed': 'Mixed',
                                    'female': 'Female'
                                  }[activeTab]}
                                  selectedTeam={selectedHomeTeam}
                                  onTeamSelect={(teamId) => handleTeamSelection(match.id, 'home', teamId)}
                                />
                              </div>
                            ) : (
                              <CustomClubDropdown
                                matchId={match.id}
                                venue="home"
                                onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                availableClubs={clubs}
                              />
                            )}
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
                                <div style={{ cursor: 'pointer' }} onClick={() => {
                                  if (!selectedAwayTeam) {
                                    const categoryType = {
                                      'levelA': 'Level A',
                                      'levelB': 'Level B',
                                      'mixed': 'Mixed',
                                      'female': 'Female'
                                    }[activeTab];
                                    fetchTeamsForClub(match.awayVenue, categoryType);
                                  }
                                }}>
                                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                    {selectedAwayTeam ? selectedAwayTeam.teamName : match.awayVenue}
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#666' }}>
                                    {selectedAwayTeam ? match.awayVenue : ''}
                                  </div>
                                </div>
                                <CustomTeamDropdown
                                  matchId={match.id}
                                  venue="away"
                                  clubName={match.awayVenue}
                                  categoryType={{
                                    'levelA': 'Level A',
                                    'levelB': 'Level B',
                                    'mixed': 'Mixed',
                                    'female': 'Female'
                                  }[activeTab]}
                                  selectedTeam={selectedAwayTeam}
                                  onTeamSelect={(teamId) => handleTeamSelection(match.id, 'away', teamId)}
                                />
                              </div>
                            ) : (
                              <CustomClubDropdown
                                matchId={match.id}
                                venue="away"
                                onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                availableClubs={getAvailableAwayClubs(match.homeVenue)}
                              />
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
                          <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteMatch(match.id)}
                              style={{ border: 'none', background: 'transparent', color: '#dc3545' }}
                            >
                              <FiTrash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ height: '50vh' }} className="text-center text-muted py-5">
              <p>Please add a match to create schedule</p>
            </div>
          )}
          {currentMatches.length > 0 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-between">
                <div></div>
                {/* <Button variant="light" style={{ padding: '10px 30px', border: '1px solid #ddd' }}>Back</Button> */}
                <div className="d-flex gap-2">
                  {/* <Button
                  onClick={handleSaveAndNextDate}
                  disabled={loadingSchedules}
                  className='export-btn'
                >
                  {loadingSchedules ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Saving...
                    </>
                  ) : (
                    'Save and Next Date'
                  )}
                </Button> */}
                  <Button
                    className='export-btn'
                    disabled={loadingSchedules}
                    onClick={handleSaveSchedule}
                    style={{ width: '8rem' }}
                  >
                    {loadingSchedules ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Schedule'
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          )}
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
                {/* <InputGroup.Text onClick={() => dateInputRef.current?.click()} style={{ borderRadius: '0 6px 6px 0', border: '1px solid #ddd', background: 'rgba(204, 210, 221, 0.43)', cursor: 'pointer' }}>
                  <BsCalendar size={18} color="#666" />
                </InputGroup.Text> */}
              </InputGroup>
              {/* <Form.Control
                type="text"
                placeholder="MM/DD/YY"
                value={formDate}
                readOnly
                style={{ marginTop: '8px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              /> */}
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Venue</Form.Label>
              <Form.Select
                value={formVenue}
                className='py-3'
                onChange={(e) => setFormVenue(e.target.value)}
                style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: "rgba(204, 210, 221, 0.43)", boxShadow: "none" }}
              >
                <option value="">Select Venue</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.name}>
                    {club.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {selectedRound === 'regularRound' && (
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Venue Type</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    id="home-venue"
                    name="venueType"
                    label="Home"
                    checked={isHomeVenue}
                    onChange={() => setIsHomeVenue(true)}
                    style={{ fontSize: '14px' }}
                  />
                  <Form.Check
                    type="radio"
                    id="away-venue"
                    name="venueType"
                    label="Away"
                    checked={!isHomeVenue}
                    onChange={() => setIsHomeVenue(false)}
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </Form.Group>
            )}


            <Button
              variant="primary"
              className="w-100"
              style={{ padding: '12px', backgroundColor: 'rgba(31, 65, 187, 1)', border: 'none', fontWeight: '600' }}
              onClick={handleCreateDate}
              disabled={!formDate || !formVenue}
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