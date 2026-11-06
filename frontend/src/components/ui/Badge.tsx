import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'amber';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-sand-100 text-text-primary border border-border/80',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-900 border border-amber-200/60',
  error: 'bg-red-50 text-red-800 border border-red-200/60',
  info: 'bg-sage-100 text-primary border border-sage-200/80',
  accent: 'bg-accent-subtle text-accent-dark border border-accent/30',
  amber: 'bg-accent text-white',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};
