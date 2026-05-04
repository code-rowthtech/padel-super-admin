import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getLeaguesIDS, getLeagueLeaderboard } from '../../../redux/admin/league/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';

const PointsTablePage = () => {
  const dispatch = useDispatch();
  const { leaguesIDS, leaderboard, loadingLeaderboard } = useSelector(state => state.league);
  const [selectedLeagueId, setSelectedLeagueId] = useState('');

  useEffect(() => {
    dispatch(getLeaguesIDS());
  }, [dispatch]);

  const handleLeagueChange = (e) => {
    const leagueId = e.target.value;
    setSelectedLeagueId(leagueId);
    if (leagueId) {
      dispatch(getLeagueLeaderboard(leagueId));
    }
  };

  return (
    <div style={{ backgroundColor: 'white', height: '100vh', overflow: 'hidden' }}>
      <Container fluid className="p-3 p-md-4">
        <Row className="mb-4">
          <Col className='d-flex justify-content-end'>
            <Form.Select
              value={selectedLeagueId}
              onChange={handleLeagueChange}
              style={{
                fontSize: "13px",
                fontFamily: "Poppins",
                borderRadius: "6px",
                border: "2px solid #dee2e6",
                padding: "5px 12px",
                backgroundColor: "#fff",
                fontWeight: "500",
                boxShadow: "none",
                maxWidth: '400px'
              }}
            >
              <option value="">Select League</option>
              {leaguesIDS?.map((league) => (
                <option key={league._id} value={league._id}>
                  {league.leagueName}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row>
          <Col>
            {!selectedLeagueId ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 150px)' }}>
                <p className="text-danger text-center" style={{fontFamily:"Poppins",fontWeight:"500", fontSize: '16px'}}>Please select a league to view the points table</p>
              </div>
            ) : loadingLeaderboard ? (
              <div className="points-wrapper">
                <DataLoading />
              </div>
            ) : !leaderboard?.standings?.length ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 150px)' }}>
                <div className="empty-box py-4 px-5">🏆 No Points Data</div>
              </div>
            ) : (
              <div className="points-wrapper">
                <div className="points-card">
                  <div className="title">Points Table</div>
                  {(() => {
                    const categories = leaderboard?.standings?.[0]?.categoryWins
                      ? Object.keys(leaderboard.standings[0].categoryWins)
                      : [];
                    return (
                      <div className="table-container">
                        <table className="points-table">
                          <thead>
                            <tr>
                              <th>POS</th>
                              <th className="team-col">Teams</th>
                              <th>P</th>
                              <th>W</th>
                              <th>L</th>
                              <th>PT</th>
                              {categories.map((cat) => (
                                <th key={cat}>{cat}</th>
                              ))}
                              <th>SD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboard.standings.map((team) => (
                              <tr key={team.clubId}>
                                <td className="pos">{team.position}</td>
                                <td className="team-col">
                                  <div className="team">
                                    {team.clubLogo && <img src={team.clubLogo} alt="logo" />}
                                    <span>{team.clubName}</span>
                                  </div>
                                </td>
                                <td>{team.played}</td>
                                <td>{team.wins}</td>
                                <td>{team.losses}</td>
                                <td className="points">{team.points}</td>
                                {categories.map((cat) => (
                                  <td key={cat}>{team.categoryWins?.[cat] || 0}</td>
                                ))}
                                <td>{team.setDifference}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .points-wrapper {
          width: 100%;
        }

        .points-card {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .title {
          text-align: center;
          padding: 16px;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        .points-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          color: white;
          font-size: 14px;
        }

        thead th {
          padding: 14px 10px;
          text-align: center;
          font-weight: 500;
          opacity: 0.9;
          white-space: nowrap;
        }

        tbody td {
          padding: 14px 10px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.15);
          white-space: nowrap;
        }

        .team-col {
          text-align: left;
          padding-left: 16px;
          min-width: 200px;
        }

        .team {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .team img {
          width: 26px;
          height: 26px;
          object-fit: cover;
          border-radius: 50%;
        }

        .pos {
          font-weight: 600;
        }

        .points {
          font-weight: 700;
        }

        tbody tr:hover {
          background: rgba(255,255,255,0.08);
        }

        .empty-box {
          background: #3b82f6;
          color: white;
          border-radius: 10px;
          text-align: center;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .points-wrapper {
            padding: 10px;
          }

          .title {
            font-size: 16px;
            padding: 12px;
          }

          .points-table {
            font-size: 12px;
          }

          .team img {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default PointsTablePage;
