import { FaMapMarkerAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAllOpenMatches } from "../../../redux/thunks";
import { useEffect } from "react";

const OpenMatches = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openMatchesData = useSelector(
    (state) => state.openMatches?.openMatchesData?.data
  );
  console.log({ openMatchesData });
  useEffect(() => {
    dispatch(getAllOpenMatches());
  }, []);

  const matchData = [
    {
      level: "Beginner",
      teamInfo: "Team A",
      players: [
        {
          name: "Player 1",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 2",
          image:
            "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 3",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
      ],
    },
    {
      level: "Intermediate",
      players: [
        {
          name: "Jane Cooper",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 5",
          image:
            "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 6",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
      ],
    },
    {
      level: "Advance",
      players: [
        {
          name: "Devon Lane",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 8",
          image:
            "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 9",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
      ],
    },
    {
      level: "Professional",
      players: [
        {
          name: "Devon Lane",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 10",
          image:
            "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80",
        },
        {
          name: "Player 11",
          image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80",
        },
      ],
    },
  ];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark">Open Matches</h3>
        <button
          className="d-flex align-items-center position-relative p-0 border-0"
          style={{
            borderRadius: "20px 10px 10px 20px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: "none",
          }}
          onClick={() => navigate("#")}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Circle Icon */}
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

          {/* Text Section */}
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
      </div>
      {matchData.map((match, index) => (
        <div
          key={index}
          className="card border-0 shadow-sm mb-3 rounded-3"
          style={{ backgroundColor: "#CBD6FF1A" }}
        >
          <div className="card-body px-4 py-3 d-flex justify-content-between flex-wrap">
            {/* Left Info */}
            <div>
              <p className="mb-1 fw-semibold" style={{ fontSize: "16px" }}>
                22 June | 9:00am{" "}
                <span className="text-muted ms-3 fw-normal">{match.level}</span>
              </p>
              <p className="mb-1 fw-medium" style={{ fontSize: "15px" }}>
                The Good Club
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                <FaMapMarkerAlt className="me-1" />
                Chandigarh 160001
              </p>
            </div>

            {/* Right: Players & Price */}
            <div className="d-flex flex-column align-items-end gap-2 mt-3 mt-md-0">
              <div className="d-flex align-items-center justify-content-end mb-2">
                {match.teamInfo && (
                  <div
                    className="d-flex align-items-center rounded-pill pe-3 bg-white me-2"
                    style={{ borderRadius: "999px", zIndex: 999 }}
                  >
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
                      }}
                    >
                      +
                    </div>
                    <div className="d-flex flex-column align-items-center">
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1D4ED8",
                          fontSize: "10px",
                        }}
                      >
                        Available
                      </span>
                      <small style={{ fontSize: "8px", color: "#6B7280" }}>
                        {match.teamInfo}
                      </small>
                    </div>
                  </div>
                )}

                {match.players.map((player, idx) => (
                  <img
                    key={idx}
                    src={player.image}
                    alt={player.name}
                    className="rounded-circle border border-white"
                    style={{
                      width: "40px",
                      height: "40px",
                      marginLeft: idx !== 0 ? "-10px" : "0",
                      zIndex: match.players.length - idx,
                    }}
                  />
                ))}
              </div>

              <div
                className="text-primary fw-semibold"
                style={{ fontSize: "18px" }}
              >
                ₹ 2000
              </div>

              <Link
                to="/admin/match-details"
                className="btn rounded-pill px-3 py-1 text-white"
                style={{
                  backgroundColor: "#3DBE64",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OpenMatches;
