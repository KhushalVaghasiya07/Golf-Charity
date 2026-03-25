import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function DrawHistory() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const adminNav = [
    { path: "/admin",         label: "Dashboard",    icon: "📊" },
    { path: "/admin/draws",   label: "Draw History", icon: "🎲" },
    { path: "/admin/winners", label: "Winners",      icon: "🏆" },
    { path: "/admin/users",   label: "Users",        icon: "👥" },
  ];

  useEffect(() => {
    API.get("/admin/draw-history")
      .then((res) => setDraws(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Navbar />

      <div className="layout">
        <aside className="sidebar">
          <p className="sidebar-title">Admin Menu</p>
          {adminNav.map((n) => (
            <div
              key={n.path}
              className={`sidebar-item ${location.pathname === n.path ? "sidebar-active" : ""}`}
              onClick={() => navigate(n.path)}
            >
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </aside>

        <main className="main">
          <div className="main-header">
            <h2 className="page-title">Draw History</h2>
            <p className="page-sub">{draws.length} draw{draws.length !== 1 ? "s" : ""} on record</p>
          </div>

          {loading ? (
            <div className="loading-row"><span className="spinner-green" /> Loading draws...</div>
          ) : draws.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">🎲</span><p>No draws yet.</p></div>
          ) : (
            <div className="draws-list">
              {draws.map((d, i) => {
                const isOpen = expanded === d._id;
                const totalWinners = (d.winners?.tier3?.length || 0) + (d.winners?.tier4?.length || 0) + (d.winners?.tier5?.length || 0);
                return (
                  <div className="draw-card" key={d._id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="draw-row" onClick={() => setExpanded(isOpen ? null : d._id)}>
                      <div className="draw-main">
                        <div className="draw-date">
                          {d.month && d.year ? `${d.month}/${d.year}` : new Date(d.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </div>
                        <div className="draw-numbers-inline">
                          {d.numbers?.map((n, j) => (
                            <span className="num-chip" key={j}>{n}</span>
                          ))}
                        </div>
                      </div>
                      <div className="draw-meta">
                        <span className="meta-pool">₹{(d.prizePool || 0).toFixed(0)}</span>
                        <span className="meta-winners">{totalWinners} winner{totalWinners !== 1 ? "s" : ""}</span>
                        <span className={`status-pill ${d.isPublished ? "pill-pub" : "pill-draft"}`}>
                          {d.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="chevron">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="draw-detail">
                        <div className="detail-grid">
                          {[
                            ["Jackpot (5-match)", `₹${(d.prizes?.tier5 || 0).toFixed(0)}`],
                            ["4-Match",           `₹${(d.prizes?.tier4 || 0).toFixed(0)}`],
                            ["3-Match",           `₹${(d.prizes?.tier3 || 0).toFixed(0)}`],
                            ["Jackpot Carry",     d.jackpotCarry > 0 ? `₹${d.jackpotCarry.toFixed(0)}` : "—"],
                          ].map(([label, val]) => (
                            <div className="detail-item" key={label}>
                              <span className="di-label">{label}</span>
                              <span className="di-val">{val}</span>
                            </div>
                          ))}
                        </div>

                        {["tier5","tier4","tier3"].map((tier) => {
                          const list = d.winners?.[tier] || [];
                          if (!list.length) return null;
                          const icons = { tier5:"🥇", tier4:"🥈", tier3:"🥉" };
                          return (
                            <div className="tier-block" key={tier}>
                              <p className="tier-heading">{icons[tier]} {tier === "tier5" ? "Jackpot" : tier === "tier4" ? "4-Match" : "3-Match"} Winners</p>
                              {list.map((w, j) => (
                                <div className="tier-row" key={j}>
                                  <span>{w.user?.email || `User ${j+1}`}</span>
                                  <span className="tier-matches">{w.matches} matches</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
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

        .main { flex: 1; display: flex; flex-direction: column; gap: 24px; min-width: 0; }
        .main-header {}
        .page-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        .loading-row { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.35); font-size: 14px; padding: 20px 0; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 0; color: rgba(255,255,255,0.3); }
        .empty-icon { font-size: 40px; }

        .draws-list { display: flex; flex-direction: column; gap: 10px; }

        .draw-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; animation: fadeIn 0.4s ease both; transition: border-color 0.2s; }
        .draw-card:hover { border-color: rgba(255,255,255,0.13); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }

        .draw-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; gap: 12px; flex-wrap: wrap; }
        .draw-main { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .draw-date { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: #f0faf0; min-width: 80px; }
        .draw-numbers-inline { display: flex; gap: 6px; flex-wrap: wrap; }
        .num-chip { background: rgba(255,213,79,0.12); border: 1px solid rgba(255,213,79,0.25); border-radius: 8px; padding: 3px 10px; font-size: 13px; font-weight: 700; color: #ffd54f; }

        .draw-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .meta-pool { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #f0faf0; }
        .meta-winners { font-size: 12px; color: rgba(255,255,255,0.35); }
        .status-pill { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .pill-pub { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.25); color: #81c784; }
        .pill-draft { background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.2); color: #ffd54f; }
        .chevron { font-size: 11px; color: rgba(255,255,255,0.25); }

        .draw-detail { border-top: 1px solid rgba(255,255,255,0.06); padding: 18px 20px; display: flex; flex-direction: column; gap: 16px; background: rgba(255,255,255,0.02); }

        .detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        @media (max-width: 600px) { .detail-grid { grid-template-columns: repeat(2, 1fr); } }
        .detail-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 14px; }
        .di-label { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
        .di-val { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #ffd54f; }

        .tier-block { display: flex; flex-direction: column; gap: 6px; }
        .tier-heading { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
        .tier-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(76,175,80,0.05); border: 1px solid rgba(76,175,80,0.12); border-radius: 8px; font-size: 13px; }
        .tier-matches { font-size: 12px; color: rgba(255,255,255,0.3); }

        .spinner-green { width: 16px; height: 16px; border: 2px solid rgba(76,175,80,0.2); border-top-color: #4caf50; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to{transform:rotate(360deg);} }
      `}</style>
    </div>
  );
}
