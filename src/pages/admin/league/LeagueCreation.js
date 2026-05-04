import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal } from "react-bootstrap";
import { FaUsers, FaEdit, FaTrash } from "react-icons/fa";
import { HiOutlineTrophy } from "react-icons/hi2";
import { BsRecordCircle } from "react-icons/bs";
import { IoCashOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLeagues, deleteLeague, updateLeague } from '../../../redux/admin/league/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';
import Pagination from '../../../helpers/Pagination';
import { GrSchedules } from "react-icons/gr";

const League = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { leagues, loading } = useSelector(state => state.league);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [leagueToToggle, setLeagueToToggle] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultLimit = 15;

  useEffect(() => {
    dispatch(getLeagues({ page: currentPage, limit: defaultLimit }));
  }, [dispatch, currentPage]);

  const leaguesData = Array.isArray(leagues?.data) ? leagues.data : [];
  const totalItems = leagues?.pagination?.total || 0;
  const totalParticipants = leaguesData.reduce((sum, league) => sum + (league.clubs || []).reduce((clubSum, club) => clubSum + (club.totalRegistrations || 0), 0), 0);
  const activeLeagues = leaguesData.filter(l => l.leagueStatus).length;
  const totalRevenue = leaguesData.reduce((sum, league) => sum + (league.totalPaymentReceived || 0), 0);

  const statsCards = [
    { title: "Total Leagues", cardBorder: "1px solid #1F41BB1A", value: totalItems, iconBg: '#1F41BB1A', icon: <HiOutlineTrophy style={{ color: '#1F41BB' }} size={20} />, bgColor: "#f3f4f6", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #E0E3F2 121.05%)' },
    { title: "Active Leagues", cardBorder: "1px solid #0596691A", value: activeLeagues, iconBg: '#D1FAE5', icon: <BsRecordCircle style={{ color: '#059669' }} size={20} />, bgColor: "#d1fae5", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #D1FAE5 121.05%)' },
    { title: "Total Participants", cardBorder: "1px solid #D977061A", value: totalParticipants, iconBg: '#FEF3C7', icon: <FaUsers className="text-warning" size={20} />, bgColor: "#fef3c7", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #FEF3C7 121.05%)' },
    { title: "Revenue (MTD)", cardBorder: "1px solid #9333EA1A", value: `₹ ${totalRevenue.toLocaleString()}`, iconBg: '#F3E8FF', icon: <IoCashOutline style={{ color: '#9333EA' }} size={20} />, bgColor: "#e0e7ff", tileBg: 'linear-gradient(113.4deg, #FFFFFF 42.44%, #F3E8FF 121.05%)' },
  ];

  const filteredLeagues = statusFilter === "all" ? leaguesData : leaguesData.filter(l => l.status === statusFilter.toLowerCase());

  const handleToggleClick = (league) => {
    setLeagueToToggle(league);
    setShowStatusModal(true);
  };

  const handleToggleConfirm = async () => {
    if (!leagueToToggle) return;
    setToggling(true);
    try {
      const newStatus = leagueToToggle.leagueStatus ? false : true;
      const formData = new FormData();
      formData.append('id', leagueToToggle._id);
      formData.append('leagueStatus', newStatus);
      await dispatch(updateLeague({ leagueData: formData })).unwrap();
      setShowStatusModal(false);
      setLeagueToToggle(null);
      dispatch(getLeagues({ page: currentPage, limit: defaultLimit }));
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setToggling(false);
    }
  };

  const handleToggleCancel = () => {
    setShowStatusModal(false);
    setLeagueToToggle(null);
  };

  const handleDeleteClick = (league) => {
    setLeagueToDelete(league);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leagueToDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteLeague(leagueToDelete._id)).unwrap();
      setShowDeleteModal(false);
      setLeagueToDelete(null);
      dispatch(getLeagues({ page: currentPage, limit: defaultLimit }));
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setLeagueToDelete(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="px-0 bg-white px-md-4">
      <Row className="mb-0 ">
        {statsCards.map((card, idx) => (
          <Col key={idx} md={3} sm={6} className="mb-0  py-4">
            <Card style={{ background: card?.tileBg, border: card?.cardBorder, boxShadow: '0px 0px 8.8px 0px #0000001A' }} className="border-0  h-100 rounded-4">
              <Card.Body className="d-flex  flex-column gap-3">
                <p className="rounded-2 m-0 d-flex align-items-center justify-content-center p-2" style={{ background: card?.iconBg, width: 'fit-content' }}>
                  {card?.icon}
                </p>
                <small className="text-muted fw-semibold fs-6 m-0">{card.title}</small>
                <h5 className="m-0 fw-bold">{card.value}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="mb-5">
        <Col xs={12} className="px-0">
          <div className="bg-white shadow-sm rounded p-2 p-md-3 d-flex flex-column" style={{ minHeight: "75vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
              <h6 className="mb-0 tabel-title fs-6">Manage League</h6>
              <div className="d-flex align-items-center justify-content-end gap-3">
                <button
                  className="d-flex align-items-center position-relative p-0 border-0"
                  style={{
                    borderRadius: "20px 10px 10px 20px",
                    background: "none",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onClick={() => navigate('/admin/new-league')}
                >
                  <div
                    className="p-md-1 p-2 rounded-circle bg-light"
                    style={{ position: "relative", left: "10px" }}
                  >
                    <div
                      className="d-flex justify-content-center align-items-center text-white fw-bold"
                      style={{
                        backgroundColor: "#1F41BB",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        fontSize: "20px",
                      }}>
                      <span className="mb-1">+</span>
                    </div>
                  </div>
                  <div
                    className="d-flex align-items-center fw-medium rounded-end-3"
                    style={{
                      padding: "0 16px",
                      height: "36px",
                      fontSize: "14px",
                      fontFamily: "Nunito, sans-serif",
                      color: "#1F41BB", border: "1px solid #1F41BB"
                    }}
                  >
                    New League
                  </div>
                </button>
              </div>
            </div>

            {loading ? (
              <DataLoading height="60vh" />
            ) : filteredLeagues.length === 0 ? (
              <div className="d-flex text-danger justify-content-center align-items-center" style={{ height: "60vh" }}>
                No leagues found!
              </div>
            ) : (
              <div className="flex-grow-1" style={{ overflowY: "auto", overflowX: "auto", flex: "1 1 auto", maxHeight: "calc(100vh - 450px)" }}>
                <Table responsive borderless size="sm" className="custom-table">
                  <thead>
                    <tr className="text-center">
                      <th className="d-lg-table-cell">Sr No.</th>
                      <th className="d-lg-table-cell">League Name</th>
                      <th className="d-none d-lg-table-cell">Start Date</th>
                      <th className="d-lg-none">Date</th>
                      <th>Clubs</th>
                      <th className="d-none d-lg-table-cell">Participants</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeagues.map((league, idx) => (
                      <tr key={league._id} className="table-data border-bottom align-middle text-center">
                        <td className="text-truncate" style={{ maxWidth: "150px" }}>{idx + 1 + (currentPage - 1) * defaultLimit}</td>
                        <td className="text-truncate" style={{ maxWidth: "150px" }}>{league.leagueName}</td>
                        <td>{new Date(league.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td>{(league.clubs || []).length}</td>
                        <td className="d-none d-lg-table-cell">{(league.clubs || []).reduce((sum, club) => sum + (club.totalRegistrations || 0), 0)}</td>
                        <td>
                          <div className="form-check form-switch d-flex justify-content-center">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={league.leagueStatus}
                              onChange={() => handleToggleClick(league)}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <GrSchedules style={{ cursor: "pointer", color: "#6b7280" }} onClick={() => navigate(`/admin/view-league-schedule/${league._id}`)} size={16} />
                            <FaEdit style={{ cursor: "pointer", color: "#6b7280" }} onClick={() => navigate(`/admin/new-league/${league._id}`, { state: { fromLeagueList: true } })} size={16} />
                            <FaTrash style={{ cursor: "pointer", color: "#6b7280" }} onClick={() => handleDeleteClick(league)} size={16} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {totalItems > defaultLimit && (
              <div className="pt-3 d-flex justify-content-center align-items-center border-top" style={{ backgroundColor: "white" }}>
                <Pagination
                  totalRecords={totalItems}
                  defaultLimit={defaultLimit}
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">Are you sure you want to delete <strong>{leagueToDelete?.leagueName}</strong>?</p>
          <p className="text-danger mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showStatusModal} onHide={handleToggleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Are you sure you want to {leagueToToggle?.leagueStatus ? 'deactivate' : 'activate'} <strong>{leagueToToggle?.leagueName}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleToggleCancel} disabled={toggling}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleToggleConfirm} disabled={toggling}>
            {toggling ? 'Updating...' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default League;