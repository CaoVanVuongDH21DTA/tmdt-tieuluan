package com.tieuluan.laptopstore.specification;

import com.tieuluan.laptopstore.entities.Product;

import org.springframework.data.jpa.domain.Specification;
import java.util.UUID;

public class ProductSpecs {

    public static Specification<Product> hasCategoryId(UUID categorId){
        return  (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("category").get("id"),categorId);
    }

    public static Specification<Product> hasCategoryTypeId(UUID typeId){
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("categoryType").get("id"),typeId);
    }

}
