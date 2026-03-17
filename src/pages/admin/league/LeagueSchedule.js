import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Container, Row, Col, Button, Form, Nav, Modal, Dropdown } from 'react-bootstrap'
import { FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi'
import './LeagueScheduleMatch.css'
import { BiExport } from "react-icons/bi";
import { useDispatch, useSelector } from 'react-redux';
import { getLeagues, getLeagueClubs, getClubTeams, saveSchedule, getLeagueById, getLeagueSummary, exportLeagueSchedulesPDF, getAvailablePlayers, getScheduleDates, getAllSchedules } from '../../../redux/admin/league/thunk';
import { showError, showSuccess } from '../../../helpers/Toast';
import { FaAngleRight } from 'react-icons/fa'
import ScheduleModal from './components/ScheduleModal';
import ConfirmationModal from './components/ConfirmationModal';

const LeagueSchedule = () => {
  const dispatch = useDispatch();
  const { leagues, leagueClubs, loadingClubs, loadingSchedules, currentLeague, leagueSummary, loadingSummary, loadingExport, scheduleDates, loadingScheduleDates, schedules } = useSelector(state => state.league);
  const [activeTab, setActiveTab] = useState('')
  const [selectedRound, setSelectedRound] = useState('regularRound')
  const [showModal, setShowModal] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [isHomeVenue, setIsHomeVenue] = useState(true)
  const [selectedAway, setSelectedAway] = useState({})
  const [expandedTeam, setExpandedTeam] = useState(null)
  const dateInputRef = useRef(null)
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [currentPage] = useState(1)
  const defaultLimit = 15
  const [matchesByCategory, setMatchesByCategory] = useState({
    all: []
  })
  const [matchTimes, setMatchTimes] = useState({})
  const [clubTeamsData, setClubTeamsData] = useState({})

  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState({})
  const [loadingTeamsState, setLoadingTeamsState] = useState({})
  const [openDropdown, setOpenDropdown] = useState(null)
  const [currentScheduleDate, setCurrentScheduleDate] = useState('')
  const [currentScheduleVenue, setCurrentScheduleVenue] = useState('')
  const [currentScheduleType, setCurrentScheduleType] = useState(true)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [currentScheduleInfo, setCurrentScheduleInfo] = useState({
    date: '',
    venue: '',
    isHomeVenue: true
  })
  const [selectedScheduleDate, setSelectedScheduleDate] = useState('') // For sidebar date selection

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
      dispatch(getLeagueSummary(selectedLeagueId));
    }
  }, [dispatch, selectedLeagueId]);

  const clubs = leagueClubs.map((club, index) => ({
    id: club.clubId || index + 1,
    name: club.clubName || 'Unknown Club',
    logo: club.clubName ? club.clubName.substring(0, 2).toUpperCase() : 'UC',
    location: club?.clubId?.locations?.[0]?.city,
    categories: club.categories || []
  }));

  // Get available categories from selected league data
  const selectedLeague = leaguesData.find(league => league._id === selectedLeagueId);
  const availableCategories = selectedLeague?.clubs?.[0]?.participationLimit?.categoryLimits || [];

  // Fetch schedule dates when league, categories are available and activeTab is set
  useEffect(() => {
    if (selectedLeagueId && availableCategories.length > 0 && activeTab && activeTab !== 'all') {
      // Find the category for the active tab
      const activeCategory = availableCategories.find(cat => cat._id === activeTab);
      if (activeCategory) {
        dispatch(getScheduleDates({ 
          leagueId: selectedLeagueId, 
          roundType: 'final',
          categoryType: activeCategory.categoryType
        }));
      }
    }
  }, [dispatch, selectedLeagueId, availableCategories, activeTab]);

  // Function to fetch schedule dates for a specific category
  const fetchScheduleDatesForCategory = (categoryType) => {
    if (selectedLeagueId) {
      dispatch(getScheduleDates({ 
        leagueId: selectedLeagueId, 
        roundType: 'final',
        categoryType: categoryType
      }));
    }
  };

  useEffect(() => {
    if (availableCategories.length > 0) {
      setActiveTab(availableCategories[0]._id);
    } else {
      setActiveTab('');
    }
  }, [availableCategories]);

  // Fetch existing schedules when league, round, or selected date changes
  useEffect(() => {
    if (selectedLeagueId && selectedRound) {
      const roundTypeMap = {
        'regularRound': 'regular',
        'quarterfinal': 'quarterfinal', 
        'semifinal': 'semifinal',
        'final': 'final'
      };
      
      const params = {
        leagueId: selectedLeagueId,
        roundType: roundTypeMap[selectedRound]
      };
      
      // If a specific date is selected from sidebar, use it as both start and end date
      if (selectedScheduleDate) {
        params.startDate = selectedScheduleDate;
        params.endDate = selectedScheduleDate;
      }
      
      dispatch(getAllSchedules(params));
    }
  }, [dispatch, selectedLeagueId, selectedRound, selectedScheduleDate]);

  // Transform API schedules data to match table structure
  const transformSchedulesToMatches = (schedulesData) => {
    const transformedMatches = {};
    
    if (!schedulesData || schedulesData.length === 0) return transformedMatches;
    
    schedulesData.forEach(dateGroup => {
      dateGroup.schedules.forEach(schedule => {
        const categoryId = availableCategories.find(cat => cat.categoryType === schedule.categoryType)?._id;
        if (!categoryId) return;
        
        if (!transformedMatches[categoryId]) {
          transformedMatches[categoryId] = [];
        }
        
        schedule.matches.forEach((match, index) => {
          const date = new Date(schedule.date);
          const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
          
          // Convert 12-hour time to 24-hour for input
          const convertTo24Hour = (time12h) => {
            if (!time12h) return '09:00';
            const [time, modifier] = time12h.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
          };
          
          const transformedMatch = {
            id: `existing_${schedule._id}_${index}`,
            date: formattedDate,
            venue: schedule.venue,
            venueClubId: schedule.venueClubId?._id,
            homeVenue: match.teamA?.clubType || (schedule.roundType === 'final' ? 'Winner 1' : null),
            awayVenue: match.teamB?.clubType || (schedule.roundType === 'final' ? 'Winner 2' : null),
            time: convertTo24Hour(match.startTime),
            duration: match.duration || 60,
            endTime: convertTo24Hour(match.endTime),
            isExisting: true, // Flag to identify existing matches
            homeTeam: match.teamA || (schedule.roundType === 'final' ? { teamName: 'Winner 1' } : null),
            awayTeam: match.teamB || (schedule.roundType === 'final' ? { teamName: 'Winner 2' } : null),
            matchNo: match.matchNo,
            status: match.status,
            roundType: schedule.roundType
          };
          
          transformedMatches[categoryId].push(transformedMatch);
        });
      });
    });
    
    return transformedMatches;
  };
  
  // Merge existing schedules with new matches
  const mergedMatches = React.useMemo(() => {
    const existingMatches = transformSchedulesToMatches(schedules);
    const merged = { ...matchesByCategory };
    
    // Add existing matches to each category
    Object.keys(existingMatches).forEach(categoryId => {
      if (!merged[categoryId]) {
        merged[categoryId] = [];
      }
      // Only add existing matches if there are no new matches being created
      const hasNewMatches = merged[categoryId].some(match => !match.isExisting);
      if (!hasNewMatches) {
        merged[categoryId] = existingMatches[categoryId];
      }
    });
    
    return merged;
  }, [schedules, matchesByCategory, availableCategories]);
  
  // Check if we're in "view mode" (showing existing data without creating new)
  const isViewMode = !currentScheduleInfo.date && schedules && schedules.length > 0;
  
  // Use merged matches instead of matchesByCategory for display
  const currentMatches = activeTab === 'all'
    ? Object.keys(mergedMatches).filter(key => key !== 'all').flatMap(key => mergedMatches[key] || [])
    : mergedMatches[activeTab] || [];
  
  // Check if there are any new (unsaved) matches
  const hasUnsavedMatches = currentMatches.some(match => !match.isExisting);

  const fetchPlayersForClub = useCallback(async (clubName, categoryType) => {
    const club = clubs.find(c => c.name === clubName);

    if (!club || !selectedLeagueId || !clubName) {
      return;
    }

    const key = `${club.id}_${categoryType}`;
    const categoryKey = activeTab;

    if (clubTeamsData[categoryKey]?.[key]) {
      return clubTeamsData[categoryKey][key];
    }
    if (loadingTeamsState[categoryKey]?.[key]) {
      return [];
    }

    setLoadingTeamsState(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], [key]: true }
    }));

    try {
      const response = await dispatch(getAvailablePlayers({
        leagueId: selectedLeagueId,
        clubId: club.id,
        categoryType
      }));

      let playersData = [];
      if (response.payload?.success && response.payload?.data) {
        playersData = response.payload.data;
      } else if (Array.isArray(response.payload)) {
        playersData = response.payload;
      }

      setClubTeamsData(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], [key]: playersData }
      }));

      return playersData;

    } catch (error) {
      console.error('Error fetching players:', error);
      setClubTeamsData(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], [key]: [] }
      }));
      return [];
    } finally {
      setLoadingTeamsState(prev => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], [key]: false }
      }));
    }
  }, [clubs, selectedLeagueId, loadingTeamsState, clubTeamsData, activeTab, dispatch]);

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

  const CustomClubSelector = ({ matchId, venue, currentClub, onClubSelect, availableClubs }) => {
    const dropdownId = `club_${matchId}_${venue}`;
    const isOpen = openDropdown === dropdownId;

    const handleDropdownClick = (e) => {
      e.stopPropagation();
      setOpenDropdown(isOpen ? null : dropdownId);
    };

    const handleClubClick = (e, clubName) => {
      e.preventDefault();
      e.stopPropagation();
      onClubSelect(clubName);
      setOpenDropdown(null);
    };

    if (currentClub) {
      // Show selected club with change option
      const club = availableClubs.find(c => c.name === currentClub);
      return (
        <div style={{ position: 'relative' }}>
          <div 
            onClick={handleDropdownClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '50%', 
              border: venue === 'home' ? '2px solid rgba(31, 65, 187, 1)' : 'none',
              background: venue === 'home' ? 'transparent' : '#1a1a1a',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: venue === 'home' ? 'rgba(31, 65, 187, 1)' : 'white'
            }}>
              {club?.logo || (venue === 'home' ? 'H' : 'A')}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                {currentClub}
              </div>
              {/* <div style={{ fontSize: '10px', color: '#666' }}>Click to change</div> */}
            </div>
            {/* <FaAngleRight size={17} color='rgba(31, 65, 187, 1)' /> */}
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
              {availableClubs.map((club, idx) => (
                <div
                  key={idx}
                  onMouseDown={(e) => handleClubClick(e, club.name)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: club.name === currentClub ? '#e3f2fd' : 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = club.name === currentClub ? '#e3f2fd' : '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = club.name === currentClub ? '#e3f2fd' : 'white'}
                >
                  <div className='d-flex align-items-center gap-2'>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'white' }}>
                      {club.logo}
                    </div>
                    {club.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Show add club option when no club selected
    return (
      <div style={{ position: 'relative' }}>
        <div onClick={handleDropdownClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '50%', 
            border: '2px solid rgba(31, 65, 187, 1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '16px', 
            color: 'rgba(31, 65, 187, 1)', 
            fontWeight: 'bold' 
          }}>+</div>
          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Add Club</div>
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
            {availableClubs.map((club, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => handleClubClick(e, club.name)}
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
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'white' }}>
                    {club.logo}
                  </div>
                  {club.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CustomPlayerDropdown = ({ matchId, venue, clubName, categoryType, selectedPlayers, onPlayerSelect }) => {
    const dropdownId = `player_${matchId}_${venue}`;
    const isOpen = openDropdown === dropdownId;
    const club = clubs.find(c => c.name === clubName);
    const key = club ? `${club.id}_${categoryType}` : null;
    const players = key ? (clubTeamsData[activeTab]?.[key] || []) : [];
    const isLoading = key ? (loadingTeamsState[activeTab]?.[key] || false) : false;
    const matchPlayers = selectedPlayers || [];
    const usedPlayers = getUsedPlayersForDate(matchId, venue);

    const handleDropdownClick = (e) => {
      e.stopPropagation();
      if (!isOpen && clubName && key && !clubTeamsData[activeTab]?.[key] && !isLoading) {
        fetchPlayersForClub(clubName, categoryType);
      }
      setOpenDropdown(isOpen ? null : dropdownId);
    };

    const handlePlayerClick = (e, player) => {
      e.preventDefault();
      e.stopPropagation();
      onPlayerSelect(player._id);
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
            ) : players.length > 0 ? (
              players.map((player) => {
                const isSelected = matchPlayers.includes(player._id);
                const isUsedElsewhere = usedPlayers.has(player._id);
                const isDisabled = (matchPlayers.length >= 2 && !isSelected) || isUsedElsewhere;
                return (
                  <div
                    key={player._id}
                    onMouseDown={(e) => !isDisabled && handlePlayerClick(e, player)}
                    style={{
                      padding: '8px 12px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: isSelected ? '#e3f2fd' : isUsedElsewhere ? '#ffebee' : 'white',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => !isDisabled && (e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : '#f8f9fa')}
                    onMouseLeave={(e) => !isDisabled && (e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : isUsedElsewhere ? '#ffebee' : 'white')}
                  >
                    <div className='d-flex align-items-center gap-2'>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected ? '#1976d2' : isUsedElsewhere ? '#f44336' : '#FFD700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: isSelected || isUsedElsewhere ? 'white' : 'black'
                      }}>
                        {isSelected ? '✓' : isUsedElsewhere ? '✗' : player.playerName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>{player.playerName}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          {player.phoneNumber} {isUsedElsewhere && '(Already used)'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                No players found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handlePlayerSelection = (matchId, venue, playerId) => {
    setSelectedPlayers(prev => {
      const key = `${matchId}_${venue}`;
      const currentPlayers = prev[activeTab]?.[key] || [];

      let updatedPlayers;
      if (currentPlayers.includes(playerId)) {
        // Remove player if already selected
        updatedPlayers = currentPlayers.filter(id => id !== playerId);
      } else if (currentPlayers.length < 2) {
        // Add player if less than 2 selected
        updatedPlayers = [...currentPlayers, playerId];
      } else {
        // Don't add if already 2 players selected
        return prev;
      }

      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [key]: updatedPlayers
        }
      };
    });
  };

  const getSelectedPlayers = (matchId, venue) => {
    const key = `${matchId}_${venue}`;
    const playerIds = selectedPlayers[activeTab]?.[key] || [];

    if (playerIds.length === 0) return [];

    const categoryData = clubTeamsData[activeTab] || {};
    const players = [];

    for (const dataKey in categoryData) {
      const clubPlayers = categoryData[dataKey] || [];
      for (const playerId of playerIds) {
        const player = clubPlayers.find(p => p._id === playerId);
        if (player && !players.find(p => p._id === playerId)) {
          players.push(player);
        }
      }
    }

    return players;
  };

  const getUsedPlayersForDate = (currentMatchId, currentVenue) => {
    const usedPlayers = new Set();
    const currentMatches = matchesByCategory[activeTab] || [];

    currentMatches.forEach(match => {
      if (match.date === currentScheduleInfo.date) {
        ['home', 'away'].forEach(venue => {
          if (!(match.id === currentMatchId && venue === currentVenue)) {
            const players = getSelectedPlayers(match.id, venue);
            players.forEach(player => usedPlayers.add(player._id));
          }
        });
      }
    });

    return usedPlayers;
  };

  const handleDeleteMatch = (matchId) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const updatedMatches = currentMatches.filter(match => match.id !== matchId);
    setMatchesByCategory(prev => ({
      ...prev,
      [activeTab]: updatedMatches
    }));
    setSelectedPlayers(prev => {
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

  const awayTeams = [
    { name: 'Courtline', logo: 'CL' },
    { name: 'Padel Haus', logo: 'PH' },
    { name: 'Terrakort', logo: 'TK' }
  ]

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const [year, month, day] = dateValue.split('-');
      const formatted = month + '/' + day + '/' + year.slice(-2);

      // Check if there are unsaved matches and date is different
      if (currentScheduleInfo.date && currentScheduleInfo.date !== formatted && hasUnsavedMatches) {
        setPendingAction({ type: 'dateChange', value: formatted });
        setShowConfirmationModal(true);
        return;
      }

      setFormDate(formatted);
    }
  }

  const handleVenueChange = (newVenue) => {
    // Check if there are unsaved matches and venue is different
    if (currentScheduleInfo.venue && currentScheduleInfo.venue !== newVenue && hasUnsavedMatches) {
      setPendingAction({ type: 'venueChange', value: newVenue });
      setShowConfirmationModal(true);
      return;
    }
    setFormVenue(newVenue);
  };

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

  const handleCreateDate = async () => {
    if (formDate && formVenue) {
      setIsCreatingSchedule(true);

      try {
        // For finals, use formCategory (chosen in modal); for all other rounds, use activeTab
        const categoryId = selectedRound === 'final' ? formCategory : activeTab;

        if (!categoryId) {
          alert("Please select a category");
          return;
        }

        // Single Final Match Validation — only applies to finals
        if (selectedRound === 'final') {
          const existingMatches = matchesByCategory[categoryId] || [];
          if (existingMatches.length > 0) {
            alert("A category can only have a single Final match.");
            return;
          }
        }

        const startTime = '09:00';
        const duration = 60;
        const currentMatches = matchesByCategory[categoryId] || [];
        const venueClub = clubs.find(club => club.name === formVenue);
        const newMatchId = currentMatches.length > 0 ? Math.max(...currentMatches.map(m => m.id)) + 1 : 1;

        const baseMatch = {
          date: formDate,
          venue: formVenue,
          venueClubId: venueClub?.id,
          // Finals use Winner placeholders; all other rounds use normal venue logic
          homeVenue: selectedRound === 'final' ? 'Winner 1' : (isHomeVenue ? formVenue : null),
          awayVenue: selectedRound === 'final' ? 'Winner 2' : null,
          time: startTime,
          duration: duration,
          endTime: calculateEndTime(startTime, duration),
          isAwayMatch: selectedRound !== 'final' && !isHomeVenue
        };

        if (selectedRound === 'final') {
          baseMatch.homeTeam = { teamName: 'Winner 1' };
          baseMatch.awayTeam = { teamName: 'Winner 2' };
        }

        let newMatches = [];
        let newSelectedPlayers = {};

        // Regular, quarter-final, and semi-final all auto-split by teams when home venue is selected
        if (selectedRound !== 'final') {
          const categoryType = availableCategories.find(c => c._id === categoryId)?.categoryType;
          if (categoryType && isHomeVenue) {
            const players = await fetchPlayersForClub(formVenue, categoryType);
            if (players && players.length > 0) {
              // Create matches based on pairs of players (2 players per match)
              const playerPairs = [];
              for (let i = 0; i < players.length; i += 2) {
                if (i + 1 < players.length) {
                  playerPairs.push([players[i], players[i + 1]]);
                }
              }

              newMatches = playerPairs.map((pair, index) => {
                const splitId = (newMatchId * 100) + index;
                return {
                  ...baseMatch,
                  id: splitId,
                  homeTeam: { teamName: `Team ${index + 1}`, players: pair }
                };
              });
            }
          } else if (selectedRound !== 'final' && categoryType && formVenue) {
            // For non-home venues, still fetch players to make them available for selection
            await fetchPlayersForClub(formVenue, categoryType);
          }
        }

        if (newMatches.length === 0) {
          newMatches = [{ ...baseMatch, id: newMatchId }];
        }

        setMatchesByCategory(prev => ({
          ...prev,
          [categoryId]: [...currentMatches, ...newMatches]
        }));

        if (Object.keys(newSelectedPlayers).length > 0) {
          setSelectedPlayers(prev => ({
            ...prev,
            [categoryId]: {
              ...prev[categoryId],
              ...newSelectedPlayers
            }
          }));
        }

        // Store current schedule info
        setCurrentScheduleInfo({
          date: formDate,
          venue: formVenue,
          isHomeVenue: isHomeVenue
        });
        setCurrentScheduleDate(formDate);
        setCurrentScheduleVenue(formVenue);
        setCurrentScheduleType(isHomeVenue);

        setShowModal(false);
        setFormCategory('');

        // Open player dropdown for away matches in non-final rounds
        if (selectedRound !== 'final' && !isHomeVenue) {
          const categoryType = availableCategories.find(c => c._id === categoryId)?.categoryType;
          fetchPlayersForClub(formVenue, categoryType);
          setOpenDropdown(`player_${newMatchId}_away`);
        }
      } catch (error) {
        console.error('Error creating schedule:', error);
      } finally {
        setIsCreatingSchedule(false);
      }
    }
  };


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

    const categoryType = availableCategories.find(c => c._id === activeTab)?.categoryType;
    fetchPlayersForClub(awayVenue, categoryType);
    setOpenDropdown(`player_${matchId}_away`);
  }

  const handleHomeVenueChange = async (matchId, homeVenue) => {
    const currentMatches = matchesByCategory[activeTab] || [];
    const categoryType = availableCategories.find(c => c._id === activeTab)?.categoryType;

    // Fetch players for the selected club
    const players = await fetchPlayersForClub(homeVenue, categoryType);

    if (players && players.length > 0) {
      // For now, just update the venue - player selection will be done via dropdown
      const updatedMatches = currentMatches.map(match =>
        match.id === matchId ? { ...match, homeVenue } : match
      );
      setMatchesByCategory(prev => ({
        ...prev,
        [activeTab]: updatedMatches
      }));
    } else {
      // If no players found, just update the venue
      const updatedMatches = currentMatches.map(match =>
        match.id === matchId ? { ...match, homeVenue } : match
      );
      setMatchesByCategory(prev => ({
        ...prev,
        [activeTab]: updatedMatches
      }));
    }
  }

  const handleSaveSchedule = async () => {
    if (!selectedLeagueId) {
      showError('Please select a league.');
      return;
    }

    const roundTypeMap = {
      'regularRound': 'regular',
      'quarterfinal': 'quarterfinal',
      'semifinal': 'semifinal',
      'final': 'final'
    };

    const roundType = roundTypeMap[selectedRound];
    const categoriesToSave = activeTab === 'all'
      ? availableCategories.filter(cat => matchesByCategory[cat._id]?.length > 0)
      : availableCategories.filter(cat => cat._id === activeTab);

    if (categoriesToSave.length === 0) {
      showError('No matches to save.');
      return;
    }

    let allSavedSuccessfully = true;

    for (const category of categoriesToSave) {
      const catMatches = matchesByCategory[category._id] || [];
      if (catMatches.length === 0) continue;

      // Validation for regular rounds
      if (roundType === 'regular') {
        const incompleteMatches = [];
        catMatches.forEach((match, index) => {
          const selectedHomePlayers = getSelectedPlayers(match.id, 'home');
          const selectedAwayPlayers = getSelectedPlayers(match.id, 'away');

          if (match.homeVenue && selectedHomePlayers.length < 2) {
            incompleteMatches.push(`Match ${index + 1}: Need 2 players for ${match.homeVenue} (Home)`);
          }
          if (match.awayVenue && selectedAwayPlayers.length < 2) {
            incompleteMatches.push(`Match ${index + 1}: Need 2 players for ${match.awayVenue} (Away)`);
          }
        });

        if (incompleteMatches.length > 0) {
          showError(`Category ${category.categoryType} has incomplete matches: ${incompleteMatches.join(', ')}`);
          allSavedSuccessfully = false;
          continue;
        }
      }

      const firstMatch = catMatches[0];
      const venueClub = clubs.find(club => club.name === firstMatch.venue);

      if (!venueClub) {
        showError(`Venue club not found for category ${category.categoryType}.`);
        allSavedSuccessfully = false;
        continue;
      }

      const payload = {
        leagueId: selectedLeagueId,
        categoryType: category.categoryType,
        roundType: roundType,
        venueClubId: venueClub.id,
        venue: firstMatch.venue,
        matches: catMatches.map((match, index) => {
          const selectedHomePlayers = getSelectedPlayers(match.id, 'home');
          const selectedAwayPlayers = getSelectedPlayers(match.id, 'away');
          const homeClubData = clubs.find(club => club.name === match.homeVenue);
          const awayClubData = clubs.find(club => club.name === match.awayVenue);

          return {
            matchNo: index + 1,
            teamA: selectedHomePlayers.length >= 2 ? {
              clubId: homeClubData?.id,
              ...(selectedRound !== 'final' ? { clubType: match.homeVenue } : {}),
              teamName: `Team ${index + 1}A`,
              players: selectedHomePlayers.slice(0, 2).map(player => ({
                playerId: player._id,
                playerName: player.playerName
              }))
            } : null,
            teamB: selectedAwayPlayers.length >= 2 ? {
              clubId: awayClubData?.id,
              ...(selectedRound !== 'final' ? { clubType: match.awayVenue } : {}),
              teamName: `Team ${index + 1}B`,
              players: selectedAwayPlayers.slice(0, 2).map(player => ({
                playerId: player._id,
                playerName: player.playerName
              }))
            } : null,
            time: convertTo12Hour(match.time),
            startTime: convertTo12Hour(match.time),
            endTime: convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60)),
            duration: match.duration || 60,
            status: 'scheduled'
          };
        })
      };

      const [month, day, year] = firstMatch.date.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      const utcDate = new Date(Date.UTC(fullYear, month - 1, day));
      payload.date = utcDate.toISOString();
      const result = await dispatch(saveSchedule(payload));
      if (result.type === 'league/saveSchedule/fulfilled') {
        const catId = category._id;
        // Clear matches for this category on successful save
        setMatchesByCategory(prev => ({
          ...prev,
          [catId]: []
        }));
        setSelectedPlayers(prev => ({
          ...prev,
          [catId]: {}
        }));
        setClubTeamsData(prev => ({
          ...prev,
          [catId]: {}
        }));
        setLoadingTeamsState(prev => ({
          ...prev,
          [catId]: {}
        }));
      } else {
        allSavedSuccessfully = false;
      }
    }

    if (allSavedSuccessfully) {
      if (activeTab === 'all') {
        showSuccess('All categories saved successfully');
      }
      
      // Refresh schedule dates after successful save
      if (selectedLeagueId && availableCategories.length > 0) {
        if (activeTab === 'all') {
          // For 'all' tab, refresh for all categories
          availableCategories.forEach(category => {
            dispatch(getScheduleDates({ 
              leagueId: selectedLeagueId, 
              roundType: 'final',
              categoryType: category.categoryType
            }));
          });
        } else {
          // For specific category tab
          const activeCategory = availableCategories.find(cat => cat._id === activeTab);
          if (activeCategory) {
            dispatch(getScheduleDates({ 
              leagueId: selectedLeagueId, 
              roundType: 'final',
              categoryType: activeCategory.categoryType
            }));
          }
        }
      }
      
      // Refresh league summary to update "By Date" section
      if (selectedLeagueId) {
        dispatch(getLeagueSummary(selectedLeagueId));
      }
      
      // Clear current schedule info after successful save
      setCurrentScheduleInfo({ date: '', venue: '', isHomeVenue: true });
      setFormDate('');
      setFormVenue('');
      setIsHomeVenue(true);
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

    // Clear selected players
    setSelectedPlayers(prev => ({
      ...prev,
      [activeTab]: []
    }));

    // Open modal for next date
    setShowModal(true);
  };

  const getAvailableAwayClubs = (homeVenue) => {
    return clubs.filter(club => club.name !== homeVenue)
  }

  const handleTabChange = (newTab) => {
    // Only show confirmation if there are unsaved matches
    if (activeTab !== 'all' && hasUnsavedMatches && activeTab !== newTab) {
      setPendingAction({ type: 'tabChange', value: newTab });
      setShowConfirmationModal(true);
      return;
    }
    setActiveTab(newTab);
  };

  const handleRoundChange = (newRound) => {
    // Only show confirmation if there are unsaved matches
    if (selectedRound !== newRound && hasUnsavedMatches) {
      setPendingAction({ type: 'roundChange', value: newRound });
      setShowConfirmationModal(true);
      return;
    }
    setSelectedRound(newRound);
    // Clear selected date when changing rounds
    setSelectedScheduleDate('');
    // Only finals collapse to the "All" tab — QF and SF keep per-category tabs
    if (newRound === 'final') {
      setActiveTab('all');
    } else if (availableCategories.length > 0) {
      setActiveTab(availableCategories[0]._id);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      if (pendingAction.type === 'dateChange') {
        setFormDate(pendingAction.value);
        // Clear matches when date changes
        setMatchesByCategory(prev => ({
          ...prev,
          [activeTab]: []
        }));
        setSelectedPlayers(prev => ({
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
        setCurrentScheduleInfo({ date: pendingAction.value, venue: '', isHomeVenue });
      } else if (pendingAction.type === 'venueChange') {
        setFormVenue(pendingAction.value);
        // Clear matches when venue changes
        setMatchesByCategory(prev => ({
          ...prev,
          [activeTab]: []
        }));
        setSelectedPlayers(prev => ({
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
        // Reset current schedule info completely for venue change
        setCurrentScheduleInfo({ date: '', venue: '', isHomeVenue: true });
      } else if (pendingAction.type === 'tabChange') {
        setActiveTab(pendingAction.value);
      } else if (pendingAction.type === 'roundChange') {
        setSelectedRound(pendingAction.value);
        // Clear matches when round changes
        setMatchesByCategory({ all: [] });
        setSelectedPlayers({});
        setClubTeamsData({});
        setLoadingTeamsState({});
        // Only finals collapse to the "All" tab
        if (pendingAction.value === 'final') {
          setActiveTab('all');
        } else if (availableCategories.length > 0) {
          setActiveTab(availableCategories[0]._id);
        }
      }
    }
    setShowConfirmationModal(false);
    setPendingAction(null);
  };

  const handleSaveAndProceed = async () => {
    await handleSaveSchedule();
    
    // After saving, perform the pending action with complete cleanup
    if (pendingAction) {
      if (pendingAction.type === 'venueChange') {
        // Complete reset for venue change after saving
        setFormVenue(pendingAction.value);
        setMatchesByCategory(prev => ({
          ...prev,
          [activeTab]: []
        }));
        setSelectedPlayers(prev => ({
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
        // Reset current schedule info completely
        setCurrentScheduleInfo({ date: '', venue: '', isHomeVenue: true });
      } else {
        // For other types, use the regular confirm action
        handleConfirmAction();
        return; // Exit early to avoid duplicate cleanup
      }
    }
    
    setShowConfirmationModal(false);
    setPendingAction(null);
  };

  // Handle date selection from sidebar
  const handleDateSelection = (dateString) => {
    // If the same date is clicked again, deselect it
    if (selectedScheduleDate === dateString) {
      setSelectedScheduleDate('');
    } else {
      setSelectedScheduleDate(dateString);
    }
    // Clear current schedule info when selecting/deselecting from sidebar
    setCurrentScheduleInfo({ date: '', venue: '', isHomeVenue: true });
  };

  const handleAddMoreRows = () => {
    if (!currentScheduleInfo.venue || !currentScheduleInfo.date) return;
    
    const categoryId = activeTab;
    const currentMatches = matchesByCategory[categoryId] || [];
    const newMatchId = currentMatches.length > 0 ? Math.max(...currentMatches.map(m => m.id)) + 1 : 1;
    const startTime = '09:00';
    const duration = 60;
    
    const newMatch = {
      id: newMatchId,
      date: currentScheduleInfo.date,
      venue: currentScheduleInfo.venue,
      homeVenue: null,
      awayVenue: null,
      time: startTime,
      duration: duration,
      endTime: calculateEndTime(startTime, duration),
      isAwayMatch: true
    };
    
    setMatchesByCategory(prev => ({
      ...prev,
      [categoryId]: [...currentMatches, newMatch]
    }));
  };

  const handleOpenModal = () => {
    if (currentScheduleInfo.date) {
      setFormDate(currentScheduleInfo.date);
      setIsHomeVenue(currentScheduleInfo.isHomeVenue);
    }
    setFormVenue('');
    setShowModal(true);
  };

  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
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
                      onClick={() => handleRoundChange("regularRound")}
                    >
                      Regular Match
                    </button>
                  )}
                  {currentLeague.matchRules.quarterfinal?.status && (
                    <button
                      className={`round-tab ${selectedRound === "quarterfinal" ? "active" : ""}`}
                      onClick={() => handleRoundChange("quarterfinal")}
                    >
                      Quarter-Final
                    </button>
                  )}
                  {currentLeague.matchRules.semifinal?.status && (
                    <button
                      className={`round-tab ${selectedRound === "semifinal" ? "active" : ""}`}
                      onClick={() => handleRoundChange("semifinal")}
                    >
                      Semi-Final
                    </button>
                  )}
                  {currentLeague.matchRules.final?.status && (
                    <button
                      className={`round-tab ${selectedRound === "final" ? "active" : ""}`}
                      onClick={() => handleRoundChange("final")}
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
                onClick={handleOpenModal}
                className="export-btn"
              >
                <FiPlus size={16} /> Add Date
              </button>
            </div>
          </div>
        </Col>
      </Row>
      <Row className='border-top' style={{ minHeight: 'calc(100vh - 200px)' }}>

        <Col md={10} style={{ overflowY: 'auto' }}>
          {/* Show category tabs for regular, quarter-final, and semi-final rounds */}
          {selectedRound !== 'final' && (
            <Nav variant="tabs" activeKey={activeTab} onSelect={handleTabChange} className="level-tabs border-0 mb-3">
              {availableCategories.map((category) => {
                const tabKey = category._id;

                if (!tabKey) return null;
                return (
                  <Nav.Item key={tabKey}>
                    <Nav.Link eventKey={tabKey} className={activeTab === tabKey ? 'active' : ''}>
                      {category.categoryType}
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
              {availableCategories.length > 0 && (
                <Nav.Item>
                  <Nav.Link eventKey="all" className={activeTab === 'all' ? 'active' : ''}>
                    All
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          )}

          {loadingSchedules ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading schedules...</p>
              </div>
            </div>
          ) : currentMatches.length > 0 ? (
            <>
              <div className="home-team-header my-3 d-flex justify-content-between align-items-center">
                <span style={{ fontWeight: '600', color: "rgba(37, 37, 37, 0.8)" }}>Match Schedule</span>
                <div className="d-flex align-items-center gap-3">
                  {currentScheduleInfo.date && (
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '14px', color: '#666' }}>Schedule Date:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F41BB' }}>
                        {currentScheduleInfo.date}
                      </span>
                    </div>
                  )}
                  {currentScheduleInfo.venue && (
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '14px', color: '#666' }}>Venue:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F41BB' }}>
                        {currentScheduleInfo.venue}
                      </span>
                    </div>
                  )}
                  {selectedRound !== 'final' && currentMatches.length > 0 && currentScheduleInfo.venue && (
                    <button
                      onClick={handleAddMoreRows}
                      className="btn btn-sm"
                      style={{
                        background: '#1F41BB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <FiPlus size={14} /> Add More
                    </button>
                  )}
                </div>
              </div>

              <div style={{ overflowX: 'auto', height: '65vh', borderRadius: '8px', padding: '0', position: 'relative' }}>
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
                    {selectedRound === 'final' ? (
                      availableCategories
                        .filter(cat => activeTab === 'all' || activeTab === cat._id)
                        .map((category) => {
                          const categoryMatches = mergedMatches[category._id] || [];
                          if (categoryMatches.length === 0 && activeTab !== category._id) return null;

                          return (
                            <React.Fragment key={category._id}>
                              <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <td colSpan="8" style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', fontSize: '13px', color: 'rgba(31, 65, 187, 1)', borderBottom: '1px solid #ddd' }}>
                                  {category.categoryType}
                                </td>
                              </tr>
                              {categoryMatches.length > 0 ? (
                                categoryMatches.map((match, mIndex) => {
                                  const homeClub = clubs.find(club => club.name === (match.homeVenue === 'Winner 1' ? null : match.homeVenue));
                                  const awayClub = clubs.find(club => club.name === (match.awayVenue === 'Winner 2' ? null : match.awayVenue));
                                  const selectedHomePlayers = match.isExisting ? [] : getSelectedPlayers(match.id, 'home');
                                  const selectedAwayPlayers = match.isExisting ? [] : getSelectedPlayers(match.id, 'away');
                                  return (
                                    <tr className='text-center' key={match.id} style={{ backgroundColor: mIndex % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                                      <td style={{ padding: '14px 12px', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', borderBottom: '1px solid #ddd' }}>{String(mIndex + 1).padStart(2, '0')}</td>
                                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                                        {/* Home Venue Logic */}
                                        {match.homeVenue ? (
                                          <div className='d-flex justify-content-center align-items-center gap-2'>
                                            <div>
                                              <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                                {match.isExisting && (match.roundType === 'final' || selectedRound === 'final') ? 
                                                  (match.homeTeam?.teamName || match.homeVenue) : 
                                                  (selectedHomePlayers.length > 0 ? `${selectedHomePlayers.length}/2 Players` : match.homeVenue)
                                                }
                                              </div>
                                              {match.isExisting && match.homeTeam?.players && match.homeTeam.players.length > 0 && (
                                                <div style={{ fontSize: '10px', color: '#666' }}>
                                                  {match.homeTeam.players.map(p => p.playerName).join(', ')}
                                                </div>
                                              )}
                                              {!match.isExisting && selectedRound !== 'final' && selectedHomePlayers.length > 0 && (
                                                <div style={{ fontSize: '10px', color: '#666' }}>
                                                  {selectedHomePlayers.map(p => p.playerName).join(', ')}
                                                </div>
                                              )}
                                            </div>
                                            {!match.isExisting && selectedRound !== 'final' && (
                                              <CustomPlayerDropdown
                                                matchId={match.id}
                                                venue="home"
                                                clubName={match.homeVenue}
                                                categoryType={category.categoryType}
                                                selectedPlayers={selectedHomePlayers.map(p => p._id)}
                                                onPlayerSelect={(playerId) => handlePlayerSelection(match.id, 'home', playerId)}
                                              />
                                            )}
                                          </div>
                                        ) : (
                                          <CustomClubSelector
                                            matchId={match.id || match._id}
                                            venue="home"
                                            currentClub={null}
                                            onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                            availableClubs={clubs}
                                          />
                                        )}
                                      </td>
                                      <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                                        <div className='rounded-3 text-white' style={{ backgroundColor: "#1F41BB", opacity: "0.1", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto', color: '#1F41BB' }}>VS</div>
                                      </td>
                                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                                        {/* Away Venue Logic */}
                                        {match.awayVenue ? (
                                          <div className='d-flex justify-content-center align-items-center gap-2'>
                                            <div>
                                              <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                                {match.isExisting && (match.roundType === 'final' || selectedRound === 'final') ? 
                                                  (match.awayTeam?.teamName || match.awayVenue) : 
                                                  (selectedAwayPlayers.length > 0 ? `${selectedAwayPlayers.length}/2 Players` : match.awayVenue)
                                                }
                                              </div>
                                              {match.isExisting && match.awayTeam?.players && match.awayTeam.players.length > 0 && (
                                                <div style={{ fontSize: '10px', color: '#666' }}>
                                                  {match.awayTeam.players.map(p => p.playerName).join(', ')}
                                                </div>
                                              )}
                                              {!match.isExisting && selectedRound !== 'final' && selectedAwayPlayers.length > 0 && (
                                                <div style={{ fontSize: '10px', color: '#666' }}>
                                                  {selectedAwayPlayers.map(p => p.playerName).join(', ')}
                                                </div>
                                              )}
                                            </div>
                                            {!match.isExisting && selectedRound !== 'final' && (
                                              <CustomPlayerDropdown
                                                matchId={match.id}
                                                venue="away"
                                                clubName={match.awayVenue}
                                                categoryType={category.categoryType}
                                                selectedPlayers={selectedAwayPlayers.map(p => p._id)}
                                                onPlayerSelect={(playerId) => handlePlayerSelection(match.id, 'away', playerId)}
                                              />
                                            )}
                                          </div>
                                        ) : match.homeVenue ? (
                                          <CustomClubSelector
                                            matchId={match.id}
                                            venue="away"
                                            currentClub={null}
                                            onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                            availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                          />
                                        ) : (
                                          <div className='d-flex justify-content-center align-items-center gap-2' style={{ opacity: 0.5 }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#ccc', fontWeight: 'bold' }}>+</div>
                                            <div style={{ fontWeight: '600', fontSize: '13px', color: '#ccc' }}>Select Home Club First</div>
                                          </div>
                                        )}
                                      </td>
                                      <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                        {match.isExisting ? (
                                          <span style={{ fontSize: '13px', color: '#666' }}>
                                            {convertTo12Hour(match.time)}
                                          </span>
                                        ) : (
                                          <input
                                            type="time"
                                            value={match.time}
                                            onChange={(e) => handleTimeChange(match.id, e.target.value)}
                                            className="form-control form-control-sm"
                                            style={{ width: '100px', margin: '0 auto' }}
                                          />
                                        )}
                                      </td>
                                      <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                        {match.isExisting ? (
                                          <span style={{ fontSize: '13px', color: '#666' }}>{match.duration}m</span>
                                        ) : (
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
                                        )}
                                      </td>
                                      <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                        {convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60))}
                                      </td>
                                      <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                        {!match.isExisting ? (
                                          <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteMatch(match.id)}
                                            style={{ border: 'none', background: 'transparent', color: '#dc3545' }}
                                          >
                                            <FiTrash2 size={16} />
                                          </Button>
                                        ) : (
                                          <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>Saved</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="8" style={{ padding: '14px 12px', textAlign: 'center', fontSize: '12px', color: '#999', fontStyle: 'italic', borderBottom: '1px solid #ddd' }}>
                                    No matches for this category. Click 'Add Date' to schedule.
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                    ) : (
                      currentMatches.map((match, index) => {
                        const homeClub = clubs.find(club => club.name === match.homeVenue);
                        const awayClub = clubs.find(club => club.name === match.awayVenue);
                        const selectedHomePlayers = getSelectedPlayers(match.id, 'home');
                        const selectedAwayPlayers = getSelectedPlayers(match.id, 'away');
                        return (
                          <tr className='text-center' key={match.id} style={{ backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                            <td style={{ padding: '14px 12px', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', borderBottom: '1px solid #ddd' }}>{String(index + 1).padStart(2, '0')}</td>
                            <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                              <div className='d-flex justify-content-center align-items-center gap-2'>
                                {match.homeVenue ? (
                                  <>
                                    {match.isExisting ? (
                                      <>
                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'rgba(31, 65, 187, 1)' }}>
                                          {homeClub?.logo || 'H'}
                                        </div>
                                        <div>
                                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                            {match.homeTeam ? match.homeTeam.teamName : match.homeVenue}
                                          </div>
                                          {match.homeTeam?.players && (
                                            <div className='fw-semibold' style={{ fontSize: '12px', color: '#666' }}>
                                              {match.homeTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <CustomClubSelector
                                          matchId={match.id}
                                          venue="home"
                                          currentClub={match.homeVenue}
                                          onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                          availableClubs={clubs}
                                        />
                                        <CustomPlayerDropdown
                                          matchId={match.id}
                                          venue="home"
                                          clubName={match.homeVenue}
                                          categoryType={availableCategories.find(c => c._id === activeTab)?.categoryType}
                                          selectedPlayers={selectedHomePlayers.map(p => p._id)}
                                          onPlayerSelect={(playerId) => handlePlayerSelection(match.id, 'home', playerId)}
                                        />
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <CustomClubSelector
                                    matchId={match.id}
                                    venue="home"
                                    currentClub={null}
                                    onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                    availableClubs={clubs}
                                  />
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                              <div className='rounded-3 text-white' style={{ backgroundColor: "#1F41BB", opacity: "0.1", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto', color: '#1F41BB' }}>VS</div>
                            </td>
                            <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                              <div className='d-flex justify-content-center align-items-center gap-2'>
                                {match.awayVenue ? (
                                  <>
                                    {match.isExisting ? (
                                      <>
                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                          {awayClub?.logo || 'A'}
                                        </div>
                                        <div>
                                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                            {match.awayTeam ? match.awayTeam.teamName : match.awayVenue}
                                          </div>
                                          {match.awayTeam?.players && (
                                            <div className='fw-semibold' style={{ fontSize: '12px', color: '#666' }}>
                                              {match.awayTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <CustomClubSelector
                                          matchId={match.id}
                                          venue="away"
                                          currentClub={match.awayVenue}
                                          onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                          availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                        />
                                        <CustomPlayerDropdown
                                          matchId={match.id}
                                          venue="away"
                                          clubName={match.awayVenue}
                                          categoryType={availableCategories.find(c => c._id === activeTab)?.categoryType}
                                          selectedPlayers={selectedAwayPlayers.map(p => p._id)}
                                          onPlayerSelect={(playerId) => handlePlayerSelection(match.id, 'away', playerId)}
                                        />
                                      </>
                                    )}
                                  </>
                                ) : match.homeVenue ? (
                                  <CustomClubSelector
                                    matchId={match.id}
                                    venue="away"
                                    currentClub={null}
                                    onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                    availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                  />
                                ) : (
                                  <>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#ccc', fontWeight: 'bold' }}>+</div>
                                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#ccc' }}>Select Home Club First</div>
                                    <div style={{ width: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <FaAngleRight size={17} color='#ccc' style={{ opacity: 0.5 }} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                              {match.isExisting ? (
                                <span style={{ fontSize: '13px', color: '#666' }}>{match.time}</span>
                              ) : (
                                <input
                                  type="time"
                                  value={match.time}
                                  onChange={(e) => handleTimeChange(match.id, e.target.value)}
                                  className="form-control form-control-sm"
                                  style={{ width: '100px', margin: '0 auto' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                              {match.isExisting ? (
                                <span style={{ fontSize: '13px', color: '#666' }}>{match.duration}m</span>
                              ) : (
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
                              )}
                            </td>
                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                              {convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60))}
                            </td>
                            <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                              {!match.isExisting ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteMatch(match.id)}
                                  style={{ border: 'none', background: 'transparent', color: '#dc3545' }}
                                >
                                  <FiTrash2 size={16} />
                                </Button>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>Saved</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className='h-100 d-flex align-items-center justify-content-center text-muted py-5'>
              <p>No data found</p>
            </div>
          )}
          {currentMatches.length > 0 && hasUnsavedMatches && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-between">
                <div></div>
                <div className="d-flex gap-2">
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
        <Col md={2} className='d-flex flex-column border-end' style={{ backgroundColor: "#FBFCFE", padding: '16px', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '15px' }}>Summary</span>
          </div>
          {loadingSummary || loadingScheduleDates ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary"></div>
            </div>
          ) : (
            <>
              {/* Schedule Dates Section */}
              {scheduleDates?.length > 0 && (
                <div className="mb-3">
                  <div className='mb-2' style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Final Countdown</div>
                  <div className="d-flex flex-column gap-2">
                    {scheduleDates.map((dateItem, idx) => {
                      const finalDate = new Date(dateItem.date);
                      const now = new Date();
                      const timeDiff = finalDate.getTime() - now.getTime();
                      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                      
                      const isToday = daysLeft === 0;
                      const isPast = daysLeft < 0;
                      const isUpcoming = daysLeft > 0;
                      const isSelected = selectedScheduleDate === dateItem.date;
                      
                      return (
                        <div 
                          key={idx} 
                          className='border rounded-3' 
                          onClick={() => handleDateSelection(dateItem.date)}
                          style={{ 
                            background: isSelected ? 'rgba(31, 65, 187, 0.1)' : (isPast ? 'rgba(248, 249, 250, 1)' : isToday ? 'rgba(255, 243, 205, 1)' : 'rgba(232, 244, 253, 1)'), 
                            borderRadius: '8px', 
                            padding: '12px', 
                            textAlign: 'center',
                            border: isSelected ? '2px solid #1F41BB' : (isToday ? '2px solid #ffc107' : '1px solid #dee2e6'),
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <div className='mb-2'>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                              {finalDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          
                          <div className="text-center mb-2">
                            {isPast ? (
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#6c757d' }}>
                                Final Completed
                              </div>
                            ) : isToday ? (
                              <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff6b35' }}>
                                🔥 TODAY!
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1F41BB' }}>
                                  {daysLeft}
                                </div>
                                <div style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>
                                  {daysLeft === 1 ? 'day left' : 'days left'}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* <div className="d-flex justify-content-center">
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#666', 
                              background: 'rgba(255, 255, 255, 0.7)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }}>
                              Final Match
                            </div>
                          </div> */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {leagueSummary?.byDate?.length > 0 ? (
                <div className="mb-3">
                  <div className='mb-2' style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By Date</div>
                  <div className="d-flex flex-column gap-2">
                    {leagueSummary.byDate.map((item, idx) => {
                      const isSelected = selectedScheduleDate === item.date;
                      return (
                        <div 
                          key={idx} 
                          className='border rounded-3' 
                          onClick={() => handleDateSelection(item.date)}
                          style={{ 
                            background: isSelected ? 'rgba(31, 65, 187, 0.1)' : 'rgba(251, 252, 254, 1)', 
                            borderRadius: '8px', 
                            padding: '12px', 
                            textAlign: 'center',
                            border: isSelected ? '2px solid #1F41BB' : '1px solid #dee2e6',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#1F41BB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </div>
                          )}
                          <div className='d-flex justify-content-between align-items-center gap-2 mb-2'>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                              {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent date selection when clicking export
                                dispatch(exportLeagueSchedulesPDF({ leagueId: selectedLeagueId }));
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                background: 'rgba(31, 65, 187, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: loadingExport ? 'not-allowed' : 'pointer',
                                opacity: loadingExport ? 0.6 : 1,
                                pointerEvents: loadingExport ? 'none' : 'auto'
                              }}
                            >
                              <BiExport size={14} />
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center text-start">
                            <div className='mb-1 text-start' style={{ fontSize: '12px', color: '#666' }}>
                              <p className='mb-0'>Matches: {String(item.matchCount).padStart(2, '0')}</p>
                            </div>
                            <div className='mb-1 text-end' style={{ fontSize: '12px', color: '#666' }}>
                              <p className='mb-0'>{item.venueName}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className='h-100 d-flex align-items-center justify-content-center'>
                  <p>No data found</p>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      <ScheduleModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setFormVenue('');
          setFormCategory('');
        }}
        formDate={formDate}
        setFormDate={setFormDate}
        formVenue={formVenue}
        setFormVenue={handleVenueChange}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        availableCategories={availableCategories}
        isHomeVenue={isHomeVenue}
        setIsHomeVenue={setIsHomeVenue}
        selectedRound={selectedRound}
        clubs={clubs}
        onCreateDate={handleCreateDate}
        showConfirmationModal={showConfirmationModal}
        onDateChange={handleDateChange}
        isCreatingSchedule={isCreatingSchedule}
      />

      <ConfirmationModal
        show={showConfirmationModal}
        onHide={() => {
          setShowConfirmationModal(false);
          setPendingAction(null);
        }}
        title="Unsaved Changes"
        message={`You have unsaved matches in the current ${pendingAction?.type === 'tabChange' ? 'category' : pendingAction?.type === 'venueChange' ? 'venue' : 'schedule'}. Changing ${pendingAction?.type === 'tabChange' ? 'category' : pendingAction?.type === 'venueChange' ? 'venue' : pendingAction?.type === 'dateChange' ? 'date' : 'round'} will erase all current matches. Would you like to save them first or proceed without saving?`}
        onConfirm={handleConfirmAction}
        onSave={currentMatches.length > 0 ? handleSaveAndProceed : null}
        confirmText="Proceed Without Saving"
        saveText="Save & Proceed"
      />
    </Container >
  )
}

export default LeagueSchedule