import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/nutrlink/api/customer'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }

    console.error('Global API Error:', error.response?.data?.message || error.message)

    return Promise.reject(error)
  })

/* ── PROFILE FUNCTIONS ── */

export const createProfile = async (info) => {
  const payload = info instanceof FormData ? info : { ...info, startingWeight: info.currentWeight }
  const { data } = await api.post('/profile', payload)
  return data
}



export const getCustomerProfile = async () => {
  try {
    const { data } = await api.get('/profile/me')
    return data
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
}

export const getProfileById = async (userId) => {
  const { data } = await api.get(`/profile/${userId}`)
  return data
}

export const updateCustomerProfile = async (info) => {
  const { data } = await api.put('/profile/me', info)
  return data
}

export const updateProfilePicture = async (file) => {
  const formData = new FormData()
  formData.append('profilePic', file)

  const { data } = await api.put('/profile/profile-picture', formData)
  return data
}

/* ── GOAL FUNCTIONS ── */

export const creategoal = async (info) => {
  const { data } = await api.post('/goal', info)
  return data
}

export const goalDone = async (goalId) => {
  const { data } = await api.put('/goal/done', { goal_id: goalId })
  return data
}

export const deleteGoal = async (goalId) => {
  const { data } = await api.delete(`/goal/${goalId}`)
  return data
}

export const getGoals = async () => {
  const { data } = await api.get('/goal')
  return data
}