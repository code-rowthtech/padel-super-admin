import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

const PlayerImportResultModal = ({ show, onHide, result }) => {
  if (!result) return null;

  return (
    <>
      <style>{`
        .import-result-modal .modal-content { border-radius: 16px; border: none; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .import-result-modal .modal-header { border-bottom: 1px solid #f3f4f6; padding: 20px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; }
        .import-result-modal .modal-title { color: white; font-weight: 600; font-size: 20px; }
        .import-result-modal .btn-close { filter: brightness(0) invert(1); }
        .import-result-modal .modal-body { padding: 24px; }
        .import-result-modal .modal-footer { border-top: 1px solid #f3f4f6; padding: 16px 24px; }
        .stats-card { border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
        .stats-card:hover { transform: translateY(-2px); }
        .stats-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .result-table { border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .result-table thead { background: #f9fafb; }
        .result-table thead th { border: none; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .result-table tbody td { padding: 12px 16px; border-top: 1px solid #f3f4f6; font-size: 14px; }
        .result-table tbody tr:hover { background: #f9fafb; }
        .reason-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
        .section-title { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
      `}</style>

      <Modal show={show} onHide={onHide} centered size="xl">
        <Modal.Header className="import-result-modal">
          <Modal.Title className='text-black'>Player Import Results</Modal.Title>
        </Modal.Header>
        <Modal.Body className="import-result-modal" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="stats-card" style={{ background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', border: '1px solid #86efac' }}>
                <div className="stats-icon" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#16a34a' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d', lineHeight: 1 }}>{result.added?.length || 0}</div>
                  <div style={{ fontSize: '14px', color: '#166534', fontWeight: '500', marginTop: '4px' }}>Players Added</div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="stats-card" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', border: '1px solid #fbbf24' }}>
                <div className="stats-icon" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#d97706' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#b45309', lineHeight: 1 }}>{result.skipped?.length || 0}</div>
                  <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '500', marginTop: '4px' }}>Players Skipped</div>
                </div>
              </div>
            </div>
          </div>

          {result.added?.length > 0 && (
            <div className="mb-4">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
                Successfully Added Players
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto', borderRadius: '8px' }}>
                <Table className="result-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Player Name</th>
                      <th>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.added.map((player, idx) => (
                      <tr key={idx}>
                        <td style={{ color: '#6b7280', fontWeight: '500' }}>{idx + 1}</td>
                        <td style={{ fontWeight: '500', color: '#111827' }}>{player.playerName}</td>
                        <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{player.phoneNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {result.skipped?.length > 0 && (
            <div>
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Skipped Players
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', borderRadius: '8px' }}>
                <Table className="result-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Player Name</th>
                      <th>Phone Number</th>
                      <th style={{ width: '35%' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skipped.map((item, idx) => {
                      // Handle both CSV upload structure (with row property) and manual add structure (direct properties)
                      const playerName = item.row?.playerName || item.playerName;
                      const phoneNumber = item.row?.phoneNumber || item.phoneNumber;

                      return (
                        <tr key={idx}>
                          <td style={{ color: '#6b7280', fontWeight: '500' }}>{idx + 1}</td>
                          <td style={{ color: playerName ? '#111827' : '#9ca3af', fontWeight: '500' }}>{playerName || '—'}</td>
                          <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{phoneNumber || '—'}</td>
                          <td>
                            <span className="reason-badge" style={{
                              background: item.reason.includes('Already') ? '#fef3c7' : item.reason.includes('Invalid') ? '#fee2e2' : '#f3f4f6',
                              color: item.reason.includes('Already') ? '#92400e' : item.reason.includes('Invalid') ? '#991b1b' : '#374151'
                            }}>
                              {item.reason}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="import-result-modal">
          <Button
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: '500'
            }}
            onClick={onHide}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PlayerImportResultModal;
