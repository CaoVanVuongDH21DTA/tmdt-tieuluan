package com.tieuluan.laptopstore.controllers;

import com.tieuluan.laptopstore.services.OrderService;
import com.tieuluan.laptopstore.services.VnPayService;
import com.tieuluan.laptopstore.repositories.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VnPayService vnPayService;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // ===========================================
    // TẠO URL THANH TOÁN VNPay
    // ===========================================
    @GetMapping("/vnpay/{orderId}")
    public ResponseEntity<?> createVnPayPayment(
            @PathVariable UUID orderId,
            @RequestParam(required = false) String bankCode
    ) throws Exception {

        if (!orderRepository.existsById(orderId)) {
            return ResponseEntity.badRequest().body("Order not found");
        }

        // KHÔNG TRUYỀN AMOUNT
        String paymentUrl = vnPayService.createPaymentUrl(orderId, bankCode);

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    // ===========================================
    // VNPay RETURN
    // ===========================================
    @GetMapping("/vnpay-return")
    public ResponseEntity<?> handleVnPayReturn(
            @RequestParam Map<String, String> params,
            HttpServletRequest request
    ) {
        try {
            // 1️⃣ VERIFY SIGNATURE
            boolean validSignature = vnPayService.validateSignature(params);
            if (!validSignature) {
                return ResponseEntity.badRequest().body("Chữ ký không hợp lệ");
            }

            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");

            if (responseCode == null || txnRef == null) {
                return ResponseEntity.badRequest().body("Thiếu tham số VNPay");
            }

            UUID orderId = UUID.fromString(txnRef);

            // 2️⃣ UPDATE ORDER STATUS
            orderService.updateOrderStatusAfterPayment(orderId, responseCode);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", orderId);

            if ("00".equals(responseCode)) {
                result.put("status", "success");
                result.put("message", "Thanh toán thành công");
            } else {
                result.put("status", "failed");
                result.put("message", "Thanh toán thất bại hoặc bị hủy");
            }

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Sai định dạng orderId");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi xử lý VNPay");
        }
    }
}
