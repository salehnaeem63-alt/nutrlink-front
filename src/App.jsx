import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login          from './pages/Login';
import Register       from './pages/Register';
import { RegisterType } from './pages/RegisterType';
import Dashboard      from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './component/ProtectedRoute';
import AdminRoute     from './component/AdminRoute';
import { Home } from './pages/Home';
import { Calculetor } from './pages/Calculetor';
import { Profile } from './pages/Profile';
import { CreatProfile } from './pages/CreatProfile';
import { Updateprofile } from './pages/Updateprofile';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"            element={<Login />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/registerType" element={<RegisterType />} />
          <Route path="/home" element={<Home/>} />
          <Route path="/calculetor" element={<Calculetor/>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path="/createprofile" element={<ProtectedRoute><CreatProfile/></ProtectedRoute>} />
          <Route path="/updateprofile" element={<ProtectedRoute><Updateprofile/></ProtectedRoute>} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-only route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;