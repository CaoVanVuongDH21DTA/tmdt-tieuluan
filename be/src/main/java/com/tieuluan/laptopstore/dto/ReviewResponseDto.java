package com.tieuluan.laptopstore.dto;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.tieuluan.laptopstore.auth.dto.User.UserPublicDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponseDto {
    private UUID id;
    private UserPublicDto user;
    private String userName;
    private Float rating;
    private String content;
    private Date createdAt;
    private UUID parentId;
    private List<ReviewResponseDto> replies;
}