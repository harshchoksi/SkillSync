// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';
import ServiceCard from '../components/common/ServiceCard';
import { ServiceCardSkeleton } from '../components/common/Loading';
import { FiSearch, FiArrowRight, FiCode, FiPenTool, FiVideo, FiMic, FiBook, FiTrendingUp } from 'react-icons/fi';

const CATEGORIES = [
  { label: 'Web Dev', icon: FiCode, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Design', icon: FiPenTool, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Video', icon: FiVideo, color: 'text-red-400', bg: 'bg-red-500/10' },
  { label: 'Audio', icon: FiMic, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Tutoring', icon: FiBook, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Marketing', icon: FiTrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

const STATS = [
  { value: '500+', label: 'Active Students' },
  { value: '1,200+', label: 'Services Posted' },
  { value: '3,000+', label: 'Orders Completed' },
  { value: '4.8★', label: 'Avg Rating' },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data } = await serviceAPI.getAll({ sort: 'rating', limit: 6 });
        setFeaturedServices(data.services);
      } catch (err) {
        console.error('Failed to load featured services');
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

        <div className="section relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-sm font-medium mb-6 animate-fade-up">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            Student-Powered Freelance Marketplace
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Trade Skills,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              Build Careers
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Buy and sell services from talented students in your college community.
            Get projects done or earn money showcasing your skills.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch}
            className="flex items-center gap-3 max-w-xl mx-auto bg-surface-800 border border-white/10 rounded-2xl p-2 mb-10 animate-fade-up"
            style={{ animationDelay: '0.3s' }}>
            <FiSearch className="text-slate-400 ml-2 shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search for web design, video editing, tutoring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
            />
            <button type="submit" className="btn-primary text-sm rounded-xl whitespace-nowrap">
              Search <FiArrowRight size={15} />
            </button>
          </form>

          {/* Category shortcuts */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {CATEGORIES.map(({ label, icon: Icon, color, bg }) => (
              <button
                key={label}
                onClick={() => navigate(`/services?category=${encodeURIComponent(label === 'Web Dev' ? 'Web Development' : label)}`)}
                className={`flex items-center gap-2 px-4 py-2 ${bg} border border-white/8 rounded-xl text-sm font-medium ${color} hover:scale-105 transition-transform`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="section mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="card text-center py-6 px-4">
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              <p className="text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED SERVICES ───────────────────────────────── */}
      <section className="section mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Top-Rated Services</h2>
            <p className="text-slate-400 text-sm mt-1">Discover what your peers are offering</p>
          </div>
          <Link to="/services" className="btn-secondary text-sm">
            View all <FiArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            : featuredServices.map((s) => <ServiceCard key={s._id} service={s} />)
          }
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="section mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">How SkillSync Works</h2>
          <p className="text-slate-400">Simple, fast, and built for students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Create Your Profile', desc: 'Sign up, choose your role as buyer or seller, and showcase your skills.' },
            { step: '02', title: 'Browse or Post Services', desc: 'Find the perfect freelancer or list your own service for others to discover.' },
            { step: '03', title: 'Collaborate & Grow', desc: 'Place orders, communicate in real-time, and build your portfolio and reputation.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="card p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-black text-white/4">{step}</div>
              <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center mb-4">
                <span className="text-brand-400 font-bold text-sm">{step}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="section mb-20">
        <div className="card p-10 text-center bg-gradient-to-br from-brand-500/10 to-accent-500/5 border-brand-500/20">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join hundreds of students already earning money and getting work done on SkillSync.
          </p>
          <div className="flex items-center justify-center gap-4">
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary">Create Free Account</Link>
            )}
            <Link to="/services" className="btn-secondary">Browse Services</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
