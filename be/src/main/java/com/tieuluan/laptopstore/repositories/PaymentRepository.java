package com.tieuluan.laptopstore.repositories;

import com.tieuluan.laptopstore.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    @Modifying
    @Transactional
    @Query(value = "UPDATE payments SET payment_status = :status, payment_date = :now WHERE order_id = :orderId", nativeQuery = true)
    void updatePaymentStatusByOrderId(@Param("orderId") UUID orderId, 
                                      @Param("status") String status, 
                                      @Param("now") Date now);
}