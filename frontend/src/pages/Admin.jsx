import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [draw, setDraw] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingDraw, setCreatingDraw] = useState(false);
  const [publishingDraw, setPublishingDraw] = useState(false);
  const [verifying, setVerifying] = useState({});
  const [toast, setToast] = useState(null);

  // ✅ ADDED (timer state)
  const [timeLeft, setTimeLeft] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load users.", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const createDraw = async () => {
    setCreatingDraw(true);

    try {
      const res = await API.post("/admin/draw");
      setDraw(res.data);
      showToast("Draw created! Review results before publishing.");
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to create draw.",
        "error"
      );
    } finally {
      setCreatingDraw(false);
    }
  };
  const publishDraw = async () => {
    if (!draw?._id) return;
    setPublishingDraw(true);
    try {
      await API.put(`/admin/draw/${draw._id}/publish`);
      setDraw((prev) => ({ ...prev, isPublished: true }));
      showToast("Draw published! Users can now see results.");
    } catch { showToast("Failed to publish draw.", "error"); }
    finally { setPublishingDraw(false); }
  };

  const verifyWinner = async (userId, winId, status) => {
    const key = `${userId}-${winId}`;
    setVerifying((prev) => ({ ...prev, [key]: true }));
    try {
      await API.put(`/admin/verify/${userId}/${winId}`, { status });
      showToast(`Winner ${status === "approved" ? "approved ✓" : "rejected ✕"}`, status === "approved" ? "success" : "error");
      fetchUsers();
    } catch { showToast("Verification failed.", "error"); }
    finally { setVerifying((prev) => ({ ...prev, [key]: false })); }
  };

  useEffect(() => {
    fetchUsers();

    // 🔥 LOAD EXISTING DRAW
    API.get("/admin/latest-draw")
      .then((res) => {
        if (res.data) {
          setDraw(res.data);
        }
      })
      .catch((err) => {
        console.log("Draw fetch error", err);
      });
  }, []);

  // ✅ ADDED (timer logic)
  useEffect(() => {
    if (!draw?.drawDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(draw.drawDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Draw time reached");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [draw]);

  const allWinners = users.flatMap((u) =>
    (u.winnings || []).map((w) => ({ ...w, userEmail: u.email, userId: u._id }))
  ).filter((w) => w.proof);

  const pendingVerifications = allWinners.filter((w) => w.status === "pending");

  return (
    <div className="page">
      <Navbar />
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}

      <div className="page-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Admin Panel</h2>
            <p className="page-sub">Manage draws, users, and winner verification</p>
          </div>
          <div className="header-actions">
            <button className="btn-draw" onClick={createDraw} disabled={creatingDraw}>
              {creatingDraw ? <><span className="spinner" /> Generating...</> : "🎲 Create Draw"}
            </button>
            {draw && !draw.isPublished && (
              <button className="btn-publish" onClick={publishDraw} disabled={publishingDraw}>
                {publishingDraw ? <><span className="spinner" /> Publishing...</> : "📢 Publish Draw"}
              </button>
            )}
          </div>
        </div>

        {/* Draw Result */}
        {draw && (
          <div className="draw-result">
            <div className="draw-top">
              <h3 className="section-title">Draw Results</h3>

              {/* ✅ ADDED TIMER UI */}
              <div style={{ color: "#ffd54f", fontSize: "13px" }}>
                ⏳ Next Draw In: {timeLeft || "Loading..."}
              </div>

              <span className={`draw-status ${draw.isPublished ? "published" : "draft"}`}>
                {draw.isPublished ? "✓ Published" : "⏸ Draft — Not Published Yet"}
              </span>
            </div>

            <div className="draw-numbers-row">
              <p className="draw-label">🎯 Draw Numbers</p>
              <div className="draw-balls">
                {draw.numbers?.map((n, i) => (
                  <div className="draw-ball" key={i} style={{ animationDelay: `${i * 0.1}s` }}>{n}</div>
                ))}
              </div>
            </div>

            <div className="draw-stats">
              <div className="draw-stat">
                <span className="ds-label">Prize Pool</span>
                <span className="ds-value">₹{(draw.prizePool || 0).toFixed(0)}</span>
              </div>
              <div className="draw-stat">
                <span className="ds-label">Jackpot (5-match)</span>
                <span className="ds-value gold">₹{(draw.prizes?.tier5 || 0).toFixed(0)}</span>
              </div>
              <div className="draw-stat">
                <span className="ds-label">4-match</span>
                <span className="ds-value">₹{(draw.prizes?.tier4 || 0).toFixed(0)}</span>
              </div>
              <div className="draw-stat">
                <span className="ds-label">3-match</span>
                <span className="ds-value">₹{(draw.prizes?.tier3 || 0).toFixed(0)}</span>
              </div>
              {draw.jackpotCarry > 0 && (
                <div className="draw-stat">
                  <span className="ds-label">Jackpot Carry</span>
                  <span className="ds-value orange">₹{draw.jackpotCarry.toFixed(0)}</span>
                </div>
              )}
            </div>

            {/* Winners by tier */}
            {["tier5", "tier4", "tier3"].map((tier) => {
              const tierWinners = draw.winners?.[tier] || [];
              if (tierWinners.length === 0) return null;
              const icons = { tier5: "🥇", tier4: "🥈", tier3: "🥉" };
              const labels = { tier5: "Jackpot Winners (5-match)", tier4: "4-Match Winners", tier3: "3-Match Winners" };
              return (
                <div className="tier-winners" key={tier}>
                  <p className="tier-label">{icons[tier]} {labels[tier]}</p>
                  <div className="winners-list">
                    {tierWinners.map((w, i) => (
                      <div className="winner-row" key={i}>
                        <span className="winner-email">{w.user?.email || w.user?.toString?.().slice(-6) || `User #${i + 1}`}</span>
                        <span className="winner-matches">{w.matches} matches</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {draw.winners?.tier3?.length === 0 && draw.winners?.tier4?.length === 0 && draw.winners?.tier5?.length === 0 && (
              <div className="no-winners">😔 No winners this round.</div>
            )}
          </div>
        )}

        {/* Pending Verifications */}
        {pendingVerifications.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Pending Verifications</h3>
                <p className="card-desc">{pendingVerifications.length} winner{pendingVerifications.length !== 1 ? "s" : ""} awaiting proof review</p>
              </div>
              <span className="pending-badge">{pendingVerifications.length}</span>
            </div>

            <div className="verif-list">
              {pendingVerifications.map((w, i) => {
                const key = `${w.userId}-${w._id}`;
                const tier = { tier5: "🥇 5-match", tier4: "🥈 4-match", tier3: "🥉 3-match" }[w.tier] || w.tier;
                return (
                  <div className="verif-card" key={i}>
                    <div className="verif-top">
                      <div>
                        <p className="verif-email">{w.userEmail}</p>
                        <p className="verif-meta">{tier} · ₹{(w.amount || 0).toFixed(0)}</p>
                      </div>
                      <a href={w.proof} target="_blank" rel="noreferrer" className="view-proof">
                        View Proof ↗
                      </a>
                    </div>
                    <div className="verif-actions">
                      <button
                        className="btn-approve"
                        onClick={() => verifyWinner(w.userId, w._id, "approved")}
                        disabled={verifying[key]}
                      >
                        {verifying[key] ? <span className="spinner" /> : "✓ Approve"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => verifyWinner(w.userId, w._id, "rejected")}
                        disabled={verifying[key]}
                      >
                        {verifying[key] ? <span className="spinner" /> : "✕ Reject"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Registered Users</h3>
              <p className="card-desc">{users.length} participant{users.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="users-summary">
              <span className="summary-pill active-pill">
                {users.filter(u => u.subscriptionStatus === "active").length} active
              </span>
              <span className="summary-pill inactive-pill">
                {users.filter(u => u.subscriptionStatus !== "active").length} inactive
              </span>
            </div>
          </div>

          {loadingUsers ? (
            <div className="loading-row"><span className="spinner-green" /><span>Loading users...</span></div>
          ) : users.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">👥</span><p>No users registered yet.</p></div>
          ) : (
            <div className="users-table">
              <div className="table-head">
                <span>#</span><span>Email</span><span>Status</span><span>Charity</span><span>Scores</span><span>Winnings</span>
              </div>
              {users.map((u, i) => (
                <div className="table-row" key={u._id || i} style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="row-num">{i + 1}</span>
                  <span className="row-email">{u.email}</span>
                  <span>
                    <span className={`sub-pill ${u.subscriptionStatus === "active" ? "sp-active" : "sp-inactive"}`}>
                      {u.subscriptionStatus || "inactive"}
                    </span>
                  </span>
                  <span className="row-charity">
                    {u.charity ? <span className="charity-tag">{u.charity}</span> : <span className="no-val">—</span>}
                  </span>
                  <span className="row-scores">{u.scores?.length ?? 0}/5</span>
                  <span className="row-winnings">{u.winnings?.length ?? 0} wins</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page { min-height: 100vh; background: #0a0f0a; font-family: 'DM Sans', sans-serif; color: #f0faf0; }
        .page-content { max-width: 1060px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 26px; }

        .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .page-sub { color: rgba(255,255,255,0.4); margin-top: 6px; font-size: 15px; }
        .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn-draw { background: linear-gradient(135deg, #ffd54f, #f9a825); border: none; border-radius: 12px; padding: 13px 24px; color: #1a1200; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-draw:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,213,79,0.4); }
        .btn-draw:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-publish { background: linear-gradient(135deg, #4caf50, #2d8a32); border: none; border-radius: 12px; padding: 13px 24px; color: #fff; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-publish:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(76,175,80,0.4); }
        .btn-publish:disabled { opacity: 0.6; cursor: not-allowed; }

        .draw-result { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,213,79,0.2); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 22px; animation: fadeIn 0.5s ease both; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }

        .draw-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #f0faf0; }
        .draw-status { font-size: 12px; padding: 5px 14px; border-radius: 20px; font-weight: 600; letter-spacing: 0.3px; }
        .draft { background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.25); color: #ffd54f; }
        .published { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.25); color: #81c784; }

        .draw-label { font-size: 12px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 12px; }
        .draw-balls { display: flex; gap: 10px; flex-wrap: wrap; }
        .draw-ball { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #ffd54f, #f9a825); color: #1a1200; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 800; font-family: 'Playfair Display', serif; box-shadow: 0 3px 14px rgba(255,213,79,0.3); animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes popIn { from{opacity:0;transform:scale(0.4) rotate(-20deg);}to{opacity:1;transform:scale(1) rotate(0);} }

        .draw-stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .draw-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 12px 18px; min-width: 120px; }
        .ds-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
        .ds-value { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #f0faf0; }
        .ds-value.gold { color: #ffd54f; }
        .ds-value.orange { color: #ff8a65; }

        .tier-winners { display: flex; flex-direction: column; gap: 8px; }
        .tier-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .winners-list { display: flex; flex-direction: column; gap: 6px; }
        .winner-row { display: flex; align-items: center; justify-content: space-between; background: rgba(76,175,80,0.06); border: 1px solid rgba(76,175,80,0.15); border-radius: 10px; padding: 10px 14px; }
        .winner-email { font-size: 14px; color: #f0faf0; }
        .winner-matches { font-size: 12px; color: rgba(255,255,255,0.35); }
        .no-winners { color: rgba(255,255,255,0.3); font-size: 14px; text-align: center; padding: 12px 0; }

        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 20px; }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #f0faf0; font-weight: 600; }
        .card-desc { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 4px; }

        .pending-badge { background: rgba(255,193,7,0.15); border: 1px solid rgba(255,193,7,0.3); border-radius: 20px; padding: 4px 14px; font-size: 14px; font-weight: 700; color: #ffd54f; }

        .verif-list { display: flex; flex-direction: column; gap: 12px; }
        .verif-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
        .verif-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .verif-email { font-size: 15px; font-weight: 500; color: #f0faf0; }
        .verif-meta { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .view-proof { font-size: 13px; color: #6ccf6c; text-decoration: none; white-space: nowrap; }
        .view-proof:hover { color: #88e888; }
        .verif-actions { display: flex; gap: 10px; }

        .btn-approve { background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.3); border-radius: 10px; padding: 9px 20px; color: #81c784; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-approve:hover:not(:disabled) { background: rgba(76,175,80,0.2); }

        .btn-reject { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.25); border-radius: 10px; padding: 9px 20px; color: #ff8080; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .btn-reject:hover:not(:disabled) { background: rgba(255,80,80,0.15); }
        .btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

        .users-summary { display: flex; gap: 8px; }
        .summary-pill { font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
        .active-pill { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.25); color: #81c784; }
        .inactive-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); }

        .users-table { display: flex; flex-direction: column; gap: 6px; }
        .table-head { display: grid; grid-template-columns: 36px 1fr 100px 140px 60px 80px; padding: 8px 14px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.8px; }
        .table-row { display: grid; grid-template-columns: 36px 1fr 100px 140px 60px 80px; align-items: center; padding: 13px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.2s; animation: fadeIn 0.3s ease both; }
        .table-row:hover { background: rgba(76,175,80,0.05); border-color: rgba(76,175,80,0.12); }
        .row-num { font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 600; }
        .row-email { font-size: 13px; color: #f0faf0; }
        .sub-pill { font-size: 11px; padding: 3px 10px; border-radius: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
        .sp-active { background: rgba(76,175,80,0.12); color: #81c784; }
        .sp-inactive { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
        .charity-tag { background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.2); border-radius: 20px; padding: 2px 9px; font-size: 11px; color: #81c784; }
        .no-val { color: rgba(255,255,255,0.2); }
        .row-scores, .row-winnings { font-size: 13px; color: rgba(255,255,255,0.45); }

        .loading-row { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.35); font-size: 14px; padding: 20px 0; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 0; color: rgba(255,255,255,0.3); font-size: 14px; }
        .empty-icon { font-size: 30px; }

        .spinner, .spinner-green { width: 17px; height: 17px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        .spinner-green { border-top-color: #4caf50; border-color: rgba(76,175,80,0.2); }
        @keyframes spin { to{transform:rotate(360deg);} }

        .toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 22px; border-radius: 14px; font-size: 14px; font-weight: 500; z-index: 999; animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) both; backdrop-filter: blur(12px); }
        .toast-success { background: rgba(76,175,80,0.18); border: 1px solid rgba(76,175,80,0.35); color: #a5d6a7; }
        .toast-error { background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.28); color: #ff8080; }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }

        @media (max-width: 700px) {
          .table-head, .table-row { grid-template-columns: 30px 1fr 90px; }
          .row-charity, .row-scores, .row-winnings, .table-head span:nth-child(4), .table-head span:nth-child(5), .table-head span:nth-child(6) { display: none; }
        }
      `}</style>
    </div>
  );
}
