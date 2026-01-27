package com.tieuluan.laptopstore.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tieuluan.laptopstore.dto.BrandDto;
import com.tieuluan.laptopstore.entities.Brand;
import com.tieuluan.laptopstore.services.BrandService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/brands")
@CrossOrigin
public class BrandController {
    @Autowired
    private BrandService brandService;

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrand());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable(value = "id",required = true) UUID brandId){
        Brand brand = brandService.getBrand(brandId);
        return new ResponseEntity<>(brand, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Brand> createBrand(@RequestBody BrandDto brandDto){
        Brand createdBrand = brandService.createBrand(brandDto);
        return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Brand> updateBrand(@RequestBody BrandDto brandDto, @PathVariable(value = "id",required = true) UUID brandId){
        Brand updatedBrand = brandService.updateBrand(brandDto,brandId);
        return new ResponseEntity<>(updatedBrand, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable(value = "id",required = true) UUID brandId){
        brandService.deleteBrand(brandId);
        return ResponseEntity.ok().build();
    }
}
