package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.dto.FlashSaleDtos;
import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.entities.FlashSale;
import com.tieuluan.laptopstore.entities.FlashSaleItem;
import com.tieuluan.laptopstore.mapper.ProductMapper;
import com.tieuluan.laptopstore.repositories.FlashSaleItemRepository;
import com.tieuluan.laptopstore.repositories.FlashSaleRepository;
import com.tieuluan.laptopstore.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FlashSaleServiceImpl implements FlashSaleService {

    @Autowired private FlashSaleItemRepository flashSaleItemRepository;
    @Autowired private ProductMapper productMapper;
    @Autowired private FlashSaleRepository flashSaleRepository;
    @Autowired private ProductRepository productRepository;

    // Tự động lấy múi giờ hệ thống (Khắc phục việc phải set cứng Asia/Ho_Chi_Minh)
    private static final ZoneId CURRENT_ZONE = ZoneId.systemDefault();

    // --- 1. ENRICH PRODUCT LIST (User View) ---
    @Override
    public void enrichProducts(List<ProductDto> productDtos) {
        if (productDtos == null || productDtos.isEmpty()) return;

        List<UUID> productIds = productDtos.stream().map(ProductDto::getId).collect(Collectors.toList());
        
        // Sử dụng giờ hệ thống
        LocalDateTime now = LocalDateTime.now(CURRENT_ZONE);

        List<FlashSaleItem> activeSales = flashSaleItemRepository.findActiveSalesByProductIds(productIds, now);
        if (activeSales.isEmpty()) return;

        Map<UUID, FlashSaleItem> saleMap = activeSales.stream()
                .collect(Collectors.toMap(
                        item -> item.getProduct().getId(),
                        item -> item,
                        (existing, replacement) -> existing
                ));

        for (ProductDto dto : productDtos) {
            if (saleMap.containsKey(dto.getId())) {
                dto.setFlashSale(productMapper.mapToFlashSaleInfo(saleMap.get(dto.getId())));
            }
        }
    }

    // --- 2. ENRICH SINGLE PRODUCT (Detail View) ---
    @Override
    public void enrichSingleProduct(ProductDto dto) {
        if (dto == null) return;
        LocalDateTime now = LocalDateTime.now(CURRENT_ZONE);
        Optional<FlashSaleItem> saleItem = flashSaleItemRepository.findActiveSaleByProductId(dto.getId(), now);
        saleItem.ifPresent(item -> dto.setFlashSale(productMapper.mapToFlashSaleInfo(item)));
    }

    // --- 3. ADMIN: GET ALL ---
    @Override
    public List<FlashSaleDtos.ListResponse> getAllFlashSales() {
        return flashSaleRepository.findAllByOrderByStartDateDesc().stream()
            .map(fs -> FlashSaleDtos.ListResponse.builder()
                .id(fs.getId())
                .name(fs.getName())
                .startDate(fs.getStartDate())
                .endDate(fs.getEndDate())
                .status(calculateStatus(fs.getStartDate(), fs.getEndDate()))
                .totalProducts(flashSaleItemRepository.countByFlashSaleId(fs.getId()))
                .build())
            .collect(Collectors.toList());
    }

    // --- 4. ADMIN: GET DETAIL ---
    @Override
    public FlashSaleDtos.DetailResponse getFlashSaleDetail(UUID id) {
        FlashSale fs = flashSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flash Sale not found"));
        
        List<FlashSaleItem> items = flashSaleItemRepository.findByFlashSaleId(id);

        List<FlashSaleDtos.ItemResponse> itemDtos = items.stream()
            .map(item -> FlashSaleDtos.ItemResponse.builder()
                    .product(productMapper.mapToProductDto(item.getProduct()))
                    .discountPercent(item.getDiscountPercent())
                    .quantity(item.getQuantity())
                    .sold(item.getSold())
                    .build())
            .collect(Collectors.toList());

        return FlashSaleDtos.DetailResponse.builder()
                .id(fs.getId())
                .name(fs.getName())
                .startDate(fs.getStartDate())
                .endDate(fs.getEndDate())
                .items(itemDtos)
                .build();
    }

    // --- 5. ADMIN: CREATE / UPDATE ---
    @Override
    @Transactional
    public void saveFlashSale(FlashSaleDtos.UpsertRequest req) {
        FlashSale flashSale;

        if (req.getId() != null) {
            // --- UPDATE ---
            flashSale = flashSaleRepository.findById(req.getId())
                    .orElseThrow(() -> new RuntimeException("Not found"));
            if (req.getName() != null && !req.getName().isEmpty()) {
                flashSale.setName(req.getName());
            }
        } else {
            // --- CREATE ---
            flashSale = new FlashSale();
            // LƯU Ý: Không set ID thủ công để tránh lỗi OptimisticLockingFailureException
            // flashSale.setId(UUID.randomUUID()); // <--- ĐÃ XÓA DÒNG NÀY
            
            flashSale.setStatus(1);

            if (req.getName() != null && !req.getName().isEmpty()) {
                flashSale.setName(req.getName());
            } else {
                flashSale.setName("Flash Sale " + LocalDateTime.now(CURRENT_ZONE).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            }
        }

        // --- SỬA LỖI MÚI GIỜ (Frontend gửi UTC nhưng muốn lưu giờ Local) ---
        try {
            // 1. Parse chuỗi UTC (có chữ Z) thành Instant
            Instant startInstant = Instant.parse(req.getStartDate());
            Instant endInstant = Instant.parse(req.getEndDate());

            // 2. Đổi về múi giờ Local của server (Cộng thêm 7 tiếng nếu ở VN)
            flashSale.setStartDate(startInstant.atZone(CURRENT_ZONE).toLocalDateTime());
            flashSale.setEndDate(endInstant.atZone(CURRENT_ZONE).toLocalDateTime());

        } catch (DateTimeParseException e) {
            // Fallback: Nếu chuỗi ngày không chuẩn UTC (không có chữ Z), parse bình thường
            try {
                flashSale.setStartDate(LocalDateTime.parse(req.getStartDate(), DateTimeFormatter.ISO_DATE_TIME));
                flashSale.setEndDate(LocalDateTime.parse(req.getEndDate(), DateTimeFormatter.ISO_DATE_TIME));
            } catch (Exception ex) {
                // Thử parse đơn giản nhất nếu format phức tạp
                flashSale.setStartDate(LocalDateTime.parse(req.getStartDate()));
                flashSale.setEndDate(LocalDateTime.parse(req.getEndDate()));
            }
        }
        
        FlashSale savedSale = flashSaleRepository.save(flashSale);

        // --- Xử lý Items ---
        List<FlashSaleItem> dbItems = flashSaleItemRepository.findByFlashSaleId(savedSale.getId());
        Map<UUID, FlashSaleItem> dbItemMap = dbItems.stream()
                .collect(Collectors.toMap(i -> i.getProduct().getId(), i -> i));

        List<FlashSaleItem> itemsToSave = new ArrayList<>();
        List<UUID> incomingProductIds = new ArrayList<>();

        if (req.getItems() != null) {
            for (FlashSaleDtos.UpsertRequest.ItemRequest itemReq : req.getItems()) {
                incomingProductIds.add(itemReq.getProductId());
                FlashSaleItem itemEntity;

                if (dbItemMap.containsKey(itemReq.getProductId())) {
                    // Update Item cũ
                    itemEntity = dbItemMap.get(itemReq.getProductId());
                    itemEntity.setDiscountPercent(itemReq.getDiscountPercent());
                    itemEntity.setQuantity(itemReq.getQuantity());
                } else {
                    // Tạo Item mới
                    itemEntity = FlashSaleItem.builder()
                            // LƯU Ý: Không set ID thủ công
                            .flashSale(savedSale)
                            .product(productRepository.getReferenceById(itemReq.getProductId()))
                            .discountPercent(itemReq.getDiscountPercent())
                            .quantity(itemReq.getQuantity())
                            .sold(0)
                            .build();
                }
                itemsToSave.add(itemEntity);
            }
        }

        List<FlashSaleItem> itemsToDelete = dbItems.stream()
                .filter(i -> !incomingProductIds.contains(i.getProduct().getId()))
                .collect(Collectors.toList());

        flashSaleItemRepository.deleteAll(itemsToDelete);
        flashSaleItemRepository.saveAll(itemsToSave);
    }

    // --- 6. ADMIN: DELETE ---
    @Override
    @Transactional
    public void deleteFlashSale(UUID id) {
        flashSaleItemRepository.deleteByFlashSaleId(id);
        flashSaleRepository.deleteById(id);
    }

    private int calculateStatus(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now(CURRENT_ZONE);
        if (now.isBefore(start)) return 0; // Sắp diễn ra
        if (now.isAfter(end)) return 2;    // Kết thúc
        return 1; // Đang diễn ra
    }
}