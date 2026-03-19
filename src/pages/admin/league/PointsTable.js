import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLeagueLeaderboard } from '../../../redux/admin/league/thunk';
import { DataLoading } from '../../../helpers/loading/Loaders';

const PointsTable = ({ leagueId }) => {
  const dispatch = useDispatch();
  const { leaderboard, loadingLeaderboard } = useSelector(state => state.league);

  useEffect(() => {
    if (leagueId) {
      dispatch(getLeagueLeaderboard(leagueId));
    }
  }, [leagueId, dispatch]);

  if (loadingLeaderboard) {
    return (
      <div className="points-wrapper">
        <DataLoading />
      </div>
    );
  }

  if (!leaderboard?.standings?.length) {
    return (
      <div className="points-wrapper">
        <div className="empty-box">🏆 No Points Data</div>
      </div>
    );
  }

  return (
    <div className="points-wrapper">
      <div className="points-card">

        <div className="title">Points Table</div>

        {/* TABLE SCROLL WRAPPER */}
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
                <th>A/B</th>
                <th>C/D</th>
                <th>A/B MX</th>
                <th>C/D MX</th>
                <th>HY</th>
                <th>SD</th>
                <th>WM</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.standings.map((team) => (
                <tr key={team.clubId}>
                  <td className="pos">{team.position}</td>

                  <td className="team-col">
                    <div className="team">
                      {team.logo && <img src={team.logo} alt="logo" />}
                      <span>{team.clubName}</span>
                    </div>
                  </td>

                  <td>{team.played}</td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
                  <td className="points">{team.points}</td>
                  <td>{team.abWins}</td>
                  <td>{team.cdWins}</td>
                  <td>{team.mixedWins}</td>
                  <td>{team.mixedWins}</td>
                  <td>{team.hybridWins}</td>
                  <td>{team.setDifference}</td>
                  <td>{team.womensWins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .points-wrapper {
          width: 100%;
          padding: 20px;
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

        /* 👇 IMPORTANT FOR MOBILE */
        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        .points-table {
          width: 100%;
          min-width: 900px; /* ensures scroll instead of breaking */
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
          object-fit: contain;
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
          padding: 40px;
          color: white;
          border-radius: 10px;
          text-align: center;
          font-size: 18px;
        }

        /* ✅ MOBILE OPTIMIZATION */
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

export default PointsTable;