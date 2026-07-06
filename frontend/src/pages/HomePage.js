// src/pages/HomePage.js - Quantum Nexus 3D Homepage
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';
import ServiceCard from '../components/common/ServiceCard';
import { ServiceCardSkeleton } from '../components/common/Loading';
import HeroScene from '../components/3d/HeroScene';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  FiSearch, FiArrowRight, FiCode, FiPenTool, FiVideo,
  FiMic, FiBook, FiTrendingUp, FiZap, FiUsers, FiStar, FiLayers,
} from 'react-icons/fi';

const CATEGORIES = [
  { label: 'Web Dev', icon: FiCode, gradient: 'from-blue-500 to-cyan-400' },
  { label: 'Design', icon: FiPenTool, gradient: 'from-purple-500 to-pink-400' },
  { label: 'Video', icon: FiVideo, gradient: 'from-red-500 to-orange-400' },
  { label: 'Audio', icon: FiMic, gradient: 'from-emerald-500 to-green-400' },
  { label: 'Tutoring', icon: FiBook, gradient: 'from-amber-500 to-yellow-400' },
  { label: 'Marketing', icon: FiTrendingUp, gradient: 'from-indigo-500 to-violet-400' },
];

const STATS = [
  { value: '500+', label: 'Active Students', icon: FiUsers },
  { value: '1,200+', label: 'Services Posted', icon: FiLayers },
  { value: '3,000+', label: 'Orders Done', icon: FiZap },
  { value: '4.8★', label: 'Avg Rating', icon: FiStar },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Sign up, choose your role as buyer or seller, and showcase your skills.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    step: '02',
    title: 'Browse or Post Services',
    desc: 'Find the perfect freelancer or list your own service for others to discover.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    step: '03',
    title: 'Collaborate & Grow',
    desc: 'Place orders, communicate in real-time, and build your portfolio.',
    gradient: 'from-pink-500 to-orange-500',
  },
];

/* ── Animation variants ──────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Animated Section Wrapper ─────────────────────────────────────────── */
const AnimSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.section>
  );
};

/* ── Bento Stats Card ─────────────────────────────────────────────────── */
const StatCard = ({ value, label, icon: Icon, index }) => (
  <motion.div
    variants={scaleIn}
    custom={index}
    className="glass-card group relative overflow-hidden p-6 text-center"
    whileHover={{ scale: 1.04, y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {/* Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
        <Icon className="text-indigo-400" size={20} />
      </div>
      <p className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </motion.div>
);

/* ── Category Pill ────────────────────────────────────────────────────── */
const CategoryPill = ({ label, icon: Icon, gradient, onClick }) => (
  <motion.button
    variants={scaleIn}
    whileHover={{ scale: 1.08, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="glass-pill group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-medium text-white/80 hover:text-white transition-colors"
  >
    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
      <Icon size={14} className="text-white" />
    </div>
    {label}
  </motion.button>
);

/* ── How-It-Works Card ────────────────────────────────────────────────── */
const StepCard = ({ step, title, desc, gradient, index }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    whileHover={{ y: -8 }}
    className="glass-card group relative overflow-hidden p-8"
  >
    {/* Large step watermark */}
    <div className="absolute -top-2 -right-2 text-[80px] font-black leading-none text-white/[0.03] select-none pointer-events-none">
      {step}
    </div>

    {/* Gradient border glow on hover */}
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-700`} />

    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
        <span className="text-white font-bold text-sm">{step}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);


/* ══════════════════════════════════════════════════════════════════════
   HOMEPAGE COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

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
    <div className="min-h-screen overflow-hidden">

      {/* ═══ HERO SECTION ═══════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      >
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>

        {/* Gradient overlays for text contrast */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950/40 via-transparent to-surface-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/50 via-transparent to-surface-950/50" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 section text-center px-4">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 px-5 py-2 glass-pill rounded-full text-sm font-medium mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400" />
            </span>
            <span className="text-indigo-300">Student-Powered Freelance Marketplace</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-[1.05] tracking-tight"
          >
            Trade Skills,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Build Careers
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Buy and sell services from talented students in your college community.
            Get projects done or earn money showcasing your skills.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onSubmit={handleSearch}
            className="flex items-center gap-3 max-w-xl mx-auto glass-card p-2 mb-10"
          >
            <FiSearch className="text-slate-400 ml-3 shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search for web design, video editing, tutoring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm py-2"
              id="hero-search-input"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-sm rounded-xl whitespace-nowrap"
              id="hero-search-button"
            >
              Search <FiArrowRight size={15} />
            </motion.button>
          </motion.form>

          {/* Categories */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3"
          >
            {CATEGORIES.map((cat, i) => (
              <CategoryPill
                key={cat.label}
                {...cat}
                onClick={() =>
                  navigate(
                    `/services?category=${encodeURIComponent(
                      cat.label === 'Web Dev' ? 'Web Development' : cat.label
                    )}`
                  )
                }
              />
            ))}
          </motion.div>
        </div>

        {/* Bottom fade to sections */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-950 to-transparent z-10 pointer-events-none" />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══ STATS BENTO GRID ═══════════════════════════════════════════ */}
      <AnimSection className="section py-20" delay={0}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </motion.div>
      </AnimSection>

      {/* ═══ FEATURED SERVICES ═══════════════════════════════════════════ */}
      <AnimSection className="section pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold text-white mb-2"
            >
              Top-Rated Services
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-sm">
              Discover what your peers are offering
            </motion.p>
          </div>
          <motion.div variants={fadeUp} custom={2}>
            <Link
              to="/services"
              className="btn-secondary text-sm group"
              id="view-all-services-cta"
            >
              View all{' '}
              <FiArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)
            : featuredServices.map((s, i) => (
                <motion.div key={s._id} variants={scaleIn} custom={i}>
                  <ServiceCard service={s} />
                </motion.div>
              ))}
        </motion.div>
      </AnimSection>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
      <AnimSection className="section pb-20">
        <div className="text-center mb-14">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 glass-pill rounded-full text-xs font-medium uppercase tracking-widest text-indigo-300 mb-4">
            How It Works
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Simple, fast, and built for students
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-slate-400 max-w-lg mx-auto">
            Get started in three easy steps
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {HOW_IT_WORKS.map((item, i) => (
            <StepCard key={item.step} {...item} index={i} />
          ))}
        </motion.div>

        {/* Connector line (desktop only) */}
        <div className="hidden md:block relative mt-[-220px] mb-[180px] pointer-events-none">
          <div className="absolute left-[16.67%] right-[16.67%] top-1/2 h-px">
            <div className="w-full h-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30" />
          </div>
        </div>
      </AnimSection>

      {/* ═══ CTA ═════════════════════════════════════════════════════════ */}
      <AnimSection className="section pb-24">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-card relative overflow-hidden p-12 sm:p-16 text-center"
        >
          {/* Animated glow blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10">
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Ready to get started?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 mb-8 max-w-md mx-auto">
              Join hundreds of students already earning money and getting work done
              on SkillSync.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              {!isAuthenticated && (
                <Link to="/register" className="btn-primary text-base px-8 py-3" id="cta-register">
                  Create Free Account
                </Link>
              )}
              <Link to="/services" className="btn-secondary text-base px-8 py-3 group" id="cta-browse">
                Browse Services{' '}
                <FiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimSection>
    </div>
  );
};

export default HomePage;
