import React, { useContext } from 'react';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';
import { AuthContext } from '../../AuthContext';
import { useSocket } from '../../SocketContext';
import { Search, ChevronLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper to get the other user in a conversation
const getOtherUser = (participants, currentUserId) => {
  if (!participants || !currentUserId || !Array.isArray(participants)) return null;

  const myId = currentUserId.toString();
  const other = participants.find(p => {
    const pId = (p?._id || p?.id || p)?.toString();
    return pId && pId !== myId;
  });

  return typeof other === 'string' ? { _id: other, username: 'User' } : other;
};

const Sidebar = ({ conversations, setConversations, setSelectedChat, selectedChat, loading }) => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  const handleBackNavigation = () => navigate(-1);

  if (loading) return (
    <div className="w-80 h-full flex items-center justify-center bg-white border-r border-slate-100">
      <LoadingOverlay message='Loading chats...' />
    </div>
  );

  return (
    <div className="w-80 h-full flex flex-col bg-white border-r border-slate-200 shrink-0">

      {/* Header Section */}
      <div className="p-5 pb-2 flex items-center gap-2">
        <button
          onClick={handleBackNavigation}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all hover:text-emerald-600 cursor-pointer active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Messages</h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm text-slate-700"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {conversations.length > 0 ? (
          conversations.map((chat) => {
            const otherUser = getOtherUser(chat.participants, user?._id);

            const isActive = selectedChat?._id?.toString() === chat._id?.toString();
            const isOnline = onlineUsers.some(u => u.userId === otherUser?._id?.toString());

            const lastMessage = chat.lastMessage;
            const isSentByMe = lastMessage?.sender?.toString() === user?._id?.toString();
            const isUnread = lastMessage && !lastMessage.seen && !isSentByMe;

            const chatKey = chat._id || `ghost-${otherUser?._id}`;

            return (
              <div
                key={chatKey}
                onClick={() => {
                  setSelectedChat(chat);
                  setConversations((prev) =>
                    prev.map((c) =>
                      c._id === chat._id
                        ? { ...c, unreadCount: 0, lastMessage: c.lastMessage ? { ...c.lastMessage, seen: true } : c.lastMessage }
                        : c
                    )
                  );
                }}
                className={`group p-3 mb-1 cursor-pointer rounded-2xl transition-all flex items-center gap-3 relative
                  ${isActive ? 'bg-emerald-50 shadow-sm' : 'hover:bg-slate-50'}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={otherUser?.profilePic || 'https://ui-avatars.com/api/?name=' + (otherUser?.username || 'U')}
                    alt=""
                    className={`size-12 object-cover rounded-full border-2 ${isActive ? 'border-emerald-200' : 'border-transparent'}`}
                  />
                  {isOnline && <span className="absolute bottom-0 right-0 size-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`capitalize truncate text-sm block ${isActive ? 'text-emerald-900 font-bold' : 'text-slate-900 font-semibold'}`}>
                    {otherUser?.username || 'User'}
                  </span>
                  <p className={`text-xs truncate ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {lastMessage ? (isSentByMe ? 'You: ' : '') + lastMessage.text : 'Start a conversation'}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="shrink-0 min-w-[20px] h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-40 mt-10 text-center">
            <Search size={32} className="mb-2" />
            <p className="text-sm">No messages</p>
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user?.profilePic || 'https://via.placeholder.com/150'}
              className="size-10 rounded-full object-cover border border-slate-200 shadow-sm"
              alt="My Profile"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 capitalize truncate">
                {user?.username}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Online</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Settings">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
