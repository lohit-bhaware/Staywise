package com.stayfinder.dto;

import com.stayfinder.model.BookingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private RoomDto room;
    private HotelDto hotel;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private Integer guestCount;
}
