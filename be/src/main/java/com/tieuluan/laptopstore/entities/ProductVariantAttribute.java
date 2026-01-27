package com.tieuluan.laptopstore.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(
    name = "product_variant_attributes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"variant_id", "attribute_name"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantAttribute {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "attribute_name", nullable = false)
    private String attributeName; // Ví dụ: RAM

    @Column(name = "attribute_value", nullable = false)
    private String attributeValue; // Ví dụ: 16GB

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnore
    private ProductVariant variant;
}
