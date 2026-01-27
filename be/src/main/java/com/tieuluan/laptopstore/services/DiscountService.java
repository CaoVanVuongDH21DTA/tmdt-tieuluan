package com.tieuluan.laptopstore.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.entities.UserDiscount;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.auth.repositories.UserDiscountRepository;
import com.tieuluan.laptopstore.dto.DiscountDto;
import com.tieuluan.laptopstore.entities.Discount;
import com.tieuluan.laptopstore.repositories.DiscountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountService {

    @Autowired private DiscountRepository discountRepository;
    @Autowired private UserDetailRepository userRepository;
    @Autowired private UserDiscountRepository userDiscountRepository;

    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }

    public Optional<Discount> getDiscountByCode(String code) {
        return discountRepository.findByCode(code);
    }

    public Discount createDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    public Discount updateDiscount(UUID id, Discount updatedDiscount) {
        return discountRepository.findById(id)
                .map(existing -> {
                    existing.setCode(updatedDiscount.getCode());
                    existing.setPercentage(updatedDiscount.getPercentage());
                    existing.setMaxDiscountAmount(updatedDiscount.getMaxDiscountAmount());
                    existing.setStartDate(updatedDiscount.getStartDate());
                    existing.setEndDate(updatedDiscount.getEndDate());
                    existing.setActive(updatedDiscount.isActive());
                    existing.setDescription(updatedDiscount.getDescription());
                    return discountRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
    }

    public void deleteDiscount(UUID id) {
        discountRepository.deleteById(id);
    }

    // SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY
    public List<DiscountDto> getDiscountsByUser(UUID userId) {
        List<UserDiscount> userDiscounts = userDiscountRepository.findByUserId(userId);

        return userDiscounts.stream().map(ud -> {
            Discount d = ud.getDiscount(); // Lấy thông tin voucher gốc
            
            return DiscountDto.builder()
                    .id(d.getId())
                    .code(d.getCode())
                    .percentage(d.getPercentage())
                    .maxDiscountAmount(d.getMaxDiscountAmount())
                    .startDate(d.getStartDate())
                    .endDate(d.getEndDate())
                    .active(d.isActive())
                    .description(d.getDescription())
                    .used(ud.isUsed())      
                    .usedDate(ud.getUsedDate())
                    .build();
        }).collect(Collectors.toList());
    }

    public Discount updateDiscountStatus(UUID id, boolean isActive) {
        return discountRepository.findById(id)
                .map(existing -> {
                    existing.setActive(isActive);
                    return discountRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá với ID: " + id));
    }

    @Transactional
    public void distributeDiscountToAllUsers(UUID discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));

        if (!discount.isActive()) {
            throw new RuntimeException("Mã giảm giá này đang bị khóa, không thể gửi.");
        }

        List<User> users = userRepository.findAll();
        List<UserDiscount> newUserDiscounts = new ArrayList<>();

        for (User user : users) {
            boolean alreadyHas = userDiscountRepository.existsByUserIdAndDiscountId(user.getId(), discount.getId());
            
            if (!alreadyHas) {
                UserDiscount userDiscount = new UserDiscount();
                userDiscount.setUser(user);
                userDiscount.setDiscount(discount);
                userDiscount.setUsed(false);
                newUserDiscounts.add(userDiscount);
            }
        }

        if (!newUserDiscounts.isEmpty()) {
            userDiscountRepository.saveAll(newUserDiscounts);
        }
    }
}