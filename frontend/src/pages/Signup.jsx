import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/signup", { email, password });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="bg-circle c1" />
        <div className="bg-circle c2" />
        <div className="bg-circle c3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">⛳</div>
          <h1 className="logo-text">GolfCharity</h1>
          <p className="logo-sub">Join the Community</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/">Sign in →</Link>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0f0a;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .auth-bg { position: absolute; inset: 0; pointer-events: none; }

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
        }

        .c1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #2d6a2d, transparent);
          top: -100px; right: -100px;
          animation: float1 8s ease-in-out infinite;
        }

        .c2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #1a4a1a, transparent);
          bottom: -80px; left: -80px;
          animation: float2 10s ease-in-out infinite;
        }

        .c3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #4a9a4a, transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: float1 12s ease-in-out infinite reverse;
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }

        .auth-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 48px 44px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-logo { text-align: center; margin-bottom: 36px; }

        .logo-icon {
          font-size: 42px;
          margin-bottom: 10px;
          filter: drop-shadow(0 0 20px rgba(80,200,80,0.5));
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(80,200,80,0.5)); }
          50% { filter: drop-shadow(0 0 36px rgba(80,200,80,0.9)); }
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #f0faf0;
          letter-spacing: -0.5px;
        }

        .logo-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .auth-form { display: flex; flex-direction: column; gap: 20px; }

        .form-group { display: flex; flex-direction: column; gap: 8px; }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .form-group input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 18px;
          color: #f0faf0;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
        }

        .form-group input::placeholder { color: rgba(255,255,255,0.2); }

        .form-group input:focus {
          border-color: #4caf50;
          background: rgba(76,175,80,0.08);
          box-shadow: 0 0 0 4px rgba(76,175,80,0.12);
        }

        .auth-error {
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.25);
          border-radius: 10px;
          padding: 12px 16px;
          color: #ff8080;
          font-size: 13px;
          text-align: center;
        }

        .auth-success {
          background: rgba(76,175,80,0.12);
          border: 1px solid rgba(76,175,80,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          color: #6ccf6c;
          font-size: 13px;
          text-align: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4caf50, #2d8a32);
          border: none;
          border-radius: 12px;
          padding: 16px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 52px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(76,175,80,0.4);
        }

        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-link {
          text-align: center;
          margin-top: 24px;
          color: rgba(255,255,255,0.35);
          font-size: 14px;
        }

        .auth-link a {
          color: #6ccf6c;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .auth-link a:hover { color: #88e888; }
      `}</style>
    </div>
  );
}
