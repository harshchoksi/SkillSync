// src/components/layout/Navbar.js - Campus bulletin board navbar
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
      isActive ? 'text-brand-500' : 'text-surface-700 hover:text-surface-900'
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
          ? 'campus-navbar shadow-sm'
          : 'bg-surface-50/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="section">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <span className="font-display font-bold text-surface-900 text-xl tracking-tight">
              Skill<span className="text-brand-500">Sync</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {(!isAuthenticated || !isAdmin) && (
              <NavLink to="/services" className={navLinkClass}>
                Browse Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-300" />
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                {!isAdmin && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-300" />
                  </NavLink>
                )}
                <NavLink to="/chat" className={navLinkClass}>
                  Messages
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-300" />
                </NavLink>
                {isSeller && !isAdmin && (
                  <NavLink to="/services/create" className={navLinkClass}>
                    + Post Service
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-300" />
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <span className="flex items-center gap-1"><FiShield size={14} /> Admin</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all duration-300" />
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-900/5 transition-colors"
                >
                  {(user?.profileImage || user?.avatar) ? (
                    <img src={user.profileImage || user.avatar} alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-surface-900">{user?.name?.split(' ')[0]}</span>
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }}>
                    <FiChevronDown size={14} className="text-surface-700" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-52 campus-dropdown rounded-lg py-1 overflow-hidden"
                    >
                      {!isAdmin && (
                        <Link to={`/profile/${user?._id}`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:text-surface-900 hover:bg-surface-900/5 transition-colors"
                          onClick={() => setDropdownOpen(false)}>
                          <FiUser size={15} /> My Profile
                        </Link>
                      )}
                      {!isAdmin && (
                        <Link to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:text-surface-900 hover:bg-surface-900/5 transition-colors"
                          onClick={() => setDropdownOpen(false)}>
                          <FiGrid size={15} /> Dashboard
                        </Link>
                      )}
                      <Link to="/chat"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:text-surface-900 hover:bg-surface-900/5 transition-colors"
                        onClick={() => setDropdownOpen(false)}>
                        <FiMessageCircle size={15} /> Messages
                      </Link>
                      <div className="border-t border-surface-900/8 my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
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
                  <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-surface-700 hover:text-surface-900"
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
            className="md:hidden border-t border-surface-900/8 bg-surface-50 overflow-hidden"
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
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2">
                    <FiLogOut /> Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" className="btn-secondary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Sign Up</Link>
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
      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-brand-500/10 text-brand-500' : 'text-surface-700 hover:bg-surface-900/5 hover:text-surface-900'
      }`
    }>
    {icon} {label}
  </NavLink>
);

export default Navbar;
