import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Container, Row, Col, Button, Form, Nav, Modal, Dropdown } from 'react-bootstrap'
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import './LeagueScheduleMatch.css'
import ScheduleSidebar from './components/ScheduleSidebar';
import CustomClubSelector from './components/CustomClubSelector';
import FinalistTeamSelector from './components/FinalistTeamSelector';
import { useDispatch, useSelector } from 'react-redux';
import { getLeagues, getLeagueClubs, getClubTeams, saveSchedule, updateSchedule, getLeagueById, getLeagueSummary, exportLeagueSchedulesPDF, getAvailablePlayers, getScheduleDates, getAllSchedules, getLeagueFinalists } from '../../../redux/admin/league/thunk';
import { showError, showSuccess } from '../../../helpers/Toast';
import { FaAngleRight } from 'react-icons/fa'
import ScheduleModal from './components/ScheduleModal';
import ConfirmationModal from './components/ConfirmationModal';

const LeagueSchedule = () => {
  const dispatch = useDispatch();
  const { leagues, leagueClubs, loadingClubs, loadingSchedules, currentLeague, leagueSummary, loadingSummary, loadingExport, scheduleDates, loadingScheduleDates, schedules, categorySummary, finalists, loadingFinalists } = useSelector(state => state.league);
  const [activeTab, setActiveTab] = useState('')
  const [selectedRound, setSelectedRound] = useState('regularRound')
  const [showModal, setShowModal] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [formCategory, setFormCategory] = useState([])
  const [isHomeVenue, setIsHomeVenue] = useState(true)
  const [selectedLeagueId, setSelectedLeagueId] = useState('')
  const [selectedClubId, setSelectedClubId] = useState('')
  const [currentPage] = useState(1)
  const defaultLimit = 15
  const [matchesByCategory, setMatchesByCategory] = useState({
    all: []
  })
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
  const [editingMatchId, setEditingMatchId] = useState(null)

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

  useEffect(() => {
    if (selectedLeagueId && selectedRound === 'final') {
      dispatch(getLeagueFinalists(selectedLeagueId));
    }
  }, [dispatch, selectedLeagueId, selectedRound]);

  const leaguesData = Array.isArray(leagues?.data) ? leagues.data : [];

  // Get available categories from selected league data
  const selectedLeague = leaguesData.find(league => league._id === selectedLeagueId);
  const availableCategories = selectedLeague?.clubs?.[0]?.participationLimit?.categoryLimits || [];

  useEffect(() => {
    if (leaguesData.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(leaguesData[0]._id);
    }
  }, [leaguesData, selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueId) {
      dispatch(getLeagueClubs(selectedLeagueId));
      dispatch(getLeagueById(selectedLeagueId));
      // Get summary for the active category if available
      if (activeTab && activeTab !== 'all') {
        const activeCategory = availableCategories.find(cat => cat._id === activeTab);
        if (activeCategory) {
          dispatch(getLeagueSummary({ leagueId: selectedLeagueId, categoryType: activeCategory.categoryType, roundType: selectedRound }));
        }
      } else {
        dispatch(getLeagueSummary({ leagueId: selectedLeagueId, roundType: selectedRound }));
      }
    }
  }, [dispatch, selectedLeagueId, activeTab, availableCategories, selectedRound]);

  const clubs = leagueClubs.map((club, index) => ({
    id: club.clubId || index + 1,
    name: club.clubName || 'Unknown Club',
    logo: club.clubName ? club.clubName.substring(0, 2).toUpperCase() : 'UC',
    location: club?.clubId?.locations?.[0]?.city,
    categories: club.categories || []
  }));

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

  useEffect(() => {
    if (availableCategories.length > 0) {
      setActiveTab(availableCategories[0]._id);
    } else {
      setActiveTab('');
    }
  }, [availableCategories]);
  // Fetch existing schedules when league, round, active tab or selected date changes
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

      if (selectedScheduleDate) {
        params.startDate = selectedScheduleDate;
        params.endDate = selectedScheduleDate;
      }

      if (activeTab && activeTab !== 'all') {
        const activeCategory = availableCategories.find(cat => cat._id === activeTab);
        if (activeCategory) params.categoryType = activeCategory.categoryType;
      }

      if (selectedClubId) {
        params.clubId = selectedClubId;
      }

      dispatch(getAllSchedules(params));
    }
  }, [dispatch, selectedLeagueId, selectedRound, selectedScheduleDate, activeTab, selectedClubId, availableCategories]);

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
            homeVenue: match.teamA?.clubType || (schedule.roundType === 'final' ? (match.teamA?.teamName || `Winner ${(index * 2) + 1}`) : null),
            awayVenue: match.teamB?.clubType || (schedule.roundType === 'final' ? (match.teamB?.teamName || `Winner ${(index * 2) + 2}`) : null),
            time: convertTo24Hour(match.startTime),
            duration: match.duration || 60,
            endTime: convertTo24Hour(match.endTime),
            isExisting: true, // Flag to identify existing matches
            homeTeam: match.teamA || (schedule.roundType === 'final' ? { teamName: match.teamA?.teamName || `Winner ${(index * 2) + 1}` } : null),
            awayTeam: match.teamB || (schedule.roundType === 'final' ? { teamName: match.teamB?.teamName || `Winner ${(index * 2) + 2}` } : null),
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

  // Separate new matches from existing matches
  const { newMatches, existingMatches } = React.useMemo(() => {
    const existingMatchesData = transformSchedulesToMatches(schedules);
    const newMatchesData = {};
    const existingMerged = {};

    // First, add all existing matches
    Object.keys(existingMatchesData).forEach(categoryId => {
      existingMerged[categoryId] = [...existingMatchesData[categoryId]];
    });

    // Separate new and existing matches from matchesByCategory
    Object.keys(matchesByCategory).forEach(categoryId => {
      if (categoryId === 'all') return;

      const categoryMatches = matchesByCategory[categoryId] || [];

      if (categoryMatches.length > 0) {
        // Separate new matches and existing matches being edited
        const newMatchesList = categoryMatches.filter(match => !match.isExisting);
        const editedExistingMatches = categoryMatches.filter(match => match.isExisting);

        if (newMatchesList.length > 0) {
          newMatchesData[categoryId] = newMatchesList;
        }

        // Replace existing matches with edited versions
        if (editedExistingMatches.length > 0) {
          if (!existingMerged[categoryId]) {
            existingMerged[categoryId] = [];
          }

          editedExistingMatches.forEach(editedMatch => {
            const index = existingMerged[categoryId].findIndex(m => m.id === editedMatch.id);
            if (index !== -1) {
              existingMerged[categoryId][index] = editedMatch;
            }
          });
        }
      }
    });

    return { newMatches: newMatchesData, existingMatches: existingMerged };
  }, [schedules, matchesByCategory, availableCategories]);
  // Check if we're in "view mode" (showing existing data without creating new)
  const isViewMode = !currentScheduleInfo.date && schedules && schedules.length > 0;

  // Get current new and existing matches for display
  const currentNewMatches = activeTab === 'all'
    ? Object.keys(newMatches).filter(key => key !== 'all').flatMap(key => newMatches[key] || [])
    : newMatches[activeTab] || [];

  const currentExistingMatches = activeTab === 'all'
    ? Object.keys(existingMatches).filter(key => key !== 'all').flatMap(key => existingMatches[key] || [])
    : existingMatches[activeTab] || [];

  // Check if there are any new (unsaved) matches
  const hasUnsavedMatches = currentNewMatches.length > 0;

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

  const getSelectedPlayers = (matchId, venue, categoryId = activeTab) => {
    const key = `${matchId}_${venue}`;
    const playerIds = selectedPlayers[categoryId]?.[key] || [];

    if (playerIds.length === 0) return [];

    const categoryData = clubTeamsData[categoryId] || {};
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
    const allMatches = [...(newMatches[activeTab] || []), ...(existingMatches[activeTab] || [])];

    // Get the date from current match or use currentScheduleInfo.date
    const currentMatch = allMatches.find(m => m.id === currentMatchId);
    const targetDate = currentMatch?.date || currentScheduleInfo.date;

    if (!targetDate) return usedPlayers;

    allMatches.forEach(match => {
      if (match.date === targetDate) {
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
    setSelectedClubId('');
  };

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


  const handleEditMatch = async (match, categoryId) => {
    setEditingMatchId(match.id);

    // Add the match to matchesByCategory so edits are tracked
    setMatchesByCategory(prev => {
      const existing = prev[categoryId] || [];
      const matchExists = existing.some(m => m.id === match.id);

      if (!matchExists) {
        return {
          ...prev,
          [categoryId]: [...existing, match]
        };
      }
      return prev;
    });

    // Initialize selected players from existing match data
    if (match.isExisting && match.homeTeam?.players) {
      const homePlayerIds = match.homeTeam.players.map(p => p.playerId);
      setSelectedPlayers(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [`${match.id}_home`]: homePlayerIds
        }
      }));

      // Fetch home club players to populate clubTeamsData
      const categoryType = availableCategories.find(c => c._id === activeTab)?.categoryType;
      if (match.homeVenue && categoryType) {
        await fetchPlayersForClub(match.homeVenue, categoryType);
      }
    }

    if (match.isExisting && match.awayTeam?.players) {
      const awayPlayerIds = match.awayTeam.players.map(p => p.playerId);
      setSelectedPlayers(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [`${match.id}_away`]: awayPlayerIds
        }
      }));

      // Fetch away club players to populate clubTeamsData
      const categoryType = availableCategories.find(c => c._id === activeTab)?.categoryType;
      if (match.awayVenue && categoryType) {
        await fetchPlayersForClub(match.awayVenue, categoryType);
      }
    }
  };

  const handleUpdateMatch = async (match, categoryType) => {
    const roundTypeMap = { regularRound: 'regular', quarterfinal: 'quarterfinal', semifinal: 'semifinal', final: 'final' };
    const scheduleId = match.id.toString().replace('existing_', '').split('_')[0];

    const homePlayers = getSelectedPlayers(match.id, 'home');
    const awayPlayers = getSelectedPlayers(match.id, 'away');
    const homeClubData = clubs.find(c => c.name === match.homeVenue);
    const awayClubData = clubs.find(c => c.name === match.awayVenue);

    const [month, day, year] = match.date.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const utcDate = new Date(Date.UTC(Number(fullYear), Number(month) - 1, Number(day)));

    const venueClub = clubs.find(c => c.name === match.venue);

    const payload = {
      scheduleId,
      date: utcDate.toISOString(),
      venue: match.venue,
      venueClubId: venueClub?.id,
      roundType: roundTypeMap[selectedRound],
      categoryType,
      startTime: convertTo12Hour(match.time),
      endTime: convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60)),
      duration: match.duration || 60,
      teamA: homePlayers.length >= 2 ? {
        clubId: homeClubData?.id,
        ...(selectedRound !== 'final' ? { clubType: match.homeVenue } : {}),
        teamName: match.homeTeam?.teamName || `Team A`,
        players: homePlayers.slice(0, 2).map(p => ({ playerId: p._id, playerName: p.playerName }))
      } : match.homeTeam,
      teamB: awayPlayers.length >= 2 ? {
        clubId: awayClubData?.id,
        ...(selectedRound !== 'final' ? { clubType: match.awayVenue } : {}),
        teamName: match.awayTeam?.teamName || `Team B`,
        players: awayPlayers.slice(0, 2).map(p => ({ playerId: p._id, playerName: p.playerName }))
      } : match.awayTeam
    };


    // Dispatch update action
    const result = await dispatch(updateSchedule(payload));
    if (result.type === 'league/updateSchedule/fulfilled') {
      showSuccess('Match updated successfully');

      // Clear the match from matchesByCategory after successful update
      handleCancelEdit(match.id);

      // Refresh schedules
      const params = { leagueId: selectedLeagueId, roundType: roundTypeMap[selectedRound] };
      if (selectedScheduleDate) {
        params.startDate = selectedScheduleDate;
        params.endDate = selectedScheduleDate;
      }
      if (activeTab && activeTab !== 'all') {
        const activeCategory = availableCategories.find(cat => cat._id === activeTab);
        if (activeCategory) params.categoryType = activeCategory.categoryType;
      }
      dispatch(getAllSchedules(params));

      // Update summary
      if (activeTab && activeTab !== 'all') {
        const activeCategory = availableCategories.find(cat => cat._id === activeTab);
        if (activeCategory) {
          dispatch(getLeagueSummary({ leagueId: selectedLeagueId, categoryType: activeCategory.categoryType, roundType: selectedRound }));
        }
      } else {
        dispatch(getLeagueSummary({ leagueId: selectedLeagueId, roundType: selectedRound }));
      }
    } else {
      setEditingMatchId(null);
    }
  };

  const handleCancelEdit = (matchId) => {
    setEditingMatchId(null);

    // Remove the match from matchesByCategory if it was only added for editing
    const categoryId = activeTab;
    setMatchesByCategory(prev => {
      const currentMatches = prev[categoryId] || [];
      const match = currentMatches.find(m => m.id === matchId);

      // Only remove if it's an existing match (was added just for editing)
      if (match?.isExisting) {
        return {
          ...prev,
          [categoryId]: currentMatches.filter(m => m.id !== matchId)
        };
      }
      return prev;
    });

    // Clear selected players for this match
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      if (updated[categoryId]) {
        delete updated[categoryId][`${matchId}_home`];
        delete updated[categoryId][`${matchId}_away`];
      }
      return updated;
    });
  };

  const handleEditTimeChange = (matchId, categoryId, time) => {
    const currentMatches = matchesByCategory[categoryId] || [];
    const updated = currentMatches.map(m =>
      m.id === matchId ? { ...m, time, endTime: calculateEndTime(time, m.duration || 60) } : m
    );
    setMatchesByCategory(prev => ({ ...prev, [categoryId]: updated }));
  };

  const handleEditDurationChange = (matchId, categoryId, duration) => {
    const currentMatches = matchesByCategory[categoryId] || [];
    const updated = currentMatches.map(m =>
      m.id === matchId ? { ...m, duration: parseInt(duration), endTime: calculateEndTime(m.time, parseInt(duration)) } : m
    );
    setMatchesByCategory(prev => ({ ...prev, [categoryId]: updated }));
  };

  const formatMatchDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [m, d, y] = parts;
      return new Date('20' + y + '-' + m + '-' + d).toLocaleDateString('en-GB');
    }
    return new Date(dateStr).toLocaleDateString('en-GB');
  };
  const handleCreateDate = async () => {
    if (!formDate || !formVenue) return;
    setIsCreatingSchedule(true);

    try {
      const venueClub = clubs.find(club => club.name === formVenue);
      const startTime = '09:00';
      const duration = 60;

      if (selectedRound === 'final') {
        // Finals: use formCategory (multiple categories chosen in modal)
        if (!formCategory.length) { alert('Please select a category'); return; }
        const newMatches = {};
        // Only process categories that don't already have a match (either unsaved or existing for final)
        const categoriesToCreate = formCategory.filter(categoryId => {
          const hasUnsaved = (matchesByCategory[categoryId] || []).length > 0;
          const hasExisting = (existingMatches[categoryId] || []).length > 0;
          return !hasUnsaved && !hasExisting;
        });
        if (categoriesToCreate.length === 0) { setShowModal(false); return; }
        categoriesToCreate.forEach(categoryId => {
          const category = availableCategories.find(cat => cat._id === categoryId);
          const maxParticipants = category?.maxParticipants || 2;
          const numMatches = Math.max(1, Math.floor(maxParticipants / 2));

          const existingMatches = matchesByCategory[categoryId] || [];
          let currentBaseId = existingMatches.length > 0 ? Math.max(...existingMatches.map(m => m.id)) + 1 : 1;

          const catMatches = [];
          for (let i = 0; i < numMatches; i++) {
            const homeIdx = (i * 2) + 1;
            const awayIdx = (i * 2) + 2;
              const homeClubName = finalists?.data?.finalists?.[0]?.clubName || `Winner ${homeIdx}`;
              const awayClubName = finalists?.data?.finalists?.[1]?.clubName || `Winner ${awayIdx}`;
              catMatches.push({
                id: currentBaseId + i,
                date: formDate,
                venue: formVenue,
                venueClubId: venueClub?.id,
                homeVenue: homeClubName,
                awayVenue: awayClubName,
                homeTeam: { teamName: homeClubName },
                awayTeam: { teamName: awayClubName },
                time: startTime,
                duration,
                endTime: calculateEndTime(startTime, duration)
              });
          }
          newMatches[categoryId] = [...existingMatches, ...catMatches];
        });
        setMatchesByCategory(prev => ({ ...prev, ...newMatches }));
      } else {
        // Non-finals: create a row in EVERY category simultaneously
        const newMatchesByCategory = {};
        const newSelectedPlayersByCategory = {};

        await Promise.all(availableCategories.map(async (category) => {
          const categoryId = category._id;
          const existingMatches = matchesByCategory[categoryId] || [];
          const baseId = existingMatches.length > 0 ? Math.max(...existingMatches.map(m => m.id)) + 1 : 1;
          const baseMatch = {
            date: formDate, venue: formVenue, venueClubId: venueClub?.id,
            homeVenue: isHomeVenue ? formVenue : null, awayVenue: null,
            time: startTime, duration, endTime: calculateEndTime(startTime, duration),
            isAwayMatch: !isHomeVenue
          };

          let catMatches = [];
          let catPlayers = {};

          if (isHomeVenue) {
            const players = await fetchPlayersForClub(formVenue, category.categoryType);
            const activePlayers = (players || []).filter(p => p.playerStatus === 'active');
            if (activePlayers.length === 2) {
              catMatches = [{ ...baseMatch, id: baseId }];
              catPlayers[`${baseId}_home`] = activePlayers.map(p => p._id);
            } else if (activePlayers.length > 2) {
              const pairs = [];
              for (let i = 0; i + 1 < activePlayers.length; i += 2) pairs.push([activePlayers[i], activePlayers[i + 1]]);
              catMatches = pairs.map((pair, idx) => {
                const splitId = baseId * 100 + idx;
                catPlayers[`${splitId}_home`] = pair.map(p => p._id);
                return { ...baseMatch, id: splitId, homeTeam: { teamName: `Team ${idx + 1}`, players: pair } };
              });
            }
          }

          if (catMatches.length === 0) catMatches = [{ ...baseMatch, id: baseId }];

          newMatchesByCategory[categoryId] = [...existingMatches, ...catMatches];
          if (Object.keys(catPlayers).length > 0) newSelectedPlayersByCategory[categoryId] = catPlayers;
        }));

        setMatchesByCategory(prev => ({ ...prev, ...newMatchesByCategory }));
        if (Object.keys(newSelectedPlayersByCategory).length > 0) {
          setSelectedPlayers(prev => {
            const updated = { ...prev };
            Object.keys(newSelectedPlayersByCategory).forEach(catId => {
              updated[catId] = { ...updated[catId], ...newSelectedPlayersByCategory[catId] };
            });
            return updated;
          });
        }
      }

      setCurrentScheduleInfo({ date: formDate, venue: formVenue, isHomeVenue });
      setCurrentScheduleDate(formDate);
      setCurrentScheduleVenue(formVenue);
      setCurrentScheduleType(isHomeVenue);
      setShowModal(false);
      setFormCategory([]);
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setIsCreatingSchedule(false);
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

  const handleAwayVenueChange = async (matchId, awayVenue) => {
    const categoryId = activeTab;
    const categoryType = availableCategories.find(c => c._id === categoryId)?.categoryType;

    // Clear previously selected players first
    setSelectedPlayers(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [`${matchId}_away`]: [] }
    }));

    // Update in matchesByCategory
    setMatchesByCategory(prev => {
      const currentMatches = prev[categoryId] || [];
      const matchExists = currentMatches.some(m => m.id === matchId);

      if (matchExists) {
        // Update existing match
        const updatedMatches = currentMatches.map(match =>
          match.id === matchId ? { ...match, awayVenue } : match
        );
        return { ...prev, [categoryId]: updatedMatches };
      } else {
        // Match not in state yet, find it in existingMatches and add it
        const match = existingMatches[categoryId]?.find(m => m.id === matchId);
        if (match) {
          return {
            ...prev,
            [categoryId]: [...currentMatches, { ...match, awayVenue }]
          };
        }
      }
      return prev;
    });

    const players = await fetchPlayersForClub(awayVenue, categoryType);
    const activePlayers = (players || []).filter(p => p.playerStatus === 'active');
    if (activePlayers.length === 2) {
      setSelectedPlayers(prev => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], [`${matchId}_away`]: activePlayers.map(p => p._id) }
      }));
    }
  };

  const handleHomeVenueChange = async (matchId, homeVenue) => {
    const categoryId = activeTab;
    const categoryType = availableCategories.find(c => c._id === categoryId)?.categoryType;

    // Clear previously selected players first
    setSelectedPlayers(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [`${matchId}_home`]: [] }
    }));

    // Update in matchesByCategory
    setMatchesByCategory(prev => {
      const currentMatches = prev[categoryId] || [];
      const matchExists = currentMatches.some(m => m.id === matchId);

      if (matchExists) {
        // Update existing match
        const updatedMatches = currentMatches.map(match =>
          match.id === matchId ? { ...match, homeVenue } : match
        );
        return { ...prev, [categoryId]: updatedMatches };
      } else {
        // Match not in state yet, find it in existingMatches and add it
        const match = existingMatches[categoryId]?.find(m => m.id === matchId);
        if (match) {
          return {
            ...prev,
            [categoryId]: [...currentMatches, { ...match, homeVenue }]
          };
        }
      }
      return prev;
    });

    const players = await fetchPlayersForClub(homeVenue, categoryType);
    const activePlayers = (players || []).filter(p => p.playerStatus === 'active');
    if (activePlayers.length === 2) {
      setSelectedPlayers(prev => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], [`${matchId}_home`]: activePlayers.map(p => p._id) }
      }));
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedLeagueId) { showError('Please select a league.'); return; }

    const roundTypeMap = { regularRound: 'regular', quarterfinal: 'quarterfinal', semifinal: 'semifinal', final: 'final' };
    const roundType = roundTypeMap[selectedRound];

    const unsavedCategories = availableCategories.filter(cat => {
      const catMatches = (matchesByCategory[cat._id] || []).filter(m => !m.isExisting);
      if (catMatches.length === 0) return false;
      if (roundType !== 'final') {
        // For non-finals: only include category if at least one fully valid match exists
        return catMatches.some(m =>
          m.homeVenue && m.awayVenue &&
          getSelectedPlayers(m.id, 'home', cat._id).length === 2 &&
          getSelectedPlayers(m.id, 'away', cat._id).length === 2
        );
      }
      return true;
    });

    if (unsavedCategories.length === 0) { showError('No matches to save.'); return; }

    // Validate: any match that has a club selected must have exactly 2 players
    if (roundType !== 'final') {
      for (const cat of unsavedCategories) {
        const catMatches = (matchesByCategory[cat._id] || []).filter(m => !m.isExisting);
        for (let i = 0; i < catMatches.length; i++) {
          const m = catMatches[i];
          if (m.homeVenue && getSelectedPlayers(m.id, 'home', cat._id).length !== 2) {
            showError(`${cat.categoryType} — Match ${i + 1}: Select exactly 2 players for ${m.homeVenue} (Home)`);
            return;
          }
          if (m.awayVenue && getSelectedPlayers(m.id, 'away', cat._id).length !== 2) {
            showError(`${cat.categoryType} — Match ${i + 1}: Select exactly 2 players for ${m.awayVenue} (Away)`);
            return;
          }
        }
      }
    }

    const firstUnsavedMatch = (matchesByCategory[unsavedCategories[0]._id] || []).find(m => !m.isExisting);
    if (!firstUnsavedMatch) { showError('No matches to save.'); return; }

    const schedulesMap = {};

    unsavedCategories.forEach(category => {
      const catMatches = (matchesByCategory[category._id] || [])
        .filter(m => !m.isExisting)
        .filter(m => roundType === 'final' || (
          m.homeVenue && m.awayVenue &&
          getSelectedPlayers(m.id, 'home', category._id).length === 2 &&
          getSelectedPlayers(m.id, 'away', category._id).length === 2
        ));

      catMatches.forEach((match, index) => {
        if (!match.date || !match.venue) return;

        const [month, day, year] = match.date.split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
        const formattedUtcDate = new Date(Date.UTC(Number(fullYear), Number(month) - 1, Number(day))).toISOString();
        const currentVenueClub = clubs.find(c => c.name === match.venue);

        const key = `${formattedUtcDate}_${currentVenueClub?.id || ''}`;
        if (!schedulesMap[key]) {
          schedulesMap[key] = {
            date: formattedUtcDate,
            venue: match.venue,
            venueClubId: currentVenueClub?.id,
            categoriesMap: {}
          };
        }

        if (!schedulesMap[key].categoriesMap[category.categoryType]) {
          schedulesMap[key].categoriesMap[category.categoryType] = [];
        }

        const homePlayers = selectedRound === 'final' ? match.homeTeam?.players || [] : getSelectedPlayers(match.id, 'home', category._id);
        const awayPlayers = selectedRound === 'final' ? match.awayTeam?.players || [] : getSelectedPlayers(match.id, 'away', category._id);
        const homeClubData = clubs.find(c => c.name === match.homeVenue);
        const awayClubData = clubs.find(c => c.name === match.awayVenue);

        let teamAData = null;
        if (selectedRound === 'final') {
          teamAData = {
            clubId: finalists?.data?.finalists?.[0]?.clubId || homeClubData?.id,
            teamName: match.homeTeam?.teamName || `Winner 1`,
            players: homePlayers.slice(0, 2).map(p => ({ playerId: p.playerId || p._id, playerName: p.playerName }))
          };
        } else if (homePlayers.length >= 2) {
          teamAData = {
            clubId: homeClubData?.id,
            clubType: match.homeVenue,
            teamName: `Team ${index + 1}A`,
            players: homePlayers.slice(0, 2).map(p => ({ playerId: p.playerId || p._id, playerName: p.playerName }))
          };
        }

        let teamBData = null;
        if (selectedRound === 'final') {
          teamBData = {
            clubId: finalists?.data?.finalists?.[1]?.clubId || awayClubData?.id,
            teamName: match.awayTeam?.teamName || `Winner 2`,
            players: awayPlayers.slice(0, 2).map(p => ({ playerId: p.playerId || p._id, playerName: p.playerName }))
          };
        } else if (awayPlayers.length >= 2) {
          teamBData = {
            clubId: awayClubData?.id,
            clubType: match.awayVenue,
            teamName: `Team ${index + 1}B`,
            players: awayPlayers.slice(0, 2).map(p => ({ playerId: p.playerId || p._id, playerName: p.playerName }))
          };
        }

        schedulesMap[key].categoriesMap[category.categoryType].push({
          matchNo: index + 1,
          teamA: teamAData,
          teamB: teamBData,
          startTime: convertTo12Hour(match.time),
          endTime: convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60)),
          duration: match.duration || 60,
          status: 'scheduled'
        });
      });
    });

    const payload = {
      leagueId: selectedLeagueId,
      roundType,
      schedules: Object.values(schedulesMap).map(group => ({
        date: group.date,
        venue: group.venue,
        venueClubId: group.venueClubId,
        categories: Object.keys(group.categoriesMap).map(categoryType => ({
          categoryType,
          matches: group.categoriesMap[categoryType]
        }))
      }))
    };
    const result = await dispatch(saveSchedule(payload));
    if (result.type === 'league/saveSchedule/fulfilled') {
      showSuccess('Schedule saved successfully');
      unsavedCategories.forEach(cat => {
        setMatchesByCategory(prev => ({ ...prev, [cat._id]: [] }));
        setSelectedPlayers(prev => ({ ...prev, [cat._id]: {} }));
        setClubTeamsData(prev => ({ ...prev, [cat._id]: {} }));
        setLoadingTeamsState(prev => ({ ...prev, [cat._id]: {} }));
      });
      setCurrentScheduleInfo({ date: '', venue: '', isHomeVenue: true });
      setFormDate('');
      setFormVenue('');
      setIsHomeVenue(true);
      const params = { leagueId: selectedLeagueId, roundType };
      if (selectedScheduleDate) { params.startDate = selectedScheduleDate; params.endDate = selectedScheduleDate; }
      if (activeTab && activeTab !== 'all') {
        const activeCategory = availableCategories.find(cat => cat._id === activeTab);
        if (activeCategory) params.categoryType = activeCategory.categoryType;
      }
      dispatch(getAllSchedules(params));
      // Update summary for the active category
      if (activeTab && activeTab !== 'all') {
        const activeCategory = availableCategories.find(cat => cat._id === activeTab);
        if (activeCategory) {
          dispatch(getLeagueSummary({ leagueId: selectedLeagueId, categoryType: activeCategory.categoryType, roundType: selectedRound }));
        }
      } else {
        dispatch(getLeagueSummary({ leagueId: selectedLeagueId, roundType: selectedRound }));
      }
      availableCategories.forEach(cat => dispatch(getScheduleDates({ leagueId: selectedLeagueId, roundType: 'final', categoryType: cat.categoryType })));
    }
  };

  const getAvailableAwayClubs = (homeVenue) => {
    return clubs.filter(club => club.name !== homeVenue)
  }

  const handleTabChange = (newTab) => {
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
    const fallbackDateRaw = currentScheduleInfo.date || selectedScheduleDate || new Date().toISOString().split('T')[0];

    let formattedDate = fallbackDateRaw;
    if (fallbackDateRaw.includes('-')) {
      const parts = fallbackDateRaw.split('T')[0].split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[1]}/${parts[2]}/${parts[0].slice(-2)}`;
      }
    }

    const fallbackVenue = currentScheduleInfo.venue || (clubs.length > 0 ? clubs[0].name : '');

    const categoryId = activeTab;
    const currentMatches = matchesByCategory[categoryId] || [];
    const newMatchId = currentMatches.length > 0 ? Math.max(...currentMatches.map(m => m.id)) + 1 : 1;
    const startTime = '09:00';
    const duration = 60;

    const nextIdx = (currentMatches.length * 2) + 1;
    const homeClubName = finalists?.data?.finalists?.[0]?.clubName || `Winner ${nextIdx}`;
    const awayClubName = finalists?.data?.finalists?.[1]?.clubName || `Winner ${nextIdx + 1}`;
    const newMatch = {
      id: newMatchId,
      date: formattedDate,
      venue: fallbackVenue,
      homeVenue: selectedRound === 'final' ? homeClubName : null,
      awayVenue: selectedRound === 'final' ? awayClubName : null,
      homeTeam: selectedRound === 'final' ? { teamName: homeClubName } : null,
      awayTeam: selectedRound === 'final' ? { teamName: awayClubName } : null,
      time: startTime,
      duration: duration,
      endTime: calculateEndTime(startTime, duration),
      isAwayMatch: selectedRound !== 'final'
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
      setFormVenue(currentScheduleInfo.venue);
      // Pre-select categories that already have a match for the current date
      const alreadyScheduled = availableCategories
        .filter(cat => (matchesByCategory[cat._id] || []).length > 0)
        .map(cat => cat._id);
      setFormCategory(alreadyScheduled);
    } else if (selectedRound === 'final') {
      // Auto-select all categories for finals when opening modal without existing schedule
      setFormCategory(availableCategories.map(cat => cat._id));
    }
    if (!currentScheduleInfo.date) setFormVenue('');
    setShowModal(true);
  };

  const rounds = [
    { key: "regularRound", label: "Regular Match" },
    { key: "quarterfinal", label: "Quarter-Final" },
    { key: "semifinal", label: "Semi-Final" },
    { key: "final", label: "Final" },
  ];
  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              {currentLeague?.matchRules && (
                <>
                  {rounds.map(({ key, label }) =>
                    currentLeague.matchRules[key]?.status ? (
                      <button
                        key={key}
                        className={`round-tab ${selectedRound === key ? "active" : ""}`}
                        onClick={() => handleRoundChange(key)}
                      >
                        {label}
                      </button>
                    ) : null
                  )}
                </>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 flex-nowrap">
              {selectedLeagueId && clubs?.length ?
                <select
                  className="form-select form-select-sm league-select"
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  disabled={loadingClubs}
                >
                  <option value="">{loadingClubs ? 'Loading...' : "Select Club"}</option>
                  {clubs?.map((club) => (
                    <option key={club?.id} value={club?.id}>
                      {club?.name}
                    </option>
                  ))}
                </select>
                :
                <></>}
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
                const summaryMatch = categorySummary?.find(s => s.categoryType === category.categoryType);
                const count = summaryMatch ? summaryMatch.matchCount : 0;

                return (
                  <Nav.Item key={tabKey}>
                    <Nav.Link eventKey={tabKey} className={activeTab === tabKey ? 'active' : ''}>
                      {category.categoryType} <span className='fw-semibold' style={{ color: '#1f41bb' }}>{categorySummary?.length > 0 ? `(${count})` : ''}</span>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
              {availableCategories.length > 0 && (
                <Nav.Item>
                  <Nav.Link eventKey="all" className={activeTab === 'all' ? 'active' : ''}>
                    All <span className='fw-semibold' style={{ color: '#1f41bb' }}>{categorySummary?.length > 0 ? `(${categorySummary.reduce((acc, curr) => acc + (curr.matchCount || 0), 0)})` : ''}</span>
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
          ) : (currentNewMatches.length > 0 || currentExistingMatches.length > 0 || currentScheduleInfo.date || selectedScheduleDate) ? (
            <>
              <div className="home-team-header my-3 d-flex justify-content-between align-items-center">
                <span style={{ fontWeight: '600', color: "rgba(37, 37, 37, 0.8)" }}>Match Schedule</span>
                <div className="d-flex align-items-center gap-3">
                  {currentScheduleInfo.date && (
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '14px', color: '#666' }}>Schedule Date:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F41BB' }}>
                        {new Date(currentScheduleInfo.date).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  )}
                  {selectedRound !== 'final' && (selectedScheduleDate || currentScheduleInfo.date) && activeTab !== 'all' && (
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
I need you to analyze the @viewschedule component and the points table in it  Need a separate page for it also with title Points table in the sidebar and there will  be league selection in the page which fetches the points table of a specific league and neeed that the ui of the table will be the same as the one used in the viewschedule page
              <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
                {/* New Matches Table (Unsaved) */}
                {currentNewMatches.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontWeight: '600', color: 'rgba(31, 65, 187, 1)', fontSize: '14px' }}>New Matches (Unsaved)</span>
                    </div>
                    <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e8e8e8' }}>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Match No.</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Team 1</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>
                              <div className='rounded-3' style={{ width: '34px', height: '34px', background: 'rgba(37, 37, 37, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '0 auto' }}>VS</div>
                            </th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Team 2</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Date</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Venue</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Start Time</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Duration</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>End Time</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableCategories
                            .filter(cat => activeTab === 'all' || activeTab === cat._id)
                            .map((category) => {
                              const categoryMatches = (matchesByCategory[category._id] || []).filter(m => !m.isExisting);
                              if (categoryMatches.length === 0) return null;

                              return (
                                <React.Fragment key={category._id}>
                                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <td colSpan="10" style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: 'rgba(31, 65, 187, 1)', borderBottom: '1px solid #ddd' }}>
                                      {category.categoryType}
                                    </td>
                                  </tr>
                                  {categoryMatches.map((match, index) => {
                                    const selectedHomePlayers = getSelectedPlayers(match.id, 'home');
                                    const selectedAwayPlayers = getSelectedPlayers(match.id, 'away');
                                    return (
                                      <tr className='text-center' key={match.id} style={{ backgroundColor: index % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                                        <td style={{ padding: '14px 12px', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', borderBottom: '1px solid #ddd' }}>{String(index + 1).padStart(2, '0')}</td>

                                        <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                                          <div className='d-flex justify-content-center align-items-center gap-2'>
                                            {selectedRound === 'final' ? (
                                              finalists?.data?.finalists?.[0] ? (
                                                <FinalistTeamSelector
                                                  matchId={match.id}
                                                  venue="home"
                                                  clubName={finalists.data.finalists[0].clubName}
                                                  clubLogo={clubs.find(c => c.name === finalists.data.finalists[0].clubName)?.logo}
                                                  availableTeams={finalists.data.finalists[0].categories.find(c => c.categoryType === category.categoryType)?.teams || []}
                                                  selectedTeamName={match.homeTeam?.optionsSelected || match.homeTeam?.teamName || ''}
                                                  onTeamSelect={(team) => {
                                                    const matches = matchesByCategory[category._id] || [];
                                                    const updated = matches.map(m =>
                                                      m.id === match.id ? {
                                                        ...m,
                                                        homeTeam: { teamName: team.teamName, players: team.players || [], optionsSelected: team.teamName },
                                                        homeVenue: finalists.data.finalists[0].clubName
                                                      } : m
                                                    );
                                                    setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                  }}
                                                  openDropdown={openDropdown}
                                                  setOpenDropdown={setOpenDropdown}
                                                />
                                              ) : match.homeTeam?.players && match.homeTeam.players.length > 0 && match.homeVenue && !match.homeVenue.startsWith('Winner') ? (
                                                <div className="d-flex align-items-center">
                                                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'rgba(31, 65, 187, 1)' }}>
                                                    {clubs.find(c => c.name === match.homeVenue)?.logo || 'H'}
                                                  </div>
                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '8px' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937', textAlign: 'left' }}>{match.homeVenue}</div>
                                                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'left', lineHeight: '1.2' }}>
                                                      <span style={{ fontWeight: '600', color: '#1F2937' }}>{match.homeTeam.teamName}</span>
                                                      <span> • {match.homeTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{match.homeTeam?.teamName || match.homeVenue || 'Winner 1'}</div>
                                              )
                                            ) : match.homeVenue ? (
                                              <CustomClubSelector
                                                matchId={match.id}
                                                venue="home"
                                                currentClub={match.homeVenue}
                                                onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                                availableClubs={clubs}
                                                selectedPlayers={selectedHomePlayers}
                                                categoryType={category.categoryType}
                                                openDropdown={openDropdown}
                                                setOpenDropdown={setOpenDropdown}
                                                fetchPlayersForClub={fetchPlayersForClub}
                                                setSelectedPlayers={setSelectedPlayers}
                                                handlePlayerSelection={handlePlayerSelection}
                                                getUsedPlayersForDate={getUsedPlayersForDate}
                                                clubTeamsData={clubTeamsData}
                                                loadingTeamsState={loadingTeamsState}
                                                activeTab={category._id}
                                              />
                                            ) : (
                                              <CustomClubSelector
                                                matchId={match.id}
                                                venue="home"
                                                currentClub={null}
                                                onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                                availableClubs={clubs}
                                                selectedPlayers={[]}
                                                categoryType={category.categoryType}
                                                openDropdown={openDropdown}
                                                setOpenDropdown={setOpenDropdown}
                                                fetchPlayersForClub={fetchPlayersForClub}
                                                setSelectedPlayers={setSelectedPlayers}
                                                handlePlayerSelection={handlePlayerSelection}
                                                getUsedPlayersForDate={getUsedPlayersForDate}
                                                clubTeamsData={clubTeamsData}
                                                loadingTeamsState={loadingTeamsState}
                                                activeTab={category._id}
                                              />
                                            )}
                                          </div>
                                        </td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                                          <div className='rounded-3 text-white' style={{ backgroundColor: "#1F41BB", opacity: "0.1", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto', color: '#1F41BB' }}>VS</div>
                                        </td>
                                        <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                                          <div className='d-flex justify-content-center align-items-center gap-2'>
                                            {selectedRound === 'final' ? (
                                              finalists?.data?.finalists?.[1] ? (
                                                <FinalistTeamSelector
                                                  matchId={match.id}
                                                  venue="away"
                                                  clubName={finalists.data.finalists[1].clubName}
                                                  clubLogo={clubs.find(c => c.name === finalists.data.finalists[1].clubName)?.logo}
                                                  availableTeams={finalists.data.finalists[1].categories.find(c => c.categoryType === category.categoryType)?.teams || []}
                                                  selectedTeamName={match.awayTeam?.optionsSelected || match.awayTeam?.teamName || ''}
                                                  onTeamSelect={(team) => {
                                                    const matches = matchesByCategory[category._id] || [];
                                                    const updated = matches.map(m =>
                                                      m.id === match.id ? {
                                                        ...m,
                                                        awayTeam: { teamName: team.teamName, players: team.players || [], optionsSelected: team.teamName },
                                                        awayVenue: finalists.data.finalists[1].clubName
                                                      } : m
                                                    );
                                                    setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                  }}
                                                  openDropdown={openDropdown}
                                                  setOpenDropdown={setOpenDropdown}
                                                />
                                              ) : match.awayTeam?.players && match.awayTeam.players.length > 0 && match.awayVenue && !match.awayVenue.startsWith('Winner') ? (
                                                <div className="d-flex align-items-center">
                                                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                                    {clubs.find(c => c.name === match.awayVenue)?.logo || 'A'}
                                                  </div>
                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '8px' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937', textAlign: 'left' }}>{match.awayVenue}</div>
                                                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'left', lineHeight: '1.2' }}>
                                                      <span style={{ fontWeight: '600', color: '#1F2937' }}>{match.awayTeam.teamName}</span>
                                                      <span> • {match.awayTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{match.awayTeam?.teamName || match.awayVenue || 'Winner 2'}</div>
                                              )
                                            ) : match.awayVenue ? (
                                              <CustomClubSelector
                                                matchId={match.id}
                                                venue="away"
                                                currentClub={match.awayVenue}
                                                onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                                availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                                selectedPlayers={selectedAwayPlayers}
                                                categoryType={category.categoryType}
                                                openDropdown={openDropdown}
                                                setOpenDropdown={setOpenDropdown}
                                                fetchPlayersForClub={fetchPlayersForClub}
                                                setSelectedPlayers={setSelectedPlayers}
                                                handlePlayerSelection={handlePlayerSelection}
                                                getUsedPlayersForDate={getUsedPlayersForDate}
                                                clubTeamsData={clubTeamsData}
                                                loadingTeamsState={loadingTeamsState}
                                                activeTab={category._id}
                                              />
                                            ) : match.homeVenue ? (
                                              <CustomClubSelector
                                                matchId={match.id}
                                                venue="away"
                                                currentClub={null}
                                                onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                                availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                                selectedPlayers={[]}
                                                categoryType={category.categoryType}
                                                openDropdown={openDropdown}
                                                setOpenDropdown={setOpenDropdown}
                                                fetchPlayersForClub={fetchPlayersForClub}
                                                setSelectedPlayers={setSelectedPlayers}
                                                handlePlayerSelection={handlePlayerSelection}
                                                getUsedPlayersForDate={getUsedPlayersForDate}
                                                clubTeamsData={clubTeamsData}
                                                loadingTeamsState={loadingTeamsState}
                                                activeTab={category._id}
                                              />
                                            ) : (
                                              <>
                                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#ccc', fontWeight: 'bold' }}>+</div>
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#ccc' }}>Select Team 1 First</div>
                                                <div style={{ width: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                  <FaAngleRight size={17} color='#ccc' style={{ opacity: 0.5 }} />
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                                          <input
                                            type="date"
                                            value={(() => {
                                              if (!match.date) return '';
                                              const [m, d, y] = match.date.split('/');
                                              return `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                            })()}
                                            onChange={(e) => {
                                              const dateValue = e.target.value;
                                              if (dateValue) {
                                                const [year, month, day] = dateValue.split('-');
                                                const formatted = month + '/' + day + '/' + year.slice(-2);
                                                const matches = matchesByCategory[category._id] || [];
                                                const updated = matches.map(m =>
                                                  m.id === match.id ? { ...m, date: formatted } : m
                                                );
                                                setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                              }
                                            }}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="form-control form-control-sm"
                                            style={{ width: '140px', margin: '0 auto' }}
                                          />
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                                          <select
                                            value={match.venue || ''}
                                            onChange={(e) => {
                                              const matches = matchesByCategory[category._id] || [];
                                              const venueClub = clubs.find(c => c.name === e.target.value);
                                              const updated = matches.map(m =>
                                                m.id === match.id ? { ...m, venue: e.target.value, venueClubId: venueClub?.id } : m
                                              );
                                              setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                            }}
                                            className="form-select form-select-sm"
                                            style={{ width: '120px', margin: '0 auto' }}
                                          >
                                            <option value="">Select Venue</option>
                                            {clubs.map(club => (
                                              <option key={club.id} value={club.name}>{club.name}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                          <input type="time" value={match.time} onChange={(e) => handleTimeChange(match.id, e.target.value)} className="form-control form-control-sm" style={{ width: '100px', margin: '0 auto' }} />
                                        </td>
                                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                          <select value={match.duration || 60} onChange={(e) => handleDurationChange(match.id, e.target.value)} className="form-select form-select-sm" style={{ width: '80px', margin: '0 auto' }}>
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
                                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMatch(match.id)} style={{ border: 'none', background: 'transparent', color: '#dc3545' }}>
                                            <FiTrash2 size={16} />
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    <div className='d-flex align-items-center justify-content-end my-2'>
                      <Button
                        className='export-btn'
                        disabled={loadingSchedules}
                        onClick={handleSaveSchedule}
                        style={{ padding: '6px 16px', fontSize: '13px' }}
                      >
                        {loadingSchedules ? 'Saving...' : 'Save Schedule'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Matches Table */}
                {currentExistingMatches.length > 0 && (
                  <div>
                    {currentNewMatches.length > 0 && (
                      <div className="mb-2">
                        <span style={{ fontWeight: '600', color: '#666', fontSize: '14px' }}>Existing Schedules</span>
                      </div>
                    )}
                    <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e8e8e8' }}>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Match No.</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Team 1</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>
                              <div className='rounded-3' style={{ width: '34px', height: '34px', background: 'rgba(37, 37, 37, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '0 auto' }}>VS</div>
                            </th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Team 2</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Date</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>Venue</th>
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
                                const rawMatches = existingMatches[category._id] || [];
                                const categoryMatches = rawMatches.map(m => {
                                  const edited = (matchesByCategory[category._id] || []).find(em => em.id === m.id);
                                  return edited || m;
                                });

                                if (categoryMatches.length === 0 && activeTab !== category._id) return null;

                                return (
                                  <React.Fragment key={category._id}>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                      <td colSpan="11" style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: 'rgba(31, 65, 187, 1)', borderBottom: '1px solid #ddd' }}>
                                        {category.categoryType}
                                      </td>
                                    </tr>
                                    {categoryMatches.length > 0 ? (
                                      categoryMatches.map((match, mIndex) => {
                                        const isEditing = editingMatchId === match.id;
                                        return (
                                          <tr className='text-center' key={match.id} style={{ backgroundColor: mIndex % 2 === 1 ? 'rgba(242, 242, 242, 0.7)' : 'white' }}>
                                            <td style={{ padding: '14px 12px', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', borderBottom: '1px solid #ddd' }}>{String(mIndex + 1).padStart(2, '0')}</td>
                                            <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                                              <div className='d-flex justify-content-center align-items-center gap-2'>
                                                {isEditing && finalists?.data?.finalists?.[0] ? (
                                                  <FinalistTeamSelector
                                                    matchId={match.id}
                                                    venue="home"
                                                    clubName={finalists.data.finalists[0].clubName}
                                                    clubLogo={clubs.find(c => c.name === finalists.data.finalists[0].clubName)?.logo}
                                                    availableTeams={finalists.data.finalists[0].categories.find(c => c.categoryType === category.categoryType)?.teams || []}
                                                    selectedTeamName={match.homeTeam?.optionsSelected || match.homeTeam?.teamName || ''}
                                                    onTeamSelect={(team) => {
                                                      const matches = matchesByCategory[category._id] || [];
                                                      const updated = matches.map(m =>
                                                        m.id === match.id ? {
                                                          ...m,
                                                          homeTeam: { teamName: team.teamName, players: team.players || [], optionsSelected: team.teamName },
                                                          homeVenue: finalists.data.finalists[0].clubName
                                                        } : m
                                                      );
                                                      setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                    }}
                                                    openDropdown={openDropdown}
                                                    setOpenDropdown={setOpenDropdown}
                                                  />
                                                ) : match.homeTeam?.players && match.homeTeam.players.length > 0 && match.homeVenue && !match.homeVenue.startsWith('Winner') ? (
                                                  <div className="d-flex align-items-center">
                                                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'rgba(31, 65, 187, 1)' }}>
                                                      {clubs.find(c => c.name === match.homeVenue)?.logo || 'H'}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '8px' }}>
                                                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937', textAlign: 'left' }}>{match.homeVenue}</div>
                                                      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'left', lineHeight: '1.2' }}>
                                                        <span style={{ fontWeight: '600', color: '#1F2937' }}>{match.homeTeam.teamName}</span>
                                                        <span> • {match.homeTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{match.homeTeam?.teamName || match.homeVenue || `Winner ${(mIndex * 2) + 1}`}</div>
                                                )}
                                              </div>
                                            </td>
                                            <td style={{ padding: '14px 12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                                              <div className='rounded-3 text-white' style={{ backgroundColor: "#1F41BB", opacity: "0.1", width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', margin: '0 auto', color: '#1F41BB' }}>VS</div>
                                            </td>
                                            <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd' }}>
                                              <div className='d-flex justify-content-center align-items-center gap-2'>
                                                {isEditing && finalists?.data?.finalists?.[1] ? (
                                                  <FinalistTeamSelector
                                                    matchId={match.id}
                                                    venue="away"
                                                    clubName={finalists.data.finalists[1].clubName}
                                                    clubLogo={clubs.find(c => c.name === finalists.data.finalists[1].clubName)?.logo}
                                                    availableTeams={finalists.data.finalists[1].categories.find(c => c.categoryType === category.categoryType)?.teams || []}
                                                    selectedTeamName={match.awayTeam?.optionsSelected || match.awayTeam?.teamName || ''}
                                                    onTeamSelect={(team) => {
                                                      const matches = matchesByCategory[category._id] || [];
                                                      const updated = matches.map(m =>
                                                        m.id === match.id ? {
                                                          ...m,
                                                          awayTeam: { teamName: team.teamName, players: team.players || [], optionsSelected: team.teamName },
                                                          awayVenue: finalists.data.finalists[1].clubName
                                                        } : m
                                                      );
                                                      setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                    }}
                                                    openDropdown={openDropdown}
                                                    setOpenDropdown={setOpenDropdown}
                                                  />
                                                ) : match.awayTeam?.players && match.awayTeam.players.length > 0 && match.awayVenue && !match.awayVenue.startsWith('Winner') ? (
                                                  <div className="d-flex align-items-center">
                                                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                                      {clubs.find(c => c.name === match.awayVenue)?.logo || 'A'}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '8px' }}>
                                                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937', textAlign: 'left' }}>{match.awayVenue}</div>
                                                      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'left', lineHeight: '1.2' }}>
                                                        <span style={{ fontWeight: '600', color: '#1F2937' }}>{match.awayTeam.teamName}</span>
                                                        <span> • {match.awayTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{match.awayTeam?.teamName || match.awayVenue || `Winner ${(mIndex * 2) + 2}`}</div>
                                                )}
                                              </div>
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                                              {isEditing ? (
                                                <input
                                                  type="date"
                                                  value={(() => {
                                                    if (!match.date) return '';
                                                    const [m, d, y] = match.date.split('/');
                                                    return `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                                  })()}
                                                  onChange={(e) => {
                                                    const dateValue = e.target.value;
                                                    if (dateValue) {
                                                      const [year, month, day] = dateValue.split('-');
                                                      const formatted = month + '/' + day + '/' + year.slice(-2);
                                                      const matches = matchesByCategory[category._id] || [];
                                                      const updated = matches.map(m =>
                                                        m.id === match.id ? { ...m, date: formatted } : m
                                                      );
                                                      setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                    }
                                                  }}
                                                  min={new Date().toISOString().split("T")[0]}
                                                  className="form-control form-control-sm"
                                                  style={{ width: '140px', margin: '0 auto' }}
                                                />
                                              ) : (
                                                formatMatchDate(match.date) || ''
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                                              {isEditing ? (
                                                <select
                                                  value={match.venue || ''}
                                                  onChange={(e) => {
                                                    const matches = matchesByCategory[category._id] || [];
                                                    const venueClub = clubs.find(c => c.name === e.target.value);
                                                    const updated = matches.map(m =>
                                                      m.id === match.id ? { ...m, venue: e.target.value, venueClubId: venueClub?.id } : m
                                                    );
                                                    setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                  }}
                                                  className="form-select form-select-sm"
                                                  style={{ width: '120px', margin: '0 auto' }}
                                                >
                                                  <option value="">Select Venue</option>
                                                  {clubs.map(club => (
                                                    <option key={club.id} value={club.name}>{club.name}</option>
                                                  ))}
                                                </select>
                                              ) : (
                                                match.venue || '—'
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                              {isEditing ? (
                                                <input type="time" value={match.time} onChange={(e) => handleEditTimeChange(match.id, category._id, e.target.value)} className="form-control form-control-sm" style={{ width: '100px', margin: '0 auto' }} />
                                              ) : (
                                                <span style={{ fontSize: '13px', color: '#666' }}>{convertTo12Hour(match.time)}</span>
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                              {isEditing ? (
                                                <select
                                                  value={match.duration || 60}
                                                  onChange={(e) => handleEditDurationChange(match.id, category._id, e.target.value)}
                                                  className="form-select form-select-sm"
                                                  style={{ width: '80px', margin: '0 auto' }}
                                                >
                                                  <option value={30}>30m</option>
                                                  <option value={60}>1h</option>
                                                  <option value={90}>1.5h</option>
                                                  <option value={120}>2h</option>
                                                </select>
                                              ) : (
                                                <span style={{ fontSize: '13px', color: '#666' }}>{match.duration}m</span>
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                              {convertTo12Hour(match.endTime || calculateEndTime(match.time, match.duration || 60))}
                                            </td>
                                            <td style={{ padding: '14px 12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                              {isEditing ? (
                                                <div className="d-flex gap-1 justify-content-center">
                                                  <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleUpdateMatch(match, category.categoryType)}
                                                    style={{ border: 'none', background: 'transparent', color: '#28a745' }}
                                                    title="Save changes"
                                                  >
                                                    <FiCheck size={16} />
                                                  </Button>
                                                  <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleCancelEdit(match.id)}
                                                    style={{ border: 'none', background: 'transparent', color: '#6c757d' }}
                                                    title="Cancel"
                                                  >
                                                    <FiX size={16} />
                                                  </Button>
                                                </div>
                                              ) : (
                                                <Button
                                                  variant="outline-secondary"
                                                  size="sm"
                                                  onClick={() => handleEditMatch(match, category._id)}
                                                  style={{ border: 'none', background: 'transparent', color: '#1F41BB' }}
                                                >
                                                  <FiEdit2 size={15} />
                                                </Button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan="11" style={{ padding: '14px 12px', textAlign: 'center', fontSize: '12px', color: '#999', fontStyle: 'italic', borderBottom: '1px solid #ddd' }}>
                                          No matches for this category. Click 'Add Date' to schedule.
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })
                          ) : (
                            availableCategories
                              .filter(cat => activeTab === 'all' || activeTab === cat._id)
                              .map((category) => {
                                const rawMatches = existingMatches[category._id] || [];
                                const categoryMatches = rawMatches.map(m => {
                                  const edited = (matchesByCategory[category._id] || []).find(em => em.id === m.id);
                                  return edited || m;
                                });
                                if (categoryMatches.length === 0 && activeTab !== category._id) return null;

                                return (
                                  <React.Fragment key={category._id}>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                      <td colSpan="11" style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: 'rgba(31, 65, 187, 1)', borderBottom: '1px solid #ddd' }}>
                                        {category.categoryType}
                                      </td>
                                    </tr>
                                    {categoryMatches.length > 0 ? (
                                      categoryMatches.map((match, index) => {
                                        const isEditing = editingMatchId === match.id;
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
                                                    {match.isExisting && !isEditing ? (
                                                      <>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'rgba(31, 65, 187, 1)' }}>
                                                          {homeClub?.logo || 'H'}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                                            {match.homeVenue}
                                                          </div>
                                                          {match.homeTeam?.players && match.homeTeam.players.length > 0 && (
                                                            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'center' }}>
                                                              {match.homeTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}
                                                            </div>
                                                          )}
                                                        </div>
                                                      </>
                                                    ) : (
                                                      <CustomClubSelector
                                                        matchId={match.id}
                                                        venue="home"
                                                        currentClub={match.homeVenue}
                                                        onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                                        availableClubs={clubs}
                                                        selectedPlayers={selectedHomePlayers}
                                                        categoryType={category.categoryType}
                                                        openDropdown={openDropdown}
                                                        setOpenDropdown={setOpenDropdown}
                                                        fetchPlayersForClub={fetchPlayersForClub}
                                                        setSelectedPlayers={setSelectedPlayers}
                                                        handlePlayerSelection={handlePlayerSelection}
                                                        getUsedPlayersForDate={getUsedPlayersForDate}
                                                        clubTeamsData={clubTeamsData}
                                                        loadingTeamsState={loadingTeamsState}
                                                        activeTab={category._id}
                                                      />
                                                    )}
                                                  </>
                                                ) : (
                                                  <CustomClubSelector
                                                    matchId={match.id}
                                                    venue="home"
                                                    currentClub={null}
                                                    onClubSelect={(clubName) => handleHomeVenueChange(match.id, clubName)}
                                                    availableClubs={clubs}
                                                    selectedPlayers={[]}
                                                    categoryType={category.categoryType}
                                                    openDropdown={openDropdown}
                                                    setOpenDropdown={setOpenDropdown}
                                                    fetchPlayersForClub={fetchPlayersForClub}
                                                    setSelectedPlayers={setSelectedPlayers}
                                                    handlePlayerSelection={handlePlayerSelection}
                                                    getUsedPlayersForDate={getUsedPlayersForDate}
                                                    clubTeamsData={clubTeamsData}
                                                    loadingTeamsState={loadingTeamsState}
                                                    activeTab={category._id}
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
                                                    {match.isExisting && !isEditing ? (
                                                      <>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white' }}>
                                                          {awayClub?.logo || 'A'}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>
                                                            {match.awayVenue}
                                                          </div>
                                                          {match.awayTeam?.players && match.awayTeam.players.length > 0 && (
                                                            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px', textAlign: 'center' }}>
                                                              {match.awayTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}
                                                            </div>
                                                          )}
                                                        </div>
                                                      </>
                                                    ) : (
                                                      <CustomClubSelector
                                                        matchId={match.id}
                                                        venue="away"
                                                        currentClub={match.awayVenue}
                                                        onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                                        availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                                        selectedPlayers={selectedAwayPlayers}
                                                        categoryType={category.categoryType}
                                                        openDropdown={openDropdown}
                                                        setOpenDropdown={setOpenDropdown}
                                                        fetchPlayersForClub={fetchPlayersForClub}
                                                        setSelectedPlayers={setSelectedPlayers}
                                                        handlePlayerSelection={handlePlayerSelection}
                                                        getUsedPlayersForDate={getUsedPlayersForDate}
                                                        clubTeamsData={clubTeamsData}
                                                        loadingTeamsState={loadingTeamsState}
                                                        activeTab={category._id}
                                                      />
                                                    )}
                                                  </>
                                                ) : match.homeVenue ? (
                                                  <CustomClubSelector
                                                    matchId={match.id}
                                                    venue="away"
                                                    currentClub={null}
                                                    onClubSelect={(clubName) => handleAwayVenueChange(match.id, clubName)}
                                                    availableClubs={getAvailableAwayClubs(match.homeVenue)}
                                                    selectedPlayers={[]}
                                                    categoryType={category.categoryType}
                                                    openDropdown={openDropdown}
                                                    setOpenDropdown={setOpenDropdown}
                                                    fetchPlayersForClub={fetchPlayersForClub}
                                                    setSelectedPlayers={setSelectedPlayers}
                                                    handlePlayerSelection={handlePlayerSelection}
                                                    getUsedPlayersForDate={getUsedPlayersForDate}
                                                    clubTeamsData={clubTeamsData}
                                                    loadingTeamsState={loadingTeamsState}
                                                    activeTab={category._id}
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
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                                              {((match.isExisting && isEditing) || !match.isExisting) ? (
                                                <input
                                                  type="date"
                                                  value={(() => {
                                                    if (!match.date) return '';
                                                    const [m, d, y] = match.date.split('/');
                                                    return `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                                  })()}
                                                  onChange={(e) => {
                                                    const dateValue = e.target.value;
                                                    if (dateValue) {
                                                      const [year, month, day] = dateValue.split('-');
                                                      const formatted = month + '/' + day + '/' + year.slice(-2);
                                                      const matches = matchesByCategory[category._id] || [];
                                                      const updated = matches.map(m =>
                                                        m.id === match.id ? { ...m, date: formatted } : m
                                                      );
                                                      setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                    }
                                                  }}
                                                  min={new Date().toISOString().split("T")[0]}
                                                  className="form-control form-control-sm"
                                                  style={{ width: '140px', margin: '0 auto' }}
                                                />
                                              ) : (
                                                formatMatchDate(match.date) || ''
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                                              {((match.isExisting && isEditing) || !match.isExisting) ? (
                                                <select
                                                  value={match.venue || ''}
                                                  onChange={(e) => {
                                                    const matches = matchesByCategory[category._id] || [];
                                                    const venueClub = clubs.find(c => c.name === e.target.value);
                                                    const updated = matches.map(m =>
                                                      m.id === match.id ? { ...m, venue: e.target.value, venueClubId: venueClub?.id } : m
                                                    );
                                                    setMatchesByCategory(prev => ({ ...prev, [category._id]: updated }));
                                                  }}
                                                  className="form-select form-select-sm"
                                                  style={{ width: '120px', margin: '0 auto' }}
                                                >
                                                  <option value="">Select Venue</option>
                                                  {clubs.map(club => (
                                                    <option key={club.id} value={club.name}>{club.name}</option>
                                                  ))}
                                                </select>
                                              ) : (
                                                match.venue || '—'
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                              {match.isExisting ? (
                                                isEditing ? (
                                                  <input type="time" value={match.time} onChange={(e) => handleEditTimeChange(match.id, category._id, e.target.value)} className="form-control form-control-sm" style={{ width: '100px', margin: '0 auto' }} />
                                                ) : (
                                                  <span style={{ fontSize: '13px', color: '#666' }}>{convertTo12Hour(match.time)}</span>
                                                )
                                              ) : (
                                                <input type="time" value={match.time} onChange={(e) => handleTimeChange(match.id, e.target.value)} className="form-control form-control-sm" style={{ width: '100px', margin: '0 auto' }} />
                                              )}
                                            </td>
                                            <td style={{ padding: '14px 12px', fontSize: '13px', color: '#666', borderBottom: '1px solid #ddd' }}>
                                              {match.isExisting ? (
                                                isEditing ? (
                                                  <select value={match.duration || 60} onChange={(e) => handleEditDurationChange(match.id, category._id, e.target.value)} className="form-select form-select-sm" style={{ width: '80px', margin: '0 auto' }}>
                                                    <option value={30}>30m</option>
                                                    <option value={60}>1h</option>
                                                    <option value={90}>1.5h</option>
                                                    <option value={120}>2h</option>
                                                  </select>
                                                ) : (
                                                  <span style={{ fontSize: '13px', color: '#666' }}>{match.duration}m</span>
                                                )
                                              ) : (
                                                <select value={match.duration || 60} onChange={(e) => handleDurationChange(match.id, e.target.value)} className="form-select form-select-sm" style={{ width: '80px', margin: '0 auto' }}>
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
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMatch(match.id)} style={{ border: 'none', background: 'transparent', color: '#dc3545' }}>
                                                  <FiTrash2 size={16} />
                                                </Button>
                                              ) : isEditing ? (
                                                <div className="d-flex gap-1 justify-content-center">
                                                  <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleUpdateMatch(match, category.categoryType)}
                                                    style={{ border: 'none', background: 'transparent', color: '#28a745' }}
                                                    title="Save changes"
                                                  >
                                                    <FiCheck size={16} />
                                                  </Button>
                                                  <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleCancelEdit(match.id)}
                                                    style={{ border: 'none', background: 'transparent', color: '#6c757d' }}
                                                    title="Cancel"
                                                  >
                                                    <FiX size={16} />
                                                  </Button>
                                                </div>
                                              ) : (
                                                <Button
                                                  variant="outline-secondary"
                                                  size="sm"
                                                  onClick={() => handleEditMatch(match, category._id)}
                                                  style={{ border: 'none', background: 'transparent', color: '#1F41BB' }}
                                                >
                                                  <FiEdit2 size={15} />
                                                </Button>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan="11" style={{ padding: '14px 12px', textAlign: 'center', fontSize: '12px', color: '#999', fontStyle: 'italic', borderBottom: '1px solid #ddd' }}>
                                          No matches for this category. Click 'Add Date' to schedule.
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className='h-100 d-flex align-items-center justify-content-center text-muted py-5'>
              <p>No data found</p>
            </div>
          )}
        </Col>
        <ScheduleSidebar
          loadingSummary={loadingSummary}
          loadingScheduleDates={loadingScheduleDates}
          scheduleDates={scheduleDates}
          leagueSummary={leagueSummary}
          leagueId={selectedLeagueId}
          selectedScheduleDate={selectedScheduleDate}
          loadingExport={loadingExport}
          onDateSelection={handleDateSelection}
          setSelectedRound={setSelectedRound}
        // onExport={() => }
        />
      </Row>

      <ScheduleModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setFormVenue('');
          setFormCategory([]);
        }}
        formDate={formDate}
        setFormDate={setFormDate}
        formVenue={formVenue}
        setFormVenue={handleVenueChange}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        availableCategories={availableCategories}
        alreadyScheduledCategories={availableCategories.filter(cat => (matchesByCategory[cat._id] || []).length > 0).map(cat => cat._id)}
        isHomeVenue={isHomeVenue}
        setIsHomeVenue={setIsHomeVenue}
        selectedRound={selectedRound}
        clubs={clubs}
        onCreateDate={handleCreateDate}
        showConfirmationModal={showConfirmationModal}
        onDateChange={handleDateChange}
        isCreatingSchedule={isCreatingSchedule}
        isLocked={!!currentScheduleInfo.date && hasUnsavedMatches}
      />

      <ConfirmationModal
        show={showConfirmationModal}
        onHide={() => {
          setShowConfirmationModal(false);
          setPendingAction(null);
        }}
        title="Unsaved Changes"
        message={`You have unsaved matches. Changing ${pendingAction?.type === 'venueChange' ? 'venue' : pendingAction?.type === 'dateChange' ? 'date' : 'round'} will erase all current matches. Would you like to save them first or proceed without saving?`}
        onConfirm={handleConfirmAction}
        onSave={currentNewMatches.length > 0 ? handleSaveAndProceed : null}
        confirmText="Proceed Without Saving"
        saveText="Save & Proceed"
      />
    </Container >
  )
}

export default LeagueSchedule;