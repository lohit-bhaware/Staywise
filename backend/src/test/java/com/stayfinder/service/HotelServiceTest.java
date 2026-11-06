package com.stayfinder.service;

import com.stayfinder.dto.HotelDto;
import com.stayfinder.dto.HotelSearchResultDto;
import com.stayfinder.model.Hotel;
import com.stayfinder.model.Room;
import com.stayfinder.model.RoomType;
import com.stayfinder.repository.HotelRepository;
import com.stayfinder.repository.ReviewRepository;
import com.stayfinder.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private HotelService hotelService;

    private Hotel tajMahal;
    private Hotel leela;

    @BeforeEach
    void setUp() {
        tajMahal = Hotel.builder()
                .id(1L)
                .name("Taj Mahal Palace")
                .city("Mumbai")
                .area("Colaba")
                .stars(5)
                .avgRating(4.9)
                .reviewCount(150)
                .amenities(List.of("Free WiFi", "Swimming Pool", "Spa"))
                .build();

        leela = Hotel.builder()
                .id(2L)
                .name("The Leela Palace")
                .city("Delhi")
                .area("Chanakyapuri")
                .stars(5)
                .avgRating(4.7)
                .reviewCount(80)
                .amenities(List.of("Free WiFi", "Bar", "Gym"))
                .build();
    }

    @Test
    @DisplayName("Explainable ranking gives highest score to exact name match + high rating")
    void testSearchHotels_ExplainableRanking() {
        when(hotelRepository.searchHotelsWithFilters("Taj Mahal Palace", null)).thenReturn(List.of(tajMahal));
        when(roomRepository.findMinPricesForHotelIds(anyList())).thenReturn(List.of());

        List<HotelSearchResultDto> results = hotelService.searchHotels("Taj Mahal Palace", null);

        assertFalse(results.isEmpty());
        HotelSearchResultDto topResult = results.get(0);
        assertEquals("Taj Mahal Palace", topResult.getHotel().getName());

        // Score: Exact name match (100) + avgRating*10 (49) + min(reviewCount, 50) (50) = 199
        assertEquals(199, topResult.getScore());
        assertTrue(topResult.getRankReason().contains("Exact name match"));
        assertTrue(topResult.getRankReason().contains("4.9★ rated"));
    }

    @Test
    @DisplayName("getHotelById computes minPrice from active rooms")
    void testGetHotelById_ComputesMinPrice() {
        Room r1 = Room.builder()
                .id(101L)
                .hotel(tajMahal)
                .name("Standard Suite")
                .type(RoomType.STANDARD)
                .pricePerNight(new BigDecimal("15000.00"))
                .capacity(2)
                .isActive(true)
                .build();

        Room r2 = Room.builder()
                .id(102L)
                .hotel(tajMahal)
                .name("Deluxe Sea Facing")
                .type(RoomType.DELUXE)
                .pricePerNight(new BigDecimal("9500.00"))
                .capacity(2)
                .isActive(true)
                .build();

        when(hotelRepository.findById(1L)).thenReturn(Optional.of(tajMahal));
        when(roomRepository.findByHotelIdAndIsActiveTrue(1L)).thenReturn(List.of(r1, r2));

        HotelDto dto = hotelService.getHotelById(1L);

        assertNotNull(dto);
        assertEquals(2, dto.getRooms().size());
        assertEquals(new BigDecimal("9500.00"), dto.getMinPrice());
    }
}
