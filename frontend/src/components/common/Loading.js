// src/components/common/Loading.js
import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

export const ServiceCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-44 rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton w-6 h-6 rounded-full" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
      <div className="border-t border-white/8 pt-3 flex justify-between">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center gap-4">
      <div className="skeleton w-20 h-20 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
    <div className="skeleton h-20 w-full rounded-xl" />
  </div>
);
