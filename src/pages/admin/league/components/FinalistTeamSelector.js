import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaAngleRight } from 'react-icons/fa';

const FinalistTeamSelector = ({
  matchId,
  venue,
  clubName,
  clubLogo,
  availableTeams = [],
  selectedTeamName,
  onTeamSelect,
  openDropdown,
  setOpenDropdown,
}) => {
  const dropdownId = `finalist_${matchId}_${venue}`;
  const isOpen = openDropdown === dropdownId;
  const toggleRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen) {
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

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setOpenDropdown(isOpen ? null : dropdownId);
  };

  const handleTeamClick = (e, team) => {
    e.preventDefault();
    e.stopPropagation();
    onTeamSelect(team);
    setOpenDropdown(null);
  };

  const selectedTeam = availableTeams.find(t => t.teamName === selectedTeamName);

  const dropdownPanel = isOpen && typeof window !== 'undefined' ? createPortal(
    <div ref={dropdownRef} style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: '260px', maxHeight: '280px', overflowY: 'auto' }}>
      {availableTeams.length > 0 ? (
        availableTeams.map((team, idx) => {
          const isSelected = selectedTeamName === team.teamName;
          return (
            <div
              key={idx}
              onMouseDown={(e) => handleTeamClick(e, team)}
              style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', backgroundColor: isSelected ? '#e3f2fd' : 'white' }}
            >
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{team.teamName}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                {team.players?.map(p => p.playerName?.split(' ')[0]).join(', ') || 'No players'}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>No teams available</div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ position: 'relative' }} ref={toggleRef}>
      <div onClick={handleDropdownClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: venue === 'home' ? '2px solid rgba(31, 65, 187, 1)' : 'none', background: venue === 'home' ? 'transparent' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: venue === 'home' ? 'rgba(31, 65, 187, 1)' : 'white', flexShrink: 0 }}>
          {clubLogo || (venue === 'home' ? 'H' : 'A')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937' }}>{clubName || 'Winner'}</div>
          {selectedTeam ? (
            <div style={{ fontSize: '10px', color: '#666', textAlign: 'left', lineHeight: '1.2' }}>
              <span style={{ fontWeight: '600', color: '#1F2937' }}>{selectedTeam.teamName}</span>
              {selectedTeam.players?.length > 0 && <span> • {selectedTeam.players.map(p => p.playerName?.split(' ')[0]).join(', ')}</span>}
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'left' }}>Select Team</div>
          )}
        </div>
        <FaAngleRight size={14} color='rgba(31, 65, 187, 1)' style={{ marginLeft: '4px' }} />
      </div>
      {dropdownPanel}
    </div>
  );
};

export default FinalistTeamSelector;
