import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import { GoogleOAuthProvider } from '@react-oauth/google';



function App() {
  console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App