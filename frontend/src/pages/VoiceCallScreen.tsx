import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VoiceCallScreen() {
  const navigate = useNavigate();
  const [callState, setCallState] = useState<"waiting" | "active" | "ended">("waiting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const connectTimer = setTimeout(() => setCallState("active"), 2000);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (callState !== "active") return;
    const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const endCall = () => {
    setCallState("ended");
    setTimeout(() => navigate("/rating?stage=voice"), 1000);
  };

  return (
    <div
      className="screen"
      style={{
        justifyContent: "center",
        gap: 32,
        background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "var(--color-bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          border: callState === "active" ? "3px solid var(--color-accent)" : "3px solid var(--color-border)",
          boxShadow: callState === "active" ? "0 0 0 8px rgba(196, 149, 106, 0.15)" : "none",
          transition: "all 0.3s",
        }}
      >
        ?
      </div>

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mystery Match</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
          {callState === "waiting" && "Connecting..."}
          {callState === "active" && "Voice Call Active"}
          {callState === "ended" && "Call Ended"}
        </p>
      </div>

      {/* Timer */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 36,
          fontWeight: 700,
          color: callState === "active" ? "var(--color-primary)" : "var(--color-text-muted)",
          letterSpacing: 3,
        }}
      >
        {callState === "waiting" ? (
          <span style={{ fontSize: 20, fontFamily: "inherit" }}>🔔 Ringing...</span>
        ) : (
          formatDuration(duration)
        )}
      </div>

      {/* Audio waveform visualization */}
      {callState === "active" && (
        <div style={{ display: "flex", gap: 3, alignItems: "center", height: 40 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                borderRadius: 2,
                background: "var(--color-accent)",
                animation: `wave${i % 5} 1s ease-in-out ${i * 0.05}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 24 }}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: isMuted ? "var(--color-error)" : "var(--color-bg-secondary)",
            color: isMuted ? "#FFF" : "var(--color-text)",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>
        <button
          onClick={() => navigate("/chat?stage=voice")}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "var(--color-bg-secondary)",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          💬
        </button>
        <button
          onClick={endCall}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "var(--color-error)",
            color: "#FFF",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📞
        </button>
      </div>

      <style>{`
        @keyframes wave0 { 0%, 100% { height: 8px; } 50% { height: 24px; } }
        @keyframes wave1 { 0%, 100% { height: 8px; } 50% { height: 32px; } }
        @keyframes wave2 { 0%, 100% { height: 8px; } 50% { height: 20px; } }
        @keyframes wave3 { 0%, 100% { height: 8px; } 50% { height: 36px; } }
        @keyframes wave4 { 0%, 100% { height: 8px; } 50% { height: 28px; } }
      `}</style>
    </div>
  );
}
