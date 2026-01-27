package com.tieuluan.laptopstore.services;

import java.util.List;
import java.util.UUID;

import com.tieuluan.laptopstore.dto.ReviewRequestDto;
import com.tieuluan.laptopstore.dto.ReviewResponseDto;

public interface ReviewService {
    
    // Hàm thêm đánh giá (hoặc reply)
    ReviewResponseDto addReview(ReviewRequestDto request);

    // Hàm lấy danh sách đánh giá theo Product ID
    List<ReviewResponseDto> getReviewsByProduct(UUID productId);
}