package com.tieuluan.laptopstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private UUID userId;
    private LocalDateTime orderDate;
    private UUID addressId;
    private UUID shippingProviderId;
    private List<OrderItemRequest> orderItemRequests;
    private Double totalAmount;
    private UUID discountId;
    private String paymentMethod;
    private String orderStatus;
    private LocalDateTime expectedDeliveryDate;
    private String note;
}

