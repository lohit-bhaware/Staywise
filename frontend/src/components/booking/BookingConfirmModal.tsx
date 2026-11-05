import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Room, Hotel } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { format, parseISO, differenceInDays } from 'date-fns';

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: Room | null;
  hotel: Hotel | null;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  loading?: boolean;
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  room,
  hotel,
  checkIn,
  checkOut,
  guestCount,
  loading = false,
}) => {
  if (!room || !hotel) return null;

  const nights =
    checkIn && checkOut
      ? differenceInDays(parseISO(checkOut), parseISO(checkIn))
      : 0;
  const total = nights * room.pricePerNight;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Booking" size="md">
      <div className="space-y-4">
        {/* Hotel / Room info */}
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="font-semibold text-text-primary">{hotel.name}</p>
          <p className="text-sm text-text-secondary">{room.name} · {room.type}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-text-secondary mb-1">Check-in</p>
            <p className="font-semibold text-text-primary text-sm">
              {checkIn ? format(parseISO(checkIn), 'EEE, MMM d, yyyy') : '—'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-text-secondary mb-1">Check-out</p>
            <p className="font-semibold text-text-primary text-sm">
              {checkOut ? format(parseISO(checkOut), 'EEE, MMM d, yyyy') : '—'}
            </p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="border border-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              ₹{room.pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}
            </span>
            <span className="text-text-primary">₹{(room.pricePerNight * nights).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Taxes & fees</span>
            <span className="text-success">Included</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-border">
            <span className="text-text-primary">Total</span>
            <span className="text-primary text-lg">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            By confirming, you agree to the cancellation policy. Cancellations may be subject to fees.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm} loading={loading}>
            Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
};
