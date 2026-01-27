package com.tieuluan.laptopstore.controllers.Admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
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
import com.tieuluan.laptopstore.entities.Category;
import com.tieuluan.laptopstore.entities.OrderStatus;
import com.tieuluan.laptopstore.repositories.CategoryRepository;
import com.tieuluan.laptopstore.repositories.OrderRepository;
import com.tieuluan.laptopstore.repositories.ProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AnalyticsController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserDetailRepository userDetailRepository;

    // Doanh thu theo tháng (6 tháng gần nhất)
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStats() {
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();
        
        OrderStatus targetStatus = OrderStatus.DELIVERED;

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));

            Double totalRevenue = orderRepository.sumTotalAmountByMonth(ym.getYear(), ym.getMonthValue(), targetStatus);
            double safeRevenue = (totalRevenue != null) ? totalRevenue : 0.0;
            double calculatedProfit = safeRevenue * 0.4;

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", ym.getMonthValue());
            monthData.put("revenue", safeRevenue);
            monthData.put("profit", calculatedProfit); 

            result.add(monthData);
        }

        return ResponseEntity.ok(result);
    }

    // Tăng trưởng người dùng (6 tháng gần nhất)
    @GetMapping("/user-growth")
    public ResponseEntity<?> getUserGrowth() {
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));

            // Lấy thời điểm cuối cùng trong tháng (ví dụ 2025-10-31T23:59:59)
            LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(23, 59, 59);

            // Đếm tổng user tạo trước hoặc bằng cuối tháng đó
            long totalUsers = userDetailRepository.countUsersBefore(endOfMonth);

            // Đếm số user tạo trong tháng
            long newUsers = userDetailRepository.countUsersInMonth(ym.getYear(), ym.getMonthValue());

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", ym.getMonthValue());
            monthData.put("totalUsers", totalUsers);
            monthData.put("newUsers", newUsers);
            result.add(monthData);
        }

        return ResponseEntity.ok(result);
    }

    // Phân bổ doanh thu theo danh mục
    @GetMapping("/category-distribution")
    public ResponseEntity<?> getCategoryDistribution() {
        List<Category> categories = categoryRepository.findAll();

        List<Map<String, Object>> data = categories.stream()
                .map(cat -> {
                    Double total = orderRepository.sumRevenueByCategory(cat.getId());
                    Map<String, Object> map = new HashMap<>();
                    map.put("category", cat.getName());
                    map.put("revenue", total != null ? total : 0);
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(data);
    }

    // Top 5 sản phẩm bán chạy
    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts() {
        List<Object[]> topProducts = productRepository.findTop5SellingProducts();

        List<Map<String, Object>> result = topProducts.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", obj[0]);
            map.put("sales", obj[1]);
            map.put("revenue", obj[2]);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
