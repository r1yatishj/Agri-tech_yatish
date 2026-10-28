import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmManager from './pages/FarmManager';
import CropManager from './pages/CropManager';
import SoilAnalytics from './pages/SoilAnalytics';
import WeatherAndPests from './pages/WeatherAndPests';
import Marketplace from './pages/Marketplace';
import OrderTracking from './pages/OrderTracking';
import CommunityForum from './pages/CommunityForum';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes for Farmers & Admins */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farms"
            element={
              <ProtectedRoute>
                <FarmManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crops"
            element={
              <ProtectedRoute>
                <CropManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/soil-analytics"
            element={
              <ProtectedRoute>
                <SoilAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <WeatherAndPests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={<Marketplace onOpenCart={() => setIsCartOpen(true)} />}
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route path="/forum" element={<CommunityForum />} />

          {/* Protected Admin Only Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Cart Drawer / Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default App;
