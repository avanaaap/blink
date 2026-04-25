import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

const GENDER_OPTIONS = ["Women", "Men", "Non-binary"];

const RELATIONSHIP_TYPE_OPTIONS = ["Monogamy", "Polyamory", "Open to Either"];

const INTEREST_OPTIONS = [
  "Music", "Travel", "Cooking", "Fitness", "Reading",
  "Art", "Gaming", "Photography", "Movies", "Nature",
  "Technology", "Yoga", "Dancing", "Coffee", "Pets",
  "Sports", "Fashion", "Volunteering", "Writing", "Hiking",
];

const RELATIONSHIP_MEANING_OPTIONS = [
  "A deep emotional bond built on trust and communication",
  "A partnership where we grow and support each other",
  "A fun adventure with someone who gets me",
  "Companionship and shared experiences",
];

const SPENDING_TIME_OPTIONS = [
  "Quality time together — walks, dinners, deep talks",
  "Active adventures — hiking, travel, trying new things",
  "Cozy nights in — movies, cooking, board games",
  "A healthy mix of together time and personal space",
];

const DISAGREEMENT_OPTIONS = [
  "Talk it out calmly and try to understand their perspective",
  "Take some space first, then come back to discuss it",
  "Find a compromise as quickly as possible",
  "Use humor to lighten the mood before addressing it",
];

const STRANDED_ISLAND_OPTIONS = [
  "Build a shelter and figure out survival",
  "Explore the island and look for resources",
  "Start a signal fire to get rescued",
  "Sit by the shore and enjoy the peace for a bit",
];

const INSTRUMENT_OPTIONS = [
  "Piano — classic, versatile, and emotionally expressive",
  "Guitar — warm, inviting, and great for campfires",
  "Drums — energetic, bold, and sets the rhythm",
  "Violin — passionate, romantic, and deeply moving",
  "Saxophone — smooth, jazzy, and a little mysterious",
  "Ukulele — cheerful, lighthearted, and fun",
];

const TOTAL_STEPS = 6;

export default function PreferencesScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [genderPrefs, setGenderPrefs] = useState<string[]>([]);
  const [relationshipType, setRelationshipType] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [relationshipMeaning, setRelationshipMeaning] = useState("");
  const [spendingTime, setSpendingTime] = useState("");
  const [disagreement, setDisagreement] = useState("");
  const [strandedIsland, setStrandedIsland] = useState("");
  const [instrument, setInstrument] = useState("");

  const toggleGender = (g: string) => {
    setGenderPrefs((prev) =>
      prev.includes(g) ? prev.filter((v) => v !== g) : [...prev, g]
    );
  };

  const toggleInterest = (i: string) => {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((v) => v !== i) : [...prev, i]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return genderPrefs.length > 0 && relationshipType !== "";
      case 1: return interests.length >= 3;
      case 2: return relationshipMeaning !== "";
      case 3: return spendingTime !== "";
      case 4: return disagreement !== "";
      case 5: return strandedIsland !== "" && instrument !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const renderSingleSelect = (
    options: string[],
    value: string,
    onChange: (v: string) => void
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            padding: "14px 20px",
            border: value === option ? "2px solid var(--color-primary)" : "1px solid #ddd",
            borderRadius: 12,
            background: value === option ? "var(--color-primary-light)" : "#fff",
            textAlign: "left",
            fontSize: 15,
            cursor: "pointer",
            fontWeight: value === option ? 600 : 400,
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="screen" style={{ paddingTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: 8 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: 14, cursor: "pointer", fontWeight: 500 }}
        >
          Save &amp; Exit
        </button>
      </div>

      <BlinkLogo size={60} />

      <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 12, marginBottom: 16 }}>
        Build Your Profile
      </h2>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 6,
              borderRadius: 3,
              background: i <= step ? "var(--color-primary)" : "#e0e0e0",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      <div style={{ width: "100%", flex: 1, overflowY: "auto" }}>
        {/* Step 1: Gender + Relationship Type */}
        {step === 0 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>I&apos;m interested in</h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>Select all that apply</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGender(g)}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    border: genderPrefs.includes(g) ? "2px solid var(--color-primary)" : "1px solid #ddd",
                    borderRadius: 12,
                    background: genderPrefs.includes(g) ? "var(--color-primary-light)" : "#fff",
                    fontSize: 14,
                    fontWeight: genderPrefs.includes(g) ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Relationship Type</h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>What are you looking for?</p>
            {renderSingleSelect(RELATIONSHIP_TYPE_OPTIONS, relationshipType, setRelationshipType)}

            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#f9f7f5",
                borderRadius: 12,
                border: "1px solid #eee",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Safe &amp; Secure Dating</p>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                All profiles undergo background verification to ensure a safe community. We verify
                identity and screen for safety concerns.
              </p>
            </div>
          </>
        )}

        {/* Step 2: Interests */}
        {step === 1 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Your Interests</h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>Select at least 3 interests</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {INTEREST_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`chip ${interests.includes(option) ? "selected" : ""}`}
                  onClick={() => toggleInterest(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
              {interests.length} of 3 minimum selected
            </p>
          </>
        )}

        {/* Step 3: Relationship meaning */}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              What does a relationship mean to you?
            </h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>Pick the one that resonates most</p>
            {renderSingleSelect(RELATIONSHIP_MEANING_OPTIONS, relationshipMeaning, setRelationshipMeaning)}
          </>
        )}

        {/* Step 4: Spending time */}
        {step === 3 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              How do you approach spending time with your partner?
            </h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>
              What&apos;s your ideal way to connect?
            </p>
            {renderSingleSelect(SPENDING_TIME_OPTIONS, spendingTime, setSpendingTime)}
          </>
        )}

        {/* Step 5: Disagreement */}
        {step === 4 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              During a disagreement with your partner, you&apos;re more likely to:
            </h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>
              Be honest — there&apos;s no wrong answer!
            </p>
            {renderSingleSelect(DISAGREEMENT_OPTIONS, disagreement, setDisagreement)}
          </>
        )}

        {/* Step 6: Stranded Island + Musical Instrument */}
        {step === 5 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              You&apos;re on a stranded island — what&apos;s the first thing you do?
            </h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>
              This says more about you than you think
            </p>
            {renderSingleSelect(STRANDED_ISLAND_OPTIONS, strandedIsland, setStrandedIsland)}

            <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 4 }}>
              What musical instrument would you be?
            </h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>
              Pick the one that matches your vibe
            </p>
            {renderSingleSelect(INSTRUMENT_OPTIONS, instrument, setInstrument)}
          </>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleNext}
        disabled={!canProceed()}
        style={{ marginTop: 24, opacity: canProceed() ? 1 : 0.5 }}
      >
        {step < TOTAL_STEPS - 1 ? "Continue  ›" : "Find My Match"}
      </button>
    </div>
  );
}
