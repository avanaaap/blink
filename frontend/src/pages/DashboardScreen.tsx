import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

const MOCK_MATCH = {
  compatibility: 87,
  sharedInterests: ["Music", "Travel", "Coffee"],
  conversationStyle: "Deep & Thoughtful",
};

const STAGES = [
  { key: "chat", label: "Chat", icon: "💬", desc: "Text conversation", path: "/chat?stage=chat" },
  { key: "voice", label: "Voice Call", icon: "📞", desc: "Audio conversation", path: "/voice-call" },
  { key: "video", label: "Video Call", icon: "📹", desc: "Face-to-face", path: "/video-call" },
];

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
          Connect through conversation to reveal their profile
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

        <button className="btn btn-primary" onClick={() => navigate("/chat?stage=chat")}>
          Start Conversation
        </button>
      </div>

      {/* Connection stages */}
      <div className="card">
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 16,
          }}
        >
          Connection Journey
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => navigate(s.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                border: "1.5px solid var(--color-border-light)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--color-bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {i + 1}. {s.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{s.desc}</div>
              </div>
              <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>→</span>
            </button>
          ))}
        </div>
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
            0 / 80
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: "0%" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
          Complete Chat → Voice → Video to unlock profile reveal
        </p>
      </div>
    </div>
  );
}
