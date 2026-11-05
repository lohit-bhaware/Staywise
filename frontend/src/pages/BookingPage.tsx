import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { hotelsApi } from '../api/hotels';
import { bookingsApi } from '../api/bookings';
import { useAuthStore } from '../store/authStore';
import { ChevronLeft, Users, CheckCircle2, CalendarDays, Building2, BedDouble } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/booking/DatePicker';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { differenceInDays, format, parseISO } from 'date-fns';

export const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guestCount, setGuestCount] = useState(Number(searchParams.get('guests')) || 1);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const roomIdNum = Number(roomId);

  // Fetch all rooms to find this one (or use a dedicated endpoint)
  const { data: roomsData, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomIdNum],
    queryFn: async () => {
      // We fetch rooms page and look for this room
      const response = await hotelsApi.getAllRooms(0, 100);
      return response.content.find((r) => r.id === roomIdNum) || null;
    },
    enabled: !!roomIdNum,
  });

  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ['hotel-for-room', roomsData?.hotelId],
    queryFn: () => hotelsApi.getById(roomsData!.hotelId),
    enabled: !!roomsData?.hotelId,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        roomId: roomIdNum,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
      }),
    onSuccess: (booking) => {
      setBooked(true);
      setBookingId(booking.id);
    },
  });

  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInDays(parseISO(checkOut), parseISO(checkIn)))
      : 0;

  const totalPrice = roomsData ? nights * roomsData.pricePerNight : 0;

  const isLoading = roomLoading || hotelLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="max-w-2xl mx-auto px-4 space-y-5">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!roomsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Room not found.</p>
          <Button onClick={() => navigate('/search')}>Browse Hotels</Button>
        </div>
      </div>
    );
  }

  // ── Success State ───────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-border shadow-card p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Booking Confirmed!</h2>
          <p className="text-text-secondary mb-1">
            Your stay at <span className="font-semibold text-text-primary">{hotel?.name}</span> is confirmed.
          </p>
          {bookingId && (
            <p className="text-xs text-text-secondary mb-6">Booking reference: #{bookingId}</p>
          )}

          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Room</span>
              <span className="font-medium text-text-primary">{roomsData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Check-in</span>
              <span className="font-medium text-text-primary">
                {checkIn ? format(parseISO(checkIn), 'MMM d, yyyy') : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Check-out</span>
              <span className="font-medium text-text-primary">
                {checkOut ? format(parseISO(checkOut), 'MMM d, yyyy') : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="font-semibold text-text-primary">Total Paid</span>
              <span className="font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/hotels/${hotel?.id}`)}
            >
              View Hotel
            </Button>
            <Button className="flex-1" onClick={() => navigate('/dashboard')}>
              My Trips
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to hotel
        </button>

        <h1 className="text-2xl font-bold text-text-primary mb-6">Complete your booking</h1>

        {/* Room summary */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-5 flex gap-4">
          <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={roomsData.imageUrl || `https://source.unsplash.com/200x160/?hotel,room`}
              alt={roomsData.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://source.unsplash.com/200x160/?bedroom`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            {hotel && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                <Building2 size={12} />
                <span className="truncate">{hotel.name}</span>
              </div>
            )}
            <h3 className="font-semibold text-text-primary text-sm">{roomsData.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="info" size="sm">{roomsData.type}</Badge>
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Users size={11} />
                {roomsData.capacity} guests max
              </span>
            </div>
            <p className="text-primary font-bold mt-1.5">
              ₹{roomsData.pricePerNight.toLocaleString()}
              <span className="text-xs text-text-secondary font-normal"> /night</span>
            </p>
          </div>
        </div>

        {/* Dates & Guests */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-5">
          <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CalendarDays size={17} className="text-primary" />
            Stay details
          </h2>
          <DatePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            className="mb-4"
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Guests
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center
                  hover:border-primary hover:text-primary transition-colors font-bold text-lg"
              >
                −
              </button>
              <span className="text-base font-semibold text-text-primary w-8 text-center">
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() => setGuestCount((c) => Math.min(roomsData.capacity, c + 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center
                  hover:border-primary hover:text-primary transition-colors font-bold text-lg"
              >
                +
              </button>
              <span className="text-sm text-text-secondary">
                (max {roomsData.capacity})
              </span>
            </div>
          </div>
        </div>

        {/* Guest info */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-5">
          <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users size={17} className="text-primary" />
            Guest information
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">First Name</label>
              <input
                readOnly
                value={user?.firstName || ''}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-slate-50 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Last Name</label>
              <input
                readOnly
                value={user?.lastName || ''}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-slate-50 text-text-primary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-text-secondary mb-1">Email</label>
              <input
                readOnly
                value={user?.email || ''}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-slate-50 text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <h2 className="font-semibold text-text-primary mb-4">Price breakdown</h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                ₹{roomsData.pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}
              </span>
              <span className="text-text-primary">
                ₹{(roomsData.pricePerNight * nights).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Taxes & service fees</span>
              <span className="text-success font-medium">Included</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-3 border-t border-border">
              <span className="text-text-primary">Total</span>
              <span className="text-primary text-xl">
                {nights > 0 ? `₹${totalPrice.toLocaleString()}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {bookMutation.isError && (
          <div className="bg-red-50 border border-red-100 text-error text-sm px-4 py-3 rounded-xl mb-4">
            Booking failed. Please check availability and try again.
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={!checkIn || !checkOut || nights <= 0}
          loading={bookMutation.isPending}
          onClick={() => bookMutation.mutate()}
        >
          Confirm Booking · ₹{totalPrice.toLocaleString()}
        </Button>

        <p className="text-xs text-text-secondary text-center mt-3">
          By confirming, you agree to our terms and cancellation policy.
        </p>
      </div>
    </div>
  );
};
