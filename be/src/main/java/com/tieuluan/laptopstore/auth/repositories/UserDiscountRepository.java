package com.tieuluan.laptopstore.auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tieuluan.laptopstore.auth.entities.UserDiscount;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDiscountRepository extends JpaRepository<UserDiscount, UUID> {
    
    // Tìm xem user đã sở hữu mã này chưa
    Optional<UserDiscount> findByUserIdAndDiscountId(UUID userId, UUID discountId);

    // Tìm tất cả mã của user (để hiển thị danh sách voucher của tôi)
    List<UserDiscount> findByUserId(UUID userId);
    
    // Kiểm tra tồn tại
    boolean existsByUserIdAndDiscountId(UUID userId, UUID discountId);
}