import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlinkLogo from "../components/BlinkLogo";

export default function SignupScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("18");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/preferences");
  };

  return (
    <div className="screen">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <BlinkLogo size={80} />

      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, marginBottom: 32 }}>
        Create Account
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}
      >
        <div className="input-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="input-field"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            className="input-field"
            min="18"
            max="99"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            className="input-field"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
          Continue
        </button>
      </form>
    </div>
  );
}
