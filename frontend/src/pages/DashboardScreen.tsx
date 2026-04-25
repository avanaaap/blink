import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

const MOCK_MATCH = {
  compatibility: 87,
  sharedInterests: ["Music", "Travel", "Coffee"],
  conversationStyle: "Deep & Thoughtful",
  matchTime: "2:00 PM",
};

export default function DashboardScreen() {
  const navigate = useNavigate();

  return (
    <div className="screen" style={{ gap: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: 8,
        }}
      >
        <BlinkLogo size={40} />
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Today&apos;s Match</h2>
        <button
          className="btn-ghost"
          onClick={() => navigate("/")}
          style={{ fontSize: 20 }}
        >
          ⚙
        </button>
      </div>

      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--color-bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 36,
          }}
        >
          ?
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Mystery Match</h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20 }}>
          Chat to discover who they are
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
          <span className="badge badge-accent">{MOCK_MATCH.compatibility}% Match</span>
          <span className="badge">{MOCK_MATCH.conversationStyle}</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Shared Interests
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {MOCK_MATCH.sharedInterests.map((interest) => (
              <span key={interest} className="chip" style={{ cursor: "default", fontSize: 13 }}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/chat")}>
          Start Conversation
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          width: "100%",
        }}
      >
        <button className="btn-ghost">⏸ Pause Matching</button>
        <button className="btn-ghost">⏭ Skip Match</button>
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Reveal Progress</span>
          <span style={{ fontSize: 14, color: "var(--color-accent)", fontWeight: 600 }}>
            45 / 80
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: "56%" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
          35 more points to unlock profile reveal
        </p>
      </div>
    </div>
  );
}
