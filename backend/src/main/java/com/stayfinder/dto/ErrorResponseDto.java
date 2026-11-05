package com.stayfinder.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ErrorResponseDto {
    private String error;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponseDto(String error, String message) {
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
