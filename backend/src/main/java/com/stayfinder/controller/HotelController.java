package com.stayfinder.controller;

import com.stayfinder.dto.*;
import com.stayfinder.service.HotelService;
import com.stayfinder.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Public hotel browsing endpoints.
 */
@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final ReviewService reviewService;

    /**
     * Search/list hotels. If no query or city provided, returns all hotels ranked by rating.
     */
    @GetMapping
    public ResponseEntity<List<HotelSearchResultDto>> searchHotels(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<HotelSearchResultDto> results = hotelService.searchHotels(query, city);
        // Manual pagination on the sorted list
        int start = page * size;
        int end = Math.min(start + size, results.size());
        if (start >= results.size()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(results.subList(start, end));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDto> getHotel(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<RoomDto>> getAvailableRooms(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(hotelService.getAvailableRooms(id, checkIn, checkOut));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<PagedResponseDto<ReviewDto>> getHotelReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getHotelReviews(id, pageable));
    }
}
