import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isAdmin = path === "/admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLink = (to, label) => (
    <span
      className={`nav-link ${path === to ? "nav-active" : ""}`}
      onClick={() => navigate(to)}
    >
      {label}
    </span>
  );

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}>
        <span className="nav-icon">⛳</span>
        <span className="nav-logo">GolfCharity</span>
      </div>

      {!isAdmin && (
        <div className="nav-links">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/winnings", "My Winnings")}
          {navLink("/subscribe", "Subscribe")}
        </div>
      )}

      <div className="nav-actions">
        {isAdmin
          ? <span className="nav-badge admin-badge">Admin Panel</span>
          : <span className="nav-badge user-badge">Player</span>
        }
        <button className="nav-logout" onClick={handleLogout}>Sign Out</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 64px;
          background: rgba(10,15,10,0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0; z-index: 100;
        }

        .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .nav-icon { font-size: 22px; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #f0faf0; letter-spacing: -0.3px; }

        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.45); padding: 6px 14px; border-radius: 8px;
          cursor: pointer; transition: all 0.2s;
        }
        .nav-link:hover { color: #f0faf0; background: rgba(255,255,255,0.06); }
        .nav-active { color: #81c784 !important; background: rgba(76,175,80,0.1) !important; }

        .nav-actions { display: flex; align-items: center; gap: 12px; }

        .nav-badge { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; }
        .admin-badge { background: rgba(255,193,7,0.12); border: 1px solid rgba(255,193,7,0.3); color: #ffd54f; }
        .user-badge { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.25); color: #81c784; }

        .nav-logout {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 7px 16px;
          color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
        }
        .nav-logout:hover { background: rgba(255,80,80,0.1); border-color: rgba(255,80,80,0.25); color: #ff8080; }

        @media (max-width: 600px) {
          .nav-links { display: none; }
          .navbar { padding: 0 16px; }
        }
      `}</style>
    </nav>
  );
}
