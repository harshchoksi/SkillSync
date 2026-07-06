// src/components/layout/Footer.js - Premium glassmorphic footer
import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Footer = () => {
  const { isAuthenticated, user, isAdmin, isSeller } = useAuth();

  return (
    <footer className="relative border-t border-white/8 mt-20 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-20 bg-indigo-500/5 blur-3xl" />

      <div className="section py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="SkillSync Logo" className="w-9 h-9 object-cover rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-500/20" />
              <span className="font-extrabold text-white text-xl tracking-tight">
                Skill
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Sync
                </span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              The peer-to-peer student skill marketplace. Connect, learn, and grow together.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[FiGithub, FiTwitter, FiLinkedin].map((Icon, i) => (
                <motion.button
                  key={i}
                  type="button"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all"
                >
                  <Icon size={16} />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2.5">
              {(!isAuthenticated || !isAdmin) && (
                <li><Link to="/services" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Browse Services</Link></li>
              )}
              {isSeller && !isAdmin && (
                <li><Link to="/services/create" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Post a Service</Link></li>
              )}
              {isAuthenticated && !isAdmin && (
                <li><Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Dashboard</Link></li>
              )}
              {isAdmin && (
                <li><Link to="/admin" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Admin Panel</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Account</h4>
            <ul className="space-y-2.5">
              {!isAuthenticated ? (
                <>
                  <li><Link to="/login" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Login</Link></li>
                  <li><Link to="/register" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Register</Link></li>
                </>
              ) : (
                <>
                  {!isAdmin && <li><Link to={`/profile/${user?._id}`} className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">My Profile</Link></li>}
                  <li><Link to="/chat" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Messages</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} SkillSync. Built for students, by students.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
