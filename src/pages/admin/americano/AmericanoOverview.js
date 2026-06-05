import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { HiOutlineTrophy } from "react-icons/hi2";
import { FaUsers } from "react-icons/fa";
import { BsRecordCircle } from "react-icons/bs";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { ownerApi } from "../../../helpers/api/apiCore";
import { GET_CLUB_WISE_AMERICANOS } from "../../../helpers/api/apiEndpoint";
import { DataLoading } from "../../../helpers/loading/Loaders";
import Pagination from "../../../helpers/Pagination";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import ObsSettingsModal from "../obsSettings/ObsSettingsModal";

const STATUS_STYLE = {
  open: { background: "#eef2ff", color: "#4f46e5" },
  scheduled: { background: "#dbeafe", color: "#2563eb" },
  in_progress: { background: "#fef3c7", color: "#d97706" },
  completed: { background: "#dcfce7", color: "#16a34a" },
  cancelled: { background: "#fee2e2", color: "#dc2626" },
  closed: { background: "#f3f4f6", color: "#6b7280" },
};

const FILTER_SELECT_STYLE = {
  height: "42px",
  minWidth: "170px",
  padding: "6px 38px 6px 12px",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  backgroundColor: "#fff",
  boxShadow: "none",
  fontFamily: "Poppins",
  fontSize: "13px",
  fontWeight: 500,
};

