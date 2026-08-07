// src/pages/HomePage.js - Campus Bulletin Board Homepage
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI } from '../services/api';
import ServiceCard from '../components/common/ServiceCard';
import { ServiceCardSkeleton } from '../components/common/Loading';
import { motion, useInView } from 'framer-motion';
import {
  FiSearch, FiArrowRight, FiCode, FiPenTool, FiVideo,
  FiMic, FiBook, FiTrendingUp, FiZap, FiUsers, FiStar, FiLayers,
} from 'react-icons/fi';

const CATEGORIES = [
  { label: 'Web Dev', icon: FiCode },
  { label: 'Design', icon: FiPenTool },
  { label: 'Video', icon: FiVideo },
  { label: 'Audio', icon: FiMic },
  { label: 'Tutoring', icon: FiBook },
  { label: 'Marketing', icon: FiTrendingUp },
];

const STATS = [
  { value: '500+', label: 'Active Students', icon: FiUsers },
  { value: '1,200+', label: 'Services Posted', icon: FiLayers },
  { value: '3,000+', label: 'Orders Done', icon: FiZap },
  { value: '4.8★', label: 'Avg Rating', icon: FiStar },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up, choose your role as buyer or seller, and showcase your skills.' },
  { step: '02', title: 'Browse or Post Services', desc: 'Find the perfect freelancer or list your own service for others to discover.' },
  { step: '03', title: 'Collaborate & Grow', desc: 'Place orders, communicate in real-time, and build your portfolio.' },
];

