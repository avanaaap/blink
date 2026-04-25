import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

export default function DashboardScreen() {
  const navigate = useNavigate();

  return (
    <div className="screen" style={{ gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <BlinkLogo size={40} />
        <div style={{ display: "flex", gap: 16 }}>
          <button
            className="btn-ghost"
            onClick={() => navigate("/preferences")}
            style={{ fontSize: 20 }}
          >
            ⚙
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigate("/")}
            style={{ fontSize: 20 }}
          >
            ⇥
          </button>
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>Today&apos;s Match</h1>
      <p style={{ color: "#888", fontSize: 15, textAlign: "center", marginTop: -8 }}>
        Your blind date awaits
      </p>

      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "#e8e8e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 40,
            color: "#999",
          }}
        >
          ?
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Match for today: Alex</h3>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>
          Profile hidden until rating threshold
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {["Travel", "Music", "Cooking"].map((interest) => (
            <span
              key={interest}
              style={{
                padding: "6px 16px",
                border: "1px solid #ddd",
                borderRadius: 20,
                fontSize: 13,
              }}
            >
              {interest}
            </span>
          ))}
        </div>

        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: "#666" }}>Compatibility</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>85%</span>
          </div>
          <div style={{ width: "100%", height: 8, background: "#e8e8e8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: "85%", height: "100%", background: "var(--color-primary)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
        This text chat will last for 60 minutes.
      </p>

      <button
        className="btn btn-primary"
        onClick={() => navigate("/chat")}
        style={{ width: "100%" }}
      >
        Start Conversation
      </button>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          width: "100%",
          padding: "14px 0",
          border: "1.5px solid #ddd",
          borderRadius: 12,
          background: "#fff",
          fontSize: 16,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Keep Exploring
      </button>
    </div>
  );
}
