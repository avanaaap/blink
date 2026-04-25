import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GENDER_OPTIONS = ["Women", "Men", "Everyone"];

const INTEREST_OPTIONS = [
  "Music", "Travel", "Cooking", "Fitness", "Reading",
  "Art", "Gaming", "Photography", "Movies", "Nature",
  "Technology", "Yoga", "Dancing", "Coffee", "Pets",
];

const CONVERSATION_STYLES = [
  { label: "Deep & Thoughtful", desc: "Meaningful topics and philosophical discussions" },
  { label: "Fun & Playful", desc: "Light-hearted banter and humor" },
  { label: "Adventurous", desc: "Spontaneous ideas and exciting plans" },
  { label: "Chill & Casual", desc: "Relaxed, go-with-the-flow conversations" },
];

export default function PreferencesScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState({ min: 18, max: 30 });
  const [interests, setInterests] = useState<string[]>([]);
  const [conversationStyle, setConversationStyle] = useState("");

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return gender !== "";
      case 1: return true;
      case 2: return interests.length >= 3;
      case 3: return conversationStyle !== "";
      default: return false;
    }
  };

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}>
        ← Back
      </button>

      <div className="progress-bar-container" style={{ marginBottom: 32 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {step === 0 && (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            I&apos;m interested in
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, textAlign: "center" }}>
            Who would you like to connect with?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                className={`chip ${gender === option ? "selected" : ""}`}
                onClick={() => setGender(option)}
                style={{ justifyContent: "center", padding: "14px 24px", fontSize: 16 }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Age Range</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, textAlign: "center" }}>
            What age range are you looking for?
          </p>
          <div style={{ display: "flex", gap: 16, width: "100%", alignItems: "center" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="min-age">Min</label>
              <input
                id="min-age"
                type="number"
                className="input-field"
                min="18"
                max="99"
                value={ageRange.min}
                onChange={(e) => setAgeRange({ ...ageRange, min: Number(e.target.value) })}
              />
            </div>
            <span style={{ color: "var(--color-text-muted)", marginTop: 20 }}>—</span>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="max-age">Max</label>
              <input
                id="max-age"
                type="number"
                className="input-field"
                min="18"
                max="99"
                value={ageRange.max}
                onChange={(e) => setAgeRange({ ...ageRange, max: Number(e.target.value) })}
              />
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Your Interests</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, textAlign: "center" }}>
            Select at least 3 interests
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                className={`chip ${interests.includes(interest) ? "selected" : ""}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 13,
              marginTop: 12,
            }}
          >
            {interests.length} of 3 minimum selected
          </p>
        </>
      )}

      {step === 3 && (
        <>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Conversation Style
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, textAlign: "center" }}>
            How do you like to connect?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            {CONVERSATION_STYLES.map((style) => (
              <button
                key={style.label}
                className={`card ${conversationStyle === style.label ? "" : ""}`}
                onClick={() => setConversationStyle(style.label)}
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  border:
                    conversationStyle === style.label
                      ? "2px solid var(--color-primary)"
                      : "1.5px solid var(--color-border-light)",
                  background:
                    conversationStyle === style.label
                      ? "var(--color-bg-secondary)"
                      : "var(--color-bg)",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{style.label}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                  {style.desc}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        className="btn btn-primary"
        onClick={handleNext}
        disabled={!canProceed()}
        style={{ marginTop: 32, opacity: canProceed() ? 1 : 0.5 }}
      >
        {step < totalSteps - 1 ? "Continue" : "Find My Match"}
      </button>
    </div>
  );
}
