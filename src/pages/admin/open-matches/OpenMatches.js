import { FaMapMarkerAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllOpenMatches } from "../../../redux/thunks";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { Col, Row } from "react-bootstrap";
import { formatSlotTime } from "../../../helpers/Formatting";
import AddPlayerModal from "./modal/AddPlayerModal";
import Pagination from "../../../helpers/Pagination";

const OpenMatches = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openMatchesData, openMatchesLoading } = useSelector(
    (state) => state.openMatches
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [matchId, setMatchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handlePlayerAdded = () => {
    dispatch(getAllOpenMatches());
    setShowModal(false);
  };

  useEffect(() => {
    dispatch(getAllOpenMatches());
  }, []);
  const TagWrapper = ({ children }) => (
    <div
      className="d-flex align-items-center rounded-pill pe-3 me-0"
      style={{
        backgroundColor: "#fff",
        borderRadius: "999px",
        zIndex: 999,
        position: "relative",
        top: "0px", // lift tag above avatars
        left: "20px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );

  // Available Tag
  const AvailableTag = ({ team, id }) => (
    <TagWrapper>
      <div
        className="d-flex justify-content-center align-items-center rounded-circle"
        style={{
          width: "40px",
          height: "40px",
          border: "1px solid #1D4ED8",
          color: "#1D4ED8",
          fontSize: "24px",
          fontWeight: "400",
          marginRight: "10px",
          cursor: "pointer",
        }}
        onClick={() => {
          setSelectedTeam(team);
          setShowModal(true);
          setMatchId(id);
        }}
      >
        <span className="d-flex align-items-center mb-1">+</span>
      </div>
      <div className="d-flex flex-column align-items-start">
        <span style={{ fontWeight: 600, color: "#1D4ED8", fontSize: "12px" }}>
          Available
        </span>
        <small style={{ fontSize: "10px", color: "#6B7280" }}>{team}</small>
      </div>
    </TagWrapper>
  );

  // First Player Tag
  const FirstPlayerTag = ({ player }) => (
    <TagWrapper>
      <div
        className="d-flex justify-content-center align-items-center rounded-circle overflow-hidden"
        style={{
          width: "40px",
          height: "40px",
          border: "1px solid #1D4ED8",
          marginRight: "10px",
          backgroundColor: "#374151",
        }}
      >
        {player?.profilePic ? (
          <img
            src={player?.profilePic}
            alt={player?.name || "Player"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            {player?.name ? player.name.charAt(0).toUpperCase() : "P"}
          </span>
        )}
      </div>
      <div className="ps-0 text-start">
        <p
          className="m-0"
          style={{ fontWeight: 600, color: "#111827", fontSize: "12px" }}
        >
          {player?.name?.charAt(0)?.toUpperCase() + player?.name?.slice(1) ||
            "Player"}
        </p>
        <p
          className="m-0 mb-1 d-flex justify-content-center align-items-center rounded"
          style={{
            fontSize: "10px",
            color: "#6B7280",
            fontWeight: "500",
            width: "30px",
            backgroundColor: "#BEEDCC",
          }}
        >
          {player?.level}
        </p>
      </div>
    </TagWrapper>
  );

  // Player Avatar (circle images)
  const PlayerAvatar = ({ player, idx, total }) => (
    <div
      className="rounded-circle border d-flex align-items-center justify-content-center position-relative"
      style={{
        width: "40px",
        height: "40px",
        marginLeft: idx !== 0 ? "-15px" : "0", // Increased overlap
        zIndex: total - idx,
        backgroundColor: player?.userId?.profilePic ? "transparent" : "#374151",
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}
    >
      {player?.userId?.profilePic ? (
        <img
          src={player?.userId?.profilePic}
          alt={player?.userId?.name || "Player"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            color: "white",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          {player?.userId?.name
            ? player.userId.name.charAt(0).toUpperCase()
            : "P"}
        </span>
      )}
    </div>
  );

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    dispatch(getAllOpenMatches({ page: pageNumber }))
  };

  return (
    <>
      {openMatchesLoading ? (
        <DataLoading height={"80vh"} />
      ) : (
        <div className="container-fluid px-2 px-md-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3
              className="fw-bold text-dark mb-0"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
            >
              Open Matches
            </h3>
          </div>
          {openMatchesData?.data?.length > 0 ? (
            <>
              <Row className="justify-content-center">
                <Col md={11}>
                  {openMatchesData?.data?.map((match, index) => (
                    <div
                      key={index}
                      className="card shadow-sm mb-3 rounded-3"
                      style={{
                        backgroundColor: "#CBD6FF1A",
                        border: "1px solid #0000001A",
                      }}
                    >
                      <div className="card-body px-4 py-3">
                        {/* Mobile Layout */}
                        <div className="d-block d-md-none">
                          {/* Top Row: Date/Info (left) & Players (right) */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="flex-grow-1 me-3">
                              <p
                                className="mb-1 fw-bold"
                                style={{ fontSize: "15px" }}
                              >
                                {format(
                                  new Date(match?.matchDate),
                                  "dd MMM yyyy"
                                )}
                              </p>
                              <span
                                className="badge bg-primary mb-2"
                                style={{ fontSize: "10px" }}
                              >
                                {match?.skillLevel?.charAt(0).toUpperCase() +
                                  match?.skillLevel?.slice(1) || ""}
                              </span>
                              <p
                                className="mb-1 text-muted"
                                style={{ fontSize: "12px" }}
                              >
                                {(() => {
                                  const slots =
                                    match?.matchTime?.split(",") || [];
                                  const formatTime = (time) => {
                                    const trimmed = time.trim();
                                    if (trimmed.includes(":"))
                                      return trimmed.toLowerCase();
                                    return trimmed
                                      .replace(/(am|pm)/i, ":00 $1")
                                      .toLowerCase();
                                  };
                                  const formattedSlots = slots.map(formatTime);
                                  return formattedSlots.length > 2
                                    ? `${formattedSlots
                                      .slice(0, 2)
                                      .join(", ")} +${formattedSlots.length - 2
                                    } more`
                                    : formattedSlots.join(", ");
                                })()}
                              </p>
                              <p
                                className="mb-1 fw-medium"
                                style={{ fontSize: "13px" }}
                              >
                                {match?.clubId?.clubName}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{ fontSize: "11px" }}
                              >
                                <FaMapMarkerAlt className="me-1" />
                                {match?.clubId?.state} {match?.clubId?.zipCode}
                              </p>
                            </div>

                            {/* Right Column: Players, Price, Button */}
                            <div className="d-flex flex-column align-items-end">
                              {/* Players Section */}
                              <div className="d-flex align-items-center mb-2">
                                {match?.teamA?.length === 1 ||
                                  match?.teamA?.length === 0 ? (
                                  match?.teamB?.length === 1 ||
                                    match?.teamB?.length === 0 ? (
                                    <AvailableTag
                                      team="Team A | B"
                                      id={match?._id}
                                    />
                                  ) : (
                                    <AvailableTag
                                      team="Team A"
                                      id={match?._id}
                                    />
                                  )
                                ) : match?.teamB?.length === 1 ||
                                  match?.teamB?.length === 0 ? (
                                  <AvailableTag team="Team B" id={match?._id} />
                                ) : match?.teamA?.length === 2 &&
                                  match?.teamB?.length === 2 ? (
                                  <FirstPlayerTag
                                    player={match?.teamA[0]?.userId}
                                  />
                                ) : null}

                                <div className="d-flex align-items-center ms-2">
                                  {[
                                    ...(match?.teamA?.filter((_, idx) =>
                                      match?.teamA?.length === 2 &&
                                        match?.teamB?.length === 2
                                        ? idx !== 0
                                        : true
                                    ) || []),
                                    ...(match?.teamB || []),
                                  ].map((player, idx, arr) => (
                                    <PlayerAvatar
                                      key={`player-${idx}`}
                                      player={player}
                                      idx={idx}
                                      total={arr.length}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Price */}
                              <div
                                className="fw-bold mb-2"
                                style={{ color: "#1F41BB", fontSize: "16px" }}
                              >
                                ₹ {calculateTotalAmount(match?.slot)}
                              </div>

                              {/* View Button */}
                              <Link
                                to={`/admin/match-details/${match?._id}`}
                                className="btn rounded-pill px-3 py-1 text-white"
                                style={{
                                  backgroundColor: "#3DBE64",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  minWidth: "70px",
                                }}
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout - Original */}
                        <div className="d-none d-md-flex justify-content-between flex-wrap">
                          <div>
                            <p
                              className="mb-1 fw-bold"
                              style={{ fontSize: "16px" }}
                            >
                              {format(
                                new Date(match?.matchDate),
                                "dd MMM yyyy"
                              )}{" "}
                              |{" "}
                              {(() => {
                                const slots =
                                  match?.matchTime?.split(",") || [];
                                const formatTime = (time) => {
                                  const trimmed = time.trim();
                                  if (trimmed.includes(":"))
                                    return trimmed.toLowerCase();
                                  return trimmed
                                    .replace(/(am|pm)/i, ":00 $1")
                                    .toLowerCase();
                                };
                                const formattedSlots = slots.map(formatTime);
                                return formattedSlots.length > 3
                                  ? `${formattedSlots
                                    .slice(0, 3)
                                    .join(", ")} +${formattedSlots.length - 3
                                  } more`
                                  : formattedSlots.join(", ");
                              })()}
                              <span className="text-dark ms-3 fw-semibold">
                                {match?.skillLevel?.charAt(0).toUpperCase() +
                                  match?.skillLevel?.slice(1) || ""}
                              </span>
                            </p>
                            <p
                              className="mb-1 fw-medium"
                              style={{ fontSize: "15px" }}
                            >
                              {match?.clubId?.clubName}
                            </p>
                            <p
                              className="mb-0 text-muted"
                              style={{ fontSize: "13px" }}
                            >
                              <FaMapMarkerAlt className="me-1" />
                              {match?.clubId?.state} {match?.clubId?.zipCode}
                            </p>
                          </div>

                          <div className="d-flex flex-column align-items-end gap-2 mt-3 mt-md-0">
                            <div className="d-flex align-items-center justify-content-end mb-1">
                              {match?.teamA?.length === 1 ||
                                match?.teamA?.length === 0 ? (
                                match?.teamB?.length === 1 ||
                                  match?.teamB?.length === 0 ? (
                                  <AvailableTag
                                    team="Team A | B"
                                    id={match?._id}
                                  />
                                ) : (
                                  <AvailableTag team="Team A" id={match?._id} />
                                )
                              ) : match?.teamB?.length === 1 ||
                                match?.teamB?.length === 0 ? (
                                <AvailableTag team="Team B" id={match?._id} />
                              ) : match?.teamA?.length === 2 &&
                                match?.teamB?.length === 2 ? (
                                <FirstPlayerTag
                                  player={match?.teamA[0]?.userId}
                                />
                              ) : null}

                              <div className="d-flex align-items-center ms-2">
                                {[
                                  ...(match?.teamA?.filter((_, idx) =>
                                    match?.teamA?.length === 2 &&
                                      match?.teamB?.length === 2
                                      ? idx !== 0
                                      : true
                                  ) || []),
                                  ...(match?.teamB || []),
                                ].map((player, idx, arr) => (
                                  <PlayerAvatar
                                    key={`player-${idx}`}
                                    player={player}
                                    idx={idx}
                                    total={arr.length}
                                  />
                                ))}
                              </div>
                            </div>

                            <div
                              className="fw-semibold"
                              style={{
                                color: "#1F41BB",
                                fontSize: "18px",
                                fontWeight: "500",
                              }}
                            >
                              ₹ {calculateTotalAmount(match?.slot)}
                            </div>

                            <Link
                              to={`/admin/match-details/${match?._id}`}
                              className="btn rounded-pill px-4 py-1 text-white"
                              style={{
                                backgroundColor: "#3DBE64",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Col>
                {/* <Col md={6}></Col> */}
              </Row>
              <Row className=" mb-5">
                <Col className="d-flex mb-3 justify-content-center">
                  <Pagination
                    totalRecords={openMatchesData?.totalPages}
                    defaultLimit={1}
                    handlePageChange={handlePageChange}
                    currentPage={currentPage || 1}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <div
              className="d-flex text-danger justify-content-center align-items-center w-100"
              style={{ height: "70vh" }}
            >
              No Open Matches were found !
            </div>
          )}
        </div>
      )}
      <AddPlayerModal
        show={showModal}
        onHide={() => setShowModal(false)}
        team={selectedTeam}
        matchId={matchId}
        onPlayerAdded={handlePlayerAdded}
      />
    </>
  );
};

export default OpenMatches;
