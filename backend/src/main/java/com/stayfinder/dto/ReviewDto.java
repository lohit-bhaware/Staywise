package com.stayfinder.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long hotelId;
    private String hotelName;
    private Long bookingId;
    private Integer rating;
    private String title;
    private String body;
    private LocalDateTime createdAt;
}
