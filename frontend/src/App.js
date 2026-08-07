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
          {/* Global toast notifications — campus theme */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#E8D5B7',
                color: '#2B2118',
                border: '1px solid rgba(43, 33, 24, 0.12)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: '"Inter", sans-serif',
              },
              success: { iconTheme: { primary: '#C8553D', secondary: '#fff' } },
              error: { iconTheme: { primary: '#C85555', secondary: '#fff' } },
            }}
          />

          <div className="flex flex-col min-h-screen relative paper-grain">
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
