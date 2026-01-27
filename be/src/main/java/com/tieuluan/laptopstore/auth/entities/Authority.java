package com.tieuluan.laptopstore.auth.entities;

import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity                                      // Đánh dấu đây là 1 entity JPA (tương ứng 1 bảng DB)
@Table(name = "AUTH_AUTHORITY")              // Đặt tên bảng (khớp với join table phía User)
@Data                                        // Lombok: sinh getter/setter/toString/equals/hashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Authority implements GrantedAuthority {

    @Id                                      // Khóa chính của bảng
    @GeneratedValue                          // Hibernate tự sinh giá trị (với UUID, Hibernate 6 có thể tự tạo)
    private UUID id;                          // Dùng UUID cho định danh (không đoán được, an toàn hơn)

    @Column(nullable = false)                 // Cột không được null
    private String roleDescription;           // Mô tả quyền (ví dụ: "Quản trị hệ thống")

    @Column(nullable = false, unique = true)  // Không null và duy nhất (mỗi roleCode là duy nhất)
    private String roleCode;                  // Mã quyền (vd: "ROLE_ADMIN", "ROLE_USER")

    @Override
    public String getAuthority() {            // Phương thức bắt buộc của GrantedAuthority
        return roleCode;                      // Spring Security sẽ dùng giá trị này để so khớp quyền
    }
}