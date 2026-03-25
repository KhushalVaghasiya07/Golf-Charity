export default function AnalyticsCards({ data }) {
  const cards = [
    { label: "Total Users",    value: data.totalUsers,              icon: "👥", color: "#81c784", bg: "rgba(76,175,80,0.08)",   border: "rgba(76,175,80,0.2)"   },
    { label: "Active Subs",    value: data.activeUsers,             icon: "✅", color: "#4dd0e1", bg: "rgba(77,208,225,0.08)",  border: "rgba(77,208,225,0.2)"  },
    { label: "Total Revenue",  value: `₹${data.totalRevenue ?? 0}`, icon: "💰", color: "#ffd54f", bg: "rgba(255,213,79,0.08)",  border: "rgba(255,213,79,0.2)"  },
    { label: "Total Payout",   value: `₹${data.totalPayout  ?? 0}`, icon: "🏆", color: "#ff8a65", bg: "rgba(255,138,101,0.08)", border: "rgba(255,138,101,0.2)" },
    { label: "Admin Profit",   value: `₹${data.adminProfit  ?? 0}`, icon: "📈", color: "#ce93d8", bg: "rgba(206,147,216,0.08)", border: "rgba(206,147,216,0.2)" },
    { label: "Charity Total",  value: `₹${data.charityTotal ?? 0}`, icon: "💚", color: "#a5d6a7", bg: "rgba(165,214,167,0.08)", border: "rgba(165,214,167,0.2)" },
  ];

  return (
    <div className="analytics-grid">
      {cards.map((c, i) => (
        <div className="a-card" key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, animationDelay: `${i * 0.07}s` }}>
          <div className="a-icon">{c.icon}</div>
          <div>
            <p className="a-label">{c.label}</p>
            <p className="a-value" style={{ color: c.color }}>{c.value}</p>
          </div>
        </div>
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) { .analytics-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .analytics-grid { grid-template-columns: 1fr; } }

        .a-card {
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
          transition: transform 0.2s;
        }
        .a-card:hover { transform: translateY(-2px); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

        .a-icon { font-size: 28px; flex-shrink: 0; }

        .a-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }

        .a-value {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
