import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: order } = await API.post("/payment/create-order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "GolfCharity",
        description: "Monthly Subscription — ₹100",
        order_id: order.id,
        handler: async (response) => {
          try {
            await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate("/dashboard");
          } catch {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#4caf50" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to initiate payment.");
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bg-orbs">
        <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
      </div>

      <div className="content">
        <div className="back-link" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </div>

        <div className="hero">
          <div className="hero-icon">⛳</div>
          <h1 className="hero-title">Join GolfCharity</h1>
          <p className="hero-sub">Subscribe to enter monthly draws and support your charity</p>
        </div>

        <div className="cards-row">
          <div className="plan-card featured">
            <div className="plan-badge">Monthly</div>
            <div className="plan-price">
              <span className="currency">₹</span>
              <span className="amount">100</span>
              <span className="period">/month</span>
            </div>
            <ul className="plan-features">
              <li><span className="check">✓</span> Enter all monthly draws</li>
              <li><span className="check">✓</span> Track up to 5 golf scores</li>
              <li><span className="check">✓</span> 10% goes to your charity</li>
              <li><span className="check">✓</span> Win up to ₹{(100 * 0.4).toFixed(0)}+ per draw</li>
              <li><span className="check">✓</span> 3-tier prize system</li>
            </ul>
            {error && <div className="pay-error">{error}</div>}
            <button className="btn-pay" onClick={handlePayment} disabled={loading}>
              {loading ? <span className="spinner" /> : "Subscribe Now — ₹100"}
            </button>
            <p className="pay-note">Secured by Razorpay · Cancel anytime</p>
          </div>

          <div className="info-card">
            <h3 className="info-title">How it works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div>
                  <p className="step-title">Subscribe</p>
                  <p className="step-desc">Pay ₹100/month to activate your account</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div>
                  <p className="step-title">Enter Scores</p>
                  <p className="step-desc">Add your last 5 golf scores (1–45 Stableford)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div>
                  <p className="step-title">Monthly Draw</p>
                  <p className="step-desc">5 numbers drawn — match 3, 4, or 5 to win</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">4</div>
                <div>
                  <p className="step-title">Give Back</p>
                  <p className="step-desc">10% of your subscription goes to your chosen charity</p>
                </div>
              </div>
            </div>

            <div className="prize-table">
              <h4 className="prize-title">Prize Breakdown</h4>
              <div className="prize-row header">
                <span>Match</span><span>Pool Share</span><span>Rollover</span>
              </div>
              <div className="prize-row">
                <span>🥇 5 Numbers</span><span>40%</span><span>Yes (Jackpot)</span>
              </div>
              <div className="prize-row">
                <span>🥈 4 Numbers</span><span>35%</span><span>No</span>
              </div>
              <div className="prize-row">
                <span>🥉 3 Numbers</span><span>25%</span><span>No</span>
              </div>
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
          position: relative;
          overflow-x: hidden;
        }

        .bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; }
        .o1 { width: 500px; height: 500px; background: radial-gradient(circle, #2d6a2d, transparent); top: -100px; left: -100px; animation: f1 8s ease-in-out infinite; }
        .o2 { width: 400px; height: 400px; background: radial-gradient(circle, #1a4a1a, transparent); bottom: -80px; right: -80px; animation: f2 10s ease-in-out infinite; }
        .o3 { width: 300px; height: 300px; background: radial-gradient(circle, #ffd54f, transparent); top: 40%; right: 20%; animation: f1 12s ease-in-out infinite reverse; opacity: 0.1; }
        @keyframes f1 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        @keyframes f2 { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(20px) scale(0.95); } }

        .content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .back-link {
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 40px;
          display: inline-block;
          transition: color 0.2s;
        }
        .back-link:hover { color: #6ccf6c; }

        .hero { text-align: center; margin-bottom: 48px; }
        .hero-icon { font-size: 48px; margin-bottom: 12px; filter: drop-shadow(0 0 24px rgba(80,200,80,0.6)); }
        .hero-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: #f0faf0; letter-spacing: -0.5px; }
        .hero-sub { color: rgba(255,255,255,0.4); margin-top: 10px; font-size: 16px; }

        .cards-row {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 720px) { .cards-row { grid-template-columns: 1fr; } }

        .plan-card {
          background: rgba(76,175,80,0.06);
          border: 1px solid rgba(76,175,80,0.25);
          border-radius: 24px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

        .plan-badge {
          display: inline-block;
          background: rgba(76,175,80,0.15);
          border: 1px solid rgba(76,175,80,0.3);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #81c784;
          text-transform: uppercase;
          letter-spacing: 1px;
          width: fit-content;
        }

        .plan-price {
          display: flex;
          align-items: flex-start;
          gap: 4px;
        }
        .currency { font-size: 22px; color: #4caf50; margin-top: 8px; }
        .amount { font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 700; color: #f0faf0; line-height: 1; }
        .period { font-size: 16px; color: rgba(255,255,255,0.35); margin-top: 16px; }

        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .plan-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,0.7); }
        .check { color: #4caf50; font-weight: 700; font-size: 16px; }

        .pay-error {
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.25);
          border-radius: 10px;
          padding: 12px 16px;
          color: #ff8080;
          font-size: 13px;
          text-align: center;
        }

        .btn-pay {
          background: linear-gradient(135deg, #4caf50, #2d8a32);
          border: none;
          border-radius: 14px;
          padding: 18px;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 58px;
        }
        .btn-pay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(76,175,80,0.4); }
        .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }

        .pay-note { font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; }

        .info-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          animation: slideUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .info-title { font-family: 'Playfair Display', serif; font-size: 22px; color: #f0faf0; }

        .steps { display: flex; flex-direction: column; gap: 16px; }
        .step { display: flex; align-items: flex-start; gap: 16px; }
        .step-num {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(76,175,80,0.15);
          border: 1px solid rgba(76,175,80,0.3);
          color: #4caf50;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0;
        }
        .step-title { font-size: 14px; font-weight: 600; color: #f0faf0; }
        .step-desc { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 2px; }

        .prize-table { display: flex; flex-direction: column; gap: 0; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
        .prize-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .prize-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 12px 16px; font-size: 13px; gap: 8px; }
        .prize-row.header { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.35); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .prize-row:not(.header) { color: rgba(255,255,255,0.65); border-top: 1px solid rgba(255,255,255,0.05); }
        .prize-row:not(.header):hover { background: rgba(76,175,80,0.05); }

        .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
