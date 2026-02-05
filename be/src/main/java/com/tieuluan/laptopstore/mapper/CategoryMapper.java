package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.CategoryDto;
import com.tieuluan.laptopstore.entities.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    @Autowired
    private CategoryTypeMapper categoryTypeMapper;

    public CategoryDto mapToDto(Category category) {
        if (category == null) return null;
        CategoryDto dto = mapToDtoBasic(category);
        if (category.getCategoryTypes() != null) {
            dto.setCategoryTypes(category.getCategoryTypes().stream()
                    .map(categoryTypeMapper::mapToDto) 
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public CategoryDto mapToDtoBasic(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .code(category.getCode())
                .description(category.getDescription())
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