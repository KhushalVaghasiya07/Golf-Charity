import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [draw, setDraw] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [runningDraw, setRunningDraw] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const runDraw = async () => {
    setRunningDraw(true);
    setDraw(null);
    try {
      const res = await API.get("/admin/draw");
      setDraw(res.data);
      showToast(
        res.data.winners?.length > 0
          ? `Draw complete! ${res.data.winners.length} winner(s) found.`
          : "Draw complete. No winners this round."
      );
    } catch {
      showToast("Failed to run draw.", "error");
    } finally {
      setRunningDraw(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="page">
      <Navbar />

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div className="page-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Admin Panel</h2>
            <p className="page-sub">Run charity draws and manage participants</p>
          </div>
          <button
            className="btn-draw"
            onClick={runDraw}
            disabled={runningDraw}
          >
            {runningDraw ? (
              <>
                <span className="spinner" />
                Running Draw...
              </>
            ) : (
              <>🎲 Run Draw</>
            )}
          </button>
        </div>

        {/* Draw Result */}
        {draw && (
          <div className="draw-result">
            <div className="draw-numbers-section">
              <h3 className="section-label">🎯 Draw Numbers</h3>
              <div className="draw-numbers">
                {draw.drawNumbers?.map((n, i) => (
                  <div
                    className="draw-ball"
                    key={i}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            <div className="winners-section">
              <h3 className="section-label">
                🏆 Winners
                <span className="winner-count">
                  {draw.winners?.length || 0} found
                </span>
              </h3>

              {!draw.winners || draw.winners.length === 0 ? (
                <div className="no-winners">
                  <span className="no-winners-icon">😔</span>
                  <p>No winners this round. Better luck next time!</p>
                </div>
              ) : (
                <div className="winners-list">
                  {draw.winners.map((w, i) => (
                    <div
                      className="winner-card"
                      key={i}
                      style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                    >
                      <div className="winner-rank">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                      </div>
                      <div className="winner-info">
                        <p className="winner-email">{w.user}</p>
                        <p className="winner-matches">{w.matches} matching number{w.matches !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="winner-badge">Winner</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Registered Users</h3>
              <p className="card-desc">{users.length} participant{users.length !== 1 ? "s" : ""} in the system</p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="loading-row">
              <span className="spinner-green" />
              <span>Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>No users registered yet.</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-head">
                <span>#</span>
                <span>Email</span>
                <span>Charity</span>
                <span>Scores</span>
              </div>
              {users.map((u, i) => (
                <div
                  className="table-row"
                  key={i}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="row-num">{i + 1}</span>
                  <span className="row-email">{u.email}</span>
                  <span className="row-charity">
                    {u.charity ? (
                      <span className="charity-tag">{u.charity}</span>
                    ) : (
                      <span className="no-charity">—</span>
                    )}
                  </span>
                  <span className="row-scores">
                    {u.scores?.length ?? 0} / 5
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #0a0f0a;
          font-family: 'DM Sans', sans-serif;
          color: #f0faf0;
        }

        .page-content {
          max-width: 1060px;
          margin: 0 auto;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #f0faf0;
          letter-spacing: -0.5px;
        }

        .page-sub {
          color: rgba(255,255,255,0.4);
          margin-top: 6px;
          font-size: 15px;
        }

        .btn-draw {
          background: linear-gradient(135deg, #ffd54f, #f9a825);
          border: none;
          border-radius: 14px;
          padding: 14px 28px;
          color: #1a1200;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.2px;
        }

        .btn-draw:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(255,213,79,0.4);
        }

        .btn-draw:disabled { opacity: 0.6; cursor: not-allowed; }

        .draw-result {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,213,79,0.2);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          animation: fadeIn 0.5s ease both;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .section-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .winner-count {
          background: rgba(76,175,80,0.15);
          border: 1px solid rgba(76,175,80,0.25);
          border-radius: 20px;
          padding: 2px 10px;
          font-size: 12px;
          color: #81c784;
          text-transform: none;
          letter-spacing: 0;
        }

        .draw-numbers {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .draw-ball {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd54f, #f9a825);
          color: #1a1200;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          font-family: 'Playfair Display', serif;
          box-shadow: 0 4px 16px rgba(255,213,79,0.3);
          animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.4) rotate(-20deg); }
          to   { opacity: 1; transform: scale(1) rotate(0); }
        }

        .winners-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .winner-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(76,175,80,0.07);
          border: 1px solid rgba(76,175,80,0.2);
          border-radius: 14px;
          padding: 16px 20px;
          animation: slideRight 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .winner-rank { font-size: 28px; }

        .winner-info { flex: 1; }

        .winner-email {
          font-size: 15px;
          font-weight: 500;
          color: #f0faf0;
        }

        .winner-matches {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
        }

        .winner-badge {
          background: rgba(76,175,80,0.15);
          border: 1px solid rgba(76,175,80,0.3);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #81c784;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .no-winners {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          padding: 12px 0;
        }

        .no-winners-icon { font-size: 28px; }

        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #f0faf0;
          font-weight: 600;
        }

        .card-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin-top: 4px;
        }

        .users-table {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .table-head {
          display: grid;
          grid-template-columns: 40px 1fr 180px 80px;
          padding: 8px 16px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 40px 1fr 180px 80px;
          align-items: center;
          padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: background 0.2s, border-color 0.2s;
          animation: fadeIn 0.3s ease both;
        }

        .table-row:hover {
          background: rgba(76,175,80,0.06);
          border-color: rgba(76,175,80,0.15);
        }

        .row-num {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          font-weight: 600;
        }

        .row-email {
          font-size: 14px;
          color: #f0faf0;
          font-weight: 400;
        }

        .row-charity {}

        .charity-tag {
          background: rgba(76,175,80,0.1);
          border: 1px solid rgba(76,175,80,0.2);
          border-radius: 20px;
          padding: 3px 10px;
          font-size: 12px;
          color: #81c784;
        }

        .no-charity {
          color: rgba(255,255,255,0.2);
          font-size: 14px;
        }

        .row-scores {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
        }

        .loading-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          padding: 20px 0;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 0;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
        }

        .empty-icon { font-size: 32px; }

        .spinner, .spinner-green {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .spinner-green {
          border-top-color: #4caf50;
          border-color: rgba(76,175,80,0.2);
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          padding: 14px 22px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          z-index: 999;
          animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
          backdrop-filter: blur(12px);
        }

        .toast-success {
          background: rgba(76,175,80,0.18);
          border: 1px solid rgba(76,175,80,0.35);
          color: #a5d6a7;
        }

        .toast-error {
          background: rgba(255,80,80,0.12);
          border: 1px solid rgba(255,80,80,0.28);
          color: #ff8080;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .table-head, .table-row {
            grid-template-columns: 32px 1fr 60px;
          }
          .row-charity, .table-head span:nth-child(3) { display: none; }
          .page-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
