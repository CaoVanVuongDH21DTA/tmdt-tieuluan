package com.tieuluan.laptopstore.auth.controller;

import com.tieuluan.laptopstore.auth.services.AuthorityService;
import com.tieuluan.laptopstore.auth.services.EmailService;
import com.tieuluan.laptopstore.auth.config.JWTTokenHelper;
import com.tieuluan.laptopstore.auth.dto.CodeResponse;
import com.tieuluan.laptopstore.auth.dto.LoginRequest;
import com.tieuluan.laptopstore.auth.dto.RegistrationRequest;
import com.tieuluan.laptopstore.auth.dto.ForgotPassword.ForgotPasswordRequest;
import com.tieuluan.laptopstore.auth.dto.ForgotPassword.ResendOtp;
import com.tieuluan.laptopstore.auth.dto.ForgotPassword.ResetPasswordRequest;
import com.tieuluan.laptopstore.auth.dto.ForgotPassword.VerifyOtpForgotPassword;
import com.tieuluan.laptopstore.auth.dto.User.UserToken;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.auth.services.OtpService;
import com.tieuluan.laptopstore.auth.services.RegistrationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    AuthorityService authorityService;

    @Autowired
    RegistrationService registrationService;

    @Autowired
    UserDetailsService userDetailsService;

    @Autowired
    JWTTokenHelper jwtTokenHelper;

    @Autowired
    OtpService otpService;

    @Autowired
    EmailService emailService;

    @Autowired
    RedisTemplate<String, String> redisTemplate;

    @Autowired
    UserDetailRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest){
        try{
            Authentication authentication = UsernamePasswordAuthenticationToken.unauthenticated(
                    loginRequest.getUserName(),
                    loginRequest.getPassword()
            );

            Authentication authenticationResponse = this.authenticationManager.authenticate(authentication);

            if(authenticationResponse.isAuthenticated()){
                User user = (User) authenticationResponse.getPrincipal();

                String token = jwtTokenHelper.generateToken(user);

                UserToken userToken = UserToken.builder().token(token).build();

                return new ResponseEntity<>(userToken, HttpStatus.OK);
            }

        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản của bạn đã bị vô hiệu hóa!");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai tài khoản hoặc mật khẩu!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Lỗi xác thực: " + e.getMessage());
        }

        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/google")
    public ResponseEntity<UserToken> loginWithGoogle(@RequestBody Map<String, String> body) {
        String idToken = body.get("token");

        try {
            UserToken userToken = authorityService.loginWithGoogle(idToken);
            return new ResponseEntity<>(userToken, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<CodeResponse> register(@RequestBody RegistrationRequest request){
        CodeResponse registrationResponse = registrationService.createUser(request);

        return new ResponseEntity<>(registrationResponse,
                registrationResponse.getCode() == 200 ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/verifyOtp-register")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String,String> map){
        String email = map.get("email");
        String otp = map.get("otp");
        boolean success = registrationService.verifyUser(email, otp);
        if (success) {
            return ResponseEntity.ok("User verified successfully!");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("The verification code is incorrect or expired.");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body("Email không tồn tại!");
        }

        // Tạo OTP
        String otp = otpService.generateOtp();
        
        // Lưu vào Redis hoặc DB tạm
        redisTemplate.opsForValue().set("OTP:" + email, otp, 5, TimeUnit.MINUTES);

        // Gửi OTP qua email
        emailService.sendForgotPasswordOtp(email, otp);

        return ResponseEntity.ok("Đã gửi OTP tới email.");
    }

    @PostMapping("/verifyOtp-forgotPassword")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpForgotPassword request) {
        String email = request.getEmail();
        String otp = request.getOtp();

        String cachedOtp = redisTemplate.opsForValue().get("OTP:" + email);

        if (cachedOtp == null) {
            return ResponseEntity.badRequest().body("OTP đã hết hạn hoặc không tồn tại!");
        }
        if (!cachedOtp.equals(otp)) {
            return ResponseEntity.badRequest().body("OTP không hợp lệ!");
        }
        redisTemplate.delete("OTP:" + email);

        return ResponseEntity.ok("Xác thực OTP thành công!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = request.getEmail();
        String newPassword = request.getNewPassword();

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody ResendOtp request) {
        String email = request.getEmail();
        
        User user = userRepository.findByEmail(email);
        
        if (user != null) {
            String otp = otpService.generateOtp();
            otpService.saveOtpAndUser(email, otp, "", 5);

            emailService.sendEmail(email, "OTP xác thực lại", "Mã OTP mới của bạn là: " + otp);

            return ResponseEntity.ok("Đã gửi lại OTP (DB)!");
        } 
        
        // 2. Nếu User không có trong DB -> Kiểm tra User tạm trong Redis
        else {
            CodeResponse response = registrationService.resendRegisterOtp(email);
            
            if (response.getCode() == 200) {
                return ResponseEntity.ok(response.getMessage());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response.getMessage());
            }
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email);
        if(user == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User không tồn tại");
        }

        if(!passwordEncoder.matches(currentPassword, user.getPassword())){
            return ResponseEntity.badRequest().body("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @PostMapping("/forgot-password-random")
    public ResponseEntity<String> forgotPasswordRandom(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            return ResponseEntity.badRequest().body("Email không tồn tại!");
        }

        // 1. Tạo và lưu mật khẩu mới
        String randomPassword = generateRandomPassword(10);
        user.setPassword(passwordEncoder.encode(randomPassword));
        userRepository.save(user);

        // 2. Gọi Service để gửi mail (Code HTML đã được ẩn đi trong Service)
        try {
            emailService.sendRandomPasswordEmail(user, randomPassword);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi gửi email: " + e.getMessage());
        }

        return ResponseEntity.ok("Mật khẩu ngẫu nhiên đã được gửi qua email!");
    }

    private String generateRandomPassword(int length) {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "@#$%&*!";

        String allChars = upper + lower + digits + special;
        StringBuilder password = new StringBuilder();
        Random random = new Random();

        // Ít nhất 1 ký tự mỗi loại
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));

        for (int i = 4; i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        List<Character> chars = password.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());
        Collections.shuffle(chars);

        StringBuilder shuffled = new StringBuilder();
        chars.forEach(shuffled::append);
        return shuffled.toString();
    }

}
