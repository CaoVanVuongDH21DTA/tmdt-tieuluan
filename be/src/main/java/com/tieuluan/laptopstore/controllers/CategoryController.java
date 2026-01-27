package com.tieuluan.laptopstore.controllers;

import com.tieuluan.laptopstore.dto.CategoryDto;
import com.tieuluan.laptopstore.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/category") 
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // ================== PUBLIC ==================
    
    // Sửa: Trả về List<CategoryDto>
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoryDtos());
    }

    // Sửa: Trả về CategoryDto
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable(value = "id", required = true) UUID categoryId){
        CategoryDto categoryDto = categoryService.getCategoryDto(categoryId);
        return new ResponseEntity<>(categoryDto, HttpStatus.OK);
    }

    // ================== ADMIN ONLY ==================

    // Sửa: Trả về CategoryDto
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto categoryDto){
        CategoryDto newCategory = categoryService.createCategory(categoryDto);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    // Sửa: Trả về CategoryDto
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<CategoryDto> updateCategory(@RequestBody CategoryDto categoryDto, @PathVariable(value = "id", required = true) UUID categoryId){
        CategoryDto updatedCategory = categoryService.updateCategory(categoryDto, categoryId);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<Void> deleteCategory(@PathVariable(value = "id", required = true) UUID categoryId){
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }
}