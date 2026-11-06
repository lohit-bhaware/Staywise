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
  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop';
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onBook,
  checkIn: _checkIn,
  checkOut: _checkOut,
  nights,
}) => {
  const [imgSrc, setImgSrc] = React.useState(room.imageUrl || getImageFallback());
  const isAvailable = room.available !== false && room.isActive;

  return (
    <div
      className={[
        'bg-white rounded-2xl border shadow-card overflow-hidden transition-[transform,box-shadow] duration-200',
        isAvailable
          ? 'border-border hover:shadow-card-hover hover:-translate-y-0.5'
          : 'border-border opacity-60',
      ].join(' ')}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-60 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={imgSrc}
            alt={room.name}
            onError={() => setImgSrc(getImageFallback())}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 left-2.5">
            <Badge variant={isAvailable ? 'info' : 'default'} size="sm">
              {room.type}
            </Badge>
          </div>
          {!isAvailable && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
              <Badge variant="default" size="md">
                Unavailable
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-serif font-semibold text-text-primary text-base">{room.name}</h3>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-primary leading-tight">
                  ₹{room.pricePerNight.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">per night</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
              {room.description}
            </p>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Users size={14} />
                <span className="text-xs">{room.capacity} {room.capacity === 1 ? 'guest' : 'guests'} max</span>
              </div>
            </div>

            {/* Room amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.slice(0, 5).map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 text-[11px] bg-sand-50 text-text-primary px-2.5 py-1 rounded-md border border-border/70"
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
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/80">
            {nights && nights > 0 ? (
              <div className="text-xs">
                <span className="text-text-secondary">{nights} night{nights !== 1 ? 's' : ''} · </span>
                <span className="font-semibold text-text-primary">
                  ₹{(room.pricePerNight * nights).toLocaleString('en-IN')} total
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
              {isAvailable ? 'Reserve Suite' : 'Unavailable'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
