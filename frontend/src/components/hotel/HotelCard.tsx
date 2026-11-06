import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, TrendingUp } from 'lucide-react';
import { Hotel } from '../../types';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';

interface HotelCardProps {
  hotel: Hotel;
  rankReason?: string;
  checkIn?: string;
  checkOut?: string;
}

function getImageFallback(_city: string) {
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  rankReason,
  checkIn,
  checkOut,
}) => {
  const [imgSrc, setImgSrc] = React.useState(
    hotel.mainImageUrl || getImageFallback(hotel.city)
  );

  const searchParams = new URLSearchParams();
  if (checkIn) searchParams.set('checkIn', checkIn);
  if (checkOut) searchParams.set('checkOut', checkOut);
  const linkTo = `/hotels/${hotel.id}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={imgSrc}
          alt={hotel.name}
          onError={() => setImgSrc(getImageFallback(hotel.city))}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Stars overlay */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} size={10} className="text-accent fill-current" />
            ))}
          </div>
        </div>
        {/* Rank reason chip */}
        {rankReason && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
              <TrendingUp size={10} />
              {rankReason}
            </span>
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-text-primary text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-text-secondary">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="text-xs truncate">{hotel.area}, {hotel.city}</span>
          </div>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={hotel.avgRating} size="sm" />
          <span className="text-xs font-semibold text-text-primary">
            {hotel.avgRating > 0 ? hotel.avgRating.toFixed(1) : '—'}
          </span>
          {hotel.reviewCount > 0 && (
            <span className="text-xs text-text-secondary">
              ({hotel.reviewCount} reviews)
            </span>
          )}
        </div>

        {/* Amenities preview */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hotel.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100"
              >
                {a}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs text-text-secondary">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-xs text-text-secondary">
              {hotel.minPrice ? 'Starting from' : 'Rates'}
            </span>
            <p className="text-lg font-bold text-primary leading-tight">
              {hotel.minPrice ? (
                <>
                  ₹{hotel.minPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-text-secondary"> / night</span>
                </>
              ) : (
                'View Rooms'
              )}
            </p>
          </div>
          <Link to={linkTo}>
            <Button size="sm" variant="primary">
              View Hotel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
