package com.tieuluan.laptopstore.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tieuluan.laptopstore.dto.WishlistDto;
import com.tieuluan.laptopstore.services.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistDto>> getWishlist(@PathVariable UUID userId) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable UUID userId, @PathVariable UUID productId) {
        wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable UUID userId, @PathVariable UUID productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