const AmericanoOverview = () => {
  const { selectedOwnerId } = useSuperAdminContext();
  const [loading, setLoading] = useState(false);
  const [americanos, setAmericanos] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [filters, setFilters] = useState({ clubId: "", matchStatus: "", americanoFormat: "" });
  const [obsModal, setObsModal] = useState({ show: false, americanoId: null, title: "" });

  const fetchAmericanos = async (page = 1) => {
    try {
      setLoading(true);
      const response = await ownerApi.get(GET_CLUB_WISE_AMERICANOS, {
        page,
        limit: pagination.limit,
        ...(selectedOwnerId ? { ownerId: selectedOwnerId } : {}),
        ...(filters.clubId ? { clubId: filters.clubId } : {}),
        ...(filters.matchStatus ? { matchStatus: filters.matchStatus } : {}),
        ...(filters.americanoFormat ? { americanoFormat: filters.americanoFormat } : {}),
      });

      setAmericanos(response.data?.data?.americanos || []);
      setClubs(response.data?.data?.clubs || []);
      setStatusCounts(response.data?.data?.statusCounts || {});
      setPagination(response.data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
    } catch {
      setAmericanos([]);
      setClubs([]);
      setStatusCounts({});
      setPagination((current) => ({ ...current, total: 0, page: 1, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters((current) => ({ ...current, clubId: "" }));
  }, [selectedOwnerId]);

  useEffect(() => {
    fetchAmericanos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOwnerId, filters.clubId, filters.matchStatus, filters.americanoFormat]);

  const cards = [
    { title: "Total Americanos", value: pagination.total, icon: <HiOutlineTrophy size={20} color="#1F41BB" />, bg: "#eef2ff" },
    { title: "Open", value: statusCounts.open || 0, icon: <BsRecordCircle size={20} color="#059669" />, bg: "#d1fae5" },
    { title: "Scheduled / Live", value: (statusCounts.scheduled || 0) + (statusCounts.in_progress || 0), icon: <FaUsers size={20} color="#d97706" />, bg: "#fef3c7" },
    { title: "Completed", value: statusCounts.completed || 0, icon: <IoCheckmarkDoneCircleOutline size={22} color="#2563eb" />, bg: "#dbeafe" },
  ];

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <Container fluid className="px-0 bg-white px-md-4">
      <Row>
        {cards.map((card) => (
          <Col key={card.title} lg={3} md={6} className="py-4">
            <Card className="border-0 h-100 rounded-4" style={{ boxShadow: "0 0 8.8px #0000001A" }}>
              <Card.Body className="d-flex flex-column gap-3">
                <div className="p-2 rounded-2" style={{ background: card.bg, width: "fit-content" }}>{card.icon}</div>
                <span className="text-muted fw-semibold">{card.title}</span>
                <h5 className="m-0 fw-bold">{card.value}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
            <h5 className="m-0 fw-bold">Club-wise Americano</h5>
            <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2">
              <Form.Select value={filters.clubId} onChange={(event) => updateFilter("clubId", event.target.value)} style={{ ...FILTER_SELECT_STYLE, minWidth: "190px" }}>
                <option value="">All Clubs</option>
                {clubs.map((club) => <option key={club._id} value={club._id}>{club.clubName} ({club.totalAmericanos || 0})</option>)}
              </Form.Select>
              <Form.Select value={filters.americanoFormat} onChange={(event) => updateFilter("americanoFormat", event.target.value)} style={FILTER_SELECT_STYLE}>
                <option value="">All Formats</option>
                <option value="rotating">Rotating</option>
                <option value="fixed_team">Fixed Team</option>
              </Form.Select>
              <Form.Select value={filters.matchStatus} onChange={(event) => updateFilter("matchStatus", event.target.value)} style={FILTER_SELECT_STYLE}>
                <option value="">All Statuses</option>
                {["open", "scheduled", "in_progress", "completed", "cancelled"].map((status) => (
                  <option key={status} value={status}>{status.replace("_", " ")}</option>
                ))}
              </Form.Select>
            </div>
          </div>

          {loading ? <DataLoading height={420} /> : americanos.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center text-muted" style={{ minHeight: "420px" }}>
              No Americanos found for the selected owner and club.
            </div>
          ) : (
            <Table responsive borderless className="custom-table align-middle">
              <thead>
                <tr className="text-center">
                  <th>#</th>
                  <th className="text-start">Americano</th>
                  <th className="text-start">Club</th>
                  <th>Format</th>
                  <th>Players / Teams</th>
                  <th>Match Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {americanos.map((americano, index) => {
                  const statusStyle = STATUS_STYLE[americano.matchStatus] || STATUS_STYLE.closed;
                  return (
                    <tr key={americano._id} className="table-data border-bottom text-center">
                      <td>{index + 1 + (pagination.page - 1) * pagination.limit}</td>
                      <td className="text-start">
                        <div className="fw-semibold">{americano.matchTitle}</div>
                        <small className="text-muted text-capitalize">{americano.gender}</small>
                      </td>
                      <td className="text-start">{americano.clubId?.clubName || "N/A"}</td>
                      <td className="text-capitalize">{String(americano.americanoFormat || "").replace("_", " ")}</td>
                      <td>{americano.joinedMembers || 0} / {americano.americanoFormat === "fixed_team" ? `${americano.maxTeams || 0} teams` : `${americano.maxPlayers || 0} players`}</td>
                      <td>{americano.matchDate ? new Date(americano.matchDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</td>
                      <td>
                        <span className="text-capitalize" style={{ ...statusStyle, padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                          {String(americano.matchStatus || "").replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <IoSettingsOutline
                          size={17}
                          title="OBS Settings"
                          style={{ cursor: "pointer", color: "#6b7280" }}
                          onClick={() => setObsModal({ show: true, americanoId: americano._id, title: americano.matchTitle })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}

          {pagination.total > pagination.limit && (
            <div className="pt-3 d-flex justify-content-center border-top">
              <Pagination
                totalRecords={pagination.total}
                defaultLimit={pagination.limit}
                handlePageChange={fetchAmericanos}
                currentPage={pagination.page}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      <ObsSettingsModal
        show={obsModal.show}
        onHide={() => setObsModal({ show: false, americanoId: null, title: "" })}
        americanoId={obsModal.americanoId}
        isLeague={false}
        title={obsModal.title}
      />
    </Container>
  );
};

export default AmericanoOverview;
