package com.tieuluan.laptopstore.repositories;

import org.springframework.stereotype.Repository;

import com.tieuluan.laptopstore.entities.ShippingProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;


@Repository
public interface ShippingProviderRepository extends JpaRepository<ShippingProvider, UUID> { 
}