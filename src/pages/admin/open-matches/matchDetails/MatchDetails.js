import { FaShareAlt } from "react-icons/fa";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { getMatchById, addPlayers } from "../../../../redux/thunks";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../../helpers/loading/Loaders";
import { padal } from "../../../../assets/files";
import { format } from "date-fns";
import { Col, Row } from "react-bootstrap";
import AddPlayerModal from "../modal/AddPlayerModal";

const MatchDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { openMatchesLoading, getMatchDetails } = useSelector(
    (state) => state.openMatches
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    dispatch(getMatchById({ id }));
  }, [dispatch, id]);

  const formatTime = (timeString) => {
    return timeString?.split(",")?.join(", ");
  };

  const handlePlayerAdded = () => {
    dispatch(getMatchById({ id }));
    setShowModal(false);
  };

  // Render player or empty slot
  const renderPlayer = (player, index, team) => {
    if (!player) {
      return (
        <div className="text-center" key={index}>
          <div
            className="btn btn-light border rounded-circle position-relative d-flex align-items-center justify-content-center"
            style={{
              width: "100px",
              height: "100px",
              fontSize: "24px",
              borderColor: "#E5E7EB",
              opacity: 0.5,
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedTeam(team);
              setShowModal(true);
            }}
          >
            +
            <div
              className="position-absolute top-100 start-50 translate-middle-x mt-2 p-2 bg-dark text-white rounded small opacity-0 hover-show"
              style={{
                width: "120px",
                zIndex: 1000,
                pointerEvents: "none",
                fontSize: "12px",
              }}
            >
              Add a teammate
            </div>
          </div>
        </div>
      );
    }

    const { userId } = player;
    const initial = userId?.name?.charAt(0)?.toUpperCase();

    return (
      <div className="text-center" key={index}>
        {userId?.profilePic ? (
          <img
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#374151",
              objectFit: "cover",
            }}
            src={userId?.profilePic}
            alt="Profile"
            onError={(e) => {
              e.target.style.display = "none"; // Hide broken images
            }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#374151",
              color: "white",
              fontWeight: 600,
              fontSize: "20px",
            }}
          >
            {initial}
          </div>
        )}
        <div className="fw-semibold small mt-2">
          {userId?.name?.charAt(0)?.toUpperCase() + userId?.name?.slice(1) ||
            "Player"}
        </div>
        <span
          className="badge rounded-pill"
          style={{ backgroundColor: "#D1FAE5", color: "#059669" }}
        >
          {userId?.level || "-"}
        </span>
      </div>
    );
  };

  const calculateTotalAmount = (slot) => {
    if (!slot || !Array.isArray(slot)) return 0;

    return slot.reduce((total, slotItem) => {
      const slotTimesTotal =
        slotItem?.slotTimes?.reduce((sum, timeSlot) => {
          return sum + (timeSlot?.amount || 0);
        }, 0) || 0;

      return total + slotTimesTotal;
    }, 0);
  };

  return (
    <div className="container-fluid py-3">
      {openMatchesLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <h5
                className="manual-heading"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: "700",
                  color: "#374151",
                }}
              >
                Open Matches
              </h5>
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <button
                className="d-flex align-items-center position-relative p-0 border-0"
                style={{
                  borderRadius: "20px 10px 10px 20px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: "none",
                }}
                onClick={() => navigate("/admin/create-match")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="p-1 rounded-circle bg-light"
                  style={{ position: "relative", left: "10px" }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      backgroundColor: "#194DD5",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      fontSize: "20px",
                    }}
                  >
                    +
                  </div>
                </div>
                <div
                  className="d-flex align-items-center text-white fw-medium"
                  style={{
                    backgroundColor: "#194DD5",
                    padding: "0 16px",
                    height: "36px",
                    fontSize: "14px",
                    fontFamily: "Nunito, sans-serif",
                  }}
                >
                  Create Match
                </div>
              </button>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col md={7}>
              <div
                className="p-4 rounded-4 shadow-sm mx-auto"
                style={{ backgroundColor: "#fff", maxWidth: "1024px" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    {getMatchDetails?.clubId?.clubName}
                  </h5>
                  <div className="d-flex gap-2">
                    <div
                      className="d-flex justify-content-center align-items-center rounded-circle p-2 border"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <FaShareAlt size={16} />
                    </div>
                    <div
                      className="d-flex justify-content-center align-items-center text-white rounded-circle p-2"
                      style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: "#1F41BB",
                      }}
                    >
                      <IoChatboxEllipsesOutline size={18} />
                    </div>
                  </div>
                </div>
                <div
                  className="border rounded-3 p-3"
                  style={{ backgroundColor: "#F9FBFF" }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src={padal} alt="padel" width={32} loading="lazy" />
                      <strong>PADEL</strong>
                    </div>
                    <div className="text-muted small">
                      {getMatchDetails?.matchDate
                        ? format(
                            new Date(getMatchDetails?.matchDate),
                            "EEE, dd MMM yyyy"
                          )
                        : "N/A"}{" "}
                      |{" "}
                      {getMatchDetails?.matchTime
                        ? formatTime(getMatchDetails?.matchTime)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="row text-center border-top p-1">
                    <div className="col border-end">
                      <div className="text-muted">Gender</div>
                      <div className="fw-semibold">
                        {getMatchDetails?.gender.charAt(0).toUpperCase() +
                          getMatchDetails?.gender.slice(1)}
                      </div>
                    </div>
                    <div className="col border-end">
                      <div className="text-muted">Level</div>
                      <div className="fw-semibold">
                        {getMatchDetails?.skillLevel?.charAt(0).toUpperCase() +
                          getMatchDetails?.skillLevel?.slice(1)}
                      </div>
                    </div>
                    <div className="col">
                      <div className="text-muted">Price</div>
                      <div className="fw-semibold">
                        ₹ {calculateTotalAmount(getMatchDetails?.slot)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center bg-light mt-3 rounded-2 fw-medium p-2">
                  <div className="text-muted">Court Number</div>
                  <div className="me-1">
                    {getMatchDetails?.slot?.[0]?.courtName.split(" ")[1]}
                  </div>
                </div>
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Players</h6>
                  <div className="row align-items-center justify-content-between border rounded-4 p-4">
                    <div className="col-6 d-flex justify-content-evenly">
                      {renderPlayer(getMatchDetails?.teamA?.[0], 0, "teamA")}
                      {renderPlayer(getMatchDetails?.teamA?.[1], 1, "teamA")}
                    </div>
                    <div className="col-6 d-flex justify-content-evenly border-start">
                      {renderPlayer(getMatchDetails?.teamB?.[0], 2, "teamB")}
                      {renderPlayer(getMatchDetails?.teamB?.[1], 3, "teamB")}
                    </div>
                    <div className="d-flex justify-content-between">
                      <div className="fw-semibold small mt-2 text-muted">
                        Team A
                      </div>
                      <div className="fw-semibold small mt-2 text-muted">
                        Team B
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <AddPlayerModal
            show={showModal}
            onHide={() => setShowModal(false)}
            team={selectedTeam}
            matchId={id}
            onPlayerAdded={handlePlayerAdded}
          />
        </>
      )}
      <style>
        {`
          .hover-show {
            transition: opacity 0.2s ease-in-out;
          }
          .btn:hover .hover-show {
            opacity: 1 !important;
          }
        `}
      </style>
    </div>
  );
};

export default MatchDetails;
