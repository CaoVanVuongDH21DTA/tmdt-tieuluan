package com.tieuluan.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDto {
    private UUID id;
    private String code;
    private double percentage;
    private double maxDiscountAmount;
    private Date startDate;
    private Date endDate;
    private boolean active;
    private String description;

    private boolean used;    
    private Date usedDate;
}
