import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "user" | "match" | "system";
  timestamp: string;
}

const CONVERSATION_STARTERS = [
  "What's something you're passionate about that most people don't know?",
  "If you could live anywhere for a year, where would it be?",
  "What's the best conversation you've had recently?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 0,
    text: "Welcome to your blind conversation! You have 24 hours to chat. Be genuine — profiles are revealed at 80 points.",
    sender: "system",
    timestamp: "",
  },
  {
    id: 1,
    text: "Hey! I'm excited to chat. I see we both love music and travel — what's the last concert you went to?",
    sender: "match",
    timestamp: "2:01 PM",
  },
];

export default function ChatScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(86400);
  const [showStarters, setShowStarters] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: messages.length,
      text: text.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setShowStarters(false);

    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 1,
        text: "That's so cool! I totally relate. I've been really into discovering new things lately too.",
        sender: "match",
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => navigate("/dashboard")}>
          ←
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Mystery Match</div>
          <div style={{ fontSize: 12, color: "var(--color-accent)" }}>
            ⏱ {formatTime(timeLeft)} remaining
          </div>
        </div>
        <button
          className="btn-ghost"
          style={{ fontSize: 12, color: "var(--color-error)" }}
          onClick={() => navigate("/rating")}
        >
          End Chat
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf:
                msg.sender === "user"
                  ? "flex-end"
                  : msg.sender === "system"
                    ? "center"
                    : "flex-start",
              maxWidth: msg.sender === "system" ? "90%" : "75%",
            }}
          >
            <div
              style={{
                padding: msg.sender === "system" ? "10px 16px" : "12px 16px",
                borderRadius:
                  msg.sender === "user"
                    ? "18px 18px 4px 18px"
                    : msg.sender === "system"
                      ? "12px"
                      : "18px 18px 18px 4px",
                background:
                  msg.sender === "user"
                    ? "var(--color-primary)"
                    : msg.sender === "system"
                      ? "var(--color-bg-secondary)"
                      : "#F0F0F0",
                color:
                  msg.sender === "user"
                    ? "#FFFFFF"
                    : msg.sender === "system"
                      ? "var(--color-text-secondary)"
                      : "var(--color-text)",
                fontSize: msg.sender === "system" ? 13 : 15,
                textAlign: msg.sender === "system" ? "center" : "left",
                fontStyle: msg.sender === "system" ? "italic" : "normal",
              }}
            >
              {msg.text}
            </div>
            {msg.timestamp && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 4,
                  textAlign: msg.sender === "user" ? "right" : "left",
                }}
              >
                {msg.timestamp}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Conversation starters */}
      {showStarters && (
        <div
          style={{
            padding: "8px 20px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            borderTop: "1px solid var(--color-border-light)",
          }}
        >
          {CONVERSATION_STARTERS.map((starter, i) => (
            <button
              key={i}
              className="chip"
              style={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: 12 }}
              onClick={() => sendMessage(starter)}
            >
              {starter.slice(0, 40)}…
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 20px",
          borderTop: "1px solid var(--color-border-light)",
        }}
      >
        <input
          type="text"
          className="input-field"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "auto", padding: "12px 20px" }}
          disabled={!input.trim()}
        >
          ↑
        </button>
      </form>
    </div>
  );
}
