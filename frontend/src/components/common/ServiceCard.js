// src/components/common/ServiceCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiUser } from 'react-icons/fi';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

const ServiceCard = ({ service }) => {
  const { _id, title, category, price, deliveryTime, serviceImage, averageRating, totalReviews, seller } = service;

  return (
    <Link to={`/services/${_id}`} className="card-hover group block">
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <img
          src={serviceImage || PLACEHOLDER}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <span className="absolute top-3 left-3 tag-pill text-xs">{category}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Seller */}
        <div className="flex items-center gap-2 mb-2.5">
          {seller?.profileImage ? (
            <img src={seller.profileImage} alt={seller.name}
              className="w-6 h-6 rounded-full object-cover ring-2 ring-brand-500/30" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-brand-500/15 flex items-center justify-center">
              <FiUser size={11} className="text-brand-500" />
            </div>
          )}
          <span className="text-xs text-surface-700 font-medium">{seller?.name}</span>
        </div>

        {/* Title */}
        <h3 className="text-surface-900 font-display font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <FiStar size={13} className="text-amber-500 fill-amber-500" />
          <span className="text-amber-600 text-xs font-semibold">
            {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
          </span>
          {totalReviews > 0 && (
            <span className="text-surface-700 text-xs">({totalReviews})</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-900/8">
          <div className="flex items-center gap-1 text-surface-700 text-xs">
            <FiClock size={12} />
            <span>{deliveryTime}d delivery</span>
          </div>
          <div>
            <span className="text-xs text-surface-700">Starting at </span>
            <span className="text-surface-900 font-bold">₹{price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
