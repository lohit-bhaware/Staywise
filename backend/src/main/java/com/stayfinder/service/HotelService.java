package com.stayfinder.service;

import com.stayfinder.dto.HotelDto;
import com.stayfinder.dto.HotelRequestDto;
import com.stayfinder.dto.HotelSearchResultDto;
import com.stayfinder.dto.RoomDto;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.model.Hotel;
import com.stayfinder.model.Room;
import com.stayfinder.repository.HotelRepository;
import com.stayfinder.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Business logic for hotel search, retrieval, and management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    /**
     * Searches hotels by query and optional city filter, returns ranked results.
     */
    @Transactional(readOnly = true)
    public List<HotelSearchResultDto> searchHotels(String query, String city) {
        List<Hotel> hotels;

        if (StringUtils.hasText(query) || StringUtils.hasText(city)) {
            hotels = hotelRepository.searchHotelsWithFilters(
                    StringUtils.hasText(query) ? query : null,
                    StringUtils.hasText(city) ? city : null);
        } else {
            hotels = hotelRepository.findAll();
        }

        if (hotels.isEmpty()) {
            return List.of();
        }

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).toList();
        Map<Long, BigDecimal> minPriceMap = roomRepository.findMinPricesForHotelIds(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (BigDecimal) row[1]
                ));

        return hotels.stream()
                .map(h -> {
                    HotelSearchResultDto result = scoreHotel(h, query);
                    if (minPriceMap.containsKey(h.getId())) {
                        result.getHotel().setMinPrice(minPriceMap.get(h.getId()));
                    }
                    return result;
                })
                .sorted(Comparator.comparingInt(HotelSearchResultDto::getScore).reversed())
                .collect(Collectors.toList());
    }

    private HotelSearchResultDto scoreHotel(Hotel hotel, String query) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        if (StringUtils.hasText(query)) {
            String lq = query.toLowerCase();
            String lName = hotel.getName().toLowerCase();
            String lCity = hotel.getCity().toLowerCase();
            String lArea = hotel.getArea() != null ? hotel.getArea().toLowerCase() : "";

            if (lName.equals(lq)) {
                score += 100;
                reasons.add("Exact name match");
            } else if (lName.contains(lq)) {
                score += 80;
                reasons.add("Name match");
            }
            if (lCity.equals(lq)) {
                score += 50;
                reasons.add("City match");
            } else if (lCity.contains(lq)) {
                score += 35;
                reasons.add("City match");
            }
            if (!lArea.isEmpty() && lArea.contains(lq)) {
                score += 30;
                reasons.add("Area match");
            }
        }

        // Rating and review boosts
        score += (int) (hotel.getAvgRating() * 10);
        score += Math.min(hotel.getReviewCount(), 50);

        if (hotel.getAvgRating() >= 4.5) {
            reasons.add(hotel.getAvgRating() + "★ rated");
        } else if (hotel.getAvgRating() > 0) {
            reasons.add(String.format("%.1f★", hotel.getAvgRating()));
        }

        String rankReason = reasons.isEmpty()
                ? hotel.getCity() + " · " + hotel.getStars() + " stars"
                : String.join(" · ", reasons);

        return HotelSearchResultDto.builder()
                .hotel(toDto(hotel))
                .score(score)
                .rankReason(rankReason)
                .build();
    }

    @Transactional(readOnly = true)
    public HotelDto getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", id));
        HotelDto dto = toDto(hotel);
        List<Room> rooms = roomRepository.findByHotelIdAndIsActiveTrue(id);
        dto.setRooms(rooms.stream().map(this::toRoomDto).collect(Collectors.toList()));
        rooms.stream()
                .map(Room::getPricePerNight)
                .min(Comparator.naturalOrder())
                .ifPresent(dto::setMinPrice);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel", hotelId);
        }
        if (checkIn == null || checkOut == null) {
            return roomRepository.findByHotelIdAndIsActiveTrue(hotelId)
                    .stream().map(this::toRoomDto).collect(Collectors.toList());
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        return roomRepository.findAvailableRooms(hotelId, checkIn, checkOut)
                .stream().map(this::toRoomDto).collect(Collectors.toList());
    }

    @Transactional
    public HotelDto createHotel(HotelRequestDto dto) {
        Hotel hotel = Hotel.builder()
                .name(dto.getName())
                .city(dto.getCity())
                .area(dto.getArea())
                .address(dto.getAddress())
                .description(dto.getDescription())
                .stars(dto.getStars())
                .mainImageUrl(dto.getMainImageUrl())
                .amenities(dto.getAmenities() != null ? dto.getAmenities() : new ArrayList<>())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .avgRating(0.0)
                .reviewCount(0)
                .build();
        return toDto(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelDto updateHotel(Long id, HotelRequestDto dto) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", id));
        hotel.setName(dto.getName());
        hotel.setCity(dto.getCity());
        hotel.setArea(dto.getArea());
        hotel.setAddress(dto.getAddress());
        hotel.setDescription(dto.getDescription());
        hotel.setStars(dto.getStars());
        hotel.setMainImageUrl(dto.getMainImageUrl());
        if (dto.getAmenities() != null) hotel.setAmenities(dto.getAmenities());
        hotel.setLatitude(dto.getLatitude());
        hotel.setLongitude(dto.getLongitude());
        return toDto(hotelRepository.save(hotel));
    }

    public HotelDto toDto(Hotel hotel) {
        HotelDto dto = new HotelDto();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setCity(hotel.getCity());
        dto.setArea(hotel.getArea());
        dto.setAddress(hotel.getAddress());
        dto.setDescription(hotel.getDescription());
        dto.setStars(hotel.getStars());
        dto.setMainImageUrl(hotel.getMainImageUrl());
        dto.setAmenities(hotel.getAmenities());
        dto.setAvgRating(hotel.getAvgRating());
        dto.setReviewCount(hotel.getReviewCount());
        dto.setLatitude(hotel.getLatitude());
        dto.setLongitude(hotel.getLongitude());
        return dto;
    }

    public RoomDto toRoomDto(Room room) {
        RoomDto dto = new RoomDto();
        dto.setId(room.getId());
        dto.setHotelId(room.getHotel().getId());
        dto.setHotelName(room.getHotel().getName());
        dto.setName(room.getName());
        dto.setType(room.getType());
        dto.setPricePerNight(room.getPricePerNight());
        dto.setCapacity(room.getCapacity());
        dto.setDescription(room.getDescription());
        dto.setImageUrl(room.getImageUrl());
        dto.setAmenities(room.getAmenities());
        dto.setIsActive(room.getIsActive());
        return dto;
    }
}
