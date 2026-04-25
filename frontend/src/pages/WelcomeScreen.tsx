import { Link } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

export default function WelcomeScreen() {
  return (
    <div className="screen" style={{ justifyContent: "center", gap: 16 }}>
      <BlinkLogo size={100} />

      <h1 style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>Blink</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: -8 }}>
        Blind Link
      </p>

      <p
        style={{
          color: "var(--color-text-secondary)",
          textAlign: "center",
          fontSize: 18,
          lineHeight: 1.5,
          marginTop: 16,
          marginBottom: 32,
          maxWidth: 320,
        }}
      >
        Authentic connections through meaningful conversations
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <Link to="/signup" className="btn btn-primary">
          Create Account
        </Link>
        <Link to="/login" className="btn btn-outline">
          Log In
        </Link>
      </div>
    </div>
  );
}
