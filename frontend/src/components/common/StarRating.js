// src/components/common/StarRating.js
import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

// Display-only star rating
export const StarDisplay = ({ rating, size = 14, showNumber = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <FiStar
        key={star}
        size={size}
        className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
      />
    ))}
    {showNumber && <span className="text-amber-400 text-sm font-semibold ml-1">{rating?.toFixed(1)}</span>}
  </div>
);

// Interactive star picker
const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <FiStar
            size={28}
            className={
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-600 hover:text-amber-300'
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-slate-400">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
};

export default StarRating;
