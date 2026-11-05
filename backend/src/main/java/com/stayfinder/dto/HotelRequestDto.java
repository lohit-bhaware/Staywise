package com.stayfinder.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class HotelRequestDto {

    @NotBlank(message = "Hotel name is required")
    @Size(max = 255, message = "Hotel name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "Area must not exceed 100 characters")
    private String area;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    private String description;

    @NotNull(message = "Stars are required")
    @Min(value = 1, message = "Stars must be at least 1")
    @Max(value = 5, message = "Stars must not exceed 5")
    private Integer stars;

    private String mainImageUrl;
    private List<String> amenities;
    private Double latitude;
    private Double longitude;
}
