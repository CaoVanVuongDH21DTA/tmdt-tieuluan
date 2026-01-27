package com.tieuluan.laptopstore.controllers;

import com.tieuluan.laptopstore.auth.dto.OrderResponse;
import com.tieuluan.laptopstore.dto.OrderDetails;
import com.tieuluan.laptopstore.dto.OrderRequest;
import com.tieuluan.laptopstore.services.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/order")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;

    // [USER] Tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, Principal principal) throws Exception {
        OrderResponse orderResponse = orderService.createOrder(orderRequest, principal);
        return ResponseEntity.ok(orderResponse);
    }

    // [USER] Lấy danh sách đơn hàng của chính người dùng (dựa theo Principal)
    @GetMapping("/user")
    public ResponseEntity<List<OrderDetails>> getOrdersByUser(Principal principal) {
        return ResponseEntity.ok(orderService.getOrdersByUser(principal));
    }

    // [ADMIN] Lấy tất cả đơn hàng (toàn hệ thống)
    @GetMapping
    public ResponseEntity<List<OrderDetails>> getAllOrders() {
        List<OrderDetails> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // [USER] Hủy đơn hàng (chỉ cho phép chủ đơn hủy)
    @PostMapping("/cancel/{id}")
    public ResponseEntity<?> cancelOrder(@PathVariable UUID id, Principal principal) {
        orderService.cancelOrder(id, principal);
        return ResponseEntity.ok(Map.of("message", "Order cancelled successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchOrder(@RequestParam UUID orderId, @RequestParam String email) {
        try {
            OrderDetails orderDetails = orderService.findOrderByIdAndEmail(orderId, email);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDetails> updateOrder(
            @PathVariable UUID id,
            @RequestBody OrderRequest orderRequest) {
        OrderDetails updatedOrder = orderService.updateOrder(id, orderRequest);
        return ResponseEntity.ok(updatedOrder);
    }

}
