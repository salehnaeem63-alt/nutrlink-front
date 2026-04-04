import React, { useContext } from 'react'
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'
import { AuthContext } from '../../AuthContext'

const Sidebar = ({ conversations, setSelectedChat, selectedChat, loading }) => {
  const { user } = useContext(AuthContext)

  const getOtherUser = (participants) => {
    if (!user || !participants) return null

    return participants.find(p => p._id !== user._id)
  }

  if (loading) return <div className="sidebar"><LoadingOverlay message='Loading chats...' /></div>

  return (
    <div className="w-75 border-r border-gray-200 overflow-y-hidden">
      <h2 className='p-2.5'>Messages</h2>
      {conversations.map((chat) => {
        const otherUser = getOtherUser(chat.participants)
        const isActive = selectedChat?._id === chat._id

        return (
          <div
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            className={`p-4 cursor-pointer border-b border-[#eee] transition-colors ${isActive ? 'bg-[#e3efff]' : 'bg-transparent'}`}
          >
            <div style={{ fontWeight: 'bold' }}>
              {otherUser?.username || 'User'}
            </div>
            <div className='text-xs text-gray-600 truncate'>
              {chat.lastMessage?.text || "Start a conversation"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Sidebar
