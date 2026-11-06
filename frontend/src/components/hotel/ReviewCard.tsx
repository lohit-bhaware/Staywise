import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
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
  'bg-primary',
  'bg-primary-light',
  'bg-sand-500',
  'bg-sage-600',
  'bg-accent-dark',
  'bg-sage-700',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return avatarColors[hash % avatarColors.length];
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const name = review.userFullName || 'Guest';
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const timeAgo = review.createdAt
    ? formatDistanceToNow(parseISO(review.createdAt), { addSuffix: true })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${color}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="font-medium text-text-primary text-sm truncate">
                {name}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-primary bg-sand-100 px-1.5 py-0.5 rounded-full border border-sand-200/80 font-medium">
                <CheckCircle2 size={10} /> Verified Stay
              </span>
            </div>
            <span className="text-xs text-text-secondary whitespace-nowrap">{timeAgo}</span>
          </div>
          <StarRating rating={review.rating} size="sm" className="mt-1" />
        </div>
      </div>
      {review.title && (
        <h4 className="font-serif font-semibold text-text-primary text-sm mb-1">{review.title}</h4>
      )}
      {review.body && (
        <p className="text-xs text-text-secondary leading-relaxed">{review.body}</p>
      )}
    </div>
  );
};
