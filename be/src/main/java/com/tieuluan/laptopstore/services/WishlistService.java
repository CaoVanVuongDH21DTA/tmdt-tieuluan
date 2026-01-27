package com.tieuluan.laptopstore.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.dto.WishlistDto;
import com.tieuluan.laptopstore.entities.Product;
import com.tieuluan.laptopstore.entities.Wishlist;
import com.tieuluan.laptopstore.mapper.WishlistMapper;
import com.tieuluan.laptopstore.repositories.ProductRepository;
import com.tieuluan.laptopstore.repositories.WishlistRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserDetailRepository userRepository;
    private final ProductRepository productRepository;
    private final WishlistMapper wishlistMapper;

    public List<WishlistDto> getWishlist(UUID userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(wishlistMapper::toWishlistDto)
                .collect(Collectors.toList());
    }

    public void addToWishlist(UUID userId, UUID productId) {
        if (wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new RuntimeException("Sản phẩm đã có trong danh sách yêu thích");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
