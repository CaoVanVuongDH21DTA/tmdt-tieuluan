package com.tieuluan.laptopstore.repositories;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tieuluan.laptopstore.entities.Brand;
import com.tieuluan.laptopstore.entities.Category;

public interface BrandRepository extends JpaRepository<Brand, UUID>{
    Optional<Category> findByCode(String code);
}
