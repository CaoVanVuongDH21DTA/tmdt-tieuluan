package com.tieuluan.laptopstore.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.tieuluan.laptopstore.repositories.BrandRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tieuluan.laptopstore.dto.BrandDto;
import com.tieuluan.laptopstore.entities.Brand;
import com.tieuluan.laptopstore.exceptions.ResourceNotFoundEx;
import com.tieuluan.laptopstore.mapper.BrandMapper;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private BrandMapper brandMapper;

    BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public Brand getBrand(UUID brandId) {
        Optional<Brand> brand = brandRepository.findById(brandId);
        return brand.orElse(null);
    }

    public List<Brand> getAllBrand() {
        return brandRepository.findAll();
    }

    public Brand createBrand(BrandDto brandDto){
        Brand brand = brandMapper.mapToEntity(brandDto);
        return brandRepository.save(brand);
    }

    public Brand updateBrand(BrandDto brandDto, UUID brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(()-> new ResourceNotFoundEx("Brand not found with Id "+brandDto.getId()));

        if(null != brandDto.getName()){
            brand.setName(brandDto.getName());
        }
        if(null != brandDto.getCode()){
            brand.setCode(brandDto.getCode());
        }
        if(null != brandDto.getDescription()){
            brand.setDescription(brandDto.getDescription());
        }
        if(null != brandDto.getLogoUrl()){
            brand.setLogoUrl(brandDto.getLogoUrl());
        }

        return  brandRepository.save(brand);
    }

    public void deleteBrand(UUID brandId) {
        brandRepository.deleteById(brandId);
    }
}
