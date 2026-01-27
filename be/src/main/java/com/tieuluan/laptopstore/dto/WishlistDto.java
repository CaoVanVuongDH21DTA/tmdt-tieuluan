package com.tieuluan.laptopstore.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDto {
    private UUID id;
    private Date createdAt;
    private ProductDto product;
}
