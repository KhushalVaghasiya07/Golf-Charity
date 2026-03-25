import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [scores, setScores] = useState([]);
  const [value, setValue] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [charity, setCharity] = useState("");
  const [charityInput, setCharityInput] = useState("");
  const [profile, setProfile] = useState(null);
  const [draw, setDraw] = useState(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [addingScore, setAddingScore] = useState(false);
  const [updatingCharity, setUpdatingCharity] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();

  // ONLY THIS PART CHANGED — keep rest SAME

  // 🔥 FIXED TIMER
  useEffect(() => {
    let interval;

    const fetchDraw = async () => {
      try {
        const res = await API.get("/user/next-draw");

        if (!res.data?.drawDate) return;

        const drawDate = new Date(res.data.drawDate);

        interval = setInterval(() => {
          const now = new Date();
          const diff = drawDate - now;

          if (diff <= 0) {
            setTimeLeft("Draw time!");
            clearInterval(interval);
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

      } catch (err) {
        console.log(err);
      }
    };

    fetchDraw();

    return () => {
      if (interval) clearInterval(interval); // ✅ CLEANUP
    };
  }, []);


  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [scoresRes, profileRes, drawRes] = await Promise.all([
        API.get("/scores"),
        API.get("/user/profile"),
        API.get("/user/draw"),
      ]);
      setScores(scoresRes.data);
      setProfile(profileRes.data);
      setCharity(profileRes.data?.charity || "");
      setDraw(drawRes.data);
    } catch {
      showToast("Failed to load data.", "error");
    } finally {
      setLoadingScores(false);
    }
  };

  const addScore = async () => {
    if (!value || !scoreDate) { showToast("Please enter both score and date.", "error"); return; }
    if (profile?.subscriptionStatus !== "active") { showToast("Active subscription required.", "error"); return; }
    setAddingScore(true);
    try {
      await API.post("/scores/add", { value: Number(value), date: scoreDate });
      setValue(""); setScoreDate("");
      const res = await API.get("/scores");
      setScores(res.data);
      showToast("Score added!");
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to add score.", "error");
    } finally { setAddingScore(false); }
  };

  const updateCharity = async () => {
    if (!charityInput) return;
    setUpdatingCharity(true);
    try {
      await API.put("/user/charity", { charity: charityInput });
      setCharity(charityInput);
      showToast("Charity updated!");
    } catch { showToast("Failed to update charity.", "error"); }
    finally { setUpdatingCharity(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const isActive = profile?.subscriptionStatus === "active";
  const subEnd = profile?.subscriptionEndDate
    ? new Date(profile.subscriptionEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const recentWinnings = (profile?.winnings || []).slice(0, 3);

  return (
    <div className="page">
      <Navbar />
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}

      <div className="page-content">
        <div className="page-header">
          <h2 className="page-title">My Dashboard</h2>
          <p className="page-sub">Welcome back{profile?.name ? `, ${profile.name}` : ""}!</p>
        </div>

        {/* Subscription Banner */}
        <div className={`sub-banner ${isActive ? "active" : "inactive"}`}>
          <div className="sub-left">
            <span className={`sub-dot ${isActive ? "dot-active" : "dot-inactive"}`} />
            <div>
              <p className="sub-status-label">{isActive ? "Subscription Active" : "Subscription Inactive"}</p>
              <p className="sub-date">{isActive && subEnd ? `Renews on ${subEnd}` : "Subscribe to enter draws and add scores"}</p>
            </div>
          </div>
          {!isActive && (
            <button className="btn-subscribe" onClick={() => navigate("/subscribe")}>
              Subscribe Now — ₹100
            </button>
          )}
        </div>

        <div className="dashboard-grid">
          {/* Scores Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Scores</h3>
                <p className="card-desc">Stableford · 1–45 range</p>
              </div>
              <div className="score-count">
                <span className={scores.length >= 5 ? "count-full" : "count-ok"}>{scores.length}</span>
                <span className="count-max">/5</span>
              </div>
            </div>

            <div className="scores-list">
              {loadingScores ? (
                <div className="loading-row"><span className="spinner-green" /><span>Loading...</span></div>
              ) : scores.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">🏌️</span><p>No scores yet</p></div>
              ) : (
                scores.map((s, i) => (
                  <div className="score-item" key={s._id || i} style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="score-rank">#{i + 1}</div>
                    <div className="score-value">{s.value}</div>
                    <div className="score-meta">
                      <span className="score-pts">pts</span>
                      {s.date && <span className="score-date">{new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="add-score-fields">
              <input type="number" placeholder="Score (1–45)" value={value} min={1} max={45}
                onChange={(e) => setValue(e.target.value)} className="score-input" disabled={!isActive} />
              <input type="date" value={scoreDate} onChange={(e) => setScoreDate(e.target.value)}
                className="score-input date-input" disabled={!isActive} />
            </div>
            <button className="btn-add" onClick={addScore} disabled={addingScore || !isActive || !value || !scoreDate}>
              {addingScore ? <span className="spinner" /> : "+ Add Score"}
            </button>
            {!isActive && <p className="limit-note">⚠ Active subscription required</p>}
            {isActive && scores.length >= 5 && <p className="limit-note">Oldest score will be replaced on next add</p>}
          </div>

          {/* Charity Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Charity</h3>
                <p className="card-desc">10% of subscription goes here</p>
              </div>
              <span className="charity-icon">💚</span>
            </div>

            {charity && (
              <div className="current-charity">
                <span className="charity-label">Current</span>
                <span className="charity-name">{charity}</span>
              </div>
            )}

            <div className="charity-row">
              <input type="text" placeholder="e.g. Red Cross, UNICEF..." value={charityInput}
                onChange={(e) => setCharityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateCharity()} className="charity-input" />
              <button className="btn-charity" onClick={updateCharity} disabled={updatingCharity || !charityInput}>
                {updatingCharity ? <span className="spinner" /> : "Update"}
              </button>
            </div>

            <div className="info-box">🏆 Win the draw and your charity receives a portion of the prize pool.</div>

            {recentWinnings.length > 0 && (
              <div className="winnings-mini">
                <div className="mini-header">
                  <span>Recent Winnings</span>
                  <span className="view-all" onClick={() => navigate("/winnings")}>View All →</span>
                </div>
                {recentWinnings.map((w, i) => (
                  <div className="mini-win" key={w._id || i}>
                    <span className="mini-tier">{w.tier === "tier5" ? "🥇" : w.tier === "tier4" ? "🥈" : "🥉"} {w.tier}</span>
                    <span className="mini-amount">₹{(w.amount || 0).toFixed(0)}</span>
                    <span className={`mini-status s-${w.status}`}>{w.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Latest Draw */}
        {draw && (
          <div className="draw-card">
            <div className="draw-header">
              <h3 className="card-title">Latest Draw Result</h3>
              <span className="draw-published">Published</span>
            </div>
            <div style={{
              marginTop: "6px",
              fontSize: "13px",
              color: "#ffd54f",
              fontWeight: "500"
            }}>
              ⏳ Next Draw In: {timeLeft || "Loading..."}
            </div>
            <div className="draw-numbers">
              <p className="draw-numbers-label">Draw Numbers</p>
              <div className="draw-balls">
                {draw.numbers?.map((n, i) => (
                  <div className="draw-ball" key={i} style={{ animationDelay: `${i * 0.08}s` }}>{n}</div>
                ))}
              </div>
            </div>
            <div className="draw-prizes">
              {[["🥇 Jackpot (5-match)", draw.prizes?.tier5], ["🥈 4-match", draw.prizes?.tier4], ["🥉 3-match", draw.prizes?.tier3]].map(([label, amt]) => (
                <div className="prize-tier" key={label}>
                  <span>{label}</span>
                  <span className="prize-amt">₹{(amt || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
            {draw.jackpotCarry > 0 && (
              <div className="jackpot-carry">🔥 Jackpot carry-over to next month: ₹{draw.jackpotCarry.toFixed(0)}</div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { min-height: 100vh; background: #0a0f0a; font-family: 'DM Sans', sans-serif; color: #f0faf0; }
        .page-content { max-width: 960px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 24px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { color: rgba(255,255,255,0.4); margin-top: 6px; font-size: 15px; }

        .sub-banner { display: flex; align-items: center; justify-content: space-between; border-radius: 16px; padding: 18px 24px; gap: 16px; flex-wrap: wrap; animation: fadeIn 0.4s ease both; }
        .sub-banner.active { background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2); }
        .sub-banner.inactive { background: rgba(255,193,7,0.06); border: 1px solid rgba(255,193,7,0.2); }
        .sub-left { display: flex; align-items: center; gap: 12px; }
        .sub-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .dot-active { background: #4caf50; box-shadow: 0 0 8px rgba(76,175,80,0.6); animation: blink 2s ease-in-out infinite; }
        .dot-inactive { background: #ffd54f; }
        @keyframes blink { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        .sub-status-label { font-size: 15px; font-weight: 600; color: #f0faf0; }
        .sub-date { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .btn-subscribe { background: linear-gradient(135deg, #ffd54f, #f9a825); border: none; border-radius: 10px; padding: 10px 22px; color: #1a1200; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .btn-subscribe:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,213,79,0.35); }

        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 700px) { .dashboard-grid { grid-template-columns: 1fr; } }

        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 26px; display: flex; flex-direction: column; gap: 16px; animation: fadeIn 0.5s ease both; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #f0faf0; font-weight: 600; }
        .card-desc { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        .score-count { display: flex; align-items: baseline; gap: 2px; }
        .count-ok { font-size: 28px; font-weight: 700; color: #4caf50; font-family: 'Playfair Display', serif; }
        .count-full { font-size: 28px; font-weight: 700; color: #ff8a65; font-family: 'Playfair Display', serif; }
        .count-max { font-size: 16px; color: rgba(255,255,255,0.25); }

        .scores-list { display: flex; flex-direction: column; gap: 7px; min-height: 90px; }
        .score-item { display: flex; align-items: center; gap: 12px; background: rgba(76,175,80,0.06); border: 1px solid rgba(76,175,80,0.15); border-radius: 12px; padding: 10px 14px; animation: slideR 0.3s ease both; transition: all 0.2s; }
        .score-item:hover { background: rgba(76,175,80,0.1); border-color: rgba(76,175,80,0.3); }
        @keyframes slideR { from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);} }
        .score-rank { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); width: 22px; }
        .score-value { font-size: 20px; font-weight: 700; color: #f0faf0; font-family: 'Playfair Display', serif; flex: 1; }
        .score-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
        .score-pts { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; }
        .score-date { font-size: 11px; color: rgba(255,255,255,0.25); }

        .loading-row { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.35); font-size: 14px; padding: 16px 0; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0; color: rgba(255,255,255,0.3); font-size: 13px; }
        .empty-icon { font-size: 26px; }

        .add-score-fields { display: flex; gap: 8px; }
        .score-input, .charity-input { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 11px 13px; color: #f0faf0; font-size: 14px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; outline: none; }
        .score-input::placeholder, .charity-input::placeholder { color: rgba(255,255,255,0.2); }
        .score-input:focus, .charity-input:focus { border-color: #4caf50; background: rgba(76,175,80,0.08); box-shadow: 0 0 0 3px rgba(76,175,80,0.1); }
        .score-input:disabled { opacity: 0.3; cursor: not-allowed; }
        .date-input::-webkit-calendar-picker-indicator { filter: invert(0.5); }

        .btn-add, .btn-charity { background: linear-gradient(135deg, #4caf50, #2d8a32); border: none; border-radius: 12px; padding: 12px 18px; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-add { width: 100%; height: 46px; }
        .btn-add:hover:not(:disabled), .btn-charity:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(76,175,80,0.35); }
        .btn-add:disabled, .btn-charity:disabled { opacity: 0.45; cursor: not-allowed; }
        .limit-note { font-size: 12px; color: rgba(255,160,80,0.7); text-align: center; }

        .current-charity { display: flex; align-items: center; gap: 10px; background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2); border-radius: 12px; padding: 11px 14px; }
        .charity-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(76,175,80,0.7); font-weight: 600; }
        .charity-name { font-size: 14px; font-weight: 500; color: #a5d6a7; }
        .charity-icon { font-size: 26px; }
        .charity-row { display: flex; gap: 10px; }
        .info-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        .winnings-mini { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px; }
        .mini-header { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
        .view-all { color: #6ccf6c; cursor: pointer; font-weight: 500; text-transform: none; letter-spacing: 0; font-size: 13px; }
        .view-all:hover { color: #88e888; }
        .mini-win { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.55); }
        .mini-tier { flex: 1; }
        .mini-amount { font-weight: 600; color: #f0faf0; }
        .mini-status { font-size: 11px; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; font-weight: 600; }
        .s-pending { background: rgba(255,213,79,0.1); color: #ffd54f; }
        .s-approved { background: rgba(76,175,80,0.1); color: #81c784; }
        .s-rejected { background: rgba(255,80,80,0.1); color: #ff8080; }
        .s-paid { background: rgba(77,208,225,0.1); color: #4dd0e1; }

        .draw-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,213,79,0.15); border-radius: 20px; padding: 26px; display: flex; flex-direction: column; gap: 18px; animation: fadeIn 0.5s 0.1s ease both; }
        .draw-header { display: flex; align-items: center; justify-content: space-between; }
        .draw-published { font-size: 11px; padding: 4px 12px; border-radius: 20px; background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.25); color: #81c784; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .draw-numbers-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 10px; }
        .draw-balls { display: flex; gap: 10px; flex-wrap: wrap; }
        .draw-ball { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #ffd54f, #f9a825); color: #1a1200; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 800; font-family: 'Playfair Display', serif; box-shadow: 0 3px 12px rgba(255,213,79,0.25); animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes popIn { from{opacity:0;transform:scale(0.4) rotate(-20deg);}to{opacity:1;transform:scale(1) rotate(0);} }
        .draw-prizes { display: flex; flex-direction: column; gap: 8px; }
        .prize-tier { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; font-size: 14px; color: rgba(255,255,255,0.6); }
        .prize-amt { font-weight: 700; color: #ffd54f; font-family: 'Playfair Display', serif; font-size: 16px; }
        .jackpot-carry { background: rgba(255,100,50,0.08); border: 1px solid rgba(255,100,50,0.2); border-radius: 12px; padding: 12px 16px; font-size: 13px; color: rgba(255,140,80,0.8); }

        .spinner, .spinner-green { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        .spinner-green { border-top-color: #4caf50; border-color: rgba(76,175,80,0.2); }
        @keyframes spin { to{transform:rotate(360deg);} }
        .toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 22px; border-radius: 14px; font-size: 14px; font-weight: 500; z-index: 999; animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both; backdrop-filter: blur(12px); }
        .toast-success { background: rgba(76,175,80,0.18); border: 1px solid rgba(76,175,80,0.35); color: #a5d6a7; }
        .toast-error { background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.28); color: #ff8080; }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
      `}</style>
    </div>
  );
}
