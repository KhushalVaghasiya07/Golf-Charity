import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const STATUS_CFG = {
  pending:  { label: "Pending",  color: "#ffd54f", bg: "rgba(255,213,79,0.1)",  border: "rgba(255,213,79,0.25)"  },
  approved: { label: "Approved", color: "#81c784", bg: "rgba(76,175,80,0.1)",   border: "rgba(76,175,80,0.25)"   },
  rejected: { label: "Rejected", color: "#ff8080", bg: "rgba(255,80,80,0.1)",   border: "rgba(255,80,80,0.25)"   },
  paid:     { label: "Paid",     color: "#4dd0e1", bg: "rgba(77,208,225,0.1)",  border: "rgba(77,208,225,0.25)"  },
};

const TIER_CFG = {
  tier3: { icon: "🥉", label: "3-Match" },
  tier4: { icon: "🥈", label: "4-Match" },
  tier5: { icon: "🥇", label: "Jackpot"  },
};

export default function Winners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [verifying, setVerifying] = useState({});
  const [markingPaid, setMarkingPaid] = useState({});
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const adminNav = [
    { path: "/admin",         label: "Dashboard",    icon: "📊" },
    { path: "/admin/draws",   label: "Draw History", icon: "🎲" },
    { path: "/admin/winners", label: "Winners",      icon: "🏆" },
    { path: "/admin/users",   label: "Users",        icon: "👥" },
  ];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWinners = () => {
    setLoading(true);
    API.get("/admin/winners")
      .then((res) => setWinners(res.data))
      .catch(() => showToast("Failed to load winners.", "error"))
      .finally(() => setLoading(false));
  };

  const verify = async (userId, winId, status) => {
    const key = `${userId}-${winId}`;
    setVerifying((p) => ({ ...p, [key]: true }));
    try {
      await API.put(`/admin/verify/${userId}/${winId}`, { status });
      showToast(`Winner ${status === "approved" ? "approved ✓" : "rejected ✕"}`, status === "approved" ? "success" : "error");
      fetchWinners();
    } catch { showToast("Verification failed.", "error"); }
    finally { setVerifying((p) => ({ ...p, [key]: false })); }
  };

  const markPaid = async (userId, winId) => {
    const key = `${userId}-${winId}`;
    setMarkingPaid((p) => ({ ...p, [key]: true }));
    try {
      await API.put(`/admin/mark-paid/${userId}/${winId}`);
      showToast("Marked as paid ✓");
      fetchWinners();
    } catch { showToast("Failed to mark paid.", "error"); }
    finally { setMarkingPaid((p) => ({ ...p, [key]: false })); }
  };

  useEffect(() => { fetchWinners(); }, []);

  const filters = ["all", "pending", "approved", "rejected", "paid"];
  const filtered = filter === "all" ? winners : winners.filter((w) => w.status === filter);

  return (
    <div className="page">
      <Navbar />
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}

      <div className="layout">
        <aside className="sidebar">
          <p className="sidebar-title">Admin Menu</p>
          {adminNav.map((n) => (
            <div key={n.path} className={`sidebar-item ${location.pathname === n.path ? "sidebar-active" : ""}`} onClick={() => navigate(n.path)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </aside>

        <main className="main">
          <div className="main-header">
            <div>
              <h2 className="page-title">Winners</h2>
              <p className="page-sub">{winners.length} total winner record{winners.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {filters.map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? "tab-active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="tab-count">
                  {f === "all" ? winners.length : winners.filter((w) => w.status === f).length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-row"><span className="spinner-green" /> Loading winners...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">🏆</span><p>No {filter !== "all" ? filter : ""} winners found.</p></div>
          ) : (
            <div className="winners-list">
              {filtered.map((w, i) => {
                const status = STATUS_CFG[w.status] || STATUS_CFG.pending;
                const tier = TIER_CFG[w.tier] || { icon: "🎯", label: w.tier };
                const key = `${w.userId}-${w.winId}`;

                return (
                  <div className="winner-card" key={w.winId || i} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="winner-top">
                      <div className="winner-left">
                        <span className="tier-icon">{tier.icon}</span>
                        <div>
                          <p className="winner-email">{w.email}</p>
                          <p className="winner-meta">{tier.label} · Draw #{w.drawId?.toString?.().slice(-6) || "—"}</p>
                        </div>
                      </div>
                      <div className="winner-right">
                        <p className="winner-amount">₹{(w.amount || 0).toFixed(0)}</p>
                        <span className="status-badge" style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Proof */}
                    {w.proof && (
                      <div className="proof-bar">
                        <span className="proof-tick">✓</span>
                        <span>Proof submitted —</span>
                        <a href={w.proof} target="_blank" rel="noreferrer" className="proof-link">View Screenshot ↗</a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="winner-actions">
                      {w.status === "pending" && w.proof && (
                        <>
                          <button className="btn-approve" onClick={() => verify(w.userId, w.winId, "approved")} disabled={verifying[key]}>
                            {verifying[key] ? <span className="spinner" /> : "✓ Approve"}
                          </button>
                          <button className="btn-reject" onClick={() => verify(w.userId, w.winId, "rejected")} disabled={verifying[key]}>
                            {verifying[key] ? <span className="spinner" /> : "✕ Reject"}
                          </button>
                        </>
                      )}
                      {w.status === "pending" && !w.proof && (
                        <span className="awaiting-note">⏳ Awaiting proof from user</span>
                      )}
                      {w.status === "approved" && (
                        <button className="btn-paid" onClick={() => markPaid(w.userId, w.winId)} disabled={markingPaid[key]}>
                          {markingPaid[key] ? <span className="spinner" /> : "💳 Mark as Paid"}
                        </button>
                      )}
                      {w.status === "paid" && <span className="paid-note">✓ Payment complete</span>}
                      {w.status === "rejected" && <span className="rejected-note">✕ Proof rejected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { min-height: 100vh; background: #0a0f0a; font-family: 'DM Sans', sans-serif; color: #f0faf0; }
        .layout { display: flex; max-width: 1200px; margin: 0 auto; padding: 32px 24px; gap: 28px; }

        .sidebar { width: 200px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; }
        .sidebar-title { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding: 0 12px; }
        .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 14px; color: rgba(255,255,255,0.45); cursor: pointer; transition: all 0.2s; }
        .sidebar-item:hover { background: rgba(255,255,255,0.05); color: #f0faf0; }
        .sidebar-active { background: rgba(76,175,80,0.1) !important; color: #81c784 !important; border: 1px solid rgba(76,175,80,0.2); }
        @media (max-width: 768px) { .sidebar { display: none; } }

        .main { flex: 1; display: flex; flex-direction: column; gap: 22px; min-width: 0; }
        .main-header { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-tab { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 7px 14px; color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .filter-tab:hover { background: rgba(255,255,255,0.07); color: #f0faf0; }
        .tab-active { background: rgba(76,175,80,0.1) !important; border-color: rgba(76,175,80,0.25) !important; color: #81c784 !important; }
        .tab-count { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1px 7px; font-size: 11px; }

        .loading-row { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.35); font-size: 14px; padding: 20px 0; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 0; color: rgba(255,255,255,0.3); }
        .empty-icon { font-size: 40px; }

        .winners-list { display: flex; flex-direction: column; gap: 12px; }
        .winner-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; animation: fadeIn 0.4s ease both; transition: border-color 0.2s; }
        .winner-card:hover { border-color: rgba(255,255,255,0.12); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }

        .winner-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .winner-left { display: flex; align-items: center; gap: 14px; }
        .tier-icon { font-size: 30px; }
        .winner-email { font-size: 15px; font-weight: 500; color: #f0faf0; }
        .winner-meta { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .winner-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .winner-amount { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #f0faf0; }
        .status-badge { font-size: 11px; font-weight: 600; padding: 3px 11px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        .proof-bar { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 9px 14px; }
        .proof-tick { color: #4caf50; font-weight: 700; }
        .proof-link { color: #6ccf6c; text-decoration: none; }
        .proof-link:hover { color: #88e888; text-decoration: underline; }

        .winner-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .btn-approve { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3); border-radius: 10px; padding: 9px 20px; color: #81c784; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-approve:hover:not(:disabled) { background: rgba(76,175,80,0.18); }

        .btn-reject { background: rgba(255,80,80,0.07); border: 1px solid rgba(255,80,80,0.22); border-radius: 10px; padding: 9px 20px; color: #ff8080; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-reject:hover:not(:disabled) { background: rgba(255,80,80,0.13); }

        .btn-paid { background: rgba(77,208,225,0.1); border: 1px solid rgba(77,208,225,0.28); border-radius: 10px; padding: 9px 20px; color: #4dd0e1; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-paid:hover:not(:disabled) { background: rgba(77,208,225,0.17); }

        .btn-approve:disabled, .btn-reject:disabled, .btn-paid:disabled { opacity: 0.5; cursor: not-allowed; }

        .awaiting-note { font-size: 13px; color: rgba(255,255,255,0.3); }
        .paid-note { font-size: 13px; color: #4dd0e1; }
        .rejected-note { font-size: 13px; color: #ff8080; }

        .spinner, .spinner-green { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        .spinner-green { border-top-color: #4caf50; border-color: rgba(76,175,80,0.2); }
        @keyframes spin { to{transform:rotate(360deg);} }

        .toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 22px; border-radius: 14px; font-size: 14px; font-weight: 500; z-index: 999; animation: toastIn 0.3s ease both; backdrop-filter: blur(12px); }
        .toast-success { background: rgba(76,175,80,0.18); border: 1px solid rgba(76,175,80,0.35); color: #a5d6a7; }
        .toast-error { background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.28); color: #ff8080; }
        @keyframes toastIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
      `}</style>
    </div>
  );
}
