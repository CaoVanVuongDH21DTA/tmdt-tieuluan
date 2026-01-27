package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.dto.ShippingProviderDto;
import com.tieuluan.laptopstore.entities.ShippingProvider;
import com.tieuluan.laptopstore.repositories.ShippingProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingProviderService {

    private final ShippingProviderRepository repository;

    // Get all
    @Transactional(readOnly = true)
    public List<ShippingProviderDto> getAllShippingProviders() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get by id
    @Transactional(readOnly = true)
    public ShippingProviderDto getShippingProviderById(UUID id) {
        ShippingProvider sp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingProvider not found"));
        return mapToDto(sp);
    }

    // Create
    @Transactional
    public ShippingProviderDto createShippingProvider(ShippingProviderDto dto) {
        ShippingProvider sp = ShippingProvider.builder()
                .id(dto.getId() != null ? dto.getId() : UUID.randomUUID())
                .name(dto.getName())
                .imgShip(dto.getImgShip())
                .contactInfo(dto.getContactInfo())
                .trackingUrlTemplate(dto.getTrackingUrlTemplate())
                .build();
        ShippingProvider saved = repository.save(sp);
        return mapToDto(saved);
    }

    // Update
    @Transactional
    public ShippingProviderDto updateShippingProvider(UUID id, ShippingProviderDto dto) {
        ShippingProvider sp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingProvider not found"));

        sp.setName(dto.getName());
        sp.setImgShip(dto.getImgShip());
        sp.setContactInfo(dto.getContactInfo());
        sp.setTrackingUrlTemplate(dto.getTrackingUrlTemplate());

        ShippingProvider saved = repository.save(sp);
        return mapToDto(saved);
    }

    // Delete
    @Transactional
    public void deleteShippingProvider(UUID id) {
        ShippingProvider sp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShippingProvider not found"));
        repository.delete(sp);
    }

    // Mapping entity -> DTO
    private ShippingProviderDto mapToDto(ShippingProvider sp) {
        return new ShippingProviderDto(sp.getId(), sp.getName(), sp.getImgShip(), sp.getContactInfo(),sp.getTrackingUrlTemplate());
    }
}
