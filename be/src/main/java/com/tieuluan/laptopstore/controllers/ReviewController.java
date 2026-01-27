package com.tieuluan.laptopstore.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tieuluan.laptopstore.dto.ReviewRequestDto;
import com.tieuluan.laptopstore.dto.ReviewResponseDto;
import com.tieuluan.laptopstore.services.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Thêm đánh giá hoặc trả lời
    @PostMapping
    public ResponseEntity<ReviewResponseDto> addReview(@RequestBody ReviewRequestDto request) {
        ReviewResponseDto createdReview = reviewService.addReview(request);
        System.out.println("requestReview: "+ request);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    // Lấy danh sách đánh giá của sản phẩm (đã phân cấp cha con)
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponseDto>> getProductReviews(@PathVariable UUID productId) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(reviews);
    }
}