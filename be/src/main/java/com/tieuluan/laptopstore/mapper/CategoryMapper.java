package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.CategoryDto;
import com.tieuluan.laptopstore.dto.CategoryTypeDto;
import com.tieuluan.laptopstore.entities.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    @Autowired
    private CategoryTypeMapper categoryTypeMapper;

    public CategoryDto mapToDto(Category category) {
        if (category == null) return null;

        // Map List<CategoryType> -> List<CategoryTypeDto>
        List<CategoryTypeDto> typeDtos = new ArrayList<>();
        if (category.getCategoryTypes() != null) {
            typeDtos = category.getCategoryTypes().stream()
                    .map(t -> categoryTypeMapper.mapToDto(t))
                    .collect(Collectors.toList());
        }

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .code(category.getCode())
                .description(category.getDescription())
                .categoryTypes(typeDtos) // Gán List DTO
                .build();
    }

    public Category mapToEntity(CategoryDto dto) {
        if (dto == null) return null;
        return Category.builder()
                .id(dto.getId())
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .build();
    }
}