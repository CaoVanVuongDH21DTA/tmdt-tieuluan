package com.tieuluan.laptopstore.controllers;

import com.tieuluan.laptopstore.auth.entities.UserDiscount;
import com.tieuluan.laptopstore.auth.repositories.UserDiscountRepository;
import com.tieuluan.laptopstore.dto.DiscountDto;
import com.tieuluan.laptopstore.entities.Discount;
import com.tieuluan.laptopstore.mapper.DiscountMapper;
import com.tieuluan.laptopstore.services.DiscountService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discount")
@CrossOrigin
@RequiredArgsConstructor
public class DiscountController {

    @Autowired private DiscountService discountService;
    @Autowired private UserDiscountRepository userDiscountRepository;

    // ================== PUBLIC / AUTHENTICATED (Ai đăng nhập cũng xem được) ==================

    // Lấy danh sách tất cả mã (User xem để lưu mã, Admin xem để quản lý)
    @GetMapping
    public ResponseEntity<List<DiscountDto>> getAllDiscounts() {
        List<Discount> discounts = discountService.getAllDiscounts();
        // Giả sử bạn có class Mapper, nếu không có thể trả trực tiếp List<Discount>
        List<DiscountDto> discountDtos = DiscountMapper.toDtoList(discounts);
        return ResponseEntity.ok(discountDtos);
    }

    // Kiểm tra mã giảm giá theo code (User nhập code để áp dụng)
    @GetMapping("/{code}")
    public ResponseEntity<Discount> getDiscountByCode(@PathVariable String code) {
        return discountService.getDiscountByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy danh sách mã giảm giá của User đang sở hữu
    @GetMapping("/user/{userId}")
    public List<DiscountDto> getDiscountsByUser(@PathVariable UUID userId) {
        List<UserDiscount> userDiscounts = userDiscountRepository.findByUserId(userId);

        return userDiscounts.stream().map(ud -> {
            Discount d = ud.getDiscount(); 
            
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

    // ================== ADMIN ONLY (Chỉ Admin mới được thao tác) ==================

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')") // Bảo mật lớp 2
    public ResponseEntity<Discount> createDiscount(@RequestBody Discount discount) {
        return ResponseEntity.ok(discountService.createDiscount(discount));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Discount> updateDiscount(@PathVariable UUID id, @RequestBody Discount discount) {
        return ResponseEntity.ok(discountService.updateDiscount(id, discount));
    }

    // API bật/tắt trạng thái Active nhanh (Dùng PATCH)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Discount> updateDiscountStatus(
            @PathVariable UUID id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(discountService.updateDiscountStatus(id, active));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteDiscount(@PathVariable UUID id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/distribute-all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> distributeDiscountToAll(@PathVariable UUID id) {
        try {
            discountService.distributeDiscountToAllUsers(id);
            return ResponseEntity.ok("Đã gửi mã giảm giá thành công cho tất cả người dùng.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}