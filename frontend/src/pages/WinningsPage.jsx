import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const STATUS_CONFIG = {
  pending:  { label: "Pending Review", color: "#ffd54f", bg: "rgba(255,213,79,0.1)",  border: "rgba(255,213,79,0.25)"  },
  approved: { label: "Approved",       color: "#81c784", bg: "rgba(76,175,80,0.1)",   border: "rgba(76,175,80,0.25)"   },
  rejected: { label: "Rejected",       color: "#ff8080", bg: "rgba(255,80,80,0.1)",   border: "rgba(255,80,80,0.25)"   },
  paid:     { label: "Paid",           color: "#4dd0e1", bg: "rgba(77,208,225,0.1)",  border: "rgba(77,208,225,0.25)"  },
};

const TIER_CONFIG = {
  tier3: { label: "3-Match", icon: "🥉", color: "#cd7f32" },
  tier4: { label: "4-Match", icon: "🥈", color: "#c0c0c0" },
  tier5: { label: "5-Match (Jackpot)", icon: "🥇", color: "#ffd700" },
};

export default function WinningsPage() {
  const [profile, setProfile] = useState(null);
  const [proofInputs, setProofInputs] = useState({});
  const [uploading, setUploading] = useState({});
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setProfile(res.data);
    } catch {
      showToast("Failed to load winnings.", "error");
    }
  };

  const uploadProof = async (winId) => {
    const proof = proofInputs[winId];
    if (!proof) return;
    setUploading((prev) => ({ ...prev, [winId]: true }));
    try {
      await API.put(`/user/upload-proof/${winId}`, { proof });
      showToast("Proof submitted successfully!");
      setProofInputs((prev) => ({ ...prev, [winId]: "" }));
      fetchProfile();
    } catch {
      showToast("Failed to upload proof.", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [winId]: false }));
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const winnings = profile?.winnings || [];
  const totalWon = winnings.filter(w => w.status === "paid").reduce((sum, w) => sum + (w.amount || 0), 0);
  const pendingCount = winnings.filter(w => w.status === "pending").length;

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
            <h2 className="page-title">My Winnings</h2>
            <p className="page-sub">Track your prizes and submit verification proof</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Total Draws Won</p>
            <p className="stat-value">{winnings.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Amount Paid Out</p>
            <p className="stat-value green">₹{totalWon.toFixed(0)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Pending Verification</p>
            <p className="stat-value yellow">{pendingCount}</p>
          </div>
        </div>

        {/* Winnings List */}
        {winnings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏆</span>
            <h3>No winnings yet</h3>
            <p>Keep entering scores — your draw entry is active every month!</p>
            <button className="btn-go" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="winnings-list">
            {winnings.map((w, i) => {
              const tier = TIER_CONFIG[w.tier] || { label: w.tier, icon: "🎯", color: "#aaa" };
              const status = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
              return (
                <div className="winning-card" key={w._id || i} style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="winning-top">
                    <div className="winning-left">
                      <span className="tier-icon">{tier.icon}</span>
                      <div>
                        <p className="tier-label" style={{ color: tier.color }}>{tier.label}</p>
                        <p className="draw-id">Draw #{w.drawId?.toString?.().slice(-6) || "—"}</p>
                      </div>
                    </div>
                    <div className="winning-right">
                      <p className="winning-amount">₹{(w.amount || 0).toFixed(0)}</p>
                      <span
                        className="status-badge"
                        style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Proof Upload — only if pending and no proof yet */}
                  {w.status === "pending" && !w.proof && (
                    <div className="proof-section">
                      <p className="proof-label">Upload Proof of Scores</p>
                      <p className="proof-hint">Paste a URL to a screenshot of your golf scores from the platform</p>
                      <div className="proof-row">
                        <input
                          type="url"
                          placeholder="https://imgur.com/your-screenshot"
                          value={proofInputs[w._id] || ""}
                          onChange={(e) => setProofInputs(prev => ({ ...prev, [w._id]: e.target.value }))}
                          className="proof-input"
                        />
                        <button
                          className="btn-proof"
                          onClick={() => uploadProof(w._id)}
                          disabled={uploading[w._id] || !proofInputs[w._id]}
                        >
                          {uploading[w._id] ? <span className="spinner" /> : "Submit"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Proof submitted */}
                  {w.proof && (
                    <div className="proof-submitted">
                      <span className="proof-tick">✓</span>
                      <span>Proof submitted — </span>
                      <a href={w.proof} target="_blank" rel="noreferrer" className="proof-link">
                        View Screenshot
                      </a>
                    </div>
                  )}

                  {/* Rejected — allow resubmit */}
                  {w.status === "rejected" && (
                    <div className="proof-section rejected">
                      <p className="proof-label" style={{ color: "#ff8080" }}>Proof Rejected — Resubmit</p>
                      <div className="proof-row">
                        <input
                          type="url"
                          placeholder="https://imgur.com/new-screenshot"
                          value={proofInputs[w._id] || ""}
                          onChange={(e) => setProofInputs(prev => ({ ...prev, [w._id]: e.target.value }))}
                          className="proof-input"
                        />
                        <button
                          className="btn-proof"
                          onClick={() => uploadProof(w._id)}
                          disabled={uploading[w._id] || !proofInputs[w._id]}
                        >
                          {uploading[w._id] ? <span className="spinner" /> : "Resubmit"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page { min-height: 100vh; background: #0a0f0a; font-family: 'DM Sans', sans-serif; color: #f0faf0; }

        .page-content { max-width: 860px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 28px; }

        .page-header { display: flex; align-items: center; justify-content: space-between; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { color: rgba(255,255,255,0.4); margin-top: 6px; font-size: 15px; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } }

        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 24px;
          animation: fadeIn 0.4s ease both;
        }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .stat-value { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #f0faf0; margin-top: 6px; }
        .stat-value.green { color: #4caf50; }
        .stat-value.yellow { color: #ffd54f; }

        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 80px 24px; text-align: center;
        }
        .empty-icon { font-size: 56px; }
        .empty-state h3 { font-family: 'Playfair Display', serif; font-size: 24px; color: #f0faf0; }
        .empty-state p { color: rgba(255,255,255,0.35); font-size: 15px; max-width: 360px; }
        .btn-go {
          margin-top: 8px;
          background: linear-gradient(135deg, #4caf50, #2d8a32);
          border: none; border-radius: 12px; padding: 12px 28px;
          color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-go:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(76,175,80,0.35); }

        .winnings-list { display: flex; flex-direction: column; gap: 16px; }

        .winning-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 24px 28px;
          display: flex; flex-direction: column; gap: 16px;
          animation: fadeIn 0.4s ease both;
          transition: border-color 0.2s;
        }
        .winning-card:hover { border-color: rgba(255,255,255,0.15); }

        @keyframes fadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

        .winning-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .winning-left { display: flex; align-items: center; gap: 14px; }
        .tier-icon { font-size: 32px; }
        .tier-label { font-size: 16px; font-weight: 600; }
        .draw-id { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .winning-right { text-align: right; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        .winning-amount { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #f0faf0; }
        .status-badge { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        .proof-section { display: flex; flex-direction: column; gap: 8px; }
        .proof-section.rejected { border-top: 1px solid rgba(255,80,80,0.15); padding-top: 16px; }
        .proof-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); }
        .proof-hint { font-size: 12px; color: rgba(255,255,255,0.25); }
        .proof-row { display: flex; gap: 10px; }

        .proof-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 14px;
          color: #f0faf0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.2s;
        }
        .proof-input::placeholder { color: rgba(255,255,255,0.2); }
        .proof-input:focus { border-color: #4caf50; background: rgba(76,175,80,0.08); box-shadow: 0 0 0 3px rgba(76,175,80,0.1); }

        .btn-proof {
          background: linear-gradient(135deg, #4caf50, #2d8a32);
          border: none; border-radius: 10px; padding: 11px 20px;
          color: #fff; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; min-width: 80px;
        }
        .btn-proof:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(76,175,80,0.35); }
        .btn-proof:disabled { opacity: 0.5; cursor: not-allowed; }

        .proof-submitted {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 10px 14px;
        }
        .proof-tick { color: #4caf50; font-weight: 700; }
        .proof-link { color: #6ccf6c; text-decoration: none; }
        .proof-link:hover { color: #88e888; text-decoration: underline; }

        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 22px; border-radius: 14px; font-size: 14px; font-weight: 500; z-index: 999; animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both; backdrop-filter: blur(12px); }
        .toast-success { background: rgba(76,175,80,0.18); border: 1px solid rgba(76,175,80,0.35); color: #a5d6a7; }
        .toast-error { background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.28); color: #ff8080; }
        @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
