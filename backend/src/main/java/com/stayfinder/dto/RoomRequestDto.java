package com.stayfinder.dto;

import com.stayfinder.model.RoomType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomRequestDto {

    @NotBlank(message = "Room name is required")
    @Size(max = 150, message = "Room name must not exceed 150 characters")
    private String name;

    @NotNull(message = "Room type is required")
    private RoomType type;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.01", message = "Price must be positive")
    private BigDecimal pricePerNight;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String description;
    private String imageUrl;
    private List<String> amenities;

    @Builder.Default
    private Boolean isActive = true;
}
