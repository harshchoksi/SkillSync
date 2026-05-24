// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase, FiShoppingBag } from 'react-icons/fi';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Join SkillSync</h1>
            <p className="text-slate-400 text-sm mt-1">Create your free student account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Rahul Sharma" className="input pl-10" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@college.edu" className="input pl-10" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters" className="input pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'buyer', label: 'Hire Talent', sub: 'Find & buy services', icon: FiShoppingBag },
                  { value: 'seller', label: 'Offer Services', sub: 'Sell my skills', icon: FiBriefcase },
                ].map(({ value, label, sub, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.role === value
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}>
                    <Icon size={18} className={form.role === value ? 'text-brand-400 mb-2' : 'text-slate-400 mb-2'} />
                    <p className={`text-sm font-semibold ${form.role === value ? 'text-white' : 'text-slate-300'}`}>{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
