package com.tieuluan.laptopstore.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tieuluan.laptopstore.dto.FlashSaleDtos;
import com.tieuluan.laptopstore.services.FlashSaleService;

@RestController
@RequestMapping("/api/admin/flash-sales")
public class FlashSaleController {

    @Autowired private FlashSaleService flashSaleService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(flashSaleService.getAllFlashSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(flashSaleService.getFlashSaleDetail(id));
    }

    @PostMapping
    public ResponseEntity<?> upsert(@RequestBody FlashSaleDtos.UpsertRequest req) {
        flashSaleService.saveFlashSale(req);
        return ResponseEntity.ok(Map.of("message", "Saved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}