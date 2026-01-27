package com.tieuluan.laptopstore.auth.services;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final RedisTemplate<String, String> redisTemplate;

    public OtpService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Sinh OTP ngẫu nhiên 6 chữ số
    public String generateOtp() {
        int code = 100000 + new Random().nextInt(900000);
        return String.valueOf(code);
    }
    
    public void saveOtpAndUser(String email, String otp, String userJson, long ttlMinutes) {
        String key = "REG:" + email;
        String value = otp + "|" + userJson;
        try {
            redisTemplate.opsForValue().set(key, value, ttlMinutes, TimeUnit.MINUTES);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Lấy OTP từ Redis
    public String getOtp(String email) {
        String data = redisTemplate.opsForValue().get("REG:" + email);
        return (data != null) ? data.split("\\|", 2)[0] : null;
    }

    // Lấy thông tin user tạm từ Redis
    public String getTempUser(String email) {
        String data = redisTemplate.opsForValue().get("REG:" + email);
        return (data != null) ? data.split("\\|", 2)[1] : null;
    }

    // Xóa OTP + user tạm
    public void deleteOtpAndUser(String email) {
        redisTemplate.delete("REG:" + email);
    }

    public void saveEmailChangeRequest(String currentEmail, String newEmail, String otp) {
        String key = "CHANGE_EMAIL:" + currentEmail;
        String value = otp + "|" + newEmail; 
        redisTemplate.opsForValue().set(key, value, 5, TimeUnit.MINUTES);
    }

    // Lấy OTP
    public String getEmailChangeOtp(String currentEmail) {
        String data = redisTemplate.opsForValue().get("CHANGE_EMAIL:" + currentEmail);
        return (data != null) ? data.split("\\|", 2)[0] : null;
    }

    // Lấy Email mới
    public String getPendingNewEmail(String currentEmail) {
        String data = redisTemplate.opsForValue().get("CHANGE_EMAIL:" + currentEmail);
        return (data != null && data.contains("|")) ? data.split("\\|", 2)[1] : null;
    }

    // Xóa dữ liệu
    public void deleteEmailChangeRequest(String currentEmail) {
        redisTemplate.delete("CHANGE_EMAIL:" + currentEmail);
    }
}
