package com.stayfinder.service;

import com.stayfinder.dto.ReviewDto;
import com.stayfinder.dto.ReviewRequestDto;
import com.stayfinder.exception.DuplicateReviewException;
import com.stayfinder.exception.InvalidBookingException;
import com.stayfinder.model.*;
import com.stayfinder.repository.BookingRepository;
import com.stayfinder.repository.HotelRepository;
import com.stayfinder.repository.ReviewRepository;
import com.stayfinder.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User testUser;
    private Hotel testHotel;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("alice@example.com")
                .firstName("Alice")
                .lastName("Smith")
                .role(Role.USER)
                .build();

        testHotel = Hotel.builder()
                .id(10L)
                .name("The Taj Mahal Palace")
                .city("Mumbai")
                .avgRating(4.5)
                .reviewCount(10)
                .build();
    }

    @Test
    @DisplayName("Throws InvalidBookingException when user does not have a completed stay")
    void testAddReview_NoCompletedStayThrowsException() {
        ReviewRequestDto request = ReviewRequestDto.builder()
                .hotelId(10L)
                .rating(5)
                .title("Magnificent Stay")
                .body("A truly exceptional heritage luxury experience.")
                .build();

        when(hotelRepository.findById(10L)).thenReturn(Optional.of(testHotel));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.existsCompletedBookingByUserAndHotel(1L, 10L)).thenReturn(false);

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                reviewService.addReview(request, 1L));

        assertTrue(ex.getMessage().contains("You can only review hotels where you have completed a stay"));
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Throws DuplicateReviewException when user already submitted a review for this hotel")
    void testAddReview_DuplicateReviewThrowsException() {
        ReviewRequestDto request = ReviewRequestDto.builder()
                .hotelId(10L)
                .rating(5)
                .title("Second Attempt")
                .body("Trying to review the hotel again.")
                .build();

        when(hotelRepository.findById(10L)).thenReturn(Optional.of(testHotel));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.existsCompletedBookingByUserAndHotel(1L, 10L)).thenReturn(true);
        when(reviewRepository.existsByUserIdAndHotelId(1L, 10L)).thenReturn(true);

        DuplicateReviewException ex = assertThrows(DuplicateReviewException.class, () ->
                reviewService.addReview(request, 1L));

        assertTrue(ex.getMessage().contains("You have already reviewed this hotel"));
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("Successfully creates review when user has verified completed stay and no prior review")
    void testAddReview_Success() {
        ReviewRequestDto request = ReviewRequestDto.builder()
                .hotelId(10L)
                .rating(5)
                .title("Exceptional Hospitality")
                .body("Flawless luxury, attentive service, and majestic ambience.")
                .build();

        when(hotelRepository.findById(10L)).thenReturn(Optional.of(testHotel));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.existsCompletedBookingByUserAndHotel(1L, 10L)).thenReturn(true);
        when(reviewRepository.existsByUserIdAndHotelId(1L, 10L)).thenReturn(false);

        Review savedReview = Review.builder()
                .id(99L)
                .user(testUser)
                .hotel(testHotel)
                .rating(5)
                .title("Exceptional Hospitality")
                .body("Flawless luxury, attentive service, and majestic ambience.")
                .build();

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);
        when(reviewRepository.calculateAvgRating(10L)).thenReturn(4.8);
        when(reviewRepository.countByHotelId(10L)).thenReturn(11L);

        ReviewDto result = reviewService.addReview(request, 1L);

        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertEquals(5, result.getRating());
        assertEquals("Exceptional Hospitality", result.getTitle());

        verify(hotelRepository, times(1)).save(testHotel);
        assertEquals(4.8, testHotel.getAvgRating());
        assertEquals(11, testHotel.getReviewCount());
    }
}
