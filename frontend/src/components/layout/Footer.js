// src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { isAuthenticated, user, isAdmin, isSeller } = useAuth();

  return (
    <footer className="border-t border-white/8 mt-20">
    <div className="section py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.png" alt="SkillSync Logo" className="w-8 h-8 object-cover rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-brand-500/20" />
            <span className="font-extrabold text-white text-xl tracking-tight">Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">Sync</span></span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            The peer-to-peer student skill marketplace. Connect, learn, and grow together.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
          <ul className="space-y-2">
            {(!isAuthenticated || !isAdmin) && <li><Link to="/services" className="text-slate-400 hover:text-white text-sm transition-colors">Browse Services</Link></li>}
            {isSeller && !isAdmin && <li><Link to="/services/create" className="text-slate-400 hover:text-white text-sm transition-colors">Post a Service</Link></li>}
            {isAuthenticated && !isAdmin && <li><Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>}
            {isAdmin && <li><Link to="/admin" className="text-slate-400 hover:text-white text-sm transition-colors">Admin Panel</Link></li>}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
          <ul className="space-y-2">
            {!isAuthenticated ? (
              <>
                <li><Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-white text-sm transition-colors">Register</Link></li>
              </>
            ) : (
              <>
                {!isAdmin && <li><Link to={`/profile/${user?._id}`} className="text-slate-400 hover:text-white text-sm transition-colors">My Profile</Link></li>}
                <li><Link to="/chat" className="text-slate-400 hover:text-white text-sm transition-colors">Messages</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} SkillSync. Built for students, by students.</p>
        <div className="flex items-center gap-4">
          {[FiGithub, FiTwitter, FiLinkedin].map((Icon, i) => (
            <a key={i} href="#" className="text-slate-500 hover:text-white transition-colors">
              <Icon size={17} />
            </a>
          ))}
        </div>
      </div>
    </div>
    </footer>
  );
};

export default Footer;
