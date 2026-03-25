import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import AnalyticsCards from "../components/admin/AnalyticsCards";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [latestDraw, setLatestDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingDraw, setCreatingDraw] = useState(false);
  const [publishingDraw, setPublishingDraw] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      const [aRes, dRes] = await Promise.all([
        API.get("/admin/analytics"),
        API.get("/admin/latest-draw"),
      ]);
      setAnalytics(aRes.data);
      setLatestDraw(dRes.data);
    } catch { showToast("Failed to load analytics.", "error"); }
    finally { setLoading(false); }
  };

  const createDraw = async () => {
    setCreatingDraw(true);
    try {
      const res = await API.post("/admin/draw");
      setLatestDraw(res.data);
      showToast("Draw created! Review and publish when ready.");
    } catch { showToast("Failed to create draw.", "error"); }
    finally { setCreatingDraw(false); }
  };

  const publishDraw = async () => {
    if (!latestDraw?._id) return;
    setPublishingDraw(true);
    try {
      await API.put(`/admin/draw/${latestDraw._id}/publish`);
      setLatestDraw((prev) => ({ ...prev, isPublished: true }));
      showToast("Draw published successfully!");
    } catch { showToast("Failed to publish draw.", "error"); }
    finally { setPublishingDraw(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const adminNav = [
    { path: "/admin",          label: "Dashboard", icon: "📊" },
    { path: "/admin/draws",    label: "Draw History", icon: "🎲" },
    { path: "/admin/winners",  label: "Winners", icon: "🏆" },
    { path: "/admin/users",    label: "Users", icon: "👥" },
  ];

  return (
    <div className="page">
      <Navbar />
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <p className="sidebar-title">Admin Menu</p>
          {adminNav.map((n) => (
            <div
              key={n.path}
              className={`sidebar-item ${location.pathname === n.path ? "sidebar-active" : ""}`}
              onClick={() => navigate(n.path)}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="main">
          <div className="main-header">
            <div>
              <h2 className="page-title">Admin Dashboard</h2>
              <p className="page-sub">Platform overview and draw management</p>
            </div>
            <div className="header-btns">
              <button className="btn-create" onClick={createDraw} disabled={creatingDraw}>
                {creatingDraw ? <><span className="spinner" /> Creating...</> : "🎲 Create Draw"}
              </button>
              {latestDraw && !latestDraw.isPublished && (
                <button className="btn-publish" onClick={publishDraw} disabled={publishingDraw}>
                  {publishingDraw ? <><span className="spinner" /> Publishing...</> : "📢 Publish"}
                </button>
              )}
            </div>
          </div>

          {/* Analytics */}
          {loading ? (
            <div className="loading-row"><span className="spinner-green" /> Loading analytics...</div>
          ) : analytics ? (
            <AnalyticsCards data={analytics} />
          ) : null}

          {/* Latest Draw */}
          {latestDraw && (
            <div className="draw-section">
              <div className="draw-section-header">
                <h3 className="section-title">Latest Draw</h3>
                <span className={`draw-pill ${latestDraw.isPublished ? "pill-published" : "pill-draft"}`}>
                  {latestDraw.isPublished ? "✓ Published" : "⏸ Draft"}
                </span>
              </div>

              <div className="draw-body">
                <div className="draw-left">
                  <p className="draw-label">Draw Numbers</p>
                  <div className="draw-balls">
                    {latestDraw.numbers?.map((n, i) => (
                      <div className="draw-ball" key={i} style={{ animationDelay: `${i * 0.09}s` }}>{n}</div>
                    ))}
                  </div>
                </div>

                <div className="draw-right">
                  {[
                    ["Prize Pool", `₹${(latestDraw.prizePool || 0).toFixed(0)}`, ""],
                    ["Jackpot (5-match)", `₹${(latestDraw.prizes?.tier5 || 0).toFixed(0)}`, "gold"],
                    ["4-match",          `₹${(latestDraw.prizes?.tier4 || 0).toFixed(0)}`, ""],
                    ["3-match",          `₹${(latestDraw.prizes?.tier3 || 0).toFixed(0)}`, ""],
                  ].map(([label, val, cls]) => (
                    <div className="prize-row" key={label}>
                      <span className="pr-label">{label}</span>
                      <span className={`pr-val ${cls}`}>{val}</span>
                    </div>
                  ))}
                  {latestDraw.jackpotCarry > 0 && (
                    <div className="carry-note">🔥 Carry-over: ₹{latestDraw.jackpotCarry.toFixed(0)}</div>
                  )}
                </div>
              </div>

              {/* Winners summary */}
              {["tier5","tier4","tier3"].map((tier) => {
                const list = latestDraw.winners?.[tier] || [];
                if (!list.length) return null;
                const icons = { tier5:"🥇", tier4:"🥈", tier3:"🥉" };
                return (
                  <div className="tier-block" key={tier}>
                    <p className="tier-heading">{icons[tier]} {tier === "tier5" ? "Jackpot" : tier === "tier4" ? "4-Match" : "3-Match"} Winners ({list.length})</p>
                    <div className="tier-list">
                      {list.map((w, i) => (
                        <div className="tier-row" key={i}>
                          <span>{w.user?.email || `User #${i+1}`}</span>
                          <span className="tier-matches">{w.matches} matches</span>
                        </div>
                      ))}
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

        /* Sidebar */
        .sidebar { width: 200px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; }
        .sidebar-title { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding: 0 12px; }
        .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 14px; color: rgba(255,255,255,0.45); cursor: pointer; transition: all 0.2s; }
        .sidebar-item:hover { background: rgba(255,255,255,0.05); color: #f0faf0; }
        .sidebar-active { background: rgba(76,175,80,0.1) !important; color: #81c784 !important; border: 1px solid rgba(76,175,80,0.2); }

        @media (max-width: 768px) { .sidebar { display: none; } .layout { padding: 20px 16px; } }

        /* Main */
        .main { flex: 1; display: flex; flex-direction: column; gap: 28px; min-width: 0; }

        .main-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .header-btns { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-create { background: linear-gradient(135deg, #ffd54f, #f9a825); border: none; border-radius: 12px; padding: 12px 22px; color: #1a1200; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-create:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(255,213,79,0.35); }
        .btn-create:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-publish { background: linear-gradient(135deg, #4caf50, #2d8a32); border: none; border-radius: 12px; padding: 12px 22px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-publish:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(76,175,80,0.35); }
        .btn-publish:disabled { opacity: 0.6; cursor: not-allowed; }

        .loading-row { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.35); font-size: 14px; padding: 20px 0; }

        /* Draw Section */
        .draw-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,213,79,0.15); border-radius: 20px; padding: 26px; display: flex; flex-direction: column; gap: 22px; animation: fadeIn 0.4s ease both; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }

        .draw-section-header { display: flex; align-items: center; justify-content: space-between; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 19px; color: #f0faf0; }
        .draw-pill { font-size: 12px; padding: 4px 14px; border-radius: 20px; font-weight: 600; }
        .pill-draft { background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.25); color: #ffd54f; }
        .pill-published { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.25); color: #81c784; }

        .draw-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 600px) { .draw-body { grid-template-columns: 1fr; } }

        .draw-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 12px; }
        .draw-balls { display: flex; gap: 10px; flex-wrap: wrap; }
        .draw-ball { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #ffd54f, #f9a825); color: #1a1200; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; font-family: 'Playfair Display', serif; box-shadow: 0 3px 14px rgba(255,213,79,0.3); animation: pop 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes pop { from{opacity:0;transform:scale(0.3) rotate(-20deg);}to{opacity:1;transform:scale(1) rotate(0);} }

        .draw-right { display: flex; flex-direction: column; gap: 8px; }
        .prize-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; font-size: 13px; color: rgba(255,255,255,0.55); }
        .pr-label {}
        .pr-val { font-weight: 700; color: #f0faf0; font-family: 'Playfair Display', serif; font-size: 15px; }
        .pr-val.gold { color: #ffd54f; }
        .carry-note { font-size: 12px; color: rgba(255,140,80,0.75); padding: 8px 14px; background: rgba(255,100,50,0.06); border: 1px solid rgba(255,100,50,0.15); border-radius: 10px; }

        .tier-block { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; }
        .tier-heading { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
        .tier-list { display: flex; flex-direction: column; gap: 6px; }
        .tier-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; background: rgba(76,175,80,0.05); border: 1px solid rgba(76,175,80,0.12); border-radius: 10px; font-size: 13px; }
        .tier-matches { color: rgba(255,255,255,0.3); font-size: 12px; }

        .spinner, .spinner-green { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
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
