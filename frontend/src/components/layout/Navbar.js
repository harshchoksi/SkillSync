// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiPlusCircle,
  FiShoppingBag, FiMessageCircle, FiChevronDown, FiShield,
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-brand-400' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-white/8">
      <div className="section">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="SkillSync Logo" className="w-12 h-12 object-cover rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-brand-500/20" />
            <span className="font-extrabold text-white text-2xl tracking-tight hidden sm:block">
              Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">Sync</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {(!isAuthenticated || !isAdmin) && (
              <NavLink to="/services" className={navLinkClass}>Browse Services</NavLink>
            )}
            {isAuthenticated && (
              <>
                {!isAdmin && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
                <NavLink to="/chat" className={navLinkClass}>Messages</NavLink>
                {isSeller && !isAdmin && (
                  <NavLink to="/services/create" className={navLinkClass}>+ Post Service</NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <span className="flex items-center gap-1"><FiShield size={14} /> Admin</span>
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <span className="text-brand-400 font-semibold text-sm">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface-800 border border-white/10 rounded-2xl shadow-2xl py-1 animate-fade-in">
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
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-surface-950 animate-fade-in">
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
        </div>
      )}
    </nav>
  );
};

const MobileLink = ({ to, label, icon, onClick }) => (
  <NavLink to={to} onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isActive ? 'bg-brand-500/10 text-brand-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`
    }>
    {icon} {label}
  </NavLink>
);

export default Navbar;
