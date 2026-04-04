import React, { useState, useEffect } from 'react'
import { getConversations } from '../api/chatapi'
import Sidebar from '../component/Chat/Sidebar'
import ChatBox from '../component/Chat/Chatbox'
import Navbar from '../component/Navigationbar/Navbar'

const ChatPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getConversations()
        setConversations(data)
      } catch (err) {
        console.error("Failed to load chats")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">        {/* 1. The List of People */}
        <Sidebar
          conversations={conversations}
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
          loading={loading}
        />

        {/* 2. The Message Area */}
        <ChatBox
          selectedChat={selectedChat}
          setConversations={setConversations}
        />
      </div>
    </>
  )
}

export default ChatPage
