package com.tieuluan.laptopstore.controllers;

import com.tieuluan.laptopstore.dto.ShippingProviderDto;
import com.tieuluan.laptopstore.services.ShippingProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShipController {

    private final ShippingProviderService service;

    // GET all
    @GetMapping
    public ResponseEntity<List<ShippingProviderDto>> getAll() {
        return ResponseEntity.ok(service.getAllShippingProviders());
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<ShippingProviderDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getShippingProviderById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ShippingProviderDto> create(@RequestBody ShippingProviderDto dto) {
        return ResponseEntity.ok(service.createShippingProvider(dto));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ShippingProviderDto> update(@PathVariable UUID id, @RequestBody ShippingProviderDto dto) {
        return ResponseEntity.ok(service.updateShippingProvider(id, dto));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteShippingProvider(id);
        return ResponseEntity.noContent().build();
    }
}
