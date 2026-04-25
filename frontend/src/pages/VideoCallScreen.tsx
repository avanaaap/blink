import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VideoCallScreen() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    navigate("/reveal");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "#1a1a1a",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Timer badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(0,0,0,0.7)",
          padding: "6px 12px",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: 600,
          zIndex: 10,
        }}
      >
        {formatTime(seconds)}
      </div>

      {/* Self PIP (top-right) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 100,
          height: 130,
          background: "#333",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 28, color: "#888" }}>📷</span>
      </div>

      {/* Main video area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 48, color: "#666", marginBottom: 12 }}>📷</span>
        <p style={{ color: "#888", fontSize: 16 }}>Video feed would appear here</p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          padding: "20px 0 12px",
        }}
      >
        <button
          onClick={() => setMuted(!muted)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: muted ? "#888" : "#555",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🎤
        </button>
        <button
          onClick={handleEndCall}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: "#e53935",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📞
        </button>
        <button
          onClick={() => setCameraOn(!cameraOn)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: cameraOn ? "#555" : "#888",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📹
        </button>
      </div>

      <p style={{ color: "#888", fontSize: 14, textAlign: "center", padding: "8px 0 24px" }}>
        Complete this call to reveal your match&apos;s profile
      </p>
    </div>
  );
}
