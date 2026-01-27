package com.tieuluan.laptopstore.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tieuluan.laptopstore.entities.Discount;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, UUID> {
    Optional<Discount> findByCode(String code);
}
