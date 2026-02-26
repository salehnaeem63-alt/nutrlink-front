import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login             from './pages/Login';
import Register          from './pages/Register';
import { RegisterType }  from './pages/RegisterType';
import Dashboard         from './pages/Dashboard';
import AdminDashboard    from './pages/AdminDashboard';
import ProtectedRoute    from './component/ProtectedRoute';
import AdminRoute        from './component/AdminRoute';
import RoleRoute         from './component/RoleRoute';          // ← NEW
import { Home }          from './pages/Home';
import { Calculetor }    from './pages/Calculetor';

// Customer pages
import { Profile }       from './pages/Profile';
import { CreatProfile }  from './pages/CreatProfile';
import { Updateprofile } from './pages/Updateprofile';

// Nutritionist pages
import { NutriProfile }       from './pages/NutriProfile';
import { NutriCreateProfile } from './pages/Nutricreateprofile';
import { NutriUpdateProfile } from './pages/Nutriupdateprofile';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/"             element={<Login />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/registerType" element={<RegisterType />} />
          <Route path="/home"         element={<Home />} />
          <Route path="/calculetor"   element={<Calculetor />} />

          {/* ── Customer-only routes ── */}
          <Route path="/profile"
            element={<RoleRoute role="customer"><Profile /></RoleRoute>}
          />
          <Route path="/createprofile"
            element={<RoleRoute role="customer"><CreatProfile /></RoleRoute>}
          />
          <Route path="/updateprofile"
            element={<RoleRoute role="customer"><Updateprofile /></RoleRoute>}
          />

          {/* ── Nutritionist-only routes ── */}
          <Route path="/Nprofile"
            element={<RoleRoute role="nutritionist"><NutriProfile /></RoleRoute>}
          />
          <Route path="/creatNprofile"
            element={<RoleRoute role="nutritionist"><NutriCreateProfile /></RoleRoute>}
          />
          <Route path="/updateNprofile"
            element={<RoleRoute role="nutritionist"><NutriUpdateProfile /></RoleRoute>}
          />

          {/* ── Dashboard (both roles) ── */}
          <Route path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />

          {/* ── Admin-only route ── */}
          <Route path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;