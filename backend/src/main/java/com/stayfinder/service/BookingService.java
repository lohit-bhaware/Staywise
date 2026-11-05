package com.stayfinder.service;

import com.stayfinder.dto.BookingDto;
import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.exception.AccessDeniedException;
import com.stayfinder.exception.InvalidBookingException;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.exception.RoomNotAvailableException;
import com.stayfinder.model.Booking;
import com.stayfinder.model.BookingStatus;
import com.stayfinder.model.Room;
import com.stayfinder.model.User;
import com.stayfinder.repository.BookingRepository;
import com.stayfinder.repository.RoomRepository;
import com.stayfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for creating, retrieving, and managing bookings.
 * Uses @Transactional with pessimistic locking semantics to prevent double-booking.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final HotelService hotelService;

    @Transactional
    public synchronized BookingDto createBooking(BookingRequestDto dto, Long userId) {
        // Validate date range
        if (!dto.getCheckOutDate().isAfter(dto.getCheckInDate())) {
            throw new InvalidBookingException("Check-out date must be after check-in date");
        }
        if (dto.getCheckInDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Check-in date must not be in the past");
        }

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", dto.getRoomId()));

        if (!room.getIsActive()) {
            throw new RoomNotAvailableException("Room is not currently available for booking");
        }

        // Check for overlapping bookings (critical section - synchronized + transactional)
        boolean overlap = bookingRepository.existsOverlappingBooking(
                dto.getRoomId(), dto.getCheckInDate(), dto.getCheckOutDate());

        if (overlap) {
            throw new RoomNotAvailableException(
                    "Room is already booked for the selected dates: " +
                    dto.getCheckInDate() + " to " + dto.getCheckOutDate());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Calculate total price
        long nights = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(dto.getCheckInDate())
                .checkOutDate(dto.getCheckOutDate())
                .totalPrice(totalPrice)
                .guestCount(dto.getGuestCount())
                .status(BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Created booking {} for user {} in room {}", booking.getId(), userId, room.getId());
        return toDto(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));
        if (!booking.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have access to this booking");
        }
        return toDto(booking);
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidBookingException(
                    "Only CONFIRMED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        log.info("Cancelled booking {} by user {}", bookingId, userId);
        return toDto(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingDto> getAllBookings(Pageable pageable) {
        return bookingRepository.findAllWithDetails(pageable).map(this::toDto);
    }

    public BookingDto toDto(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setUserFullName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        dto.setRoom(hotelService.toRoomDto(booking.getRoom()));
        dto.setHotel(hotelService.toDto(booking.getRoom().getHotel()));
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setGuestCount(booking.getGuestCount());
        return dto;
    }
}
