import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [scores, setScores] = useState([]);
  const [value, setValue] = useState("");
  const [charity, setCharity] = useState("");
  const [charityInput, setCharityInput] = useState("");
  const [loadingScores, setLoadingScores] = useState(true);
  const [addingScore, setAddingScore] = useState(false);
  const [updatingCharity, setUpdatingCharity] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchScores = async () => {
    try {
      const res = await API.get("/scores");
      setScores(res.data);
    } catch {
      showToast("Failed to load scores.", "error");
    } finally {
      setLoadingScores(false);
    }
  };

  const addScore = async () => {
    if (!value) return;
    if (scores.length >= 5) {
      showToast("Maximum 5 scores allowed.", "error");
      return;
    }
    setAddingScore(true);
    try {
      await API.post("/scores/add", { value: Number(value) });
      setValue("");
      await fetchScores();
      showToast("Score added successfully!");
    } catch {
      showToast("Failed to add score.", "error");
    } finally {
      setAddingScore(false);
    }
  };

  const updateCharity = async () => {
    if (!charityInput) return;
    setUpdatingCharity(true);
    try {
      await API.put("/user/charity", { charity: charityInput });
      setCharity(charityInput);
      showToast("Charity updated successfully!");
    } catch {
      showToast("Failed to update charity.", "error");
    } finally {
      setUpdatingCharity(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

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
          <h2 className="page-title">My Dashboard</h2>
          <p className="page-sub">Track your scores and support your chosen charity</p>
        </div>

        <div className="dashboard-grid">
          {/* Scores Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Scores</h3>
                <p className="card-desc">Up to 5 scores stored for the draw</p>
              </div>
              <div className="score-count">
                <span className={scores.length >= 5 ? "count-full" : "count-ok"}>
                  {scores.length}
                </span>
                <span className="count-max">/5</span>
              </div>
            </div>

            <div className="scores-list">
              {loadingScores ? (
                <div className="loading-row">
                  <span className="spinner-green" />
                  <span>Loading scores...</span>
                </div>
              ) : scores.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🏌️</span>
                  <p>No scores yet. Add your first one!</p>
                </div>
              ) : (
                scores.map((s, i) => (
                  <div className="score-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="score-rank">#{i + 1}</div>
                    <div className="score-value">{s.value}</div>
                    <div className="score-label">pts</div>
                  </div>
                ))
              )}
            </div>

            <div className="add-score-row">
              <input
                type="number"
                placeholder="Enter score"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addScore()}
                className="score-input"
                disabled={scores.length >= 5}
              />
              <button
                className="btn-add"
                onClick={addScore}
                disabled={addingScore || scores.length >= 5 || !value}
              >
                {addingScore ? <span className="spinner" /> : "+ Add"}
              </button>
            </div>
            {scores.length >= 5 && (
              <p className="limit-note">Maximum scores reached for this round.</p>
            )}
          </div>

          {/* Charity Section */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Charity</h3>
                <p className="card-desc">Choose who benefits from your winnings</p>
              </div>
              <span className="charity-icon">💚</span>
            </div>

            {charity && (
              <div className="current-charity">
                <span className="charity-label">Current</span>
                <span className="charity-name">{charity}</span>
              </div>
            )}

            <div className="charity-form">
              <input
                type="text"
                placeholder="e.g. Red Cross, UNICEF..."
                value={charityInput}
                onChange={(e) => setCharityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateCharity()}
                className="charity-input"
              />
              <button
                className="btn-charity"
                onClick={updateCharity}
                disabled={updatingCharity || !charityInput}
              >
                {updatingCharity ? <span className="spinner" /> : "Update"}
              </button>
            </div>

            <div className="info-box">
              <p>🏆 If you win the draw, your chosen charity receives the prize donation.</p>
            </div>
          </div>
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
          max-width: 960px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-header { margin-bottom: 36px; }

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

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 700px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }

        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeIn 0.5s ease both;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
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

        .score-count {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .count-ok {
          font-size: 28px;
          font-weight: 700;
          color: #4caf50;
          font-family: 'Playfair Display', serif;
        }

        .count-full {
          font-size: 28px;
          font-weight: 700;
          color: #ff8a65;
          font-family: 'Playfair Display', serif;
        }

        .count-max {
          font-size: 16px;
          color: rgba(255,255,255,0.25);
        }

        .scores-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 120px;
        }

        .score-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(76,175,80,0.06);
          border: 1px solid rgba(76,175,80,0.15);
          border-radius: 12px;
          padding: 12px 16px;
          animation: slideRight 0.3s ease both;
          transition: border-color 0.2s, background 0.2s;
        }

        .score-item:hover {
          background: rgba(76,175,80,0.1);
          border-color: rgba(76,175,80,0.3);
        }

        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .score-rank {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: 24px;
        }

        .score-value {
          font-size: 20px;
          font-weight: 700;
          color: #f0faf0;
          font-family: 'Playfair Display', serif;
          flex: 1;
        }

        .score-label {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
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
          justify-content: center;
          gap: 8px;
          padding: 24px 0;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
        }

        .empty-icon { font-size: 32px; }

        .add-score-row {
          display: flex;
          gap: 10px;
        }

        .score-input, .charity-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #f0faf0;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
        }

        .score-input::placeholder, .charity-input::placeholder { color: rgba(255,255,255,0.2); }

        .score-input:focus, .charity-input:focus {
          border-color: #4caf50;
          background: rgba(76,175,80,0.08);
          box-shadow: 0 0 0 4px rgba(76,175,80,0.12);
        }

        .score-input:disabled { opacity: 0.4; }

        .btn-add, .btn-charity {
          background: linear-gradient(135deg, #4caf50, #2d8a32);
          border: none;
          border-radius: 12px;
          padding: 12px 20px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 72px;
          white-space: nowrap;
        }

        .btn-add:hover:not(:disabled), .btn-charity:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(76,175,80,0.4);
        }

        .btn-add:disabled, .btn-charity:disabled { opacity: 0.5; cursor: not-allowed; }

        .limit-note {
          font-size: 12px;
          color: rgba(255,140,80,0.7);
          text-align: center;
        }

        .current-charity {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(76,175,80,0.08);
          border: 1px solid rgba(76,175,80,0.2);
          border-radius: 12px;
          padding: 12px 16px;
        }

        .charity-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(76,175,80,0.7);
          font-weight: 600;
        }

        .charity-name {
          font-size: 15px;
          font-weight: 500;
          color: #a5d6a7;
        }

        .charity-icon { font-size: 28px; }

        .charity-form { display: flex; gap: 10px; }

        .info-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
        }

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
      `}</style>
    </div>
  );
}
