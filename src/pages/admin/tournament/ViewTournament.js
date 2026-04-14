import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table } from 'react-bootstrap';
import { Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentById } from '../../../redux/admin/tournament/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';
import { ownerAxios } from '../../../helpers/api/apiCore';
import { showError } from '../../../helpers/Toast';

const PlayersTab = ({ tournamentId, filters, handleFilterChange, clearFilters, hasActiveFilters, categories }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [tournamentId, filters]);

  const fetchPlayers = async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const params = { tournamentId };
      if (filters.categoryType) params.categoryType = filters.categoryType;
      if (filters.gender) params.gender = filters.gender;

      const response = await ownerAxios.get('/api/tournament-players/getPlayersByCategoryGender', { params });
      setPlayers(response.data?.data || []);
    } catch (error) {
      showError('Failed to load players');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3">
          {/* Players Table */}
          <div style={{ position: 'relative', maxHeight: 'calc(100vh - 300px)', overflow: 'hidden' }}>
            <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
              <Table responsive borderless size="sm" className="custom-table" style={{ marginBottom: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8f9fa' }}>
                  <tr className="text-center">
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Sr No.</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }} className="text-start">Player Name</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Phone Number</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Email</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Gender</th>
                    <th style={{ padding: '12px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f8f9fa' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <DataLoading />
                      </td>
                    </tr>
                  ) : players.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No players found
                      </td>
                    </tr>
                  ) : (
                    players.map((player, idx) => (
                      <tr key={player._id} className="table-data border-bottom align-middle text-center">
                        <td style={{ padding: '12px', fontSize: '13px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }} className="text-start">
                          <div className="fw-semibold">{player.playerName}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{player.phoneNumber || '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{player.email || '—'}</td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <span className="badge" style={{
                            backgroundColor: player.gender === 'Male' ? '#dbeafe' : player.gender === 'Female' ? '#fce7f3' : '#f3f4f6',
                            color: player.gender === 'Male' ? '#1e40af' : player.gender === 'Female' ? '#be185d' : '#6b7280',
                            fontSize: '11px',
                            padding: '4px 8px'
                          }}>
                            {player.gender}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px' }}>
                          <span className="badge" style={{
                            backgroundColor: player.playerStatus === 'active' ? '#dcfce7' : '#fee2e2',
                            color: player.playerStatus === 'active' ? '#16a34a' : '#dc2626',
                            fontSize: '11px',
                            padding: '4px 8px',
                            textTransform: 'capitalize'
                          }}>
                            {player.playerStatus || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const ViewTournament = () => {
  const dispatch = useDispatch();
  const { tournamentId } = useParams();
  const { currentTournament, loadingTournament } = useSelector(state => state.tournament);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    categoryType: '',
    gender: ''
  });

  const categories = currentTournament?.category || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ categoryType: '', gender: '' });
  };

  const hasActiveFilters = filters.categoryType || filters.gender;

  useEffect(() => {
    if (tournamentId) {
      dispatch(getTournamentById(tournamentId));
    }
  }, [tournamentId, dispatch]);

  return (
    <div className='h-100' style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
      <Container fluid className="p-3 p-md-2 pb-md-0" style={{ flex: '0 0 auto' }}>
        <Row className="mb-0">
          <Col>
            <div className="border-0">
              <div className="p-0">
                {/* Tabs */}
                <div className="d-flex flex-wrap justify-content-between align-items-center">
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
                    <Tab label="Players" />
                    <Tab label="Schedules" />
                    {/* <Tab label="Bracket" /> */}
                  </Tabs>

                  {/* Filters - Only show on Players tab */}
                  {activeTab === 0 && (
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Select
                        size="sm"
                        value={filters.categoryType}
                        onChange={(e) => handleFilterChange('categoryType', e.target.value)}
                        style={{ width: '180px', fontSize: '12px' }}
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.tag} value={cat.tag}>{cat.tag}</option>
                        ))}
                      </Form.Select>

                      {hasActiveFilters && (
                        <button
                          className="btn btn-outline-danger text-danger fw-semibold btn-sm"
                          onClick={clearFilters}
                          style={{ fontSize: '12px' }}
                        >
                          Clear
                        </button>
                      )}
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
        <Container fluid className="px-0">
          <Row>
            <Col>
              {loadingTournament ? (
                <Card className="text-center py-5 border-0 shadow-sm">
                  <Card.Body>
                    <DataLoading />
                    <div className="mt-3 text-muted">Loading tournament details...</div>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  {activeTab === 0 && <PlayersTab tournamentId={tournamentId} filters={filters} handleFilterChange={handleFilterChange} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} categories={categories} />}
                  {activeTab === 1 && (
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <div className="text-center py-5">
                          <div style={{ fontSize: '48px', color: '#dee2e6', marginBottom: '16px' }}>📅</div>
                          <h5 className="mb-2">Tournament Schedules</h5>
                          <p className="text-muted mb-0">Schedule management coming soon...</p>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                  {activeTab === 2 && (
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-4">
                        <div className="text-center py-5">
                          <div style={{ fontSize: '48px', color: '#dee2e6', marginBottom: '16px' }}>🏆</div>
                          <h5 className="mb-2">Tournament Bracket</h5>
                          <p className="text-muted mb-0">Tournament bracket visualization coming soon...</p>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ViewTournament;
