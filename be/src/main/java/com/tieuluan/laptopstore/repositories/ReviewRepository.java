package com.tieuluan.laptopstore.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tieuluan.laptopstore.entities.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    // 1. Lấy tất cả review của 1 sản phẩm, sắp xếp mới nhất trước
    List<Review> findByProductIdOrderByCreatedAtDesc(UUID productId);
    // 2. Check user đã mua/review chưa (Ok)
    boolean existsByProductIdAndUserIdAndParentIdIsNull(UUID productId, UUID userId);
    // 3. Thống kê
    @Query("SELECT COUNT(r), AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.parentId IS NULL AND r.rating IS NOT NULL")
    Object[][] getRatingStats(UUID productId);
}