package com.tieuluan.laptopstore.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tieuluan.laptopstore.auth.entities.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue
    private UUID id;

    private LocalDateTime orderDate;
    
    private LocalDateTime expectedDeliveryDate;

    // 🧍‍♂️ Người dùng đặt hàng
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "roles", "addresses"})
    private User user;

    // 📍 Địa chỉ giao hàng
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Address address;

    // 🚚 Đơn vị vận chuyển
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shipping_provider_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ShippingProvider shippingProvider;

    @Column(nullable = false, unique = true)
    private String shipmentNumber;

    @Column(nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @Column(nullable = false)
    private String paymentMethod;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "order", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnoreProperties({"order"})
    private List<OrderItem> orderItemList;

    @ManyToOne
    @JoinColumn(name = "discount_id")
    private Discount discount;

    @OneToOne(fetch = FetchType.LAZY, mappedBy = "order", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnoreProperties({"order"})
    private Payment payment;

    @Column(columnDefinition = "TEXT")
    private String note;
}
