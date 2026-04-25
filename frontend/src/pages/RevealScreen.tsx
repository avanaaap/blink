import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_PROFILE = {
  name: "Alex",
  age: 25,
  bio: "Music lover, coffee enthusiast, and always planning the next adventure. I believe the best connections start with genuine conversations.",
  interests: ["Music", "Travel", "Coffee", "Photography", "Nature"],
  location: "Los Angeles, CA",
  conversationStyle: "Deep & Thoughtful",
};

export default function RevealScreen() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  if (!showProfile) {
    return (
      <div className="screen" style={{ justifyContent: "center", gap: 24 }}>
        <div style={{ fontSize: 72, lineHeight: 1 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>
          Congratulations!
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            textAlign: "center",
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 300,
          }}
        >
          You&apos;ve built a genuine connection through meaningful conversations. It&apos;s
          time to see who you&apos;ve been talking to!
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {["✨", "💫", "🌟", "⭐", "✨"].map((emoji, i) => (
            <span
              key={i}
              style={{
                fontSize: 24,
                animation: `float 2s ease-in-out ${i * 0.2}s infinite`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowProfile(true)}
          style={{ marginTop: 16 }}
        >
          Reveal Profile
        </button>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="screen" style={{ gap: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>Your Match</h2>

      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        {/* Avatar */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 40,
            color: "#FFFFFF",
            fontWeight: 700,
          }}
        >
          {MOCK_PROFILE.name[0]}
        </div>

        <h3 style={{ fontSize: 24, fontWeight: 700 }}>
          {MOCK_PROFILE.name}, {MOCK_PROFILE.age}
        </h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
          📍 {MOCK_PROFILE.location}
        </p>

        <p
          style={{
            color: "var(--color-text)",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {MOCK_PROFILE.bio}
        </p>

        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            Interests
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {MOCK_PROFILE.interests.map((interest) => (
              <span key={interest} className="chip" style={{ cursor: "default", fontSize: 13 }}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <span className="badge badge-accent">{MOCK_PROFILE.conversationStyle}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <button className="btn btn-primary" onClick={() => navigate("/chat")}>
          Continue Chatting
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
