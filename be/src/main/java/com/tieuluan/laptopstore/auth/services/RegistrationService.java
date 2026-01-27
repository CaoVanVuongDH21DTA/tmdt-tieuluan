package com.tieuluan.laptopstore.auth.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tieuluan.laptopstore.auth.dto.CodeResponse;
import com.tieuluan.laptopstore.auth.dto.RegistrationRequest;
import com.tieuluan.laptopstore.auth.dto.ForgotPassword.RedisUser;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.services.UserRewardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerErrorException;

@Service
public class RegistrationService {

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private AuthorityService authorityService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRewardService userRewardService;

    public CodeResponse createUser(RegistrationRequest request) {
        User existing = userDetailRepository.findByEmail(request.getEmail());

        if (existing != null) {
            return CodeResponse.builder()
                    .code(400)
                    .message("Email đã tồn tại!")
                    .build();
        }

        try {
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setEnabled(false);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhoneNumber(request.getPhoneNumber());
            user.setProvider("manual");

            // Gán role ngay khi tạo user
            user.setAuthorities(authorityService.getUserAuthority());

            //Tạo otp
            String otp = otpService.generateOtp();

            // Tạo RedisUser để lưu Redis
            RedisUser redisUser = new RedisUser();

            redisUser.setEmail(user.getEmail());
            redisUser.setPassword(user.getPassword()); // hashed
            redisUser.setFirstName(user.getFirstName());
            redisUser.setLastName(user.getLastName());
            redisUser.setPhoneNumber(user.getPhoneNumber());
            redisUser.setProvider(user.getProvider());

            // Chuyển user sang JSON để lưu vào Redis
            String userJson = objectMapper.writeValueAsString(redisUser);

            // Lưu OTP + user tạm vào Redis (5 phút)
            otpService.saveOtpAndUser(user.getEmail(), otp, userJson, 5);
            
            // Gửi email xác thực
            emailService.sendOtpEmail(user, otp);

            return CodeResponse.builder()
                    .code(200)
                    .message("Tạo tài khoản thành công! Vui lòng kiểm tra email để xác thực.")
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerErrorException("Đăng ký thất bại", e);
        }
    }

    public boolean verifyUser(String email, String otp) {
        String storedOtp = otpService.getOtp(email);

        if (storedOtp == null) {
            return false;
        }

        if (!storedOtp.trim().equals(otp.trim())) {
            return false;
        }

        try {
            String userJson = otpService.getTempUser(email);
            if (userJson == null) return false;

            // Chuyển JSON sang RedisUser
            RedisUser redisUser = objectMapper.readValue(userJson, RedisUser.class);

            // Lấy user thực từ DB (hoặc tạo mới nếu chưa tồn tại)
            User user = userDetailRepository.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setEmail(redisUser.getEmail());
                user.setFirstName(redisUser.getFirstName());
                user.setLastName(redisUser.getLastName());
                user.setPassword(redisUser.getPassword());
                user.setPhoneNumber(redisUser.getPhoneNumber());
                user.setProvider(redisUser.getProvider());

                // Gán role từ DB, không lấy từ JSON
                user.setAuthorities(authorityService.getUserAuthority());
            }

            user.setEnabled(true);
            userDetailRepository.save(user);
            userRewardService.giveWelcomeDiscount(user);
            otpService.deleteOtpAndUser(email);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public CodeResponse resendRegisterOtp(String email) {
        String userJson = otpService.getTempUser(email);
        
        if (userJson == null) {
            return CodeResponse.builder()
                    .code(400)
                    .message("Email không tồn tại hoặc phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.")
                    .build();
        }

        try {
            String newOtp = otpService.generateOtp();

            otpService.saveOtpAndUser(email, newOtp, userJson, 5);

            // Parse để lấy tên gửi mail cho thân thiện
            RedisUser redisUser = objectMapper.readValue(userJson, RedisUser.class);
            User tempUser = new User();
            tempUser.setEmail(redisUser.getEmail());
            tempUser.setFirstName(redisUser.getFirstName());
            tempUser.setLastName(redisUser.getLastName());
            
            emailService.sendOtpEmail(tempUser, newOtp);

            return CodeResponse.builder()
                    .code(200)
                    .message("Mã xác minh mới đã được gửi lại!")
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return CodeResponse.builder()
                    .code(500)
                    .message("Lỗi hệ thống: " + e.getMessage())
                    .build();
        }
    }
}
