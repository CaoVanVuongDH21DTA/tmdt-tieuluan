package com.tieuluan.laptopstore.auth.dto.ForgotPassword;

import lombok.Data;

@Data
public class VerifyOtpForgotPassword {
    private String email;
    private String otp;
}
