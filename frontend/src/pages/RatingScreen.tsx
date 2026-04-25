import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RatingScreen() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentPoints = 45;
  const earnedPoints = rating * 5;
  const newTotal = currentPoints + earnedPoints;
  const threshold = 80;
  const reachedThreshold = newTotal >= threshold;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      if (reachedThreshold) {
        navigate("/reveal");
      } else {
        navigate("/dashboard");
      }
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="screen" style={{ justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>{reachedThreshold ? "🎉" : "✨"}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>
          {reachedThreshold ? "Threshold Reached!" : "Rating Submitted!"}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", textAlign: "center" }}>
          {reachedThreshold
            ? "You've earned enough points to reveal your match's profile!"
            : `You earned ${earnedPoints} points. ${threshold - newTotal} more to go!`}
        </p>
        <div className="progress-bar-container" style={{ marginTop: 16 }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min((newTotal / threshold) * 100, 100)}%` }}
          />
        </div>
        <p style={{ fontSize: 14, color: "var(--color-accent)", fontWeight: 600 }}>
          {newTotal} / {threshold} points
        </p>
      </div>
    );
  }

  return (
    <div className="screen" style={{ justifyContent: "center", gap: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Rate Your Conversation</h2>
      <p style={{ color: "var(--color-text-secondary)", textAlign: "center" }}>
        How was your experience chatting with your match?
      </p>

      {/* Stars */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
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
              fontSize: 40,
              color:
                star <= (hoveredStar || rating)
                  ? "var(--color-star)"
                  : "var(--color-star-empty)",
              transition: "transform 0.15s",
              transform: star <= (hoveredStar || rating) ? "scale(1.15)" : "scale(1)",
            }}
          >
            ★
          </button>
        ))}
      </div>

      {rating > 0 && (
        <p style={{ fontSize: 14, color: "var(--color-accent)", fontWeight: 600 }}>
          +{earnedPoints} points
        </p>
      )}

      {/* Feedback */}
      <div className="input-group" style={{ marginTop: 8 }}>
        <label htmlFor="feedback">Feedback (optional)</label>
        <textarea
          id="feedback"
          className="input-field"
          placeholder="Tell us more about your conversation..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          style={{ resize: "none" }}
        />
      </div>

      {/* Progress preview */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--color-text-secondary)" }}>Progress to Reveal</span>
          <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
            {newTotal} / {threshold}
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min((newTotal / threshold) * 100, 100)}%` }}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={rating === 0}
        style={{ opacity: rating > 0 ? 1 : 0.5 }}
      >
        Submit Rating
      </button>

      <button className="btn-ghost" onClick={() => navigate("/dashboard")}>
        Skip
      </button>
    </div>
  );
}
