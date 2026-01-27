package com.tieuluan.laptopstore.auth.dto.ForgotPassword;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedisUser {
    private String email;
    private String password; 
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String provider;
}