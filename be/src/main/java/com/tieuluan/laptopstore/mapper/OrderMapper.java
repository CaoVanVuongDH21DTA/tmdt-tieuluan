package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.dto.OrderDetails;
import com.tieuluan.laptopstore.dto.OrderItemDetail;
import com.tieuluan.laptopstore.dto.ShippingProviderDto;
import com.tieuluan.laptopstore.entities.Order;
import com.tieuluan.laptopstore.entities.OrderItem;
import com.tieuluan.laptopstore.entities.ShippingProvider;
import com.tieuluan.laptopstore.repositories.ReviewRepository;

import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {
        
        @Autowired private ProductMapper productMapper;
        
        @Autowired private ReviewRepository reviewRepository;

        @Autowired private DiscountMapper discountMapper;

    // =======================================================================
    // 🧾 MAPPING DÀNH CHO USER
    // =======================================================================
    public OrderDetails mapToOrderDetails(Order order, User user) {
        if (order == null || user == null) return null;

        return OrderDetails.builder()
                .id(order.getId())
                .emailUser(user.getEmail())
                .orderDate(order.getOrderDate())
                .address(order.getAddress())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingProvider(mapToShippingProviderDto(order.getShippingProvider()))
                .shipmentNumber(order.getShipmentNumber())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .note(order.getNote())
                .discount(discountMapper.mapToDiscountDto(order.getDiscount()))
                .orderItemList(order.getOrderItemList() != null
                        ? order.getOrderItemList().stream()
                                .map(item -> toOrderItemDetail(item, user))
                                .collect(Collectors.toList())
                        : null)
                .build();
    }

    // =======================================================================
    // 📋 MAPPING DÀNH CHO ADMIN
    // =======================================================================
    public OrderDetails mapToOrderDetailsAdmin(Order order) {
        if (order == null) return null;

        return OrderDetails.builder()
                .id(order.getId())
                .emailUser(order.getUser() != null ? order.getUser().getEmail() : "")
                .orderDate(order.getOrderDate())
                .address(order.getAddress())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingProvider(mapToShippingProviderDto(order.getShippingProvider()))
                .shipmentNumber(order.getShipmentNumber())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .note(order.getNote())
                .discount(discountMapper.mapToDiscountDto(order.getDiscount()))
                .orderItemList(order.getOrderItemList() != null
                        ? order.getOrderItemList().stream()
                                .map(this::toOrderItemDetailAdmin)
                                .collect(Collectors.toList())
                        : null)
                .build();
    }

        public OrderItemDetail toOrderItemDetail(OrderItem item, User user) {
                if (item == null || user == null) return null;

                boolean reviewed = reviewRepository
                        .existsByProductIdAndUserIdAndParentIdIsNull(
                        item.getProduct().getId(),
                        user.getId()
                        );

                return OrderItemDetail.builder()
                        .id(item.getId())
                        .product(productMapper.mapToProductDto(item.getProduct()))
                        .productVariantId(item.getProductVariantId())
                        .quantity(item.getQuantity())
                        .itemPrice(item.getItemPrice())
                        .reviewed(reviewed) 
                        .build();
        }

        public OrderItemDetail toOrderItemDetailAdmin(OrderItem item) {
                if (item == null) return null;

                return OrderItemDetail.builder()
                        .id(item.getId())
                        .product(productMapper.mapToProductDto(item.getProduct()))
                        .productVariantId(item.getProductVariantId())
                        .quantity(item.getQuantity())
                        .itemPrice(item.getItemPrice())
                        .reviewed(false)
                        .build();
        }



    private ShippingProviderDto mapToShippingProviderDto(ShippingProvider sp) {
        if (sp == null) return null;
        return new ShippingProviderDto(
                sp.getId(),
                sp.getName(),
                sp.getImgShip(),
                sp.getContactInfo(),
                sp.getTrackingUrlTemplate()
        );
    }

}

