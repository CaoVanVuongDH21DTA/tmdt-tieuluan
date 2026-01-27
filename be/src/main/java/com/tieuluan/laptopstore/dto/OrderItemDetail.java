package com.tieuluan.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemDetail {

    private UUID id;
    private ProductDto product;
    private UUID productVariantId;
    private Integer quantity;
    private Double itemPrice;

    private boolean reviewed;
}