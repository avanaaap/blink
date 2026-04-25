import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const STAGE_CONFIG = {
  chat: { label: "Chat", icon: "💬", next: "/voice-call", pointsPer: 5 },
  voice: { label: "Voice Call", icon: "📞", next: "/video-call", pointsPer: 6 },
  video: { label: "Video Call", icon: "📹", next: "/reveal", pointsPer: 8 },
};

export default function RatingScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stage = (searchParams.get("stage") || "chat") as keyof typeof STAGE_CONFIG;
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.chat;

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const basePoints = stage === "chat" ? 20 : stage === "voice" ? 40 : 60;
  const earnedPoints = rating * config.pointsPer;
  const newTotal = basePoints + earnedPoints;
  const threshold = 80;
  const isLastStage = stage === "video";
  const reachedThreshold = isLastStage && newTotal >= threshold;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      if (reachedThreshold) {
        navigate("/reveal");
      } else {
        navigate(config.next);
      }
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="screen" style={{ justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>
          {reachedThreshold ? "🎉" : "✨"}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>
          {reachedThreshold ? "Threshold Reached!" : "Rating Submitted!"}
        </h2>
        <p style={{ color: "var(--color-text-secondary)", textAlign: "center", maxWidth: 300 }}>
          {reachedThreshold
            ? "You've earned enough points to reveal your match's profile!"
            : stage === "chat"
              ? `Great chat! +${earnedPoints} points. Next up: Voice Call 📞`
              : stage === "voice"
                ? `Awesome call! +${earnedPoints} points. Next up: Video Call 📹`
                : `+${earnedPoints} points. Total: ${newTotal}/${threshold}`}
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
      {/* Stage indicator */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {(["chat", "voice", "video"] as const).map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                background:
                  s === stage
                    ? "var(--color-primary)"
                    : (["chat", "voice", "video"] as const).indexOf(s) < (["chat", "voice", "video"] as const).indexOf(stage)
                      ? "var(--color-accent)"
                      : "var(--color-border-light)",
                color:
                  s === stage || (["chat", "voice", "video"] as const).indexOf(s) < (["chat", "voice", "video"] as const).indexOf(stage)
                    ? "#FFF"
                    : "var(--color-text-muted)",
              }}
            >
              {STAGE_CONFIG[s].icon}
            </div>
            {i < 2 && (
              <div
                style={{
                  width: 24,
                  height: 2,
                  background:
                    (["chat", "voice", "video"] as const).indexOf(s) < (["chat", "voice", "video"] as const).indexOf(stage)
                      ? "var(--color-accent)"
                      : "var(--color-border-light)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 700 }}>
        Rate Your {config.label}
      </h2>
      <p style={{ color: "var(--color-text-secondary)", textAlign: "center" }}>
        How was your {config.label.toLowerCase()} experience?
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
          placeholder={`Tell us about your ${config.label.toLowerCase()} experience...`}
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

      <button className="btn-ghost" onClick={() => navigate(config.next)}>
        Skip
      </button>
    </div>
  );
}
