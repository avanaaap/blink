import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RatingScreen() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");

  const ratingProgress = 72;

  const handleSubmit = () => {
    if (rating === 0) return;
    navigate("/voice-call");
  };

  return (
    <div className="screen" style={{ justifyContent: "center", gap: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
        How Was Your Conversation?
      </h1>
      <p style={{ color: "#888", fontSize: 15, textAlign: "center" }}>
        Your rating helps us understand your preferences better
      </p>

      <div
        className="card"
        style={{ padding: 24, textAlign: "center", marginTop: 8 }}
      >
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Rate this conversation</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 36,
                color: star <= (hoveredStar || rating) ? "#C4956A" : "#ddd",
                transition: "color 0.15s",
              }}
            >
              ★
            </button>
          ))}
        </div>

        <p style={{ fontWeight: 500, fontSize: 14, textAlign: "left", marginBottom: 8 }}>
          Additional feedback (optional)
        </p>
        <textarea
          placeholder="What did you enjoy? What could be better?"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 12,
            fontSize: 14,
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Rating Progress</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{ratingProgress}/100</span>
        </div>
        <div style={{ width: "100%", height: 10, background: "#e8e8e8", borderRadius: 5, overflow: "hidden" }}>
          <div
            style={{
              width: `${ratingProgress}%`,
              height: "100%",
              background: "linear-gradient(to right, var(--color-primary), #333)",
              borderRadius: 5,
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
          Complete the Video Call to unlock profile photos
        </p>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={rating === 0}
        style={{ width: "100%", opacity: rating > 0 ? 1 : 0.5 }}
      >
        Submit Rating
      </button>
    </div>
  );
}
