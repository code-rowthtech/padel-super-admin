import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUsers, FaEdit, FaEye } from 'react-icons/fa';
import { HiOutlineTrophy } from 'react-icons/hi2';
import { BsRecordCircle, BsThreeDotsVertical } from 'react-icons/bs';
import { IoCashOutline } from 'react-icons/io5';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTournaments, deleteTournament, exportPlayersCSV, uploadPlayersCSV } from '../../../redux/admin/tournament/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';
import Pagination from '../../../helpers/Pagination';
import { showSuccess, showError } from '../../../helpers/Toast';

const TournamentCreation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector(state => state.tournament);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultLimit = 15;
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    dispatch(getTournaments({ page: currentPage, limit: defaultLimit }));
  }, [dispatch, currentPage]);

  const tournamentsData = Array.isArray(tournaments?.data) ? tournaments.data : [];
  const totalItems = tournaments?.pagination?.total || 0;
  const activeCount = tournamentsData.filter(t => t.status === 'active').length;
  const totalCategories = tournamentsData.reduce((sum, t) => sum + (t.category?.length || 0), 0);

  const statsCards = [
    { title: 'Total Tournaments', value: totalItems, iconBg: '#1F41BB1A', icon: <HiOutlineTrophy style={{ color: '#1F41BB' }} size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #E0E3F2 121.05%)', cardBorder: '1px solid #1F41BB1A' },
    { title: 'Active Tournaments', value: activeCount, iconBg: '#D1FAE5', icon: <BsRecordCircle style={{ color: '#059669' }} size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #D1FAE5 121.05%)', cardBorder: '1px solid #0596691A' },
    { title: 'Total Categories', value: totalCategories, iconBg: '#FEF3C7', icon: <FaUsers className="text-warning" size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #FEF3C7 121.05%)', cardBorder: '1px solid #D977061A' },
    { title: 'Completed', value: tournamentsData.filter(t => t.status === 'completed').length, iconBg: '#F3E8FF', icon: <IoCashOutline style={{ color: '#9333EA' }} size={20} />, tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #F3E8FF 121.05%)', cardBorder: '1px solid #9333EA1A' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      draft: { bg: '#f3f4f6', text: '#6b7280', label: 'Draft' },
      active: { bg: '#dcfce7', text: '#16a34a', label: 'Active' },
      completed: { bg: '#dbeafe', text: '#2563eb', label: 'Completed' },
      cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' },
    };
    const c = map[status] || map.draft;
    return <span style={{ backgroundColor: c.bg, color: c.text, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>{c.label}</span>;
  };

  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleMenuToggle = (e, tournamentId) => {
    if (openMenuId === tournamentId) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + window.scrollY, left: rect.right - 170 });
    setOpenMenuId(tournamentId);
  };
  const [exportingId, setExportingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const uploadTargetId = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    if (openMenuId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleExportCSV = async (tournament) => {
    setOpenMenuId(null);
    setExportingId(tournament._id);
    try {
      await dispatch(exportPlayersCSV({
        tournamentId: tournament._id,
        tournamentName: tournament.tournamentName
      })).unwrap();
    } catch (error) {
      // Error already handled in thunk
    } finally {
      setExportingId(null);
    }
  };

  const handleImportClick = (tournamentId) => {
    setOpenMenuId(null);
    uploadTargetId.current = tournamentId;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTargetId.current) return;
    setUploadingId(uploadTargetId.current);
    try {
      const result = await dispatch(uploadPlayersCSV({
        file,
        tournamentId: uploadTargetId.current
      })).unwrap();
      if (result?.added || result?.skipped) {
        setImportResult(result);
        setShowImportResultModal(true);
      }
    } catch (error) {
      // Error already handled in thunk
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tournamentToDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteTournament(tournamentToDelete._id)).unwrap();
      setShowDeleteModal(false);
      setTournamentToDelete(null);
      dispatch(getTournaments({ page: currentPage, limit: defaultLimit }));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid className="px-0 bg-white px-md-4">
      <style>{`
        .action-menu { position: fixed; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); z-index: 9999; min-width: 170px; overflow: hidden; }
        .action-menu-item { display: flex; align-items: center; gap: 8px; padding: 9px 14px; font-size: 13px; color: #374151; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
        .action-menu-item:hover { background: #f3f4f6; }
        .action-menu-item:has(.spinner-border) { pointer-events: none; opacity: 0.7; }
      `}</style>
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
      <Row className="mb-0">
        {statsCards.map((card, idx) => (
          <Col key={idx} md={3} sm={6} className="py-4">
            <Card style={{ background: card.tileBg, border: card.cardBorder, boxShadow: '0px 0px 8.8px 0px #0000001A' }} className="border-0 h-100 rounded-4">
              <Card.Body className="d-flex flex-column gap-3">
                <p className="rounded-2 m-0 d-flex align-items-center justify-content-center p-2" style={{ background: card.iconBg, width: 'fit-content' }}>{card.icon}</p>
                <small className="text-muted fw-semibold fs-6 m-0">{card.title}</small>
                <h5 className="m-0 fw-bold">{card.value}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mb-5">
        <Col xs={12} className="px-0">
          <div className="bg-white shadow-sm rounded p-2 p-md-3 d-flex flex-column" style={{ minHeight: '75vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
              <h6 className="mb-0 tabel-title fs-6">Manage Tournaments</h6>
              <button
                className="d-flex align-items-center position-relative p-0 border-0"
                style={{ borderRadius: '20px 10px 10px 20px', background: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/admin/new-tournament')}
              >
                <div className="p-md-1 p-2 rounded-circle bg-light" style={{ position: 'relative', left: '10px' }}>
                  <div className="d-flex justify-content-center align-items-center text-white fw-bold" style={{ backgroundColor: '#1F41BB', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px' }}>
                    <span className="mb-1">+</span>
                  </div>
                </div>
                <div className="d-flex align-items-center fw-medium rounded-end-3" style={{ padding: '0 16px', height: '36px', fontSize: '14px', color: '#1F41BB', border: '1px solid #1F41BB' }}>
                  New Tournament
                </div>
              </button>
            </div>

            {loading ? (
              <DataLoading height="60vh" />
            ) : tournamentsData.length === 0 ? (
              <div className="d-flex text-danger justify-content-center align-items-center" style={{ height: '60vh' }}>No tournaments found!</div>
            ) : (
              <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: 'calc(100vh - 450px)' }}>
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr className="text-center">
                      <th>Sr No.</th>
                      <th className="text-start">Tournament Name</th>
                      <th>Location</th>
                      <th>Sport</th>
                      <th>Season</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reg. Fee</th>
                      <th>Categories</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentsData.map((tournament, idx) => (
                      <tr key={tournament._id} className="table-data border-bottom align-middle text-center">
                        <td>{idx + 1 + (currentPage - 1) * defaultLimit}</td>
                        <td className="text-start" style={{ maxWidth: '180px' }}>
                          <div className="fw-semibold text-truncate" style={{ fontSize: '13px' }}>{tournament.tournamentName}</div>
                        </td>
                        <td>{tournament.stateId?.name || '—'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{tournament.sportType}</td>
                        <td style={{ textTransform: 'capitalize' }}>{tournament.seasonType || '—'}</td>
                        <td>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                        <td>{tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                        <td>
                          {tournament.registration?.isEnabled
                            ? <span style={{ fontWeight: '600', color: '#059669' }}>₹{tournament.registration.fee?.toLocaleString('en-IN') || 0}</span>
                            : <span style={{ color: '#9ca3af', fontSize: '12px' }}>Free</span>}
                        </td>
                        <td>
                          {tournament.category?.length > 0 ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`cat-tooltip-${tournament._id}`} style={{ textAlign: 'left' }}>
                                  {tournament.category.map((c, i) => (
                                    <div key={i} style={{ padding: '2px 0', whiteSpace: 'nowrap' }}>
                                      <span style={{ fontWeight: '600' }}>{c.categoryType}</span>
                                      <span style={{ opacity: 0.75, marginLeft: '6px' }}>({c.tag})</span>
                                    </div>
                                  ))}
                                </Tooltip>
                              }
                            >
                              <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'default' }}>
                                {tournament.category.length} {tournament.category.length === 1 ? 'Category' : 'Categories'}
                              </span>
                            </OverlayTrigger>
                          ) : <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>}
                        </td>
                        <td>{getStatusBadge(tournament.status)}</td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <FaEye style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => navigate(`/admin/view-tournament/${tournament._id}`)} size={16} title="View Tournament" />
                            <FaEdit style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => navigate(`/admin/new-tournament/${tournament._id}`)} size={16} title="Edit Tournament" />
                            <div className="position-relative" ref={openMenuId === tournament._id ? menuRef : null}>
                              {(exportingId === tournament._id || uploadingId === tournament._id) ? (
                                <span className="spinner-border spinner-border-sm" style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                              ) : (
                                <BsThreeDotsVertical
                                  size={16}
                                  style={{ cursor: 'pointer', color: '#6b7280' }}
                                  onClick={(e) => handleMenuToggle(e, tournament._id)}
                                  title="More Actions"
                                />
                              )}
                              {openMenuId === tournament._id && (
                                <div className="action-menu" style={{ top: menuPos.top, left: menuPos.left }}>
                                  <div className="action-menu-item" onClick={() => handleExportCSV(tournament)}>
                                    <FiDownload size={14} color="#1F41BB" />
                                    <span>Export CSV Template</span>
                                  </div>
                                  <div className="action-menu-item" onClick={() => handleImportClick(tournament._id)}>
                                    <FiUpload size={14} color="#059669" />
                                    <span>Import Players</span>
                                  </div>
                                  <div className="action-menu-item" onClick={() => { setOpenMenuId(null); setTournamentToDelete(tournament); setShowDeleteModal(true); }}>
                                    <FiTrash2 size={14} color="#dc2626" />
                                    <span>Delete Tournament</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {totalItems > defaultLimit && (
              <div className="pt-3 d-flex justify-content-center align-items-center border-top" style={{ backgroundColor: 'white' }}>
                <Pagination totalRecords={totalItems} defaultLimit={defaultLimit} handlePageChange={setCurrentPage} currentPage={currentPage} />
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="mb-2">Are you sure you want to delete <strong>{tournamentToDelete?.tournamentName}</strong>?</p>
          <p className="text-danger mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showImportResultModal} onHide={() => setShowImportResultModal(false)} centered size="lg">
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
        <Modal.Header className="import-result-modal">
          <Modal.Title className='text-black'>CSV Import Results</Modal.Title>
        </Modal.Header>
        <Modal.Body className="import-result-modal" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {importResult && (
            <>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="stats-card" style={{ background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', border: '1px solid #86efac' }}>
                    <div className="stats-icon" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#16a34a' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d', lineHeight: 1 }}>{importResult.added?.length || 0}</div>
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
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#b45309', lineHeight: 1 }}>{importResult.skipped?.length || 0}</div>
                      <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '500', marginTop: '4px' }}>Players Skipped</div>
                    </div>
                  </div>
                </div>
              </div>

              {importResult.added?.length > 0 && (
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
                        {importResult.added.map((player, idx) => (
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

              {importResult.skipped?.length > 0 && (
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
                          <th style={{ width: '60px' }}>Line</th>
                          <th>Player Name</th>
                          <th>Phone Number</th>
                          <th style={{ width: '35%' }}>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.skipped.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ color: '#6b7280', fontWeight: '500' }}>{item.line || idx + 1}</td>
                            <td style={{ color: item.row?.playerName ? '#111827' : '#9ca3af', fontWeight: '500' }}>{item.row?.playerName || '—'}</td>
                            <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{item.row?.phoneNumber || '—'}</td>
                            <td>
                              <span className="reason-badge" style={{
                                background: item.reason.includes('Already') ? '#fef3c7' : item.reason.includes('Invalid') ? '#fee2e2' : '#f3f4f6',
                                color: item.reason.includes('Already') ? '#92400e' : item.reason.includes('Invalid') ? '#991b1b' : '#374151'
                              }}>
                                {item.reason}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </>
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
            onClick={() => setShowImportResultModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TournamentCreation;
