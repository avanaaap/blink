import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

export default function RevealScreen() {
  const navigate = useNavigate();

  return (
    <div className="screen" style={{ justifyContent: "center", gap: 16 }}>
      <BlinkLogo size={80} />

      <h1 style={{ fontSize: 36, fontWeight: 700, textAlign: "center", marginTop: 16 }}>
        Congratulations!
      </h1>

      <p style={{ fontSize: 18, color: "#666", textAlign: "center" }}>
        You&apos;ve completed your video call
      </p>

      <p style={{ fontSize: 15, color: "#999", textAlign: "center" }}>
        Your match&apos;s profile is now revealed
      </p>

      <button
        className="btn btn-primary"
        onClick={() => navigate("/dashboard")}
        style={{ marginTop: 32, padding: "16px 48px", fontSize: 17 }}
      >
        Reveal Profile
      </button>
    </div>
  );
}
