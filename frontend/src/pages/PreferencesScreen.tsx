import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GENDER_OPTIONS = ["Women", "Men", "Everyone"];

const RELATIONSHIP_TYPE_OPTIONS = [
  "Long-term relationship",
  "Something casual",
  "Still figuring it out",
  "Prefer not to say",
];

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

interface StepConfig {
  title: string;
  subtitle: string;
  type: "single" | "multi" | "range";
  options?: string[];
  stateKey: string;
  minSelect?: number;
}

const STEPS: StepConfig[] = [
  {
    title: "I'm interested in",
    subtitle: "Who would you like to connect with?",
    type: "single",
    options: GENDER_OPTIONS,
    stateKey: "gender",
  },
  {
    title: "What are you looking for?",
    subtitle: "What type of relationship interests you?",
    type: "single",
    options: RELATIONSHIP_TYPE_OPTIONS,
    stateKey: "relationshipType",
  },
  {
    title: "Age Range",
    subtitle: "What age range are you looking for?",
    type: "range",
    stateKey: "ageRange",
  },
  {
    title: "Your Interests",
    subtitle: "Select at least 3 interests",
    type: "multi",
    options: INTEREST_OPTIONS,
    stateKey: "interests",
    minSelect: 3,
  },
  {
    title: "What does a relationship mean to you?",
    subtitle: "Pick the one that resonates most",
    type: "single",
    options: RELATIONSHIP_MEANING_OPTIONS,
    stateKey: "relationshipMeaning",
  },
  {
    title: "How do you approach spending time with your partner?",
    subtitle: "What's your ideal way to connect?",
    type: "single",
    options: SPENDING_TIME_OPTIONS,
    stateKey: "spendingTime",
  },
  {
    title: "During a disagreement with your partner, you're more likely to:",
    subtitle: "Be honest — there's no wrong answer!",
    type: "single",
    options: DISAGREEMENT_OPTIONS,
    stateKey: "disagreement",
  },
  {
    title: "You're on a stranded island — what's the first thing you do?",
    subtitle: "This says more about you than you think",
    type: "single",
    options: STRANDED_ISLAND_OPTIONS,
    stateKey: "strandedIsland",
  },
  {
    title: "What musical instrument would you be?",
    subtitle: "Pick the one that matches your vibe",
    type: "single",
    options: INSTRUMENT_OPTIONS,
    stateKey: "instrument",
  },
];

export default function PreferencesScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | { min: number; max: number }>>({
    gender: "",
    relationshipType: "",
    ageRange: { min: 18, max: 30 },
    interests: [],
    relationshipMeaning: "",
    spendingTime: "",
    disagreement: "",
    strandedIsland: "",
    instrument: "",
  });

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;
  const currentStep = STEPS[step];

  const getAnswer = (key: string) => answers[key];
  const setAnswer = (key: string, value: string | string[] | { min: number; max: number }) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key: string, value: string) => {
    const current = (getAnswer(key) as string[]) || [];
    if (current.includes(value)) {
      setAnswer(key, current.filter((v) => v !== value));
    } else {
      setAnswer(key, [...current, value]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const canProceed = () => {
    const answer = getAnswer(currentStep.stateKey);
    if (currentStep.type === "single") return answer !== "";
    if (currentStep.type === "multi") {
      return (answer as string[]).length >= (currentStep.minSelect || 1);
    }
    if (currentStep.type === "range") return true;
    return false;
  };

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}>
        ← Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginBottom: 24 }}>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          {step + 1}/{totalSteps}
        </span>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
        {currentStep.title}
      </h2>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24, textAlign: "center", fontSize: 15 }}>
        {currentStep.subtitle}
      </p>

      {/* Single select */}
      {currentStep.type === "single" && currentStep.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {currentStep.options.map((option) => (
            <button
              key={option}
              className={`chip ${getAnswer(currentStep.stateKey) === option ? "selected" : ""}`}
              onClick={() => setAnswer(currentStep.stateKey, option)}
              style={{
                justifyContent: "flex-start",
                padding: "14px 20px",
                fontSize: 15,
                textAlign: "left",
                lineHeight: 1.4,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Multi select */}
      {currentStep.type === "multi" && currentStep.options && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {currentStep.options.map((option) => (
              <button
                key={option}
                className={`chip ${(getAnswer(currentStep.stateKey) as string[]).includes(option) ? "selected" : ""}`}
                onClick={() => toggleMulti(currentStep.stateKey, option)}
              >
                {option}
              </button>
            ))}
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 12 }}>
            {(getAnswer(currentStep.stateKey) as string[]).length} of {currentStep.minSelect} minimum selected
          </p>
        </>
      )}

      {/* Range select */}
      {currentStep.type === "range" && (
        <div style={{ display: "flex", gap: 16, width: "100%", alignItems: "center" }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="min-age">Min</label>
            <input
              id="min-age"
              type="number"
              className="input-field"
              min="18"
              max="99"
              value={(getAnswer("ageRange") as { min: number; max: number }).min}
              onChange={(e) =>
                setAnswer("ageRange", {
                  ...(getAnswer("ageRange") as { min: number; max: number }),
                  min: Number(e.target.value),
                })
              }
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
              value={(getAnswer("ageRange") as { min: number; max: number }).max}
              onChange={(e) =>
                setAnswer("ageRange", {
                  ...(getAnswer("ageRange") as { min: number; max: number }),
                  max: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
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
