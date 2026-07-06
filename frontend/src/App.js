// src/App.js - Root component with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// 3D Background
import AnimatedBackground from './components/3d/AnimatedBackground';

// Route guard
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CreateServicePage from './pages/CreateServicePage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

/* Page transition wrapper */
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

/* Animated Routes wrapper */
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
        <Route path="/services/:id" element={<PageTransition><ServiceDetailPage /></PageTransition>} />
        <Route path="/profile/:id" element={<PageTransition><ProfilePage /></PageTransition>} />

        {/* Protected: any authenticated user */}
        <Route path="/dashboard" element={
          <ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><PageTransition><ChatPage /></PageTransition></ProtectedRoute>
        } />

        {/* Protected: seller only */}
        <Route path="/services/create" element={
          <ProtectedRoute requireRole="seller"><PageTransition><CreateServicePage /></PageTransition></ProtectedRoute>
        } />
        <Route path="/services/edit/:id" element={
          <ProtectedRoute><PageTransition><CreateServicePage /></PageTransition></ProtectedRoute>
        } />

        {/* Protected: admin only */}
        <Route path="/admin" element={
          <ProtectedRoute requireRole="admin"><PageTransition><AdminPage /></PageTransition></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          {/* Animated gradient background */}
          <AnimatedBackground />

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(20px)',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          <div className="flex flex-col min-h-screen relative">
            <Navbar />

            <main className="flex-1">
              <AnimatedRoutes />
            </main>

            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
