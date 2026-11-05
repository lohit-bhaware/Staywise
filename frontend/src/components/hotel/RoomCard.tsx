import React from 'react';
import { Users, Wifi, Coffee, AirVent } from 'lucide-react';
import { Room } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RoomCardProps {
  room: Room;
  onBook?: (room: Room) => void;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
}

const amenityIconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi size={13} />,
  'free wifi': <Wifi size={13} />,
  coffee: <Coffee size={13} />,
  ac: <AirVent size={13} />,
  'air conditioning': <AirVent size={13} />,
};

function getAmenityIcon(amenity: string): React.ReactNode {
  const key = amenity.toLowerCase();
  return amenityIconMap[key] || null;
}

function getImageFallback() {
  return `https://source.unsplash.com/400x250/?hotel,room,bedroom`;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onBook,
  checkIn,
  checkOut,
  nights,
}) => {
  const [imgSrc, setImgSrc] = React.useState(room.imageUrl || getImageFallback());
  const isAvailable = room.available !== false && room.isActive;

  return (
    <div
      className={[
        'bg-white rounded-2xl border shadow-card overflow-hidden transition-all duration-200',
        isAvailable
          ? 'border-border hover:shadow-card-hover hover:-translate-y-0.5'
          : 'border-border opacity-60',
      ].join(' ')}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-56 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={imgSrc}
            alt={room.name}
            onError={() => setImgSrc(getImageFallback())}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge variant={isAvailable ? 'info' : 'default'} size="sm">
              {room.type}
            </Badge>
          </div>
          {!isAvailable && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Badge variant="default" size="md">
                Unavailable
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-text-primary text-base">{room.name}</h3>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-primary">
                  ₹{room.pricePerNight.toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary">per night</p>
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
              {room.description}
            </p>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Users size={14} />
                <span className="text-xs">{room.capacity} guests max</span>
              </div>
            </div>

            {/* Room amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.slice(0, 5).map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100"
                  >
                    {getAmenityIcon(a)}
                    {a}
                  </span>
                ))}
                {room.amenities.length > 5 && (
                  <span className="text-xs text-text-secondary self-center">
                    +{room.amenities.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            {nights && nights > 0 ? (
              <div className="text-sm">
                <span className="text-text-secondary">{nights} nights · </span>
                <span className="font-bold text-text-primary">
                  ₹{(room.pricePerNight * nights).toLocaleString()} total
                </span>
              </div>
            ) : (
              <div />
            )}
            <Button
              size="sm"
              disabled={!isAvailable}
              onClick={() => onBook?.(room)}
              variant={isAvailable ? 'primary' : 'secondary'}
            >
              {isAvailable ? 'Book Now' : 'Unavailable'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
