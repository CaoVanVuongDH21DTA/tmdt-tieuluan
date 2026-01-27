package com.tieuluan.laptopstore.entities;

import java.util.Date;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue
    private UUID id;

    // Lưu ID user (Giả sử bạn có bảng User riêng, ở đây lưu ID để decouple)
    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID productId;

    // Để hỗ trợ trả lời bình luận (Reply)
    @Column
    private UUID parentId;

    // Rating có thể là số lẻ (VD: 4.5), dùng Float cho đồng bộ với Product
    @Column
    private Float rating;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}