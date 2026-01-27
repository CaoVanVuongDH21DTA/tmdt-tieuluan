package com.tieuluan.laptopstore.auth.entities;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.tieuluan.laptopstore.entities.Address;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Table(name = "AUTH_USER_DETAILS")                             // Ánh xạ với bảng AUTH_USER_DETAILS
@Entity                                                        // Đánh dấu là entity JPA
@Data                                                          // Lombok: sinh getter/setter/toString/equals/hashCode
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {                     // Implement UserDetails để dùng cho Spring Security

    @Id                                                        // Khóa chính
    @GeneratedValue                                            // Hibernate tự sinh UUID (Hibernate 6)
    private UUID id;                                           // Định danh người dùng

    private String avatarUrl;                                  // URL ảnh đại diện

    private String firstName;                                  // Tên
    private String lastName;                                   // Họ

    @Column(nullable = false, unique = true)                   // Email là duy nhất & bắt buộc
    private String email;

    @JsonIgnore                                                // Không lộ mật khẩu ra JSON response
    private String password;                                   // Mật khẩu (đã mã hóa)

    private Date createdOn;                                    // Thời điểm tạo
    private Date updatedOn;                                    // Thời điểm cập nhật

    private String phoneNumber;                                // Số điện thoại
    private String provider;                                   // Nhà cung cấp đăng nhập (local/google/facebook...)

    private boolean enabled;                           // Trạng thái kích hoạt tài khoản

    // Quan hệ N-N giữa User và Authority (role)
    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(                                                // Bảng nối giữa user và authority
        name = "AUTH_USER_AUTHORITY",
        joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),          // FK tới user.id
        inverseJoinColumns = @JoinColumn(name = "authorities_id", referencedColumnName = "id") // FK tới authority.id
    )
    private List<Authority> authorities;                       // Danh sách role của user

    // Quan hệ 1-N: 1 user có nhiều địa chỉ
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)   // "mappedBy = user" => field 'user' trong Address là FK
    @ToString.Exclude                                          // Tránh vòng lặp khi toString()
    private List<Address> addressList;                           // Danh sách địa chỉ của user

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-userDiscount")
    @ToString.Exclude
    private List<UserDiscount> userDiscounts;

    // ====== Các method bắt buộc khi implement UserDetails ======

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;                               // Trả về danh sách quyền để Security so khớp
    }

    @Override
    public String getPassword(){
        return this.password;                                  // Mật khẩu (đã băm)
    }

    @Override
    public String getUsername(){
        return this.email;                                     // Dùng email làm "username" đăng nhập
    }
    // ====== Hooks JPA cho thời gian tạo/cập nhật ======

    @PrePersist                                                 // Chạy trước khi INSERT lần đầu
    protected void onCreate(){
        this.createdOn = new Date();                            // Ghi nhận thời điểm tạo
        this.updatedOn = new Date();                            // Lần đầu tạo cũng là lần cập nhật gần nhất
    }

    @PreUpdate                                                  // Chạy trước mỗi lần UPDATE
    protected void onUpdate(){
        this.updatedOn = new Date();                            // Cập nhật mốc thời gian sửa đổi
    }
}