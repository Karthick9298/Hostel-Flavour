import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ 
  rating = 0, 
  onChange, 
  size = 'md', 
  readonly = false,
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <FaStar
            key={value}
            className={`
              star ${sizeClasses[size]}
              ${(hoverRating || rating) >= value ? 'filled' : 'empty'}
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
            `}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {(hoverRating || rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
