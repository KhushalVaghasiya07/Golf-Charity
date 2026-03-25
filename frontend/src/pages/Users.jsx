import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState({});
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

  const fetchUsers = () => {
    setLoading(true);
    API.get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => showToast("Failed to load users.", "error"))
      .finally(() => setLoading(false));
  };

  const banUser = async (id) => {
    setActing((p) => ({ ...p, [`ban-${id}`]: true }));
    try {
      await API.put(`/admin/ban/${id}`);
      showToast("User banned.");
      fetchUsers();
    } catch { showToast("Failed to ban user.", "error"); }
    finally { setActing((p) => ({ ...p, [`ban-${id}`]: false })); }
  };

  const unbanUser = async (id) => {
    setActing((p) => ({ ...p, [`unban-${id}`]: true }));
    try {
      await API.put(`/admin/unban/${id}`);
      showToast("User unbanned.");
      fetchUsers();
    } catch { showToast("Failed to unban user.", "error"); }
    finally { setActing((p) => ({ ...p, [`unban-${id}`]: false })); }
  };

  const toggleSubscription = async (id, current) => {
    setActing((p) => ({ ...p, [`sub-${id}`]: true }));
    try {
      await API.put(`/admin/subscription/${id}`, {
        status: current === "active" ? "inactive" : "active",
      });
      showToast(`Subscription ${current === "active" ? "deactivated" : "activated"}.`);
      fetchUsers();
    } catch { showToast("Failed to update subscription.", "error"); }
    finally { setActing((p) => ({ ...p, [`sub-${id}`]: false })); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const displayed = users.filter((u) => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "active" ? u.subscriptionStatus === "active" :
      filter === "inactive" ? u.subscriptionStatus !== "active" :
      filter === "banned" ? u.isBanned : true;
    return matchSearch && matchFilter;
  });

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
              <h2 className="page-title">Users</h2>
              <p className="page-sub">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="controls">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <div className="filter-tabs">
              {["all","active","inactive","banned"].map((f) => (
                <button key={f} className={`filter-tab ${filter === f ? "tab-active" : ""}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            {[
              { label: "Total",    val: users.length,                                          color: "#f0faf0" },
              { label: "Active",   val: users.filter(u => u.subscriptionStatus === "active").length, color: "#81c784" },
              { label: "Inactive", val: users.filter(u => u.subscriptionStatus !== "active").length, color: "#ffd54f" },
              { label: "Banned",   val: users.filter(u => u.isBanned).length,                  color: "#ff8080" },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <span className="sc-label">{s.label}</span>
                <span className="sc-val" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="loading-row"><span className="spinner-green" /> Loading users...</div>
          ) : displayed.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">👥</span><p>No users found.</p></div>
          ) : (
            <div className="users-list">
              {displayed.map((u, i) => (
                <div className={`user-card ${u.isBanned ? "card-banned" : ""}`} key={u._id} style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="user-top">
                    <div className="user-left">
                      <div className="user-avatar">{u.email?.[0]?.toUpperCase() || "?"}</div>
                      <div>
                        <p className="user-email">{u.email}</p>
                        <div className="user-tags">
                          <span className={`sub-pill ${u.subscriptionStatus === "active" ? "sp-active" : "sp-inactive"}`}>
                            {u.subscriptionStatus || "inactive"}
                          </span>
                          {u.isBanned && <span className="ban-pill">Banned</span>}
                          {u.charity && <span className="charity-pill">💚 {u.charity}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="user-right">
                      <span className="score-count">{u.scores?.length ?? 0}/5 scores</span>
                      <span className="win-count">{u.winnings?.length ?? 0} wins</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    {/* Subscription toggle */}
                    <button
                      className={u.subscriptionStatus === "active" ? "btn-deactivate" : "btn-activate"}
                      onClick={() => toggleSubscription(u._id, u.subscriptionStatus)}
                      disabled={acting[`sub-${u._id}`]}
                    >
                      {acting[`sub-${u._id}`] ? <span className="spinner" /> :
                        u.subscriptionStatus === "active" ? "Deactivate Sub" : "Activate Sub"}
                    </button>

                    {/* Ban / Unban */}
                    {u.isBanned ? (
                      <button className="btn-unban" onClick={() => unbanUser(u._id)} disabled={acting[`unban-${u._id}`]}>
                        {acting[`unban-${u._id}`] ? <span className="spinner" /> : "↩ Unban"}
                      </button>
                    ) : (
                      <button className="btn-ban" onClick={() => banUser(u._id)} disabled={acting[`ban-${u._id}`]}>
                        {acting[`ban-${u._id}`] ? <span className="spinner" /> : "🚫 Ban"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
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

        .main { flex: 1; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
        .main-header { display: flex; justify-content: space-between; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        .controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .search-input { flex: 1; min-width: 200px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 11px 16px; color: #f0faf0; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .search-input:focus { border-color: #4caf50; background: rgba(76,175,80,0.08); box-shadow: 0 0 0 3px rgba(76,175,80,0.1); }

        .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-tab { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 7px 14px; color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
        .filter-tab:hover { background: rgba(255,255,255,0.07); color: #f0faf0; }
        .tab-active { background: rgba(76,175,80,0.1) !important; border-color: rgba(76,175,80,0.25) !important; color: #81c784 !important; }

        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 600px) { .stats-row { grid-template-columns: repeat(2,1fr); } }
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px 18px; }
        .sc-label { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; display: block; margin-bottom: 4px; }
        .sc-val { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; }

        .loading-row { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.35); font-size: 14px; padding: 20px 0; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 0; color: rgba(255,255,255,0.3); }
        .empty-icon { font-size: 40px; }

        .users-list { display: flex; flex-direction: column; gap: 10px; }
        .user-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; animation: fadeIn 0.4s ease both; transition: border-color 0.2s; }
        .user-card:hover { border-color: rgba(255,255,255,0.12); }
        .card-banned { border-color: rgba(255,80,80,0.2) !important; background: rgba(255,80,80,0.03) !important; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }

        .user-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .user-left { display: flex; align-items: center; gap: 14px; }
        .user-avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(76,175,80,0.15); border: 1px solid rgba(76,175,80,0.25); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #81c784; flex-shrink: 0; }
        .user-email { font-size: 15px; font-weight: 500; color: #f0faf0; }
        .user-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 5px; }
        .user-right { display: flex; gap: 12px; align-items: center; }
        .score-count, .win-count { font-size: 12px; color: rgba(255,255,255,0.3); }

        .sub-pill { font-size: 11px; padding: 2px 10px; border-radius: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .sp-active { background: rgba(76,175,80,0.12); color: #81c784; }
        .sp-inactive { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
        .ban-pill { font-size: 11px; padding: 2px 10px; border-radius: 10px; font-weight: 600; background: rgba(255,80,80,0.12); color: #ff8080; }
        .charity-pill { font-size: 11px; padding: 2px 10px; border-radius: 10px; background: rgba(76,175,80,0.08); color: #81c784; }

        .user-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-activate { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.28); border-radius: 10px; padding: 8px 18px; color: #81c784; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-activate:hover:not(:disabled) { background: rgba(76,175,80,0.18); }

        .btn-deactivate { background: rgba(255,193,7,0.08); border: 1px solid rgba(255,193,7,0.22); border-radius: 10px; padding: 8px 18px; color: #ffd54f; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-deactivate:hover:not(:disabled) { background: rgba(255,193,7,0.15); }

        .btn-ban { background: rgba(255,80,80,0.07); border: 1px solid rgba(255,80,80,0.22); border-radius: 10px; padding: 8px 18px; color: #ff8080; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-ban:hover:not(:disabled) { background: rgba(255,80,80,0.14); }

        .btn-unban { background: rgba(77,208,225,0.08); border: 1px solid rgba(77,208,225,0.25); border-radius: 10px; padding: 8px 18px; color: #4dd0e1; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-unban:hover:not(:disabled) { background: rgba(77,208,225,0.15); }

        .btn-activate:disabled,.btn-deactivate:disabled,.btn-ban:disabled,.btn-unban:disabled { opacity: 0.5; cursor: not-allowed; }

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
