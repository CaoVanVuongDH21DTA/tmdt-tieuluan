package com.tieuluan.laptopstore.auth.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.tieuluan.laptopstore.auth.dto.User.UserDetailsDto;
import com.tieuluan.laptopstore.auth.entities.Authority;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.mapper.DiscountMapper;

@Component
public class UserDetailsMapper {

    public UserDetailsDto toUserDetailsDto(User user) {
        if (user == null) {
            return null;
        }
        List<Authority> authorities = user.getAuthorities().stream()
                .map(auth -> (Authority) auth) 
                .collect(Collectors.toList());
        return UserDetailsDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .addressList(user.getAddressList())
                .authorityList(authorities)
                .discounts(
                    user.getUserDiscounts() == null
                        ? null
                        : user.getUserDiscounts().stream()
                            .map(userDiscount -> DiscountMapper.mapToDiscountDto(userDiscount.getDiscount()))
                            .collect(Collectors.toList())
                )
                .enabled(user.isEnabled())
                .build();
    }
}
