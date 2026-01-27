package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.DiscountDto;
import com.tieuluan.laptopstore.entities.Discount;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class DiscountMapper {

    public static DiscountDto mapToDiscountDto(Discount discount) {
        if (discount == null) return null;

        return DiscountDto.builder()
                .id(discount.getId())
                .code(discount.getCode())
                .percentage(discount.getPercentage())
                .maxDiscountAmount(discount.getMaxDiscountAmount())
                .startDate(discount.getStartDate())
                .endDate(discount.getEndDate())
                .active(discount.isActive())
                .description(discount.getDescription())
                .used(false) 
                .usedDate(null)
                .build();
    }

    public static Discount toEntity(DiscountDto dto) {
        if (dto == null) return null;

        return Discount.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .percentage(dto.getPercentage())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .active(dto.isActive())
                .description(dto.getDescription())
                .build();
    }

    public static List<DiscountDto> toDtoList(List<Discount> discounts) {
        if (discounts == null) return null;
        return discounts.stream().map(DiscountMapper::mapToDiscountDto).collect(Collectors.toList());
    }

    public static List<Discount> toEntityList(List<DiscountDto> dtos) {
        if (dtos == null) return null;
        return dtos.stream().map(DiscountMapper::toEntity).collect(Collectors.toList());
    }
}