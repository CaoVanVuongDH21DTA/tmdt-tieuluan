package com.tieuluan.laptopstore.auth.dto.User;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserPublicDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String avatarUrl;
}