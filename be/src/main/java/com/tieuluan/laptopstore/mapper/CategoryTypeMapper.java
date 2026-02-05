package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.CategoryTypeDto;
import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.entities.CategoryType;
import com.tieuluan.laptopstore.entities.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryTypeMapper {

    @Autowired
    @Lazy
    private ProductMapper productMapper;

    public CategoryTypeDto mapToDto(CategoryType type) {
        if (type == null) return null;

        CategoryTypeDto dto = mapToDtoBasic(type);

        if (type.getProducts() != null) {
            List<ProductDto> productDtos = type.getProducts().stream()
                    .filter(Product::isEnable)
                    .map(p -> productMapper.mapToProductDto(p))
                    .collect(Collectors.toList());
            dto.setProducts(productDtos);
        }

        return dto;
    }

    public CategoryTypeDto mapToDtoBasic(CategoryType type) {
        if (type == null) return null;
        
        return CategoryTypeDto.builder()
                .id(type.getId())
                .name(type.getName())
                .code(type.getCode())
                .description(type.getDescription())
                .imgCategory(type.getImgCategory())
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