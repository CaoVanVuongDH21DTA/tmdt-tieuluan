package com.tieuluan.laptopstore.repositories;

import com.tieuluan.laptopstore.entities.FlashSaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, UUID> {

    @Query("SELECT fsi FROM FlashSaleItem fsi " +
           "JOIN FETCH fsi.flashSale fs " +
           "WHERE fsi.product.id IN :productIds " +
           "AND fs.status = 1 " + // Chỉ lấy Sale đang Active (1)
           "AND :now BETWEEN fs.startDate AND fs.endDate")
    List<FlashSaleItem> findActiveSalesByProductIds(@Param("productIds") List<UUID> productIds, 
                                                    @Param("now") LocalDateTime now);

    // Tương tự cho hàm tìm 1 sản phẩm
    @Query("SELECT fsi FROM FlashSaleItem fsi " +
           "JOIN FETCH fsi.flashSale fs " +
           "WHERE fsi.product.id = :productId " +
           "AND fs.status = 1 " +
           "AND :now BETWEEN fs.startDate AND fs.endDate") 
    Optional<FlashSaleItem> findActiveSaleByProductId(@Param("productId") UUID productId, 
                                                      @Param("now") LocalDateTime now);

    @Query("SELECT fsi FROM FlashSaleItem fsi " +
           "JOIN FETCH fsi.product p " + 
           "WHERE fsi.flashSale.id = :flashSaleId")
    List<FlashSaleItem> findByFlashSaleId(@Param("flashSaleId") UUID flashSaleId);

    // Dùng để đếm tổng số SP trong bảng danh sách
    int countByFlashSaleId(UUID flashSaleId);

    // Dùng để xóa sạch items trước khi xóa Flash Sale cha
    void deleteByFlashSaleId(UUID flashSaleId);
}