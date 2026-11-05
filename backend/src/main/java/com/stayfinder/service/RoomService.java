package com.stayfinder.service;

import com.stayfinder.dto.RoomDto;
import com.stayfinder.dto.RoomRequestDto;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.model.Hotel;
import com.stayfinder.model.Room;
import com.stayfinder.repository.HotelRepository;
import com.stayfinder.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

/**
 * Business logic for room management (admin operations).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final HotelService hotelService;

    @Transactional
    public RoomDto addRoomToHotel(Long hotelId, RoomRequestDto dto) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", hotelId));

        Room room = Room.builder()
                .hotel(hotel)
                .name(dto.getName())
                .type(dto.getType())
                .pricePerNight(dto.getPricePerNight())
                .capacity(dto.getCapacity())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .amenities(dto.getAmenities() != null ? dto.getAmenities() : new ArrayList<>())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        room = roomRepository.save(room);
        log.info("Added room {} to hotel {}", room.getId(), hotelId);
        return hotelService.toRoomDto(room);
    }

    @Transactional
    public RoomDto updateRoom(Long roomId, RoomRequestDto dto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", roomId));

        room.setName(dto.getName());
        room.setType(dto.getType());
        room.setPricePerNight(dto.getPricePerNight());
        room.setCapacity(dto.getCapacity());
        room.setDescription(dto.getDescription());
        room.setImageUrl(dto.getImageUrl());
        if (dto.getAmenities() != null) room.setAmenities(dto.getAmenities());
        if (dto.getIsActive() != null) room.setIsActive(dto.getIsActive());

        room = roomRepository.save(room);
        log.info("Updated room {}", roomId);
        return hotelService.toRoomDto(room);
    }
}
