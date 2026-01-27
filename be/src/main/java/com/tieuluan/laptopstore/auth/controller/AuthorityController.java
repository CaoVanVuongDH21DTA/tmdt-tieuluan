package com.tieuluan.laptopstore.auth.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tieuluan.laptopstore.auth.dto.Role.AuthorityDto;
import com.tieuluan.laptopstore.auth.dto.Role.AuthorityRequestDto;
import com.tieuluan.laptopstore.auth.entities.Authority;
import com.tieuluan.laptopstore.auth.services.AuthorityService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/roles")
@Slf4j
public class AuthorityController {

    @Autowired
    private AuthorityService authorityService;

    @GetMapping
    public List<AuthorityDto> getAll() {
        return authorityService.getAllAuthorities().stream() // gọi service để lấy danh sách
                .map(this::toDto) // convert từ entity -> dto
                .collect(Collectors.toList()); // gom lại thành List
    }

    // Lấy thông tin authority theo id (GET /api/roles/{id})
    @GetMapping("/{id}")
    public AuthorityDto getById(@PathVariable UUID id) {
        return toDto(authorityService.getAuthorityById(id));
    }

    // Tạo mới authority (POST /api/roles)
    @PostMapping
    public AuthorityDto create(@Valid @RequestBody AuthorityRequestDto dto) {
        Authority saved = authorityService.createAuthority(dto.getRoleCode(), dto.getRoleDescription());

        return toDto(saved);
    }

    // Cập nhật authority theo id (PUT /api/roles/{id})
    @PutMapping("/{id}")
    public AuthorityDto update(@PathVariable UUID id, @RequestBody AuthorityRequestDto dto) {
        // Gọi service để cập nhật authority
        Authority updated = authorityService.updateAuthority(id, dto.getRoleCode(), dto.getRoleDescription());
        return toDto(updated); // Trả về DTO
    }

    // Xóa authority theo id (DELETE /api/roles/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        authorityService.deleteAuthority(id); // Gọi service để xóa
        return ResponseEntity.ok().build(); // Trả về status 200 OK mà không có body
    }

    // Hàm tiện ích: chuyển đổi từ Entity -> DTO để trả ra ngoài
    private AuthorityDto toDto(Authority authority) {
        return AuthorityDto.builder()
                .id(authority.getId())
                .roleCode(authority.getRoleCode())
                .roleDescription(authority.getRoleDescription())
                .build();
    }
}
