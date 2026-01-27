package com.tieuluan.laptopstore.auth.dto.User;

import com.tieuluan.laptopstore.auth.entities.Authority;
import com.tieuluan.laptopstore.dto.DiscountDto;
import com.tieuluan.laptopstore.entities.Address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailsDto {

    private UUID id;
    private String avatarUrl;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String email;
    private List<Authority> authorityList;
    private List<Address> addressList;
    private List<DiscountDto> discounts;
    private Boolean enabled;
}
