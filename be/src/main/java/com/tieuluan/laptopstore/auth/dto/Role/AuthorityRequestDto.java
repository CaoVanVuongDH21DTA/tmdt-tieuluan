package com.tieuluan.laptopstore.auth.dto.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorityRequestDto {
    private String roleCode;
    private String roleDescription;
}
