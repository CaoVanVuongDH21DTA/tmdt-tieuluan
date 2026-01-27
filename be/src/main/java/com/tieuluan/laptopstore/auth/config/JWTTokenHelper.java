package com.tieuluan.laptopstore.auth.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.tieuluan.laptopstore.auth.entities.User;

import java.security.Key;
import java.util.Date;

// Đánh dấu đây là một Spring Bean, có thể inject vào chỗ khác
@Component
public class JWTTokenHelper {

    // Đọc tên ứng dụng từ file application.properties (jwt.auth.app)
    @Value("${jwt.auth.app}")
    private String appName;

    // Khóa bí mật để ký và verify JWT (jwt.auth.secret_key)
    @Value("${jwt.auth.secret_key}")
    private String secretKey;

    // Thời gian sống của token (tính bằng mili giây) (jwt.auth.expires_in)
    @Value("${jwt.auth.expires_in}")
    private int expiresIn;

    // Hàm tạo token mới dựa trên username
    public String generateToken(User user) {
        return Jwts.builder()
                .issuer(appName)
                .subject(user.getEmail())
                .claim("id", user.getId().toString())
                .claim("username", user.getFirstName()+ " " + user.getLastName())
                .issuedAt(new Date())
                .expiration(generateExpirationDate())
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Tạo khóa ký từ secret key (base64 → byte[] → HMAC-SHA)
    private Key getSigningKey() {
        byte[] keysBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keysBytes);
    }

    // Sinh thời điểm hết hạn cho token
    private Date generateExpirationDate() {
        return new Date(new Date().getTime() + expiresIn);
    }

    // Lấy token từ header HTTP request
    public String getToken(HttpServletRequest request) {
        String authHeader = getAuthHeaderFromHeader(request);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Cắt bỏ "Bearer " để lấy phần token
            return authHeader.substring(7);
        }
        return authHeader;
    }

    // Kiểm tra token có hợp lệ với user không
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUserNameFromToken(token);
        return (
                username != null &&
                username.equals(userDetails.getUsername()) && // token đúng user
                !isTokenExpired(token)                        // token chưa hết hạn
        );
    }

    // Kiểm tra token hết hạn chưa
    private boolean isTokenExpired(String token) {
        Date expireDate = getExpirationDate(token);
        return expireDate.before(new Date()); // nếu expireDate < hiện tại → hết hạn
    }

    // Lấy thời gian hết hạn từ token
    private Date getExpirationDate(String token) {
        Date expireDate;
        try {
            final Claims claims = this.getAllClaimsFromToken(token);
            expireDate = claims.getExpiration();
        } catch (Exception e) {
            expireDate = null;
        }
        return expireDate;
    }

    // Lấy Authorization header từ request
    private String getAuthHeaderFromHeader(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }

    // Lấy username từ token (subject)
    public String getUserNameFromToken(String authToken) {
        String username;
        try {
            final Claims claims = this.getAllClaimsFromToken(authToken);
            username = claims.getSubject();
        } catch (Exception e) {
            username = null;
        }
        return username;
    }

    // Parse toàn bộ claims (payload) từ token
    private Claims getAllClaimsFromToken(String token){
        Claims claims;
        try {
            claims = Jwts.parser()                 // tạo parser
                    .setSigningKey(getSigningKey())// set secret key
                    .build()                       // build parser
                    .parseClaimsJws(token)         // parse token
                    .getBody();                    // lấy phần payload (claims)
        }
        catch (Exception e){
            claims = null;
        }
        return claims;
    }
}
