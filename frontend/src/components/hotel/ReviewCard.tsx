import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Review } from '../../types';
import { StarRating } from '../ui/StarRating';

interface ReviewCardProps {
  review: Review;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return avatarColors[hash % avatarColors.length];
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const initials = getInitials(review.userName || 'Anonymous');
  const color = getAvatarColor(review.userName || '');
  const timeAgo = review.createdAt
    ? formatDistanceToNow(parseISO(review.createdAt), { addSuffix: true })
    : '';

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-card">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${color}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-text-primary text-sm truncate">
              {review.userName || 'Guest'}
            </p>
            <span className="text-xs text-text-secondary whitespace-nowrap">{timeAgo}</span>
          </div>
          <StarRating rating={review.rating} size="sm" className="mt-0.5" />
        </div>
      </div>
      {review.title && (
        <h4 className="font-semibold text-text-primary text-sm mb-1">{review.title}</h4>
      )}
      {review.body && (
        <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>
      )}
    </div>
  );
};
