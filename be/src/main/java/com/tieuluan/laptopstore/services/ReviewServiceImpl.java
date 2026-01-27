package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.auth.dto.User.UserPublicDto;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.dto.ReviewRequestDto;
import com.tieuluan.laptopstore.dto.ReviewResponseDto;
import com.tieuluan.laptopstore.entities.Product;
import com.tieuluan.laptopstore.entities.Review;
import com.tieuluan.laptopstore.repositories.ProductRepository;
import com.tieuluan.laptopstore.repositories.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserDetailRepository userRepository; 

    // --- 1. TẠO REVIEW & TỰ ĐỘNG CẬP NHẬT RATING ---
    @Override
    @Transactional // Đảm bảo tính toàn vẹn dữ liệu (Rollback nếu lỗi)
    public ReviewResponseDto addReview(ReviewRequestDto request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // A. Lưu Review
        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(request.getUserId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .rating(request.getParentId() == null ? request.getRating() : null) 
                .build();
        
        Review savedReview = reviewRepository.saveAndFlush(review);

        // B. Logic cập nhật Product (Chỉ làm khi là Review gốc và có chấm điểm)
        if (request.getParentId() == null && request.getRating() != null) {
            updateProductRating(request.getProductId(), product);
        }

        return mapToDto(savedReview);
    }

    // Helper: Tính toán và update bảng Product
    private void updateProductRating(UUID productId, Product product) {
        // Gọi Query lấy [Count, Avg]
        Object[][] stats = reviewRepository.getRatingStats(productId);
        
        if (stats != null && stats.length > 0) {
            Long count = (stats[0][0] != null) ? (Long) stats[0][0] : 0L;
            Double avgDouble = (stats[0][1] != null) ? (Double) stats[0][1] : 0.0;

            if (count > 0 && avgDouble != null) {
                // Làm tròn 1 chữ số thập phân (VD: 4.567 -> 4.6)
                float newRating = (float) (Math.round(avgDouble * 10.0) / 10.0);
                
                // Cập nhật Entity Product
                product.setRating(newRating);
                product.setReviewCount(count.intValue());
                
                // Lưu lại Product
                productRepository.save(product);
            }
        }
    }

    // --- 2. LẤY DANH SÁCH DẠNG CÂY ---
    @Override
    public List<ReviewResponseDto> getReviewsByProduct(UUID productId) {
        List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        List<ReviewResponseDto> dtos = allReviews.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Thuật toán xây dựng cây (In-memory)
        return buildReviewTree(dtos);
    }

    // Helper: Map Entity -> DTO (ĐÃ SỬA LẠI TÊN USER)
    private ReviewResponseDto mapToDto(Review entity) {
        // Mặc định
        UserPublicDto userDto = UserPublicDto.builder()
                .firstName("Người dùng ")
                .lastName(" ẩn danh")
                .avatarUrl(null) 
                .build();
        
        if (entity.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(entity.getUserId());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                userDto.setId(user.getId());
                userDto.setFirstName(user.getFirstName());
                userDto.setLastName(user.getLastName());
                userDto.setAvatarUrl(user.getAvatarUrl()); 
            }
        }

        return ReviewResponseDto.builder()
                .id(entity.getId())
                .user(userDto)
                .content(entity.getContent())
                .rating(entity.getRating())
                .parentId(entity.getParentId())
                .createdAt(entity.getCreatedAt())
                .replies(new ArrayList<>())
                .build();
    }

    // Helper: Gom nhóm cha con
    private List<ReviewResponseDto> buildReviewTree(List<ReviewResponseDto> allReviews) {
        Map<UUID, ReviewResponseDto> map = new HashMap<>();
        List<ReviewResponseDto> roots = new ArrayList<>();

        for (ReviewResponseDto r : allReviews) map.put(r.getId(), r);

        for (ReviewResponseDto r : allReviews) {
            if (r.getParentId() != null) {
                ReviewResponseDto parent = map.get(r.getParentId());
                if (parent != null) {
                    parent.getReplies().add(r);
                }
            } else {
                roots.add(r);
            }
        }

        // Sắp xếp replies để hiển thị đúng thứ tự (cũ nhất lên trước)
        roots.forEach(this::sortRepliesRecursively);

        return roots;
    }

    // Helper: Sắp xếp đệ quy
    private void sortRepliesRecursively(ReviewResponseDto node) {
        if (!node.getReplies().isEmpty()) {
            // Sắp xếp tăng dần theo thời gian tạo (cũ -> mới)
            node.getReplies().sort(Comparator.comparing(ReviewResponseDto::getCreatedAt));
            // Đệ quy cho các cấp con sâu hơn (nếu có)
            node.getReplies().forEach(this::sortRepliesRecursively);
        }
    }
}