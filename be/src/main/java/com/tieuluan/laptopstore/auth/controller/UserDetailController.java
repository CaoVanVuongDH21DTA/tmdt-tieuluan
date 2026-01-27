package com.tieuluan.laptopstore.auth.controller;

import com.tieuluan.laptopstore.auth.dto.User.UserDetailsDto;
import com.tieuluan.laptopstore.auth.entities.Authority;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.mapper.UserDetailsMapper;
import com.tieuluan.laptopstore.auth.repositories.AuthorityRepository;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.auth.services.CloudinaryService;
import com.tieuluan.laptopstore.auth.services.EmailService;
import com.tieuluan.laptopstore.auth.services.OtpService;

import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/api/user")
public class UserDetailController {

    @Autowired private UserDetailsService userDetailsService;
    @Autowired private UserDetailRepository userDetailRepository;
    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private UserDetailsMapper userDetailsMapper;
    @Autowired private AuthorityRepository authorityRepository;
    @Autowired private OtpService otpService; 
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;

    // ================== 1. API PROFILE==================
    @GetMapping("/profile")
    public ResponseEntity<UserDetailsDto> getUserProfile(Principal principal) {
        if (principal == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        if (user == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

        List<Authority> authorities = user.getAuthorities().stream()
                .map(auth -> (Authority) auth) 
                .collect(Collectors.toList());

        UserDetailsDto userDetailsDto = UserDetailsDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .addressList(user.getAddressList())
                .authorityList(authorities)
                .build();

        return new ResponseEntity<>(userDetailsDto, HttpStatus.OK);
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserProfile(
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "avatarUrl", required = false) String avatarUrl,
            @RequestPart(value = "avatar", required = false) MultipartFile avatarFile,
            Principal principal
    ) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        if (user == null) return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);

        // Logic update giống cũ
        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (email != null) user.setEmail(email);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);

        try {
            if (avatarFile != null && !avatarFile.isEmpty()) {
                String uploadedFile = cloudinaryService.uploadFile(avatarFile);
                user.setAvatarUrl(uploadedFile);
            } else if (avatarUrl != null && !avatarUrl.isEmpty()) {
                String uploadedUrl = cloudinaryService.uploadFileFromUrl(avatarUrl);
                user.setAvatarUrl(uploadedUrl);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload ảnh thất bại: " + e.getMessage());
        }

        user.setUpdatedOn(new Date());
        userDetailRepository.save(user);

        UserDetailsDto updatedDto = UserDetailsDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .addressList(user.getAddressList())
                .build();
        return ResponseEntity.ok(updatedDto);
    }

    @PostMapping("/request-change-email")
    public ResponseEntity<?> requestChangeEmail(@RequestBody Map<String, String> payload, Principal principal) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        
        String currentEmail = user.getEmail();
        String newEmail = payload.get("newEmail");
        String password = payload.get("currentPassword"); // Lấy password từ frontend gửi lên

        // 1. Validate cơ bản
        if (newEmail == null || !newEmail.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email mới không hợp lệ"));
        }
        if (currentEmail.equals(newEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email mới trùng với email hiện tại"));
        }

        // 2. CHECK BẢO MẬT: Mật khẩu hiện tại có đúng không?
        if (password == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không chính xác"));
        }

        // 3. Kiểm tra email mới đã có ai dùng chưa
        if (userDetailRepository.findByEmail(newEmail) != null) {
             return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được sử dụng"));
        }

        // 4. Tạo OTP & Lưu Redis (Key=Email Cũ, Value=Email Mới)
        String otp = otpService.generateOtp();
        otpService.saveEmailChangeRequest(currentEmail, newEmail, otp);

        // 5. Gửi OTP đến EMAIL MỚI (Để user vào mail mới check -> đảm bảo mail sống)
        emailService.sendEmailChangeOtp(newEmail, otp);

        return ResponseEntity.ok(Map.of("message", "Mã xác thực đã gửi đến " + newEmail + ". Vui lòng kiểm tra."));
    }

