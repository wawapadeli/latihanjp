import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardStaf from './pages/DashboardStaf';
import TambahKursus from './pages/TambahKursus';
import DashboardAdmin from './pages/DashboardAdmin';
import SemakKursusAdmin from './pages/SemakKursusAdmin';
import UrusStafAdmin from './pages/UrusStafAdmin';

function ProtectedRoute({ children, roleRequired }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <div style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: '#f0f4f8' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <LoginPage />} />

          {/* Staf routes */}
          <Route path="/dashboard" element={<ProtectedRoute roleRequired="staf"><DashboardStaf /></ProtectedRoute>} />
          <Route path="/kursus" element={<ProtectedRoute roleRequired="staf"><DashboardStaf /></ProtectedRoute>} />
          <Route path="/kursus/tambah" element={<ProtectedRoute roleRequired="staf"><TambahKursus /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/kursus" element={<ProtectedRoute roleRequired="admin"><SemakKursusAdmin /></ProtectedRoute>} />
          <Route path="/admin/staf" element={<ProtectedRoute roleRequired="admin"><UrusStafAdmin /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
