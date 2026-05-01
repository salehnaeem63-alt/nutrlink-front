import React, { useState, useEffect, useContext, useRef } from 'react';
import { getMessages, sendMessage, deleteMessage } from '../../api/chatapi';
import { AuthContext } from '../../AuthContext';
import { useSocket } from '../../SocketContext';
import { Send, Trash2 } from 'lucide-react';
import { formatLastSeen } from '../../utils/chatActivity';

// 1. Helper moved to the TOP to prevent Hoisting Errors
const getOtherUser = (participants, currentUserId) => {
  if (!participants || !currentUserId || !Array.isArray(participants)) return null;
  const myId = currentUserId.toString();

  const other = participants.find(p => {
    const pId = (p?._id || p?.id || p)?.toString();
    return pId && pId !== myId;
  });

  return typeof other === 'string' ? { _id: other, username: 'User' } : other;
};

const ChatBox = ({ selectedChat, setConversations, setSelectedChat }) => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const scrollRef = useRef();
  const inputRef = useRef();
  const typingTimeoutRef = useRef(null);

  // 2. Identify the other user standardizing IDs
  const otherUser = getOtherUser(selectedChat?.participants, user?._id);

  // 3. Determine online status
  const isOnline = onlineUsers?.some(u => u.userId === otherUser?._id?.toString());

  useEffect(() => {
    if (!socket) return;
    // Join room only if the chat exists in DB
    if (selectedChat?._id) socket.emit('join chat', selectedChat._id);

    const handleMessage = (newMessageReceived) => {
      if (selectedChat?._id?.toString() === newMessageReceived.conversationId?.toString()) {
        setMessages((prev) => [...prev, newMessageReceived]);
      }

      // Update sidebar preview
      setConversations((prev) => {
        const otherChats = prev.filter(c => c._id?.toString() !== newMessageReceived.conversationId?.toString());
        const targetChat = prev.find(c => c._id?.toString() === newMessageReceived.conversationId?.toString());
        if (!targetChat) return prev;
        return [{ ...targetChat, lastMessage: newMessageReceived }, ...otherChats];
      });
    };

    const handleDeleteSocket = ({ messageId, conversationId }) => {
      if (selectedChat?._id?.toString() === conversationId?.toString()) {
        setMessages((prev) => prev.filter((m) => m._id?.toString() !== messageId?.toString()));
      }
    };

    socket.on('message received', handleMessage);
    socket.on("typing", () => setOtherUserTyping(true));
    socket.on("stop typing", () => setOtherUserTyping(false));
    socket.on("message deleted", handleDeleteSocket);

    return () => {
      socket.off('message received', handleMessage);
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message deleted", handleDeleteSocket);
    };
  }, [selectedChat?._id, socket, setConversations]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedChat?._id) {
        try {
          const data = await getMessages(selectedChat._id);
          setMessages(data);
          inputRef?.current?.focus();
        } catch (err) { console.error('Could not load messages'); }
      } else {
        setMessages([]); // Clear for Ghost Chats
      }
    };
    fetchHistory();
  }, [selectedChat?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handleStatusChange = ({ userId, lastSeen }) => {
      if (otherUser?._id?.toString() === userId?.toString()) {
        setSelectedChat(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.map(p => {
              const pId = (p._id || p)?.toString();
              return pId === userId?.toString() ? (typeof p === 'object' ? { ...p, lastSeen } : p) : p;
            })
          };
        });
      }
    };
    socket.on("user-status-changed", handleStatusChange);
    return () => socket.off("user-status-changed", handleStatusChange);
  }, [socket, otherUser?._id, setSelectedChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user?._id) return;
    try {
      // 4. Destructure response to promote Ghost to Real if necessary
      const { newMessage, conversationId } = await sendMessage(otherUser?._id, text, selectedChat?._id);

      socket.emit('new message', { ...newMessage, recipientId: otherUser?._id });
      setMessages(prev => [...prev, newMessage]);
      setText("");

      // 5. Promote Ghost Chat to Real State
      if (!selectedChat?._id) {
        const materialized = { ...selectedChat, _id: conversationId, isGhost: false };
        setSelectedChat(materialized);
        socket.emit('join chat', conversationId);
      }

      setConversations(prev => {
        const otherChats = prev.filter(c => c._id?.toString() !== (selectedChat?._id || conversationId)?.toString());
        return [{ ...selectedChat, _id: conversationId, lastMessage: newMessage }, ...otherChats];
      });
    } catch (err) { console.error('Message failed to send'); }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id.toString() !== messageId.toString()));
      socket.emit("delete message", { messageId, conversationId: selectedChat._id });
    } catch (err) { console.error("Delete Error:", err); }
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isOnline) {
      const timer = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(timer);
    }
  }, [isOnline]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <div className="size-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-4 animate-bounce">
          <Send size={32} />
        </div>
        <p className="text-lg font-semibold text-slate-600">Your chat will appear here</p>
        <p className="text-sm">Select a contact from the sidebar to start</p>
      </div>
    );
  }

  const formatTime = (ds) => new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const lastSeenValue = formatLastSeen(otherUser?.lastSeen);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf9f6] overflow-hidden">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${otherUser?.username || 'U'}&background=random`}
              alt="profile"
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-50"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 capitalize leading-tight">{otherUser?.username || 'User'}</h3>
            <span className={`text-[11px] font-medium transition-colors ${isOnline || lastSeenValue === "online_grace" ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isOnline ? "Active Now" : lastSeenValue === "online_grace" ? "Online" : `Last seen ${lastSeenValue}`}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none">
          <span className="text-slate-500/5 font-black text-7xl md:text-9xl uppercase tracking-[1rem]" style={{ transform: 'rotate(-30deg)' }}>
            nutrlink
          </span>
        </div>

        <div className="relative z-10 h-full overflow-y-auto p-4 md:p-6 flex flex-col gap-4 custom-scrollbar">
          {messages.map((m) => {
            const senderId = typeof m.sender === 'object' ? m.sender._id : m.sender;
            const isMe = senderId?.toString() === user._id?.toString();
            const isMenuOpen = activeMenuId === m._id?.toString();

            return (
              <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`group relative max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm
                    ${isMe ? 'bg-emerald-600 text-white rounded-tr-none hover:bg-emerald-700' : 'bg-white text-slate-800 rounded-tl-none hover:bg-slate-100 border border-slate-100'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMe) setActiveMenuId(isMenuOpen ? null : m._id?.toString());
                  }}
                >
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`text-[9px] ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>{formatTime(m.createdAt)}</span>
                  </div>
                  {isMe && isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 min-w-[140px]">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(m._id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold">
                        <Trash2 size={14} /> Delete Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      <footer className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {otherUserTyping && (
            <div className="text-[11px] text-emerald-600 font-medium px-4 animate-pulse italic">
              {otherUser?.username} is typing...
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (!socket || !selectedChat?._id) return;
                if (!isTyping) {
                  setIsTyping(true);
                  socket.emit("typing", selectedChat._id);
                }
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  socket.emit("stop typing", selectedChat._id);
                  setIsTyping(false);
                }, 3000);
              }}
              placeholder="Write your message..."
              ref={inputRef}
              className="flex-1 p-3 px-5 bg-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 ring-emerald-500/20 focus:border-emerald-500/50 transition-all border border-transparent"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200 transition-all active:scale-95">
              <Send size={20} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatBox;