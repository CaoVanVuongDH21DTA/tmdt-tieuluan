package com.tieuluan.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal discount;
    private Float rating;
    private boolean newArrival;
    private int stock;
    private String thumbnail;
    private BrandDto brand;
    private CategoryDto category;
    private CategoryTypeDto categoryType;
    private boolean enable;
    private FlashSaleDtos.ProductFlashSaleInfo flashSale;
    private int reviewCount;
    
    private List<ProductSpecificationDto> specifications;
    private List<ProductVariantDto> variants;
    private List<ProductResourceDto> resources;
}

