package com.tieuluan.laptopstore.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class FlashSaleDtos {

    // 1. Dùng cho danh sách (Table Admin)
    @Data
    @Builder
    public static class ListResponse {
        private UUID id;
        private String name;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private int status;
        private int totalProducts;
    }

    // 2. Dùng cho chi tiết (Form Edit)
    @Data
    @Builder
    public static class DetailResponse {
        private UUID id;
        private String name;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private List<ItemResponse> items;
    }

    @Data
    @Builder
    public static class ItemResponse {
        private ProductDto product; 
        private Double discountPercent;
        private int quantity;
        private int sold;
    }

    // 3. Dùng để Tạo mới / Cập nhật (Request Body)
    @Data
    public static class UpsertRequest {
        private UUID id; // Null = Tạo mới, Có giá trị = Cập nhật
        private String name;
        private String startDate; // ISO String
        private String endDate;
        private List<ItemRequest> items;

        @Data
        public static class ItemRequest {
            private UUID productId;
            private Double discountPercent;
            private int quantity;
        }
    }

    @Data
    @Builder
    public static class ProductFlashSaleInfo {
        private UUID id;              
        private Double discountPercent;
        private int quantity;
        private int sold;
        private LocalDateTime startDate; 
        private LocalDateTime endDate; 
    }
}