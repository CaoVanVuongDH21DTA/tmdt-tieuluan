package com.tieuluan.laptopstore.repositories;

import com.tieuluan.laptopstore.entities.Product;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    List<Product> findByCategory_Id(UUID categoryId);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Trong interface ProductRepository
    List<Product> findByIdIn(List<UUID> ids);

    Product findBySlug(String slug);
    
    @Query("SELECT p FROM Product p " +
        "WHERE p.slug = :slug")
    Optional<Product> findBySlugWithSpecifications(@Param("slug") String slug);

    @Query("""
        SELECT p.name, SUM(oi.quantity) AS sales, SUM(oi.quantity * oi.itemPrice) AS revenue
        FROM OrderItem oi
        JOIN oi.product p
        GROUP BY p.id, p.name
        ORDER BY sales DESC
    """)
    List<Object[]> findTop5SellingProducts();

    @Modifying
    @Transactional // Bắt buộc phải có để thực hiện lệnh UPDATE/DELETE
    @Query("UPDATE Product p SET p.enable = :enable WHERE p.id = :id")
    void updateEnableStatus(UUID id, boolean enable);
}
