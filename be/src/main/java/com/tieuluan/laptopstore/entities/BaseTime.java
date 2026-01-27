package com.tieuluan.laptopstore.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public abstract class BaseTime{
      @Column(name = "created_at", nullable = false)
    protected LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    protected LocalDateTime updatedAt;

    @PrePersist void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
    }
    @PreUpdate void preUpdate() { updatedAt = LocalDateTime.now(); }
}