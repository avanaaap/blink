import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <BlinkLogo size={80} />

      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, marginBottom: 32 }}>
        Welcome Back
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}
      >
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
          Log In
        </button>
      </form>
    </div>
  );
}
