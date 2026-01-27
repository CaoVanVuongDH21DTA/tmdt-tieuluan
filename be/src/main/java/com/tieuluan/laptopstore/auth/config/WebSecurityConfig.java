package com.tieuluan.laptopstore.auth.config;

import com.tieuluan.laptopstore.auth.exceptions.RESTAuthenticationEntryPoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired private JWTAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests((authorize) -> authorize
                
                // ================== 1. PUBLIC (KHÔNG CẦN LOGIN) ==================
                .requestMatchers(
                    "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/api/auth/**"
                ).permitAll()
                // Payment
                .requestMatchers("/api/payment/**").permitAll()
                
                // Xem danh mục, thương hiệu, sản phẩm, phí ship (Khách vãng lai cần xem để mua hàng)
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/category/**", "/api/brands/**", "/api/shipping/**", "/api/order/**").permitAll()
                // API lấy sản phẩm theo list ID (thường dùng cho giỏ hàng ở FE)
                .requestMatchers(HttpMethod.POST, "/api/products/by-ids").permitAll()

                // ================== 2. USER & AUTHENTICATED (LOGIN LÀ ĐƯỢC) ==================
                
                // --- User Profile & Address & Delete ---
                .requestMatchers("/api/user/profile").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/user/{id}").authenticated()
                .requestMatchers("/api/address/**").authenticated()
                .requestMatchers("/api/wishlist/**").authenticated()
                
                // --- Order (Phần dành cho người mua) ---
                .requestMatchers(HttpMethod.POST, "/api/order").authenticated()     
                .requestMatchers(HttpMethod.GET, "/api/order/user").authenticated()   
                .requestMatchers(HttpMethod.POST, "/api/order/cancel/**").authenticated() 
                .requestMatchers(HttpMethod.GET, "/api/order/search").authenticated()

                // --- Discount (Xem mã) ---
                .requestMatchers(HttpMethod.GET, "/api/discount/**").authenticated()

                // --- Review
                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()

                // ================== 3. ADMIN ONLY (QUẢN TRỊ) ==================
                
                // --- Dashboard & Analytics & Roles ---
                .requestMatchers("/api/analytics/**", "/api/dashboard/**", "/api/roles/**").hasAuthority("ADMIN")

                // --- Quản lý User (Trừ profile cá nhân đã cấu hình ở trên) ---
                .requestMatchers(HttpMethod.GET, "/api/user").hasAuthority("ADMIN")

                // --- Quản lý Catalog (Thêm/Sửa/Xóa Sản phẩm, Brand, Category) ---
                .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/category/**", "/api/brands/**", "/api/shipping/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/category/**", "/api/brands/**", "/api/shipping/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/category/**", "/api/brands/**", "/api/shipping/**").hasAuthority("ADMIN")

                // --- Quản lý Đơn hàng (Admin xem tất cả, cập nhật trạng thái) ---
                .requestMatchers(HttpMethod.GET, "/api/order").hasAuthority("ADMIN")   
                .requestMatchers(HttpMethod.PUT, "/api/order/**").hasAuthority("ADMIN") 

                // --- Quản lý Mã giảm giá (Discount) ---
                .requestMatchers(HttpMethod.POST, "/api/discount/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/discount/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/discount/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/discount/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/discount/**").hasAuthority("ADMIN")

                // --- Quản lý Flash Sale ---
                .requestMatchers("/api/admin/flash-sales/**").hasAuthority("ADMIN")

                // ================== 4. CATCH ALL ==================
                .anyRequest().authenticated()
            )

            .exceptionHandling((exception) -> exception
                .authenticationEntryPoint(new RESTAuthenticationEntryPoint()))

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); 
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(daoAuthenticationProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}