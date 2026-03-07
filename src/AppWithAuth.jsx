import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import App from './App';

const AppWithAuth = () => {
  return (
    <AuthProvider>      <Router>        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected route - admin dashboard */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected route - main application */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppWithAuth;
