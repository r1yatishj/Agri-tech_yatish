import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FarmManagement from './pages/FarmManagement';
import SoilAnalysis from './pages/SoilAnalysis';
import WeatherPestRadar from './pages/WeatherPestRadar';
import Marketplace from './pages/Marketplace';
import CommunityForum from './pages/CommunityForum';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';

// Protected Route Guard
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading AgriTech...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { t } = useLanguage();
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farms"
            element={
              <ProtectedRoute>
                <FarmManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soil"
            element={
              <ProtectedRoute>
                <SoilAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <WeatherPestRadar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityForum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation"
            element={
              <ProtectedRoute>
                <CommunityForum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-top py-3 mt-auto">
        <div className="container-fluid px-lg-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
          <div>
            <strong>AgriTech</strong> — Empowering Farmers Through Digital Technology (MERN Stack Architecture)
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>Soil Telemetry</span>
            <span>•</span>
            <span>Pathogen Radar</span>
            <span>•</span>
            <span className="badge bg-success-subtle text-success">API Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
