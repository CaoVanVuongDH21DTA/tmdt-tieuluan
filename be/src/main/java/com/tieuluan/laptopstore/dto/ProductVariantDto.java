package com.tieuluan.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDto {
    private UUID id;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
    private Map<String, String> attributes; 
}