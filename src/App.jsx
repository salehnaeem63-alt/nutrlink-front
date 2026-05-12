import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { RegisterType } from './pages/RegisterType/RegisterType';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './component/Routing/ProtectedRoute';
import AdminRoute from './component/Routing/AdminRoute';
import RoleRoute from './component/Routing/RoleRoute';
import Home from './pages/Home/Home';
import { CreateProfile } from './pages/CreateProfile/CreateProfile';
import { Updateprofile } from './pages/Profile/Updateprofile';
import { Calculator } from './pages/Calculator/Calculator';
import { Profile } from './pages/Profile/Profile';
import { Aifull } from './pages/Aifull/Aifull';
import VideoCall from './pages/videoCall';
import AdminDashboard from './pages/Admindashboard/Admindashboard';
import { NutriProfile } from './pages/NutrProfile/NutriProfile';
import { NutriCreateProfile } from './pages/NutrProfile/Nutricreateprofile';
import { Ndashboard } from './pages/Ndashboard/Ndashboard';
import Nutritionists from './pages/Nutritionists/Nutritionists';
import Appointments from './pages/Appointments/Appointments';
import ChatPage from './pages/Chat';

// ── FIX: IMPORT THE MISSING SPINNER ──────────────────────────────────────────
// Note: Adjust this path if your Spinner component is located in a different folder
import Spinner from './component/Spinner'; 
// ─────────────────────────────────────────────────────────────────────────────

// ── NEW IMPORTS ───────────────────────────────────────────────────────────────
import CustomerDietPage from './pages/Customerdietpage/Customerdietpage';
import NutritionistDietPage from './pages/NutritionistsDietPage/NutritionistDietPage';
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div className="full-screen-loader"> <Spinner /> </div>;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registerType" element={<RegisterType />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/createprofile" element={<CreateProfile />} />
          <Route path="/updateprofile" element={<Updateprofile />} />
          <Route path="/nutritionists" element={<Nutritionists />} />

          {/* Role-based Profile Route */}
          <Route path="/profile" element={<RoleRoute role="customer"><Profile /></RoleRoute>} />
          <Route path="/Nprofile" element={<RoleRoute role="nutritionist"><NutriProfile /></RoleRoute>} />

          <Route path="/customer/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/nutritionist/profile/:userId" element={<ProtectedRoute><NutriProfile /></ProtectedRoute>} />

          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/creatNprofile" element={<ProtectedRoute><NutriCreateProfile /></ProtectedRoute>} />
          <Route path="/Ndashboard" element={<ProtectedRoute><Ndashboard /></ProtectedRoute>} />
          <Route path="/Ai" element={<ProtectedRoute><Aifull /></ProtectedRoute>} />

          {/* Video Call Route */}
          <Route
            path="/video-call/:appointmentId"
            element={<ProtectedRoute><VideoCall /></ProtectedRoute>}
          />

          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* ── NEW DIET PLAN ROUTES ─────────────────────────────────────────── */}
          <Route
            path="/CustomerDietPlan"
            element={
              <RoleRoute role="customer">
                <CustomerDietPage />
              </RoleRoute>
            }
          />
          <Route
            path="/NutritionistDietPlan"
            element={
              <RoleRoute role="nutritionist">
                <NutritionistDietPage />
              </RoleRoute>
            }
          />
          {/* ─────────────────────────────────────────────────────────────────── */}

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;