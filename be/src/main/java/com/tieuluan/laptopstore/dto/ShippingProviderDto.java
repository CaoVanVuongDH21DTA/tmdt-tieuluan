package com.tieuluan.laptopstore.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShippingProviderDto {
    private UUID id;
    private String name;
    private String imgShip;
    private String contactInfo;
    private String trackingUrlTemplate;
}