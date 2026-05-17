import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  createmessage,
  createChat,
  getchat,
  getmessages,
  deletechat,
} from "../../api/ai"; // adjust path as needed
import "./Aifull.css";

export const Aifull = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 🟢 NEW: Local state for filtering search history
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");

  // modal state for naming a new chat
  const [showModal, setShowModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showModal) setTimeout(() => titleInputRef.current?.focus(), 50);
  }, [showModal]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await getchat();
      const list = Array.isArray(res) ? res : [];
      setChats(list);
      if (list.length > 0) {
        setActiveChatId(list[0]._id);
        loadMessages(list[0]._id);
      }
    } catch {
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId) => {
    setLoadingMessages(true);
    try {
      const res = await getmessages(chatId);
      setMessages(Array.isArray(res) ? res : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    loadMessages(chatId);
  };

  // open modal to name a new chat
  const openNewChatModal = () => {
    setNewChatTitle("");
    setShowModal(true);
  };

  // confirm create with chosen title (or default)
  const confirmNewChat = async () => {
    const title = newChatTitle.trim() || `Chat ${chats.length + 1}`;
    setCreatingChat(true);
    try {
      const res = await createChat({ title });
      setChats((prev) => [res, ...prev]);
      setActiveChatId(res._id);
      setMessages([]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleModalKeyDown = (e) => {
    if (e.key === "Enter") confirmNewChat();
    if (e.key === "Escape") setShowModal(false);
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await deletechat(chatId);
      const updated = chats.filter((c) => c._id !== chatId);
      setChats(updated);
      if (activeChatId === chatId) {
        if (updated.length > 0) {
          selectChat(updated[0]._id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    let currentChatId = activeChatId;

    // if no chat exists yet, auto-create with default title
    if (!currentChatId) {
      try {
        const res = await createChat({ title: "New Chat" });
        currentChatId = res._id;
        setChats((prev) => [res, ...prev]);
        setActiveChatId(currentChatId);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
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

  const activeChat = chats.find((c) => c._id === activeChatId);
  const isAI = (role) => role === "assistant";

  // 🟢 NEW: Filter our chats array locally using case-insensitive validation
  const filteredChats = chats.filter((chat) => {
    const titleText = chat.title || "Untitled Chat";
    return titleText.toLowerCase().includes(searchHistoryQuery.toLowerCase());
  });

  return (
    <div className="aifull-page">

      {/* ── New Chat Name Modal ── */}
      {showModal && (
        <div className="aifull-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="aifull-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Name your chat</h3>
            <p>Give this conversation a title, or leave blank for a default name.</p>
            <input
              ref={titleInputRef}
              className="aifull-modal-input"
              type="text"
              placeholder={`Chat ${chats.length + 1}`}
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyDown={handleModalKeyDown}
              maxLength={50}
            />
            <div className="aifull-modal-actions">
              <button className="aifull-modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="aifull-modal-confirm" onClick={confirmNewChat} disabled={creatingChat}>
                {creatingChat ? "Creating..." : "Create Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <div className="aifull-sidebar">
        <div className="aifull-sidebar-header">
          <h3>💬 Conversations</h3>
          <button className="aifull-new-btn" onClick={openNewChatModal}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width={15} height={15}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* 🟢 NEW: History Search Input Bar Section */}
        <div className="aifull-history-search-container">
          <svg className="aifull-history-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            className="aifull-history-search-input"
            value={searchHistoryQuery}
            onChange={(e) => setSearchHistoryQuery(e.target.value)}
          />
          {searchHistoryQuery && (
            <button className="aifull-clear-history-search" onClick={() => setSearchHistoryQuery("")}>
              ×
            </button>
          )}
        </div>

        <div className="aifull-chat-list">
          {loadingChats ? (
            <div className="aifull-loading" style={{ height: "80px" }}>
              <div className="aifull-spinner" />
            </div>
          ) : chats.length === 0 ? (
            <div className="aifull-no-chats">No conversations yet.<br />Start a new chat!</div>
          ) : filteredChats.length === 0 ? (
            // 🟢 NEW: UI feedback if search results return empty
            <div className="aifull-no-chats">No matching conversations found.</div>
          ) : (
            // 🟢 CHANGED: We iterate over filteredChats instead of chats directly
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`aifull-chat-item ${activeChatId === chat._id ? "active" : ""}`}
                onClick={() => selectChat(chat._id)}
              >
                <div className="aifull-chat-item-left">
                  <div className="aifull-chat-icon">💬</div>
                  <span className="aifull-chat-title">{chat.title || "Untitled Chat"}</span>
                </div>
                <button
                  className="aifull-delete-btn"
                  onClick={(e) => handleDeleteChat(chat._id, e)}
                  title="Delete chat"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat ── */}
      <div className="aifull-main">
        <div className="aifull-main-header">
          <div className="aifull-main-avatar">🥗</div>
          <div>
            <h2>NutriLink AI</h2>
            <p>{activeChat ? activeChat.title : "Your personal nutrition assistant"}</p>
          </div>
          <div className="aifull-online-dot" />
        </div>

        <div className="aifull-messages">
          {loadingMessages ? (
            <div className="aifull-loading">
              <div className="aifull-spinner" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="aifull-welcome">
              <div className="aifull-welcome-icon">🥗</div>
              <h3>Hello! I'm your NutriLink AI</h3>
              <p>Ask me anything about nutrition, diets, meal plans, or your health goals.</p>
              <div className="aifull-suggestions">
                {[
                  "What should I eat to lose weight?",
                  "Create a 7-day meal plan",
                  "How much protein do I need?",
                  "Best foods for energy",
                ].map((s) => (
                  <button key={s} className="aifull-suggestion-chip" onClick={() => setInput(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`aifull-msg ${isAI(msg.role) ? "assistant" : "user"}`}>
                <div className="aifull-msg-avatar">
                  {isAI(msg.role) ? "🥗" : "U"}
                </div>
                <div className="aifull-msg-bubble">
                  {isAI(msg.role) ? (
                    <div className="aifull-markdown"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="aifull-msg assistant">
              <div className="aifull-msg-avatar">🥗</div>
              <div className="aifull-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="aifull-input-area">
          <div className="aifull-input-box">
            <textarea
              className="aifull-textarea"
              placeholder="Ask about nutrition, meal plans, health goals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button
              className="aifull-send-btn"
              disabled={loading || !input.trim()}
              onClick={sendMessage}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="aifull-input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};