// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div className="animate-fade-up">
      <p className="text-8xl font-display font-black text-brand-500/25 mb-2">404</p>
      <h1 className="text-3xl font-display font-bold text-surface-900 mb-3">Page not found</h1>
      <p className="text-surface-700 mb-8 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/services" className="btn-secondary">Browse Services</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
