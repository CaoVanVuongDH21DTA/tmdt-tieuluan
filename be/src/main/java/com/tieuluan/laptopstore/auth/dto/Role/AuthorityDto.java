package com.tieuluan.laptopstore.auth.dto.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorityDto {
    private UUID id;
    private String roleCode;
    private String roleDescription;
}
