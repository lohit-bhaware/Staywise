package com.stayfinder.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HotelSearchResultDto {
    private HotelDto hotel;
    private int score;
    private String rankReason;
}
