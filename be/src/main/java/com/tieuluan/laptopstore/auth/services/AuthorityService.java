package com.tieuluan.laptopstore.auth.services;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.tieuluan.laptopstore.auth.config.JWTTokenHelper;
import com.tieuluan.laptopstore.auth.dto.User.UserToken;
import com.tieuluan.laptopstore.auth.entities.Authority;
import com.tieuluan.laptopstore.auth.entities.User;
import com.tieuluan.laptopstore.auth.repositories.AuthorityRepository;
import com.tieuluan.laptopstore.auth.repositories.UserDetailRepository;
import com.tieuluan.laptopstore.services.UserRewardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private UserDetailRepository userRepository;

    @Autowired
    private JWTTokenHelper jwtTokenHelper;

    @Autowired
    private UserRewardService userRewardService;
    
    public UserToken loginWithGoogle(String idToken) throws Exception {
        // 1️⃣ Xác thực token Firebase
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        String email = decodedToken.getEmail();
        String name = decodedToken.getName();
        String picture = decodedToken.getPicture();

        // 2️⃣ Kiểm tra user trong DB
        User user = userRepository.findByEmail(email);

        if (user != null) {
            // --- [THÊM MỚI] KIỂM TRA TÀI KHOẢN BỊ KHÓA ---
            if (!user.isEnabled()) {
                throw new Exception("Tài khoản Google này đã bị khóa trong hệ thống!");
            }
            // ---------------------------------------------

            // Đã có user -> cập nhật avatar nếu cần
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(picture);
                userRepository.save(user);
            }
        } else {
            // 3️⃣ Nếu chưa có user -> tạo mới
            user = new User();
            user.setEmail(email);

            String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"", ""};
            user.setFirstName(nameParts.length > 1 ? nameParts[1] : nameParts[0]);
            user.setLastName(nameParts.length > 1 ? nameParts[0] : "");

            user.setAvatarUrl(picture);
            user.setEnabled(true); 
            user.setProvider("google");
            user.setPassword(null);

            user.setAuthorities(getUserAuthority());
            userRepository.save(user);
            userRewardService.giveWelcomeDiscount(user);
        }

        // 5️⃣ Sinh JWT token
        String token = jwtTokenHelper.generateToken(user);

        // 6️⃣ Trả về object UserToken
        return UserToken.builder().token(token).build();
    }

    public List<Authority> getUserAuthority() {
        List<Authority> authorities = new ArrayList<>();
        // Tìm quyền có roleCode = "USER"
        Authority authority = authorityRepository.findByRoleCode("USER");

        if (authority == null) {
            throw new RuntimeException("Default role USER not found in DB");
        }

        // Thêm quyền này vào danh sách
        authorities.add(authority);
        return authorities;
    }

    public Authority createAuthority(String role, String description) {
        // Tạo object Authority bằng builder
        Authority authority = Authority.builder()
                .roleCode(role)
                .roleDescription(description)
                .build();
        // Lưu vào DB
        return authorityRepository.save(authority);
    }

    public List<Authority> getAllAuthorities() {
        return authorityRepository.findAll();
    }

    public Authority getAuthorityById(UUID id) {
        return authorityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    public Authority updateAuthority(UUID id, String roleCode, String roleDescription) {
        // Lấy quyền hiện tại
        Authority existing = getAuthorityById(id);
        // Cập nhật roleCode và roleDescription
        existing.setRoleCode(roleCode);
        existing.setRoleDescription(roleDescription);
        // Lưu lại vào DB
        return authorityRepository.save(existing);
    }
    
    public void deleteAuthority(UUID id) {
        authorityRepository.deleteById(id);
    }

}
