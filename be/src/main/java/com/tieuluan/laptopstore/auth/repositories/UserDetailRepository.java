package com.tieuluan.laptopstore.auth.repositories;

import com.tieuluan.laptopstore.auth.entities.User;

import io.lettuce.core.dynamic.annotation.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDetailRepository extends JpaRepository<User, UUID> {

    User findByEmail(String email);

    Page<User> findAllByEnabled(boolean enabled, Pageable pageable);

    long countByEnabled(boolean enabled);

    // Tổng số user đến trước 1 ngày cụ thể
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdOn <= :date")
    long countUsersBefore(@Param("date") LocalDateTime date);

    // Số user mới trong tháng
    @Query("SELECT COUNT(u) FROM User u WHERE YEAR(u.createdOn) = :year AND MONTH(u.createdOn) = :month")
    long countUsersInMonth(@Param("year") int year, @Param("month") int month);

}

