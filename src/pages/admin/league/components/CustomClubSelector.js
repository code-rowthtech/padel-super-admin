import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaAngleRight } from 'react-icons/fa';

const CustomClubSelector = ({
  matchId,
  venue,
  currentClub,
  onClubSelect,
  availableClubs,
  selectedPlayers = [],
  categoryType,
  openDropdown,
  setOpenDropdown,
  fetchPlayersForClub,
  setSelectedPlayers,
  handlePlayerSelection,
  clubTeamsData,
  loadingTeamsState,
  activeTab
}) => {
  const dropdownId = `club_${matchId}_${venue}`;
  const isOpen = openDropdown === dropdownId;
  const [hoveredClub, setHoveredClub] = useState(currentClub || null);
  const toggleRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Pre-fetch all clubs' players when dropdown opens and calculate pos
  useEffect(() => {
    if (isOpen) {
      availableClubs.forEach(club => fetchPlayersForClub(club.name, categoryType));
      setHoveredClub(currentClub || availableClubs[0]?.name || null);

      if (toggleRef.current) {
        const rect = toggleRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY + 5,
          left: rect.left + window.scrollX
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = (e) => {
      // Don't close if the scroll originated from within the dropdown itself
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, setOpenDropdown]);

  const hoveredClubObj = availableClubs.find(c => c.name === hoveredClub);
  const hoveredKey = hoveredClubObj ? `${hoveredClubObj.id}_${categoryType}` : null;
  const isHoveredClubLoading = !!(hoveredKey && loadingTeamsState[activeTab]?.[hoveredKey]);

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setOpenDropdown(isOpen ? null : dropdownId);
  };

  const handleClubClick = async (e, clubName) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlayers(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [`${matchId}_${venue}`]: [] }
    }));
    onClubSelect(clubName);
    const players = await fetchPlayersForClub(clubName, categoryType);
    const activePlayers = (players || []).filter(p => p.playerStatus === 'active');
    if (activePlayers.length === 2) {
      setSelectedPlayers(prev => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], [`${matchId}_${venue}`]: activePlayers.map(p => p._id) }
      }));
    }
    setOpenDropdown(null);
  };

  const handlePlayerClick = (e, playerId) => {
    e.preventDefault();
    e.stopPropagation();
    if (hoveredClub && hoveredClub !== currentClub) {
      onClubSelect(hoveredClub);
    }
    handlePlayerSelection(matchId, venue, playerId);
  };

  const selectedPlayerIds = selectedPlayers.map(p => p._id);

  const dropdownPanel = isOpen && typeof window !== 'undefined' ? createPortal(
    <div ref={dropdownRef} style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', minWidth: '460px' }}>
      <div style={{ minWidth: '200px', borderRight: '1px solid #eee', maxHeight: '280px', overflowY: 'auto' }}>
        {availableClubs.map((clubItem, idx) => {
          const clubKey = `${clubItem.id}_${categoryType}`;
          const isLoading = !!(loadingTeamsState[activeTab]?.[clubKey]);
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredClub(clubItem.name)}
              onMouseDown={(e) => handleClubClick(e, clubItem.name)}
              style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f5f5f5', backgroundColor: hoveredClub === clubItem.name ? '#f0f4ff' : 'white' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
                {clubItem.logo}
              </div>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937', flex: 1 }}>{clubItem.name}</span>
              {isLoading
                ? <div className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                : <FaAngleRight size={14} color='#aaa' />
              }
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '12px', maxHeight: '280px', overflowY: 'auto', minWidth: '220px' }}>
        {hoveredClub ? (
          isHoveredClubLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div className="spinner-border spinner-border-sm"></div>
            </div>
          ) : (hoveredKey && clubTeamsData[activeTab]?.[hoveredKey]?.length > 0) ? (
            clubTeamsData[activeTab][hoveredKey].filter(p => p.playerStatus === 'active').map((player) => {
              const isSelected = selectedPlayerIds.includes(player._id);
              const isDisabled = selectedPlayerIds.length >= 2 && !isSelected;
              return (
                <div
                  key={player._id}
                  onMouseDown={(e) => !isDisabled && handlePlayerClick(e, player._id)}
                  style={{ padding: '8px 10px', borderRadius: '6px', marginBottom: '6px', border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0', backgroundColor: isSelected ? '#e3f2fd' : 'white', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled && !isSelected ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: isSelected ? '#1976d2' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: isSelected ? 'white' : '#555' }}>
                    {isSelected ? '✓' : player.playerName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className='text-capitalize' style={{ fontSize: '12px', fontWeight: '600', color: '#1F2937' }}>{player.playerName}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '20px' }}>No players found</div>
          )
        ) : (
          <div style={{ fontSize: '12px', color: '#bbb', textAlign: 'center', padding: '20px' }}>Hover a club to see players</div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  if (currentClub) {
    const club = availableClubs.find(c => c.name === currentClub);
    return (
      <div style={{ position: 'relative' }} ref={toggleRef}>
        <div onClick={handleDropdownClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: venue === 'home' ? '2px solid rgba(31, 65, 187, 1)' : 'none', background: venue === 'home' ? 'transparent' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: venue === 'home' ? 'rgba(31, 65, 187, 1)' : 'white' }}>
            {club?.logo || (venue === 'home' ? 'H' : 'A')}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{currentClub}</div>
            {selectedPlayers.length > 0 && (
              <div className='text-capitalize' style={{ fontSize: '10px', color: '#666' }}>
                {selectedPlayers.map(p => p.playerName?.split(' ')[0]).join(', ')}
              </div>
            )}
          </div>
          <FaAngleRight size={14} color='rgba(31, 65, 187, 1)' />
        </div>
        {dropdownPanel}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} ref={toggleRef}>
      <div onClick={handleDropdownClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'rgba(31, 65, 187, 1)', fontWeight: 'bold' }}>+</div>
        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>Add Club</div>
        <FaAngleRight size={17} color='rgba(31, 65, 187, 1)' />
      </div>
      {dropdownPanel}
    </div>
  );
};

export default CustomClubSelector;
