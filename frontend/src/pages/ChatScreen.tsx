import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "user" | "match";
  timestamp: string;
}

const CONVERSATION_STARTERS = [
  "I saw we both love reading - what's a book that fundamentally changed your perspective?",
  "Since you enjoy hiking too, what's the most memorable trail you've ever explored?",
  "We both value creativity. What project are you most proud of working on recently?",
];

const MATCH_REPLIES = [
  "That's really cool! I can totally relate to that.",
  "Oh I love that! We definitely have that in common.",
  "That's so interesting — tell me more!",
  "Haha, I wasn't expecting that but I love it.",
  "Same here honestly. It's nice to connect with someone who gets it.",
  "That's a great answer. I think we'd get along really well.",
];

const STAGES = [
  { key: "chat", label: "Text Chat", active: true },
  { key: "voice", label: "Voice Call", active: false },
  { key: "video", label: "Video Call", active: false },
  { key: "reveal", label: "Reveal", active: false },
];

export default function ChatScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(3600);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);

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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const id = nextId.current++;
    const now = new Date();
    const newMsg: Message = {
      id,
      text: text.trim(),
      sender: "user",
      timestamp: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    inputRef.current?.focus();

    const replyIndex = id % MATCH_REPLIES.length;
    setTimeout(() => {
      const replyTime = new Date();
      const reply: Message = {
        id: nextId.current++,
        text: MATCH_REPLIES[replyIndex],
        sender: "match",
        timestamp: replyTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: 480, margin: "0 auto", background: "#fff" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #eee",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
        >
          ←
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🕐</span>
          <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600 }}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <button
          onClick={() => navigate("/rating")}
          style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
        >
          ✕
        </button>
      </div>

      {/* Connection Progress */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
        <div className="card" style={{ padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 12 }}>Connection Progress</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {STAGES.map((s, i) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: s.active ? "var(--color-primary)" : "#e8e8e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 4px",
                      fontSize: 16,
                      color: s.active ? "#fff" : "#999",
                    }}
                  >
                    {s.key === "chat" ? "💬" : s.key === "voice" ? "📞" : s.key === "video" ? "📹" : "👁"}
                  </div>
                  <span style={{ fontSize: 10, color: s.active ? "var(--color-primary)" : "#999" }}>
                    {s.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ width: 20, height: 2, background: "#e0e0e0", margin: "0 2px", marginBottom: 16 }} />
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 8 }}>
            Complete this chat with a good rating to unlock voice calls
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.length === 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Conversation Starters</h3>
            {CONVERSATION_STARTERS.map((starter, i) => (
              <button
                key={i}
                onClick={() => sendMessage(starter)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 16px",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  background: "#fff",
                  textAlign: "left",
                  fontSize: 14,
                  lineHeight: 1.5,
                  cursor: "pointer",
                  marginBottom: i < CONVERSATION_STARTERS.length - 1 ? 8 : 0,
                }}
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: 16,
                background: msg.sender === "user" ? "var(--color-primary)" : "#f0f0f0",
                color: msg.sender === "user" ? "#fff" : "#333",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {msg.text}
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.7,
                  marginTop: 4,
                  textAlign: msg.sender === "user" ? "right" : "left",
                }}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {messages.length > 0 && (
          <div style={{ padding: "8px 0" }}>
            <p style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Conversation Starters</p>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {CONVERSATION_STARTERS.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(starter)}
                  style={{
                    flexShrink: 0,
                    padding: "8px 14px",
                    border: "1px solid #eee",
                    borderRadius: 20,
                    background: "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderTop: "1px solid #eee",
          background: "#fff",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderRadius: 24,
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: input.trim() ? "var(--color-primary)" : "#ddd",
            color: "#fff",
            fontSize: 18,
            cursor: input.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
