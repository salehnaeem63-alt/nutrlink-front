import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../SocketContext';
import { AuthContext } from '../AuthContext';
import { getConversations } from '../api/chatapi';
import Sidebar from '../component/Chat/Sidebar';
import ChatBox from '../component/Chat/Chatbox';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // 1. Socket Logic: Sidebar Synchronization
  useEffect(() => {
    if (!socket) return;

    const handleSidebarUpdate = (newMessage) => {
      // Standardize senderId for comparison
      const senderId = (newMessage.sender?._id || newMessage.sender)?.toString();
      if (senderId === user?._id?.toString()) return;

      setConversations((prev) => {
        // Standardize conversation ID comparison
        const existingChatIndex = prev.findIndex(c => 
          c._id?.toString() === newMessage.conversationId?.toString()
        );
        
        if (existingChatIndex === -1) return prev;

        const updatedConversations = [...prev];
        const targetChat = updatedConversations[existingChatIndex];
        const isCurrentlyOpen = selectedChat?._id?.toString() === newMessage.conversationId?.toString();

        const updatedChat = {
          ...targetChat,
          lastMessage: {
            ...newMessage,
            seen: isCurrentlyOpen
          },
          unreadCount: isCurrentlyOpen
            ? 0
            : (targetChat.unreadCount || 0) + 1
        };

        // Move the updated chat to the top of the list
        updatedConversations.splice(existingChatIndex, 1);
        return [updatedChat, ...updatedConversations];
      });
    };

    socket.on("update sidebar", handleSidebarUpdate);
    socket.on("message received", handleSidebarUpdate);

    return () => {
      socket.off("update sidebar", handleSidebarUpdate);
      socket.off("message received", handleSidebarUpdate);
    };
  }, [socket, selectedChat?._id, user?._id]);

  // 2. Data Initialization
  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  // 3. Handle incoming "Ghost" chat from Appointments/Nutritionists page
  useEffect(() => {
    const incomingChat = location?.state?.incomingChat;

    if (incomingChat) {
      // 1. Open the chat window immediately
      setSelectedChat(incomingChat);

      // 2. Add it to the sidebar list ONLY if it's not already there
      setConversations((prev) => {
        // Find the "other" person in the incoming chat to check for duplicates
        const otherPersonId = incomingChat.participants.find(p =>
          (p._id?.toString() || p.id?.toString() || p) !== user._id?.toString()
        );

        const isAlreadyInSidebar = prev.some(c => {
          // Check by Conversation ID (if it exists)
          if (c._id && incomingChat._id && c._id.toString() === incomingChat._id.toString()) return true;

          // Check by the Other Person's ID (Crucial for Ghost Chats)
          return c.participants.some(p =>
            (p._id?.toString() || p.id?.toString() || p) === (otherPersonId?._id?.toString() || otherPersonId?.toString())
          );
        });

        // Prepend only if it's a new interaction
        if (!isAlreadyInSidebar) return [incomingChat, ...prev];

        return prev;
      });

      // 4. Cleanup: remove state from history so it doesn't re-trigger on F5
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user?._id]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full bg-white shadow-sm border-x border-slate-200">
        
        {/* Sidebar */}
        <Sidebar
          conversations={conversations}
          setConversations={setConversations}
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
          loading={loading}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <ChatBox
            selectedChat={selectedChat}
            setConversations={setConversations}
            setSelectedChat={setSelectedChat}
          />
        </div>

      </main>
    </div>
  );
};

export default ChatPage;