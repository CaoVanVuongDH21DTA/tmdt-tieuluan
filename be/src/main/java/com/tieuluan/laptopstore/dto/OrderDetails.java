package com.tieuluan.laptopstore.dto;

import com.tieuluan.laptopstore.entities.Address;
import com.tieuluan.laptopstore.entities.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDetails {

    private UUID id;
    private LocalDateTime orderDate;
    private String emailUser;
    private Address address;
    private Double totalAmount;
    private OrderStatus orderStatus;
    private String paymentMethod;
    private ShippingProviderDto  shippingProvider;
    private String shipmentNumber;
    private DiscountDto discount;
    private String note;
    private LocalDateTime expectedDeliveryDate;
    private List<OrderItemDetail> orderItemList;

}