package com.tieuluan.laptopstore.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tieuluan.laptopstore.dto.WishlistDto;
import com.tieuluan.laptopstore.entities.Wishlist;

@Component
public class WishlistMapper {

    @Autowired
    private ProductMapper productMapper;

    public WishlistDto toWishlistDto(Wishlist wishlist) {
        if (wishlist == null) return null;

        return WishlistDto.builder()
                .id(wishlist.getId())
                .createdAt(wishlist.getCreatedAt())
                .product(productMapper.mapToProductDto(wishlist.getProduct()))
                .build();
    }
}
