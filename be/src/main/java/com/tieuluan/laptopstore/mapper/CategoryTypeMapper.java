package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.CategoryTypeDto;
import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.entities.CategoryType;
import com.tieuluan.laptopstore.entities.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryTypeMapper {

    @Autowired
    private ProductMapper productMapper;

    public CategoryTypeDto mapToDto(CategoryType type) {
        if (type == null) return null;

        // Map List<Product> -> List<ProductDto>
        List<ProductDto> productDtos = new ArrayList<>();
        if (type.getProducts() != null) {
            productDtos = type.getProducts().stream()
                    .filter(Product::isEnable) // Chỉ lấy sản phẩm đang bật
                    .map(p -> productMapper.mapToProductDto(p)) // Gọi ProductMapper để lấy FlashSale
                    .collect(Collectors.toList());
        }

        return CategoryTypeDto.builder()
                .id(type.getId())
                .name(type.getName())
                .code(type.getCode())
                .description(type.getDescription())
                .imgCategory(type.getImgCategory())
                .products(productDtos) // Gán List DTO
                .build();
    }

    public CategoryType mapToEntity(CategoryTypeDto dto) {
        if (dto == null) return null;
        return CategoryType.builder()
                .id(dto.getId())
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .imgCategory(dto.getImgCategory())
                .build();
    }
}