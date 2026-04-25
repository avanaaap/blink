import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  "What's your idea of a perfect weekend?",
  "What's on your bucket list this year?",
];

const MATCH_REPLIES = [
  "That's really cool! I can totally relate to that.",
  "Oh I love that! We definitely have that in common.",
  "That's so interesting — tell me more!",
  "Haha, I wasn't expecting that but I love it.",
  "Same here honestly. It's nice to connect with someone who gets it.",
  "That's a great answer. I think we'd get along really well.",
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
  const [searchParams] = useSearchParams();
  const stage = searchParams.get("stage") || "chat";
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(86400);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const nextId = useRef(100);

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

    const delay = 1500;
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
    }, delay);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const stageLabel = stage === "voice" ? "Voice Call Chat" : stage === "video" ? "Video Call Chat" : "Chat";
  const ratingPath = `/rating?stage=${stage}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--color-border-light)",
          background: "var(--color-bg)",
        }}
      >
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => navigate("/dashboard")}>
          ←
        </button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Mystery Match</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{stageLabel}</div>
        </div>
        <button
          className="btn-ghost"
          style={{ fontSize: 12, color: "var(--color-error)" }}
          onClick={() => navigate(ratingPath)}
        >
          End
        </button>
      </div>

      {/* Timer bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 20px",
          background: "var(--color-bg-secondary)",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        <span style={{ fontSize: 18 }}>⏱</span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 20,
            fontWeight: 700,
            color: timeLeft < 3600 ? "var(--color-error)" : "var(--color-primary)",
            letterSpacing: 2,
          }}
        >
          {formatTime(timeLeft)}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>remaining</span>
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
      <div
        style={{
          padding: "8px 20px",
          borderTop: "1px solid var(--color-border-light)",
          background: "var(--color-bg-secondary)",
        }}
      >
        <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 6 }}>
          Conversation starters:
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {CONVERSATION_STARTERS.map((starter, i) => (
            <button
              key={i}
              className="chip"
              style={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: 12 }}
              onClick={() => sendMessage(starter)}
            >
              {starter.length > 35 ? starter.slice(0, 35) + "…" : starter}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 20px",
          borderTop: "1px solid var(--color-border-light)",
          background: "var(--color-bg)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="input-field"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, fontSize: 16 }}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            width: 48,
            height: 48,
            padding: 0,
            borderRadius: "50%",
            fontSize: 20,
            flexShrink: 0,
          }}
          disabled={!input.trim()}
        >
          ↑
        </button>
      </form>
    </div>
  );
}
