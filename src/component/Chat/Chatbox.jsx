import React, { useState, useEffect, useContext, useRef } from 'react';
import { getMessages, sendMessage } from '../../api/chatapi';
import { AuthContext } from '../../AuthContext';

const ChatBox = ({ selectedChat, setConversations }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef();
  const inputRef = useRef()

  // 1. Fetch messages on chat selection
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedChat?._id) {
        try {
          const data = await getMessages(selectedChat._id);
          setMessages(data);
          inputRef.current.focus()
        } catch (err) {
          console.error('Could not load messages');
        }
      }
    };
    fetchHistory();
  }, [selectedChat?._id]); // Only re-run if the ID actually changes

  // 2. Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user?._id) return;

    const recipient = selectedChat.participants.find(p => p._id !== user._id);

    try {
      // Logic: Send to API, then update local state
      const sentMsg = await sendMessage(recipient._id, text);
      
      // Ensure we are adding the actual message object returned from the server
      setMessages(prev => [...prev, sentMsg]);
      setText("");

      // Update Sidebar Preview
      setConversations(prev => {
        const otherChats = prev.filter(c => c._id !== selectedChat._id);
        const updatedChat = { ...selectedChat, lastMessage: sentMsg };
        return [updatedChat, ...otherChats];
      });
    } catch (err) {
      console.error('Message failed to send');
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-lg font-medium">Select a chat to start messaging</p>
      </div>
    );
  }

  const otherUser = selectedChat.participants.find(p => p._id !== user._id);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] overflow-hidden">
      <header className="h-[64px] bg-white border-b border-gray-200 flex items-center px-6 shadow-sm z-10">
        <img
          src={otherUser?.profilePic || 'https://via.placeholder.com/40'}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-800">{otherUser?.username || 'User'}</h3>
          <span className="text-[11px] text-green-500 font-medium">Online</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-3">
        {messages.map((m) => {
          // DEFENSIVE CHECK: Handle sender as string or object
          const senderId = typeof m.sender === 'object' ? m.sender._id : m.sender;
          const isMe = senderId?.toString() === user._id?.toString();

          return (
            <div
              key={m._id}
              className={`p-3 px-4 rounded-2xl shadow-sm max-w-[75%] text-sm ${
                isMe
                  ? 'self-end bg-[#dcf8c6] rounded-tr-none text-gray-800'
                  : 'self-start bg-white rounded-tl-none text-gray-800'
              }`}
            >
              {m.text}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <footer className="p-4 bg-gray-100 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            ref={inputRef}
            className="flex-1 p-3 px-5 bg-white rounded-full shadow-sm outline-none focus:ring-1 ring-green-500"
          />
          <button type="submit" className="bg-green-600 p-2 rounded-full text-white">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatBox;