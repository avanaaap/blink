import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VideoCallScreen() {
  const navigate = useNavigate();
  const [callState, setCallState] = useState<"waiting" | "active" | "ended">("waiting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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
    setTimeout(() => navigate("/rating?stage=video"), 1000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "#1A1A1A",
        position: "relative",
      }}
    >
      {/* Remote video (match) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: callState === "active"
            ? "linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)"
            : "#1A1A1A",
        }}
      >
        {callState === "waiting" && (
          <div style={{ textAlign: "center", color: "#FFF" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
            <p style={{ fontSize: 16 }}>Connecting video...</p>
          </div>
        )}
        {callState === "active" && (
          <div style={{ textAlign: "center", color: "#FFF" }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                margin: "0 auto 16px",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              ?
            </div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Mystery Match</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              Video call in progress
            </p>
          </div>
        )}
        {callState === "ended" && (
          <div style={{ textAlign: "center", color: "#FFF" }}>
            <p style={{ fontSize: 18 }}>Call Ended</p>
          </div>
        )}
      </div>

      {/* Self video (small pip) */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 100,
          height: 140,
          borderRadius: 12,
          background: isVideoOff ? "#333" : "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isVideoOff ? 24 : 14,
          color: "#FFF",
          fontWeight: 600,
          border: "2px solid rgba(255,255,255,0.3)",
        }}
      >
        {isVideoOff ? "📷" : "You"}
      </div>

      {/* Duration badge */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.6)",
          color: "#FFF",
          padding: "6px 14px",
          borderRadius: 20,
          fontFamily: "monospace",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {callState === "waiting" ? "..." : formatDuration(duration)}
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          padding: "24px 20px 40px",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: isMuted ? "var(--color-error)" : "rgba(255,255,255,0.15)",
            color: "#FFF",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: isVideoOff ? "var(--color-error)" : "rgba(255,255,255,0.15)",
            color: "#FFF",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isVideoOff ? "📷" : "📹"}
        </button>
        <button
          onClick={() => navigate("/chat?stage=video")}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "#FFF",
            fontSize: 18,
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
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: "var(--color-error)",
            color: "#FFF",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📞
        </button>
      </div>
    </div>
  );
}
