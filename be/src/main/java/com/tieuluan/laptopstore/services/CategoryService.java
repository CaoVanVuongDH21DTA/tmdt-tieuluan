package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.dto.CategoryDto;
import com.tieuluan.laptopstore.entities.Category;
import com.tieuluan.laptopstore.entities.CategoryType;
import com.tieuluan.laptopstore.exceptions.ResourceNotFoundEx;
import com.tieuluan.laptopstore.mapper.CategoryMapper;
import com.tieuluan.laptopstore.repositories.CategoryRepository;
import com.tieuluan.laptopstore.repositories.CategoryTypeRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryTypeRepository categoryTypeRepository;

    @Autowired
    private CategoryMapper categoryMapper;

    // --- GET ONE (Return DTO) ---
    public CategoryDto getCategoryDto(UUID categoryId){
        Optional<Category> category = categoryRepository.findById(categoryId);
        // Map Entity -> DTO
        return category.map(value -> categoryMapper.mapToDto(value)).orElse(null);
    }

    // --- CREATE (Return DTO) ---
    public CategoryDto createCategory(CategoryDto categoryDto){
        Category category = categoryMapper.mapToEntity(categoryDto);
        Category savedCategory = categoryRepository.save(category);
        // Map lại Entity vừa lưu thành DTO để trả về cho Client
        return categoryMapper.mapToDto(savedCategory);
    }

    // --- GET ALL (Return List<DTO>) ---
    public List<CategoryDto> getAllCategoryDtos() {
        List<Category> categories = categoryRepository.findAll();
        // Stream: Convert List<Entity> -> List<DTO>
        return categories.stream()
                .map(category -> categoryMapper.mapToDto(category))
                .collect(Collectors.toList());
    }
    
    // Helper method for internal use (giữ nguyên nếu cần dùng nội bộ)
    public CategoryType getCategoryType(UUID typeId) {
        return categoryTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundEx("CategoryType not found with Id " + typeId));
    }

    // --- UPDATE (Return DTO) ---
    public CategoryDto updateCategory(CategoryDto categoryDto, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(()-> new ResourceNotFoundEx("Category not found with Id "+categoryDto.getId()));

        if(null != categoryDto.getName()){
            category.setName(categoryDto.getName());
        }
        if(null != categoryDto.getCode()){
            category.setCode(categoryDto.getCode());
        }
        if(null != categoryDto.getDescription()){
            category.setDescription(categoryDto.getDescription());
        }

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.mapToDto(updatedCategory);
    }

    public void deleteCategory(UUID categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    public Category getCategoryEntity(UUID categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        }
}