/* ── Animation variants ──────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
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
    opacity: 1, scale: 1,
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
    className="card group relative overflow-hidden p-6 text-center"
    whileHover={{ scale: 1.03, y: -3 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <div className="relative z-10">
      <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-brand-500/10 flex items-center justify-center">
        <Icon className="text-brand-500" size={20} />
      </div>
      <p className="text-3xl font-display font-bold text-surface-900 mb-1 tracking-tight">{value}</p>
      <p className="text-sm text-surface-700">{label}</p>
    </div>
  </motion.div>
);

/* ── Category Pill ────────────────────────────────────────────────────── */
const CategoryPill = ({ label, icon: Icon, onClick }) => (
  <motion.button
    variants={scaleIn}
    whileHover={{ scale: 1.06, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium text-surface-700 hover:text-surface-900 transition-colors border border-surface-900/10 bg-surface-200 hover:border-brand-500/30"
  >
    <div className="w-7 h-7 rounded-md bg-brand-500/10 flex items-center justify-center">
      <Icon size={14} className="text-brand-500" />
    </div>
    <span className="font-mono text-xs">{label}</span>
  </motion.button>
);

/* ── How-It-Works Card ────────────────────────────────────────────────── */
const StepCard = ({ step, title, desc, index }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    whileHover={{ y: -6 }}
    className="card group relative overflow-hidden p-8"
  >
    {/* Large step watermark */}
    <div className="absolute -top-2 -right-2 text-[80px] font-display font-black leading-none text-surface-900/[0.04] select-none pointer-events-none">
      {step}
    </div>

    <div className="relative z-10">
      <div className="w-12 h-12 rounded-lg bg-brand-500 flex items-center justify-center mb-5">
        <span className="text-white font-display font-bold text-sm">{step}</span>
      </div>
      <h3 className="text-xl font-display font-bold text-surface-900 mb-3">{title}</h3>
      <p className="text-surface-700 text-sm leading-relaxed">{desc}</p>
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
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="section">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left — Content (3 cols) */}
            <div className="lg:col-span-3">
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-md text-xs font-mono bg-surface-200 border border-surface-900/10 text-surface-700 mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                by students, for students
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-surface-900 mb-6 leading-[1.05] tracking-tight"
              >
                Trade Skills,
                <br />
                <span className="text-brand-500">Build Careers.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-lg text-surface-700 mb-10 max-w-xl leading-relaxed"
              >
                A peer-to-peer campus marketplace where students buy & sell freelance
                services — no middlemen, no fluff.
              </motion.p>

              {/* Search */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onSubmit={handleSearch}
                className="flex items-center gap-3 max-w-xl card p-2 mb-8"
              >
                <FiSearch className="text-surface-700 ml-3 shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Search for web design, video editing, tutoring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-surface-900 placeholder-surface-700/50 outline-none text-sm py-2"
                  id="hero-search-input"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary text-sm rounded-md whitespace-nowrap"
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
                className="flex flex-wrap gap-3"
              >
                {CATEGORIES.map((cat) => (
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

            {/* Right — Photo collage (2 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 hidden lg:block relative"
            >
              <div className="relative w-full h-[420px]">
                {/* Pinned photo 1 */}
                <div className="absolute top-0 left-4 w-48 h-64 rounded-lg overflow-hidden border border-surface-900/10 shadow-md transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" alt="Students collaborating" className="w-full h-full object-cover" />
                </div>
                {/* Pinned photo 2 */}
                <div className="absolute top-8 right-0 w-44 h-56 rounded-lg overflow-hidden border border-surface-900/10 shadow-md transform rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80" alt="Student working" className="w-full h-full object-cover" />
                </div>
                {/* Pinned photo 3 */}
                <div className="absolute bottom-0 left-12 w-52 h-48 rounded-lg overflow-hidden border border-surface-900/10 shadow-md transform rotate-[1.5deg] hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&q=80" alt="Laptop work" className="w-full h-full object-cover" />
                </div>
                {/* Handwritten tag */}
                <div className="absolute bottom-4 right-8 px-3 py-1.5 rounded-md bg-brand-500 text-white text-xs font-mono transform rotate-[-2deg] shadow-sm">
                  500+ students
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BENTO GRID ═══════════════════════════════════════════ */}
      <AnimSection className="section py-16" delay={0}>
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
      <AnimSection className="section pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.h2 variants={fadeUp} className="text-3xl font-display font-bold text-surface-900 mb-2">
              Top-Rated Services
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-surface-700 text-sm">
              Discover what your peers are offering
            </motion.p>
          </div>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/services" className="btn-secondary text-sm group" id="view-all-services-cta">
              View all{' '}
              <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
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
                <motion.div key={s._id} variants={scaleIn} custom={i}
                  style={{ transform: i % 3 === 1 ? 'rotate(0.8deg)' : i % 3 === 2 ? 'rotate(-0.5deg)' : 'none' }}
                >
                  <ServiceCard service={s} />
                </motion.div>
              ))}
        </motion.div>
      </AnimSection>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
      <AnimSection className="section pb-16">
        <div className="text-center mb-14">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-widest text-brand-500 bg-brand-500/8 border border-brand-500/15 mb-4">
            How It Works
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-display font-bold text-surface-900 mb-3">
            Simple, fast, and built for students
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-surface-700 max-w-lg mx-auto">
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
      </AnimSection>

      {/* ═══ CTA ═════════════════════════════════════════════════════════ */}
      <AnimSection className="section pb-24">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="card relative overflow-hidden p-12 sm:p-16 text-center"
        >
          <div className="relative z-10">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-bold text-surface-900 mb-4">
              Ready to get started?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-surface-700 mb-8 max-w-md mx-auto">
              Join hundreds of students already earning money and getting work done on SkillSync.
            </motion.p>

            <motion.div variants={fadeUp} custom={2} className="flex items-center justify-center gap-4 flex-wrap">
              {!isAuthenticated && (
                <Link to="/register" className="btn-primary text-base px-8 py-3" id="cta-register">
                  Create Free Account
                </Link>
              )}
              <Link to="/services" className="btn-secondary text-base px-8 py-3 group" id="cta-browse">
                Browse Services{' '}
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimSection>
    </div>
  );
};

export default HomePage;