    @PostMapping("/verify-change-email")
    public ResponseEntity<?> verifyChangeEmail(@RequestBody Map<String, String> payload, Principal principal) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        
        String currentEmail = user.getEmail();
        String otpInput = payload.get("otp");

        // 1. Lấy OTP & Email mới từ Redis
        String savedOtp = otpService.getEmailChangeOtp(currentEmail);
        String pendingNewEmail = otpService.getPendingNewEmail(currentEmail);

        if (savedOtp == null || pendingNewEmail == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã xác thực hết hạn hoặc không tồn tại"));
        }

        // 2. So khớp OTP
        if (!savedOtp.equals(otpInput)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã OTP không chính xác"));
        }

        // 3. Update Database
        user.setEmail(pendingNewEmail);
        user.setUpdatedOn(new Date());
        userDetailRepository.save(user);

        // 4. Xóa Redis
        otpService.deleteEmailChangeRequest(currentEmail);

        return ResponseEntity.ok(Map.of("message", "Đổi email thành công!"));
    }


    // ================== 2. API QUẢN TRỊ ==================
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<Map<String, Object>> getUsers(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "1000") int perPage,
        @RequestParam(required = false) Boolean enabled
    ) {
        PageRequest pageable = PageRequest.of(page - 1, perPage);
        Page<User> users;
        long total;

        if (enabled == null) {
            users = userDetailRepository.findAll(pageable);
            total = userDetailRepository.count();
        } else {
            users = userDetailRepository.findAllByEnabled(enabled, pageable);
            total = userDetailRepository.countByEnabled(enabled);
        }

        List<UserDetailsDto> userDtos = users.getContent().stream()
            .map(userDetailsMapper::toUserDetailsDto)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", userDtos);
        response.put("total", total);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        Optional<User> optionalUser = userDetailRepository.findById(id);
        if (optionalUser.isPresent()) {
            return ResponseEntity.ok(userDetailsMapper.toUserDetailsDto(optionalUser.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<?> updateUserJson(@PathVariable UUID id, @RequestBody UserDetailsDto dto) {
        Optional<User> optionalUser = userDetailRepository.findById(id);
        if (optionalUser.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));

        User user = optionalUser.get();
        
        updateUserInfo(user, dto);
        
        return ResponseEntity.ok(userDetailsMapper.toUserDetailsDto(user));
    }

    // Xóa User -> Cần quyền ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable UUID id) {
        Optional<User> optionalUser = userDetailRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        User user = optionalUser.get();
        user.setEnabled(false);
        user.setUpdatedOn(new Date());
        userDetailRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User disabled successfully"));
    }

    // Helper method
    private void updateUserInfo(User user, UserDetailsDto dto) {
        // 1. Cập nhật thông tin cơ bản
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getEnabled() != null) user.setEnabled(dto.getEnabled());

        // 2. Logic cập nhật Role (Dựa trên authorityList của DTO)
        // Kiểm tra nếu danh sách quyền được gửi lên và không rỗng
        if (dto.getAuthorityList() != null && !dto.getAuthorityList().isEmpty()) {
            
            List<Authority> newAuthorities = new ArrayList<>();

            // Duyệt qua từng item trong list gửi lên
            for (Authority authItem : dto.getAuthorityList()) {
                if (authItem.getId() != null) {
                    // Tìm quyền trong DB để đảm bảo nó tồn tại
                    Authority authInDb = authorityRepository.findById(authItem.getId())
                            .orElseThrow(() -> new RuntimeException("Authority not found with id: " + authItem.getId()));
                    newAuthorities.add(authInDb);
                }
            }

            // Nếu tìm thấy quyền hợp lệ thì set lại cho user
            if (!newAuthorities.isEmpty()) {
                user.setAuthorities(newAuthorities);
            }
        }

        user.setUpdatedOn(new Date());
        userDetailRepository.save(user);
    }
}