// src/components/layout/Navbar.js - Glassmorphic animated navbar
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiPlusCircle,
  FiShoppingBag, FiMessageCircle, FiChevronDown, FiShield,
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-all duration-300 relative group ${
      isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
    }`;

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-navbar shadow-2xl shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="section">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <motion.img
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              src="/logo.png"
              alt="SkillSync Logo"
              className="w-10 h-10 object-cover rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-500/30"
            />
            <span className="font-extrabold text-white text-xl tracking-tight hidden sm:block">
              Skill
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Sync
              </span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {(!isAuthenticated || !isAdmin) && (
              <NavLink to="/services" className={navLinkClass}>
                Browse Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                {!isAdmin && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
                  </NavLink>
                )}
                <NavLink to="/chat" className={navLinkClass}>
                  Messages
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
                </NavLink>
                {isSeller && !isAdmin && (
                  <NavLink to="/services/create" className={navLinkClass}>
                    + Post Service
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <span className="flex items-center gap-1"><FiShield size={14} /> Admin</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {(user?.profileImage || user?.avatar) ? (
                    <img src={user.profileImage || user.avatar} alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200">{user?.name?.split(' ')[0]}</span>
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }}>
                    <FiChevronDown size={14} className="text-slate-400" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-52 glass-dropdown rounded-2xl shadow-2xl py-1 overflow-hidden"
                    >
                      {!isAdmin && (
                        <Link to={`/profile/${user?._id}`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setDropdownOpen(false)}>
                          <FiUser size={15} /> My Profile
                        </Link>
                      )}
                      {!isAdmin && (
                        <Link to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setDropdownOpen(false)}>
                          <FiGrid size={15} /> Dashboard
                        </Link>
                      )}
                      <Link to="/chat"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setDropdownOpen(false)}>
                        <FiMessageCircle size={15} /> Messages
                      </Link>
                      <div className="border-t border-white/8 my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <FiLogOut size={15} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <FiX size={22} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <FiMenu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden border-t border-white/8 glass-navbar overflow-hidden"
          >
            <div className="section py-4 flex flex-col gap-1">
              {(!isAuthenticated || !isAdmin) && (
                <MobileLink to="/services" label="Browse Services" icon={<FiShoppingBag />} onClick={() => setMobileOpen(false)} />
              )}
              {isAuthenticated && (
                <>
                  {!isAdmin && <MobileLink to="/dashboard" label="Dashboard" icon={<FiGrid />} onClick={() => setMobileOpen(false)} />}
                  <MobileLink to="/chat" label="Messages" icon={<FiMessageCircle />} onClick={() => setMobileOpen(false)} />
                  {!isAdmin && <MobileLink to={`/profile/${user?._id}`} label="My Profile" icon={<FiUser />} onClick={() => setMobileOpen(false)} />}
                  {isSeller && !isAdmin && (
                    <MobileLink to="/services/create" label="Post a Service" icon={<FiPlusCircle />} onClick={() => setMobileOpen(false)} />
                  )}
                  {isAdmin && (
                    <MobileLink to="/admin" label="Admin Panel" icon={<FiShield />} onClick={() => setMobileOpen(false)} />
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-2">
                    <FiLogOut /> Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" className="btn-secondary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const MobileLink = ({ to, label, icon, onClick }) => (
  <NavLink to={to} onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`
    }>
    {icon} {label}
  </NavLink>
);

export default Navbar;
