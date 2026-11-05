package com.stayfinder.dto;

import com.stayfinder.model.RoomType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomDto {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String name;
    private RoomType type;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private String description;
    private String imageUrl;
    private List<String> amenities;
    private Boolean isActive;
}
