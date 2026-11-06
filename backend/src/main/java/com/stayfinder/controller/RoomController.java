package com.stayfinder.controller;

import com.stayfinder.dto.RoomDto;
import com.stayfinder.dto.RoomRequestDto;
import com.stayfinder.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Room management endpoints (admin access via AdminController, public read via HotelController).
 * This controller handles direct room-level operations.
 */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/{id}")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomDto> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequestDto dto) {
        return ResponseEntity.ok(roomService.updateRoom(id, dto));
    }
}
