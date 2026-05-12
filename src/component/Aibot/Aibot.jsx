import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { createmessage, createChat, getchat, getmessages  } from "../../api/ai"; // adjust path as needed
import "./Aibot.css";

export const Aibot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !chatId) initChat();
  }, [isOpen]);

 const initChat = async () => {
  try {
    const existing = await getchat();
    const list = Array.isArray(existing) ? existing : [];

    if (list.length > 0) {
      setChatId(list[0]._id);
    } else {
      const newChat = await createChat({ title: "Quick Chat" });
      setChatId(newChat._id);
    }
  } catch (err) {
    console.error("Failed to get chats, creating new chat...", err);

    try {
      const newChat = await createChat({ title: "Quick Chat" });
      setChatId(newChat._id);
    } catch (createErr) {
      console.error("Failed to create chat", createErr);
    }
  }
};

  const sendMessage = async () => {
if (!input.trim() || loading) return;

let currentChatId = chatId;

if (!currentChatId) {
  try {
    const newChat = await createChat({ title: "Quick Chat" });
    currentChatId = newChat._id;
    setChatId(currentChatId);
  } catch (err) {
    console.error("Failed to create chat", err);
    return;
  }
}    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // createmessage returns: { reply: "..." }
      const res = await createmessage({ message: input }, currentChatId);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isAI = (role) => role === "assistant";

  return (
    <div className="aibot-fab">
      {isOpen && (
        <div className="aibot-panel">
          {/* Header */}
          <div className="aibot-header">
            <div className="aibot-header-left">
              <div className="aibot-avatar">🥗</div>
              <div>
                <h4>NutriLink AI</h4>
                <p>Your nutrition assistant</p>
              </div>
            </div>
            <button className="aibot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="aibot-messages">
            {messages.length === 0 && (
              <div className="aibot-empty">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Ask me anything about nutrition!</span>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`aibot-msg ${isAI(msg.role) ? "assistant" : "user"}`}>
                <div className="aibot-msg-avatar">
                  {isAI(msg.role) ? "🥗" : "U"}
                </div>
                <div className="aibot-msg-bubble">
                  {isAI(msg.role) ? (
                    <div className="aibot-markdown">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="aibot-msg assistant">
                <div className="aibot-msg-avatar">🥗</div>
                <div className="aibot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="aibot-footer">
            <input
              className="aibot-input"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="aibot-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button className="aibot-bubble" onClick={() => setIsOpen((p) => !p)}>
        {isOpen ? (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
};