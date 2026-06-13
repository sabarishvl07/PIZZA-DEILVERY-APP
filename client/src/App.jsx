import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Protected Route wrappers
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layout Components
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// User Pages
import Dashboard from './pages/Dashboard';
import CustomPizza from './pages/CustomPizza';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Protected Customer Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/build-pizza" element={
                  <ProtectedRoute>
                    <CustomPizza />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
