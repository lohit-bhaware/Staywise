import React, { useEffect } from 'react';
import { CalendarDays, MoveRight } from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';

interface DatePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  minDate?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  className = '',
}) => {
  const today = minDate || new Date().toISOString().split('T')[0];

  const nights =
    checkIn && checkOut && isValid(parseISO(checkIn)) && isValid(parseISO(checkOut))
      ? differenceInDays(parseISO(checkOut), parseISO(checkIn))
      : 0;

  // Auto-adjust check-out if it's before check-in
  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      onCheckOutChange(nextDay.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut, onCheckOutChange]);

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="flex-1">
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Check-in
        </label>
        <div className="relative">
          <CalendarDays
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm text-text-primary
              focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary
              hover:border-sand-300 transition-[border-color,box-shadow] duration-150 ease-out bg-white cursor-pointer"
          />
        </div>
      </div>

      <div className="hidden sm:flex items-end pb-2.5 text-text-secondary">
        <MoveRight size={18} />
      </div>

      <div className="flex-1">
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Check-out
        </label>
        <div className="relative">
          <CalendarDays
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm text-text-primary
              focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary
              hover:border-sand-300 transition-[border-color,box-shadow] duration-150 ease-out bg-white cursor-pointer"
          />
        </div>
      </div>

      {nights > 0 && (
        <div className="hidden sm:flex items-end pb-2 text-sm text-text-secondary whitespace-nowrap">
          <span className="font-semibold text-primary">{nights}</span>&nbsp;night{nights !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
