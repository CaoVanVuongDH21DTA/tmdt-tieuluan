package com.tieuluan.laptopstore.repositories;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tieuluan.laptopstore.entities.CategoryType;

public interface CategoryTypeRepository extends JpaRepository<CategoryType, UUID>{
    
}
