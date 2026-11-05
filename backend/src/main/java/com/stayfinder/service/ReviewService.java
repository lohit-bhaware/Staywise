package com.stayfinder.service;

import com.stayfinder.dto.PagedResponseDto;
import com.stayfinder.dto.ReviewDto;
import com.stayfinder.dto.ReviewRequestDto;
import com.stayfinder.exception.AccessDeniedException;
import com.stayfinder.exception.DuplicateReviewException;
import com.stayfinder.exception.InvalidBookingException;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.model.Booking;
import com.stayfinder.model.Hotel;
import com.stayfinder.model.Review;
import com.stayfinder.model.User;
import com.stayfinder.repository.BookingRepository;
import com.stayfinder.repository.HotelRepository;
import com.stayfinder.repository.ReviewRepository;
import com.stayfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for hotel reviews.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public ReviewDto addReview(ReviewRequestDto dto, Long userId) {
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", dto.getHotelId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Validate user has a completed booking at this hotel
        boolean hasCompletedBooking = bookingRepository
                .existsCompletedBookingByUserAndHotel(userId, dto.getHotelId());
        if (!hasCompletedBooking) {
            throw new InvalidBookingException(
                    "You can only review hotels where you have completed a stay");
        }

        // Prevent duplicate reviews
        if (reviewRepository.existsByUserIdAndHotelId(userId, dto.getHotelId())) {
            throw new DuplicateReviewException(
                    "You have already reviewed this hotel. Only one review per hotel is allowed.");
        }

        // Optionally link to a specific booking
        Booking booking = null;
        if (dto.getBookingId() != null) {
            booking = bookingRepository.findById(dto.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", dto.getBookingId()));
            if (!booking.getUser().getId().equals(userId)) {
                throw new AccessDeniedException("Booking does not belong to you");
            }
        }

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
                .booking(booking)
                .rating(dto.getRating())
                .title(dto.getTitle())
                .body(dto.getBody())
                .build();

        review = reviewRepository.save(review);

        // Recalculate hotel average rating and review count
        recalculateHotelRating(hotel);

        log.info("User {} added review for hotel {}", userId, hotel.getId());
        return toDto(review);
    }

    @Transactional(readOnly = true)
    public PagedResponseDto<ReviewDto> getHotelReviews(Long hotelId, Pageable pageable) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel", hotelId);
        }
        Page<Review> page = reviewRepository.findByHotelId(hotelId, pageable);
        return PagedResponseDto.<ReviewDto>builder()
                .content(page.getContent().stream().map(this::toDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own reviews");
        }

        Hotel hotel = review.getHotel();
        reviewRepository.delete(review);

        // Recalculate rating after deletion
        recalculateHotelRating(hotel);
        log.info("Deleted review {} by user {}", reviewId, userId);
    }

    private void recalculateHotelRating(Hotel hotel) {
        Double avg = reviewRepository.calculateAvgRating(hotel.getId());
        Long count = reviewRepository.countByHotelId(hotel.getId());
        hotel.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        hotel.setReviewCount(count != null ? count.intValue() : 0);
        hotelRepository.save(hotel);
    }

    public ReviewDto toDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setUserId(review.getUser().getId());
        dto.setUserFullName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        dto.setHotelId(review.getHotel().getId());
        dto.setHotelName(review.getHotel().getName());
        if (review.getBooking() != null) {
            dto.setBookingId(review.getBooking().getId());
        }
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setBody(review.getBody());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
