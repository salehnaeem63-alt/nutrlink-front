import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './pages/Login';
import Register from './pages/Register';
import { RegisterType } from './pages/RegisterType';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './component/ProtectedRoute';
import AdminRoute from './component/AdminRoute';
import RoleRoute from './component/RoleRoute';
import Home from './pages/Home';
import Nhome from './pages/Nhome';
// This import now works because we added 'export default' in the other file
import NutritionistAppointments from './pages/NutritionistAppointments';
import { Calculator } from './pages/Calculator';
import { Profile } from './pages/Profile';
import { Aifull } from './pages/Aifull';
import AdminDashboard from './pages/Admindashboard';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registerType" element={<RegisterType />} />
          <Route path="/calculator" element={<Calculator />} />

          <Route 
            path="/profile" 
            element={<RoleRoute role="customer"><Profile /></RoleRoute>} 
          />

          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />

          <Route 
            path="/Nhome" 
            element={<RoleRoute role="nutritionist"><Nhome /></RoleRoute>} 
          />

          {/* Nutritionist Appointments Route */}
          <Route 
            path="/Appointments" 
            element={
              <RoleRoute role="nutritionist">
                <NutritionistAppointments />
              </RoleRoute>
            } 
          />

          <Route 
            path="/Ai" 
            element={<ProtectedRoute><Aifull /></ProtectedRoute>} 
          />

          <Route 
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;