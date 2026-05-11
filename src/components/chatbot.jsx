import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi 👋 I’m your Eclix assistant. How can I help you?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    const botReply = getBotReply(input);

    setMessages([...messages, userMsg, { role: "bot", text: botReply }]);
    setInput("");
  };

  const getBotReply = (msg) => {
    msg = msg.toLowerCase();

    if (msg.includes("price")) return "Our properties range from $50,000 to luxury villas.";
    if (msg.includes("book")) return "You can book a property from its details page 🏡";
    if (msg.includes("location")) return "We have listings in Nairobi, Mombasa and beyond.";
    if (msg.includes("hello")) return "Hello! How can I assist you today?";
    
    return "I'm still learning 🤖 — try asking about properties, booking or prices.";
  };

  return (
    <>
      {/* Floating Button */}
      <div style={styles.fab} onClick={() => setOpen(!open)}>
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div style={styles.chatBox}>
          <div style={styles.header}>Eclix Assistant</div>

          <div style={styles.body}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.msg,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#d4af37" : "#1f2937",
                  color: m.role === "user" ? "#000" : "#fff",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={styles.footer}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={styles.input}
            />
            <button onClick={handleSend} style={styles.btn}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#d4af37",
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    zIndex: 9999,
  },
  chatBox: {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "320px",
    height: "420px",
    background: "#0a0e1a",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9999,
  },
  header: {
    padding: "10px",
    background: "#111827",
    color: "#d4af37",
    fontWeight: "bold",
    textAlign: "center",
  },
  body: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
  },
  msg: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "75%",
    fontSize: "0.85rem",
  },
  footer: {
    display: "flex",
    padding: "10px",
    gap: "8px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  btn: {
    background: "#d4af37",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};