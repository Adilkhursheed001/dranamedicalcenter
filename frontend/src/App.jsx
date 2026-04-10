import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// ... (rest of imports)
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import axios from 'axios';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

// Axios global setup
const token = localStorage.getItem('token');
if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

const adminToken = localStorage.getItem('adminToken');
if (adminToken) axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminProtectedRoute({ children }) {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  
  const handleLogin = (newToken) => {
    setAdminToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  if (!adminToken) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return children;
}

function ComingSoon() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '3.5rem' }}>🚧</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Coming Soon</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '360px' }}>
        We're working on something great. Check back soon.
      </p>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<ComingSoon />} />
        <Route path="/gallery" element={<ComingSoon />} />
        <Route path="/amount" element={<ComingSoon />} />
        <Route path="/contact" element={<Home />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1629',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#00c4b4', secondary: '#0f1629' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
