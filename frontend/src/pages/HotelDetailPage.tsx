import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Star, Users, ChevronLeft, MessageSquare, Wifi,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import { useHotel, useHotelRooms } from '../hooks/useHotels';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews';
import { useAuthStore } from '../store/authStore';
import { StarRating } from '../components/ui/StarRating';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { RoomCard } from '../components/hotel/RoomCard';
import { ReviewCard } from '../components/hotel/ReviewCard';
import { AmenityBadge } from '../components/hotel/AmenityBadge';
import { DatePicker } from '../components/booking/DatePicker';
import { Modal } from '../components/ui/Modal';
import { Room } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays } from 'date-fns';

type Tab = 'overview' | 'rooms' | 'reviews';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(10, 'Review must be at least 10 characters'),
});
type ReviewForm = z.infer<typeof reviewSchema>;

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const hotelId = Number(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guestCount, setGuestCount] = useState(1);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  const { data: hotel, isLoading: hotelLoading } = useHotel(hotelId);
  const { data: rooms, isLoading: roomsLoading } = useHotelRooms(
    hotelId, checkIn || undefined, checkOut || undefined
  );
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', hotelId, reviewPage],
    queryFn: () => reviewsApi.getByHotel(hotelId, reviewPage, 8),
    enabled: !!hotelId,
  });

  const reviewForm = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewsApi.create({ hotelId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', hotelId] });
      setReviewModalOpen(false);
      reviewForm.reset();
      setSelectedRating(0);
    },
  });

  const nights =
    checkIn && checkOut
      ? Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)))
      : 0;

  const handleBookRoom = (room: Room) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', String(guestCount));
    navigate(`/book/${room.id}?${params.toString()}`);
  };

  const onSubmitReview = (data: ReviewForm) => {
    submitReviewMutation.mutate({ ...data, rating: selectedRating });
  };

  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-72 w-full rounded-none" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
          <SkeletonText lines={4} />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Hotel not found.</p>
          <Button className="mt-4" onClick={() => navigate('/search')}>
            Browse Hotels
          </Button>
        </div>
      </div>
    );
  }

  const imgSrc = hotel.mainImageUrl || `https://source.unsplash.com/1200x600/?hotel,${hotel.city}`;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Image ──────────────────────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={imgSrc}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://source.unsplash.com/1200x600/?hotel,luxury`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-1.5 bg-black/30 hover:bg-black/50
            backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Hotel name overlay */}
        <div className="absolute bottom-0 inset-x-0 p-6 max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} size={14} className="text-accent fill-current" />
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 text-white/80">
                <MapPin size={14} />
                <span className="text-sm">{hotel.area}, {hotel.city}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2 justify-end">
                <StarRating rating={hotel.avgRating} size="sm" />
                <span className="text-white font-bold">{hotel.avgRating.toFixed(1)}</span>
              </div>
              <p className="text-white/70 text-xs mt-1">{hotel.reviewCount} reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-border sticky top-16 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0">
            {(['overview', 'rooms', 'reviews'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'px-5 py-4 text-sm font-medium capitalize border-b-2 transition-all',
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {tab}
                {tab === 'reviews' && hotel.reviewCount > 0 && (
                  <span className="ml-1.5 text-xs bg-slate-100 text-text-secondary px-1.5 py-0.5 rounded-full">
                    {hotel.reviewCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Overview Tab ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">About this property</h2>
              <p className="text-text-secondary leading-relaxed">
                {hotel.description || 'No description available.'}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-text-primary mb-3">Location</h2>
              <div className="flex items-start gap-2 text-text-secondary">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                <p>{hotel.address || `${hotel.area}, ${hotel.city}`}</p>
              </div>
            </div>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2.5">
                  {hotel.amenities.map((amenity) => (
                    <AmenityBadge key={amenity} amenity={amenity} />
                  ))}
                </div>
              </div>
            )}

            {/* Rating overview */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">Guest Rating</h2>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-primary">
                    {hotel.avgRating.toFixed(1)}
                  </p>
                  <StarRating rating={hotel.avgRating} size="md" className="mt-2 justify-center" />
                  <p className="text-xs text-text-secondary mt-1.5">
                    {hotel.reviewCount} reviews
                  </p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-text-secondary w-3">{star}</span>
                      <Star size={11} className="text-accent fill-current" />
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all"
                          style={{
                            width: `${star === Math.round(hotel.avgRating) ? 60 : 20 + Math.random() * 20}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Rooms Tab ────────────────────────────────────────────── */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            {/* Date + guest picker */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-text-primary mb-4">Check availability</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                  />
                </div>
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
                    Guests
                  </label>
                  <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5">
                    <Users size={16} className="text-text-secondary" />
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="text-sm text-text-primary focus:outline-none bg-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} guest{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-text-secondary mt-3">
                  Showing prices for <span className="font-semibold text-primary">{nights} night{nights !== 1 ? 's' : ''}</span>
                </p>
              )}
            </div>

            {/* Room list */}
            {roomsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border p-4 flex gap-4">
                    <Skeleton className="w-56 h-44 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBook={handleBookRoom}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    nights={nights}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-border">
                <p className="text-text-secondary">No rooms available for the selected dates.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setCheckIn(''); setCheckOut(''); }}
                >
                  Clear dates
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Reviews Tab ──────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Guest Reviews
                {hotel.reviewCount > 0 && (
                  <span className="text-text-secondary font-normal text-base ml-2">
                    ({hotel.reviewCount})
                  </span>
                )}
              </h2>
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<MessageSquare size={14} />}
                  onClick={() => setReviewModalOpen(true)}
                >
                  Write a Review
                </Button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-border p-5">
                    <div className="flex gap-3 mb-3">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <SkeletonText lines={3} />
                  </div>
                ))}
              </div>
            ) : reviewsData?.content && reviewsData.content.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewsData.content.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
                {reviewsData.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage === 0}
                      onClick={() => setReviewPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-text-secondary px-3 self-center">
                      {reviewPage + 1} / {reviewsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reviewPage >= reviewsData.totalPages - 1}
                      onClick={() => setReviewPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-border">
                <MessageSquare size={40} className="text-slate-200 mx-auto mb-3" />
                <h3 className="font-semibold text-text-primary mb-1">No reviews yet</h3>
                <p className="text-text-secondary text-sm">Be the first to share your experience!</p>
                {isAuthenticated && (
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => setReviewModalOpen(true)}
                  >
                    Write a Review
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Write Review Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Review"
      >
        <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
          {/* Star selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Rating <span className="text-error">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setSelectedRating(star);
                    reviewForm.setValue('rating', star);
                  }}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={
                      star <= (hoverRating || selectedRating)
                        ? 'text-accent fill-current'
                        : 'text-slate-200 fill-current'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Title <span className="text-error">*</span>
            </label>
            <input
              {...reviewForm.register('title')}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none
                focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {reviewForm.formState.errors.title && (
              <p className="text-xs text-error mt-1">{reviewForm.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Your Review <span className="text-error">*</span>
            </label>
            <textarea
              {...reviewForm.register('body')}
              rows={4}
              placeholder="Share your experience with other travelers..."
              className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none
                focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            {reviewForm.formState.errors.body && (
              <p className="text-xs text-error mt-1">{reviewForm.formState.errors.body.message}</p>
            )}
          </div>

          {submitReviewMutation.isError && (
            <p className="text-sm text-error bg-red-50 p-3 rounded-lg">
              Failed to submit review. Please try again.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={submitReviewMutation.isPending}
              disabled={selectedRating === 0}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
