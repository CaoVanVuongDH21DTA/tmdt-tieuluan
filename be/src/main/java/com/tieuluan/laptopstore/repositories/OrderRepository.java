package com.tieuluan.laptopstore.repositories;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.entities.Order;
import com.tieuluan.laptopstore.entities.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUser(User user);

    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.user.email = :email")
    Optional<Order> findByIdAndUserEmail(@Param("orderId") UUID orderId, @Param("email") String email);

    // 1. Tính tổng doanh thu dựa trên danh sách trạng thái (VD: Completed, Shipping)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus IN :statuses")
    Double sumRevenueByStatuses(@Param("statuses") Collection<OrderStatus> statuses);

    // 2. Đếm số lượng đơn hàng theo trạng thái (Dùng để đếm đơn hủy)
    long countByOrderStatus(OrderStatus orderStatus);

    List<Order> findTop5ByOrderByOrderDateDesc();

    // Lợi nhuận giả định (ví dụ: 60% doanh thu)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE YEAR(o.orderDate) = :year AND MONTH(o.orderDate) = :month AND o.orderStatus = :status")
    Double sumTotalAmountByMonth(@Param("year") int year, @Param("month") int month, @Param("status") OrderStatus status);

    // Doanh thu theo danh mục (dựa trên OrderItem)
    @Query("""
        SELECT SUM(oi.itemPrice * oi.quantity) 
        FROM OrderItem oi 
        WHERE oi.product.category.id = :categoryId
    """)
    Double sumRevenueByCategory(@Param("categoryId") UUID categoryId);

    List<Order> findByOrderStatusAndPaymentMethodInAndOrderDateBefore(
            OrderStatus orderStatus,
            List<String> paymentMethods,
            LocalDateTime time
    );

}