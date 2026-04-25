import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VoiceCallScreen() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);

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
    navigate("/video-call");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "#333",
        color: "#fff",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "#555",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          marginBottom: 20,
        }}
      >
        📞
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Voice Call</h1>
      <p style={{ color: "#aaa", fontSize: 16, marginBottom: 24 }}>Connected</p>
      <p style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 600, marginBottom: 60 }}>
        {formatTime(seconds)}
      </p>

      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <button
          onClick={() => setMuted(!muted)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: muted ? "#888" : "#555",
            color: "#fff",
            fontSize: 22,
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
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "#e53935",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📞
        </button>
      </div>

      <p style={{ color: "#999", fontSize: 14, position: "absolute", bottom: 32 }}>
        Complete this call to unlock video calling
      </p>
    </div>
  );
}
