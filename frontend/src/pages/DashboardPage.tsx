import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  CalendarDays,
  MapPin,
  Star,
  Trash2,
  X,
  PenLine,
  CheckCircle2,
  Clock,
  BanIcon,
} from 'lucide-react';
import { bookingsApi } from '../api/bookings';
import { reviewsApi } from '../api/reviews';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { StarRating } from '../components/ui/StarRating';
import { Booking, Review } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; variant: 'success' | 'error' | 'info' | 'warning'; icon: React.ReactNode }
> = {
  CONFIRMED: {
    label: 'Confirmed',
    variant: 'success',
    icon: <CheckCircle2 size={12} />,
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'info',
    icon: <CheckCircle2 size={12} />,
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'error',
    icon: <BanIcon size={12} />,
  },
  PENDING: {
    label: 'Pending',
    variant: 'warning',
    icon: <Clock size={12} />,
  },
};

// ── Booking Card ─────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: number) => void;
  cancelLoading: boolean;
  onWriteReview: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  cancelLoading,
  onWriteReview,
}) => {
  const nights = differenceInDays(parseISO(booking.checkOutDate), parseISO(booking.checkInDate));
  const cfg = statusConfig[booking.status] ?? statusConfig.PENDING;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Hotel image strip */}
      <div className="relative h-32 bg-slate-100">
        <img
          src={
            booking.hotel?.mainImageUrl ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=300&fit=crop'
          }
          alt={booking.hotel?.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=300&fit=crop';
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant={cfg.variant} size="sm">
            <span className="flex items-center gap-1">
              {cfg.icon}
              {cfg.label}
            </span>
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-serif font-semibold text-text-primary text-base sm:text-lg">{booking.hotel?.name}</h3>
            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-primary" />
              {booking.hotel?.city}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-serif font-bold text-primary text-lg">
              ₹{booking.totalPrice?.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-text-secondary">
              {nights} night{nights !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-surface-alt rounded-xl p-3 border border-border/60">
            <p className="text-xs text-text-secondary mb-0.5 flex items-center gap-1 font-medium">
              <CalendarDays size={12} className="text-primary" /> Check-in
            </p>
            <p className="font-medium text-text-primary text-xs sm:text-sm">
              {format(parseISO(booking.checkInDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="bg-surface-alt rounded-xl p-3 border border-border/60">
            <p className="text-xs text-text-secondary mb-0.5 flex items-center gap-1 font-medium">
              <CalendarDays size={12} className="text-primary" /> Check-out
            </p>
            <p className="font-medium text-text-primary text-xs sm:text-sm">
              {format(parseISO(booking.checkOutDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <p className="text-xs text-text-secondary mb-3">
          Room: <span className="font-medium text-text-primary">{booking.room?.name}</span>
          {' · '}Reference #{booking.id}
        </p>

        <div className="flex gap-2">
          {booking.status === 'CONFIRMED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(booking.id)}
              loading={cancelLoading}
              leftIcon={<X size={14} />}
              className="flex-1"
            >
              Cancel Reservation
            </Button>
          )}
          {booking.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWriteReview(booking)}
              leftIcon={<PenLine size={14} />}
              className="flex-1"
            >
              Write Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Review Card (dashboard) ───────────────────────────────────────────────────

interface MyReviewCardProps {
  review: Review;
  onDelete: (id: number) => void;
  deleteLoading: boolean;
}

const MyReviewCard: React.FC<MyReviewCardProps> = ({ review, onDelete, deleteLoading }) => {
  const timeAgo = review.createdAt
    ? format(parseISO(review.createdAt), 'MMM d, yyyy')
    : '';

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-serif font-semibold text-text-primary text-base">{review.hotelName || 'Hotel'}</p>
          <StarRating rating={review.rating} size="sm" className="mt-1" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-text-secondary">{timeAgo}</span>
          <button
            onClick={() => onDelete(review.id)}
            disabled={deleteLoading}
            className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-error transition-colors disabled:opacity-50"
            aria-label="Delete review"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {review.title && (
        <h4 className="font-medium text-text-primary text-sm mb-1">{review.title}</h4>
      )}
      {review.body && (
        <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>
      )}
    </div>
  );
};

// ── Write Review Modal ────────────────────────────────────────────────────────

interface WriteReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ booking, onClose }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const submitMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        hotelId: booking!.hotel.id,
        rating,
        title,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      onClose();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(
        err?.response?.data?.message || 'Only guests with a completed stay can submit a verified review.'
      );
    },
  });

  if (!booking) return null;

  return (
    <Modal isOpen={!!booking} onClose={onClose} title="Write a review" size="md">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-text-secondary mb-1">Hotel</p>
          <p className="font-serif font-semibold text-text-primary text-base">{booking.hotel?.name}</p>
        </div>

        {/* Star picker */}
        <div>
          <p className="text-xs font-medium text-text-primary mb-2">Your rating</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={26}
                  className={s <= rating ? 'fill-accent text-accent' : 'text-border fill-surface-alt'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={120}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary
              placeholder:text-text-secondary/70 outline-none focus:ring-2 focus:ring-primary/20
              focus:border-primary transition-all duration-150"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-1.5">Review</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us about your stay…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text-primary
              placeholder:text-text-secondary/70 outline-none focus:ring-2 focus:ring-primary/20
              focus:border-primary transition-all duration-150 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            loading={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            disabled={!title.trim() || !body.trim()}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ── Dashboard Page ────────────────────────────────────────────────────────────

type Tab = 'trips' | 'reviews';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('trips');
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: bookingsApi.getMyBookings,
  });

  const {
    data: reviews,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: reviewsApi.getMyReviews,
    enabled: activeTab === 'reviews',
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setCancelTarget(null);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary">Guest Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">
            Welcome back,{' '}
            <span className="font-medium text-text-primary">{user?.firstName}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 bg-surface-alt border border-border rounded-xl w-fit mb-8">
          {(['trips', 'reviews'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-medium transition-all duration-150',
                activeTab === tab
                  ? 'bg-primary text-white shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {tab === 'trips' ? 'My Trips' : 'My Reviews'}
            </button>
          ))}
        </div>

        {/* ── Trips Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'trips' && (
          <>
            {bookingsLoading && (
              <div className="grid sm:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-14 rounded-xl" />
                        <Skeleton className="h-14 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bookingsError && (
              <div className="text-center py-16">
                <p className="text-text-secondary mb-4">Could not load your trips.</p>
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['my-bookings'] })}
                >
                  Retry
                </Button>
              </div>
            )}

            {!bookingsLoading && !bookingsError && bookings?.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CalendarDays size={36} className="text-text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No trips yet</h3>
                <p className="text-text-secondary mb-6">
                  Start exploring hotels and book your first stay!
                </p>
                <Button onClick={() => navigate('/search')}>Find Hotels</Button>
              </div>
            )}

            {!bookingsLoading && !bookingsError && bookings && bookings.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={(id) => setCancelTarget(id)}
                    cancelLoading={cancelMutation.isPending && cancelTarget === booking.id}
                    onWriteReview={(b) => setReviewTarget(b)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Reviews Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <>
            {reviewsLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {reviewsError && (
              <div className="text-center py-16">
                <p className="text-text-secondary mb-4">Could not load your reviews.</p>
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['my-reviews'] })}
                >
                  Retry
                </Button>
              </div>
            )}

            {!reviewsLoading && !reviewsError && reviews?.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Star size={36} className="text-text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No reviews yet</h3>
                <p className="text-text-secondary mb-6">
                  Complete a stay and share your experience.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('trips')}>
                  View My Trips
                </Button>
              </div>
            )}

            {!reviewsLoading && !reviewsError && reviews && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <MyReviewCard
                    key={review.id}
                    review={review}
                    onDelete={(id) => deleteReviewMutation.mutate(id)}
                    deleteLoading={deleteReviewMutation.isPending}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel booking"
        size="sm"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        {cancelMutation.isError && (
          <p className="text-sm text-error mb-4">
            Failed to cancel booking. Please try again.
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setCancelTarget(null)}
          >
            Keep Booking
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={cancelMutation.isPending}
            onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget)}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>

      {/* Write Review Modal */}
      <WriteReviewModal booking={reviewTarget} onClose={() => setReviewTarget(null)} />
    </div>
  );
};

