package com.stayfinder.dto;

import lombok.Data;

import java.util.List;

@Data
public class HotelDto {
    private Long id;
    private String name;
    private String city;
    private String area;
    private String address;
    private String description;
    private Integer stars;
    private String mainImageUrl;
    private List<String> amenities;
    private Double avgRating;
    private Integer reviewCount;
    private Double latitude;
    private Double longitude;
    private List<RoomDto> rooms;
}
