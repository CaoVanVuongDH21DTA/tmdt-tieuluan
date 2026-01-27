package com.tieuluan.laptopstore.auth.dto.User;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserToken {
    private String token;
    private UUID id;
    private String email;
    private List<String> roles;
}
