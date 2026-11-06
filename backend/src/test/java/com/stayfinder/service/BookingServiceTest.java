package com.stayfinder.service;

import com.stayfinder.dto.BookingDto;
import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.HotelDto;
import com.stayfinder.dto.RoomDto;
import com.stayfinder.exception.AccessDeniedException;
import com.stayfinder.exception.InvalidBookingException;
import com.stayfinder.exception.RoomNotAvailableException;
import com.stayfinder.model.*;
import com.stayfinder.repository.BookingRepository;
import com.stayfinder.repository.RoomRepository;
import com.stayfinder.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelService hotelService;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Hotel testHotel;
    private Room testRoom;

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
                .name("The Oberoi")
                .city("Mumbai")
                .stars(5)
                .avgRating(4.8)
                .reviewCount(120)
                .build();

        testRoom = Room.builder()
                .id(100L)
                .hotel(testHotel)
                .name("Deluxe Sea View")
                .type(RoomType.DELUXE)
                .pricePerNight(new BigDecimal("12000.00"))
                .capacity(2)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Successfully creates booking when dates are valid and no collision exists")
    void testCreateBooking_Success() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5); // 3 nights

        BookingRequestDto request = BookingRequestDto.builder()
                .roomId(100L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestCount(2)
                .build();

        when(roomRepository.findById(100L)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.existsOverlappingBooking(100L, checkIn, checkOut)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Booking savedBooking = Booking.builder()
                .id(500L)
                .user(testUser)
                .room(testRoom)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .totalPrice(new BigDecimal("36000.00"))
                .guestCount(2)
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(hotelService.toRoomDto(any(Room.class))).thenReturn(new RoomDto());
        when(hotelService.toDto(any(Hotel.class))).thenReturn(new HotelDto());

        BookingDto result = bookingService.createBooking(request, 1L);

        assertNotNull(result);
        assertEquals(500L, result.getId());
        assertEquals(BookingStatus.CONFIRMED, result.getStatus());
        assertEquals(new BigDecimal("36000.00"), result.getTotalPrice());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws RoomNotAvailableException when overlapping booking exists (double-booking prevention)")
    void testCreateBooking_OverlapThrowsConflict() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        BookingRequestDto request = BookingRequestDto.builder()
                .roomId(100L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestCount(2)
                .build();

        when(roomRepository.findById(100L)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.existsOverlappingBooking(100L, checkIn, checkOut)).thenReturn(true);

        RoomNotAvailableException ex = assertThrows(RoomNotAvailableException.class, () ->
                bookingService.createBooking(request, 1L));

        assertTrue(ex.getMessage().contains("already booked"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws InvalidBookingException when check-out is before or equal to check-in")
    void testCreateBooking_InvalidDateRange() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(2); // before check-in

        BookingRequestDto request = BookingRequestDto.builder()
                .roomId(100L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestCount(1)
                .build();

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(request, 1L));

        assertTrue(ex.getMessage().contains("Check-out date must be after check-in date"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws InvalidBookingException when check-in is in the past")
    void testCreateBooking_PastCheckInDate() {
        LocalDate checkIn = LocalDate.now().minusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(2);

        BookingRequestDto request = BookingRequestDto.builder()
                .roomId(100L)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestCount(1)
                .build();

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.createBooking(request, 1L));

        assertTrue(ex.getMessage().contains("Check-in date must not be in the past"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws AccessDeniedException when cancelling booking belonging to another user")
    void testCancelBooking_UnauthorizedUser() {
        User otherUser = User.builder().id(999L).build();
        Booking booking = Booking.builder()
                .id(200L)
                .user(otherUser)
                .status(BookingStatus.CONFIRMED)
                .build();

        when(bookingRepository.findById(200L)).thenReturn(Optional.of(booking));

        assertThrows(AccessDeniedException.class, () ->
                bookingService.cancelBooking(200L, 1L));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws InvalidBookingException when cancelling already CANCELLED or COMPLETED booking")
    void testCancelBooking_AlreadyCancelled() {
        Booking booking = Booking.builder()
                .id(200L)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.CANCELLED)
                .build();

        when(bookingRepository.findById(200L)).thenReturn(Optional.of(booking));

        InvalidBookingException ex = assertThrows(InvalidBookingException.class, () ->
                bookingService.cancelBooking(200L, 1L));

        assertTrue(ex.getMessage().contains("Only CONFIRMED bookings can be cancelled"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Successfully cancels CONFIRMED booking owned by user")
    void testCancelBooking_Success() {
        Booking booking = Booking.builder()
                .id(200L)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking cancelledBooking = Booking.builder()
                .id(200L)
                .user(testUser)
                .room(testRoom)
                .status(BookingStatus.CANCELLED)
                .build();

        when(bookingRepository.findById(200L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(cancelledBooking);
        when(hotelService.toRoomDto(any(Room.class))).thenReturn(new RoomDto());
        when(hotelService.toDto(any(Hotel.class))).thenReturn(new HotelDto());

        BookingDto result = bookingService.cancelBooking(200L, 1L);

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        verify(bookingRepository, times(1)).save(booking);
    }
}
