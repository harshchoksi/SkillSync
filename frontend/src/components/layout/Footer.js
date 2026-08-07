// src/components/layout/Footer.js - Campus warm footer
import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Footer = () => {
  const { isAuthenticated, user, isAdmin, isSeller } = useAuth();

  return (
    <footer className="relative border-t border-surface-900/10 mt-20 bg-surface-200/40">
      <div className="section py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display font-bold text-surface-900 text-xl tracking-tight">
                Skill<span className="text-brand-500">Sync</span>
              </span>
            </div>
            <p className="text-surface-700 text-sm leading-relaxed max-w-xs mb-6">
              The peer-to-peer student skill marketplace. Connect, learn, and grow together.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[FiGithub, FiTwitter, FiLinkedin].map((Icon, i) => (
                <motion.button
                  key={i}
                  type="button"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-surface-200 border border-surface-900/10 flex items-center justify-center text-surface-700 hover:text-brand-500 hover:border-brand-500/30 transition-all"
                >
                  <Icon size={16} />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-surface-900 font-display font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {(!isAuthenticated || !isAdmin) && (
                <li><Link to="/services" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Browse Services</Link></li>
              )}
              {isSeller && !isAdmin && (
                <li><Link to="/services/create" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Post a Service</Link></li>
              )}
              {isAuthenticated && !isAdmin && (
                <li><Link to="/dashboard" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Dashboard</Link></li>
              )}
              {isAdmin && (
                <li><Link to="/admin" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Admin Panel</Link></li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-surface-900 font-display font-semibold text-sm mb-4 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2.5">
              {!isAuthenticated ? (
                <>
                  <li><Link to="/login" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Login</Link></li>
                  <li><Link to="/register" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Register</Link></li>
                </>
              ) : (
                <>
                  {!isAdmin && <li><Link to={`/profile/${user?._id}`} className="text-surface-700 hover:text-brand-500 text-sm transition-colors">My Profile</Link></li>}
                  <li><Link to="/chat" className="text-surface-700 hover:text-brand-500 text-sm transition-colors">Messages</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-900/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-700 text-sm">
            © {new Date().getFullYear()} SkillSync. Built for students, by students.
          </p>
          <div className="flex items-center gap-6 text-xs text-surface-700">
            <span className="hover:text-brand-500 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-brand-500 transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-brand-500 transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
