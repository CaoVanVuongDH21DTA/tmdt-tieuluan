package com.tieuluan.laptopstore.entities;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shipping_providers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingProvider {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "image_ship", length = 255)
    private String imgShip;

    @Column(name = "contact_info", length = 255)
    private String contactInfo;

    @Column(name = "tracking_url_template", length = 500)
    private String trackingUrlTemplate;
}