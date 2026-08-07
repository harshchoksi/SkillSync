// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase, FiShoppingBag } from 'react-icons/fi';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to SkillSync 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential, form.role, 'register');
      toast.success('Account created! Welcome to SkillSync 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-forest-500 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        <div className="relative z-10">
          <Link to="/" className="font-display font-bold text-surface-50 text-2xl tracking-tight">
            Skill<span className="text-brand-300">Sync</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-display font-bold text-surface-50 mb-4 leading-tight">
            Trade Skills,<br />Build Careers.
          </h2>
          <p className="text-surface-200/70 text-sm font-mono">join 500+ students already trading skills</p>
        </div>

        <div className="relative z-10 flex -space-x-3">
          {[
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&q=80',
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&q=80',
            'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=100&q=80',
          ].map((src, i) => (
            <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-forest-500 object-cover" />
          ))}
          <div className="w-10 h-10 rounded-full bg-brand-500 border-2 border-forest-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">500+</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-surface-50">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-surface-900">Create your account</h1>
              <p className="text-surface-700 text-sm mt-1">Start trading skills with your campus community</p>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'buyer', label: 'Hire Talent', sub: 'Find & buy services', icon: FiShoppingBag },
                  { value: 'seller', label: 'Offer Services', sub: 'Sell my skills', icon: FiBriefcase },
                ].map(({ value, label, sub, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      form.role === value
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-surface-900/10 bg-surface-200/50 hover:border-surface-900/20'
                    }`}>
                    <Icon size={18} className={form.role === value ? 'text-brand-500 mb-2' : 'text-surface-700 mb-2'} />
                    <p className={`text-sm font-semibold ${form.role === value ? 'text-surface-900' : 'text-surface-700'}`}>{label}</p>
                    <p className="text-xs text-surface-700 mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Google Sign-Up */}
            <div className="flex justify-center mb-5" id="google-register-btn">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-up was cancelled or failed.')}
                theme="outline"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-surface-900/10" />
              <span className="text-xs text-surface-700 uppercase tracking-wider font-medium">or register with email</span>
              <div className="flex-1 h-px bg-surface-900/10" />
            </div>

            {/* Email registration form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-700" size={17} />
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Rahul Sharma" className="input pl-10" required />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-700" size={17} />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@college.edu" className="input pl-10" required />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-700" size={17} />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="Min. 6 characters" className="input pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-700 hover:text-surface-900 transition-colors">
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-surface-700 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
