package com.tieuluan.laptopstore.controllers.Admin;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.dto.OrderDetails;
import com.tieuluan.laptopstore.entities.Order;
import com.tieuluan.laptopstore.entities.OrderStatus;
import com.tieuluan.laptopstore.mapper.OrderMapper;
import com.tieuluan.laptopstore.repositories.OrderRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class DashboardController {

    private final UserDetailRepository userDetailRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @GetMapping
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // --- 1. Thống kê User & Tổng đơn ---
        long totalUsers = userDetailRepository.count();
        long totalOrders = orderRepository.count(); // Tổng tất cả các đơn (bao gồm cả hủy)

        // --- 2. Thống kê Doanh thu (Chỉ tính Hoàn thành & Đã giao) ---
        List<OrderStatus> revenueStatuses = Arrays.asList(
            OrderStatus.DELIVERED,
            OrderStatus.SHIPPED   
        );
        Double totalRevenue = orderRepository.sumRevenueByStatuses(revenueStatuses);
        
        long cancelledOrders = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);

        // --- Đẩy dữ liệu vào Map ---
        stats.put("totalUsers", totalUsers);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("cancelledOrders", cancelledOrders);

        // --- 4. Đơn hàng gần đây ---
        List<Order> recentOrders = orderRepository.findTop5ByOrderByOrderDateDesc();
        List<OrderDetails> recentOrderDetails = recentOrders.stream()
                .map(order -> orderMapper.mapToOrderDetails(order, order.getUser()))
                .collect(Collectors.toList());

        stats.put("recentOrders", recentOrderDetails);

        return ResponseEntity.ok(stats);
    }
}