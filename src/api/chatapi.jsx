import axios from 'axios'

// 1. Create the instance specifically for the chat
const chatApi = axios.create({
  baseURL: "http://localhost:5000/nutrlink/api/chat"
})

// 2. Request interceptor (Attaches the token automatically)
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 3. Response interceptor (Handle errors and 401 logout)
chatApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }
    console.error('Chat API Error:', error.response?.data?.message || error.message)
    return Promise.reject(error)
  }
)

// 4. Feature Functions
export const sendMessage = async (recipientId, text) => {
  const response = await chatApi.post('/send', { recipientId, text })
  return response.data
}

export const deleteMessage = async(messageId) => {
  const response = await chatApi.delete(`/messages/${messageId}`)
  return response.data
}

export const getConversations = async () => {
  const response = await chatApi.get('/conversations')
  return response.data
}

export const getMessages = async (conversationId) => {
  const response = await chatApi.get(`/messages/${conversationId}`)
  return response.data
}

export const accessConversation = async (userId) => {
  const { data } = await chatApi.post('/', { userId})
  return data
}

export default chatApi