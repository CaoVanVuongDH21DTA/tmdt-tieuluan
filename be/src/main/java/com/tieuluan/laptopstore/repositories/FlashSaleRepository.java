package com.tieuluan.laptopstore.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tieuluan.laptopstore.entities.FlashSale;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, UUID> {
    List<FlashSale> findAllByOrderByStartDateDesc();
}