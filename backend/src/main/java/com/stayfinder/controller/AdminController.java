package com.stayfinder.controller;

import com.stayfinder.dto.*;
import com.stayfinder.model.User;
import com.stayfinder.repository.UserRepository;
import com.stayfinder.service.BookingService;
import com.stayfinder.service.HotelService;
import com.stayfinder.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin-only management endpoints. All routes require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final HotelService hotelService;
    private final RoomService roomService;
    private final BookingService bookingService;
    private final UserRepository userRepository;

    // ── Hotels ────────────────────────────────────────────────────────────────

    @GetMapping("/hotels")
    public ResponseEntity<List<HotelDto>> getAllHotels() {
        return ResponseEntity.ok(
                hotelService.searchHotels(null, null)
                        .stream()
                        .map(HotelSearchResultDto::getHotel)
                        .collect(Collectors.toList()));
    }

    @PostMapping("/hotels")
    public ResponseEntity<HotelDto> createHotel(@Valid @RequestBody HotelRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.createHotel(dto));
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<HotelDto> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequestDto dto) {
        return ResponseEntity.ok(hotelService.updateHotel(id, dto));
    }

    // ── Rooms ─────────────────────────────────────────────────────────────────

    @PostMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<RoomDto> addRoom(
            @PathVariable Long hotelId,
            @Valid @RequestBody RoomRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.addRoomToHotel(hotelId, dto));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomDto> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequestDto dto) {
        return ResponseEntity.ok(roomService.updateRoom(id, dto));
    }

    // ── Bookings ──────────────────────────────────────────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<PagedResponseDto<BookingDto>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingDto> bookingPage = bookingService.getAllBookings(pageable);
        return ResponseEntity.ok(PagedResponseDto.<BookingDto>builder()
                .content(bookingPage.getContent())
                .page(bookingPage.getNumber())
                .size(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .build());
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users.stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getEmail(),
                        u.getFirstName(), u.getLastName(), u.getRole(), u.getCreatedAt()))
                .collect(Collectors.toList()));
    }

    // ── Inner DTO ─────────────────────────────────────────────────────────────

    public record UserSummaryDto(
            Long id,
            String email,
            String firstName,
            String lastName,
            com.stayfinder.model.Role role,
            java.time.LocalDateTime createdAt) {}
}
