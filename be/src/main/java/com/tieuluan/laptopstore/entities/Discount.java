package com.tieuluan.laptopstore.entities;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tieuluan.laptopstore.auth.entities.UserDiscount;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "discount")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code; // Mã giảm giá (ví dụ: SALE20, NEWUSER, ...)

    @Column(nullable = false)
    private double percentage; // Tỷ lệ giảm giá (%)

    @Column(nullable = false)
    private double maxDiscountAmount; // Giảm tối đa (VNĐ)

    private Date startDate;
    private Date endDate;

    private boolean active = true; // Mặc định là đang hoạt động

    private String description; // Mô tả thêm (nếu có)

    // Nhiều user có thể được tặng hoặc dùng nhiều mã giảm giá
    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserDiscount> userDiscounts;

}
