import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 12,
  md: 16,
  lg: 20,
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const iconSize = sizeMap[size];
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars.map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;

        return (
          <span key={star} className="relative inline-flex">
            {/* Empty star background */}
            <Star
              size={iconSize}
              className="text-sand-200"
              fill="currentColor"
            />
            {/* Filled overlay */}
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : '50%' }}
              >
                <Star
                  size={iconSize}
                  className="text-accent"
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
      {showValue && (
        <span className={`ml-1 font-semibold text-text-primary ${textSizeMap[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
