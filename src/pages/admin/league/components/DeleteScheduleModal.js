import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MdClose, MdWarning } from 'react-icons/md';
import { FiCalendar, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';

const DeleteScheduleModal = ({
  show,
  onHide,
  onConfirm,
  scheduleData,
  loading = false
}) => {
  if (!scheduleData) return null;

  const { match } = scheduleData;

  const formatMatchDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [m, d, y] = parts;
      return new Date('20' + y + '-' + m + '-' + d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '—';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header className="border-0" style={{ padding: '24px 24px 0' }}>
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MdWarning size={24} color="#dc3545" />
              </div>
              <div>
                <h5 style={{ fontWeight: '600', fontSize: '18px', color: '#1a1a1a', margin: 0 }}>
                  Delete Schedule
                </h5>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            {/* <MdClose
              size={24}
              onClick={onHide}
              style={{ cursor: 'pointer', color: '#666' }}
            /> */}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body style={{ padding: '0 24px 24px' }}>
        {/* Warning Message */}
        <div
          style={{
            backgroundColor: 'rgba(220, 53, 69, 0.05)',
            border: '1px solid rgba(220, 53, 69, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px'
          }}
        >
          <p style={{ fontSize: '14px', color: '#dc3545', margin: 0, fontWeight: '500' }}>
            ⚠️ You are about to delete this match schedule permanently.
          </p>
        </div>

        {/* Schedule Details Card */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e9ecef'
          }}
        >
          {/* Match Info */}
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F41BB', marginBottom: '4px' }}>
                {match.homeVenue || match.homeTeam?.teamName || 'Team 1'}
              </div>
              {match.homeTeam?.players && match.homeTeam.players.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {match.homeTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}
                </div>
              )}
            </div>
            <div
              style={{
                backgroundColor: '#1F41BB',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                minWidth: '50px',
                textAlign: 'center'
              }}
            >
              VS
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                {match.awayVenue || match.awayTeam?.teamName || 'Team 2'}
              </div>
              {match.awayTeam?.players && match.awayTeam.players.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {match.awayTeam.players.map(p => p.playerName.split(' ')[0]).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            <div>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiCalendar size={16} color="#1F41BB" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Date</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                    {formatMatchDate(match.date)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiClock size={16} color="#1F41BB" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Time</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                    {convertTo12Hour(match.time)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiMapPin size={16} color="#1F41BB" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Venue</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                    {match.venue || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiUsers size={16} color="#1F41BB" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Duration</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                    {match.duration || 60} min
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Number */}
          {match.matchNo && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'rgba(31, 65, 187, 0.05)',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '12px', color: '#666' }}>Match #</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F41BB', marginLeft: '4px' }}>
                {match.matchNo}
              </span>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0" style={{ padding: '0 24px 24px' }}>
        <div className="d-flex gap-2 w-100">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              fontWeight: '500',
              fontSize: '14px',
              backgroundColor: '#dc3545',
              border: 'none'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete Schedule'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteScheduleModal;
