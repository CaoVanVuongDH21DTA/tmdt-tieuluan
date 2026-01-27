package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.BrandDto;
import com.tieuluan.laptopstore.entities.Brand;

import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    public Brand mapToEntity(BrandDto dto) {
        Brand brand = new Brand();
        brand.setName(dto.getName());
        brand.setCode(dto.getCode());
        brand.setDescription(dto.getDescription());
        brand.setLogoUrl(dto.getLogoUrl());
        return brand;
    }
}
