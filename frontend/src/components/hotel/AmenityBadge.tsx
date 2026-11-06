import React from 'react';
import {
  Wifi, Coffee, AirVent, Car, Utensils, Dumbbell, Waves,
  Tv, BabyIcon, PawPrint, Briefcase, FlameKindling, Shield,
  ConciergeBell, Sparkles, type LucideProps,
} from 'lucide-react';

interface AmenityBadgeProps {
  amenity: string;
  size?: 'sm' | 'md';
}

type IconComponent = React.FC<LucideProps>;

const amenityIconMap: Record<string, IconComponent> = {
  wifi: Wifi,
  'free wifi': Wifi,
  parking: Car,
  'free parking': Car,
  restaurant: Utensils,
  gym: Dumbbell,
  fitness: Dumbbell,
  pool: Waves,
  swimming: Waves,
  'spa': Sparkles,
  tv: Tv,
  breakfast: Coffee,
  'room service': ConciergeBell,
  'pet friendly': PawPrint,
  'baby crib': BabyIcon,
  business: Briefcase,
  fireplace: FlameKindling,
  security: Shield,
  ac: AirVent,
  'air conditioning': AirVent,
};

function getAmenityIcon(amenity: string): IconComponent {
  const key = amenity.toLowerCase();
  return amenityIconMap[key] || Sparkles;
}

export const AmenityBadge: React.FC<AmenityBadgeProps> = ({
  amenity,
  size = 'md',
}) => {
  const Icon = getAmenityIcon(amenity);
  const iconSize = size === 'sm' ? 13 : 15;

  return (
    <div
      className={[
        'inline-flex items-center gap-2 bg-sand-50/80 border border-border/80 rounded-xl',
        'text-text-primary font-medium',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
      ].join(' ')}
    >
      <Icon size={iconSize} className="text-primary flex-shrink-0" />
      <span>{amenity}</span>
    </div>
  );
};
