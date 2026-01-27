package com.tieuluan.laptopstore.mapper;

import com.tieuluan.laptopstore.dto.BrandDto;
import com.tieuluan.laptopstore.dto.CategoryDto;
import com.tieuluan.laptopstore.dto.CategoryTypeDto;
import com.tieuluan.laptopstore.dto.FlashSaleDtos;
import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.dto.ProductResourceDto;
import com.tieuluan.laptopstore.dto.ProductSpecificationDto;
import com.tieuluan.laptopstore.dto.ProductVariantDto;
import com.tieuluan.laptopstore.entities.FlashSaleItem;
import com.tieuluan.laptopstore.entities.Product;
import com.tieuluan.laptopstore.entities.ProductSpecification;
import com.tieuluan.laptopstore.entities.ProductVariant;
import com.tieuluan.laptopstore.entities.ProductVariantAttribute;
import com.tieuluan.laptopstore.entities.Resources;
import com.tieuluan.laptopstore.repositories.FlashSaleItemRepository;
import com.tieuluan.laptopstore.services.BrandService;
import com.tieuluan.laptopstore.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    @Autowired
    private BrandService brandService;

    @Autowired
    @Lazy
    private CategoryService categoryService;

    @Autowired
    private FlashSaleItemRepository flashSaleItemRepository;

    /** ================= Map DTO -> Entity ================= */
    public Product mapToProductEntity(ProductDto dto) {
        if (dto == null) return null;
        Product product = new Product();
        updateProductFromDto(dto, product);
        return product;
    }

    public void updateProductFromDto(ProductDto dto, Product entity) {
        if (dto == null || entity == null) return;

        // 1. Cập nhật các trường thông tin cơ bản
        entity.setName(dto.getName());
        entity.setSlug(dto.getSlug());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setDiscount(dto.getDiscount());
        entity.setStock(dto.getStock());
        entity.setNewArrival(dto.isNewArrival());
        entity.setRating(dto.getRating());

        // 2. Cập nhật quan hệ (Brand, Category...)
        if (dto.getBrand() != null && dto.getBrand().getId() != null) {
            entity.setBrand(brandService.getBrand(dto.getBrand().getId()));
        }
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            entity.setCategory(categoryService.getCategoryEntity(dto.getCategory().getId()));
        }
        if (dto.getCategoryType() != null && dto.getCategoryType().getId() != null) {
            entity.setCategoryType(categoryService.getCategoryType(dto.getCategoryType().getId()));
        }

        // 3. Xử lý Update List con (Variants, Specs, Resources)
        updateVariantsSafe(entity, dto.getVariants());
        updateResourcesSafe(entity, dto.getResources());
        updateSpecificationsSafe(entity, dto.getSpecifications());
    }
// --- XỬ LÝ VARIANTS AN TOÀN (Dựa vào ID FE gửi) ---
    private void updateVariantsSafe(Product entity, List<ProductVariantDto> dtos) {
        if (dtos == null) return;

        // --- FIX BUG NPE: Nếu entity chưa có list variants (bị null), hãy tạo mới ---
        if (entity.getVariants() == null) {
            entity.setVariants(new ArrayList<>());
        }
        
        List<ProductVariant> currentVariants = entity.getVariants();

        // 1. Xóa (Delete)
        currentVariants.removeIf(current -> 
            dtos.stream().noneMatch(dto -> 
                dto.getId() != null && dto.getId().equals(current.getId())
            )
        );

        // 2. Thêm hoặc Sửa (Upsert)
        for (ProductVariantDto dto : dtos) {
            if (dto.getId() == null) {
                ProductVariant newVariant = new ProductVariant();
                newVariant.setProduct(entity);
                newVariant.setSku(dto.getSku());
                newVariant.setPrice(dto.getPrice());
                newVariant.setStockQuantity(dto.getStockQuantity());
                newVariant.setAttributes(new ArrayList<>()); 
                
                updateVariantAttributes(newVariant, dto.getAttributes());
                currentVariants.add(newVariant);
            } else {
                currentVariants.stream()
                    .filter(v -> v.getId().equals(dto.getId()))
                    .findFirst()
                    .ifPresent(existingVariant -> {
                        existingVariant.setSku(dto.getSku());
                        existingVariant.setPrice(dto.getPrice());
                        existingVariant.setStockQuantity(dto.getStockQuantity());
                        updateVariantAttributes(existingVariant, dto.getAttributes());
                    });
            }
        }
    }

    // Xử lý Attributes của Variant (Map<String, String>)
    private void updateVariantAttributes(ProductVariant variant, Map<String, String> dtoAttributes) {
        if (dtoAttributes == null) return;
        List<ProductVariantAttribute> currentAttrs = variant.getAttributes();
        if (currentAttrs == null) {
            currentAttrs = new ArrayList<>();
            variant.setAttributes(currentAttrs);
        }

        // 1. Xóa Attribute cũ nếu tên attribute không còn trong map mới
        currentAttrs.removeIf(attr -> !dtoAttributes.containsKey(attr.getAttributeName()));

        // 2. Update hoặc Insert dựa vào Key (Tên thuộc tính)
        for (Map.Entry<String, String> entry : dtoAttributes.entrySet()) {
            String attrName = entry.getKey(); 
            String attrValue = entry.getValue();

            // Tìm xem attribute này đã tồn tại trong variant chưa
            ProductVariantAttribute existingAttr = currentAttrs.stream()
                    .filter(a -> a.getAttributeName().equals(attrName))
                    .findFirst().orElse(null);

            if (existingAttr != null) {
                // Có rồi -> Update giá trị
                existingAttr.setAttributeValue(attrValue);
            } else {
                // Chưa có -> Tạo mới
                ProductVariantAttribute newAttr = new ProductVariantAttribute();
                newAttr.setAttributeName(attrName);
                newAttr.setAttributeValue(attrValue);
                newAttr.setVariant(variant); // Quan trọng: Gắn cha
                currentAttrs.add(newAttr);
            }
        }
    }

    // --- XỬ LÝ SPECIFICATIONS (Tương tự) ---
    private void updateSpecificationsSafe(Product entity, List<ProductSpecificationDto> dtos) {
        if (dtos == null) return;

        // --- FIX BUG NPE ---
        if (entity.getSpecifications() == null) {
            entity.setSpecifications(new ArrayList<>());
        }

        List<ProductSpecification> currentSpecs = entity.getSpecifications();

        // Logic cũ giữ nguyên
        currentSpecs.removeIf(curr -> 
            dtos.stream().noneMatch(d -> d.getId() != null && d.getId().equals(curr.getId()))
        );

        for (ProductSpecificationDto dto : dtos) {
            if (dto.getId() == null) {
                ProductSpecification newSpec = ProductSpecification.builder()
                        .name(dto.getName())
                        .value(dto.getValue())
                        .product(entity)
                        .build();
                currentSpecs.add(newSpec);
            } else {
                currentSpecs.stream()
                    .filter(s -> s.getId().equals(dto.getId()))
                    .findFirst()
                    .ifPresent(s -> {
                        s.setName(dto.getName());
                        s.setValue(dto.getValue());
                    });
            }
        }
    }
    
    // --- XỬ LÝ RESOURCES (Tương tự) ---
    private void updateResourcesSafe(Product entity, List<ProductResourceDto> dtos) {
        if (dtos == null) return;

        // --- FIX BUG NPE ---
        if (entity.getResources() == null) {
            entity.setResources(new ArrayList<>());
        }

        List<Resources> currentRes = entity.getResources();

        currentRes.removeIf(curr -> 
            dtos.stream().noneMatch(d -> d.getId() != null && d.getId().equals(curr.getId()))
        );

        // ... (phần loop giữ nguyên như cũ)
        for (ProductResourceDto dto : dtos) {
            if (dto.getId() == null) {
                Resources newRes = new Resources();
                newRes.setName(dto.getName());
                newRes.setUrl(dto.getUrl());
                newRes.setType(dto.getType());
                newRes.setIsPrimary(dto.getIsPrimary());
                newRes.setProduct(entity);
                currentRes.add(newRes);
            } else {
                currentRes.stream()
                    .filter(r -> r.getId().equals(dto.getId()))
                    .findFirst()
                    .ifPresent(r -> {
                        r.setName(dto.getName());
                        r.setUrl(dto.getUrl());
                        r.setType(dto.getType());
                        r.setIsPrimary(dto.getIsPrimary());
                    });
            }
        }
    }    
    /** ================= Map Entity -> DTO ================= */
    public ProductDto mapToProductDto(Product product) {
        if (product == null) return null;

        ProductDto.ProductDtoBuilder builder = ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .discount(product.getDiscount())
                .stock(product.getStock())
                .rating(product.getRating())
                .newArrival(product.isNewArrival())
                .enable(product.isEnable());

        // Lấy Thumbnail
        if (product.getResources() != null) {
            builder.thumbnail(getPrimaryResourceUrl(product.getResources()));
        }

        // Map Relations (Brand, Category, CategoryType)...
        if (product.getBrand() != null) {
            builder.brand(BrandDto.builder().id(product.getBrand().getId()).name(product.getBrand().getName()).build());
        }
        if (product.getCategory() != null) {
            builder.category(CategoryDto.builder().id(product.getCategory().getId()).name(product.getCategory().getName()).build());
        }
        if (product.getCategoryType() != null) {
            builder.categoryType(CategoryTypeDto.builder().id(product.getCategoryType().getId()).name(product.getCategoryType().getName()).build());
        }

        builder.variants(mapProductVariantListToDto(product.getVariants()));
        builder.resources(mapProductResourcesListToDto(product.getResources()));
        builder.specifications(mapProductSpecificationsToDto(product.getSpecifications()));

        // Flash Sale logic
        try {
            flashSaleItemRepository.findActiveSaleByProductId(product.getId(), LocalDateTime.now())
                .ifPresent(item -> builder.flashSale(mapToFlashSaleInfo(item)));
        } catch (Exception e) {
            // Log error if needed, but don't break the response
        }

        return builder.build();
    }

    // Helper functions
    private String getPrimaryResourceUrl(List<Resources> resources) {
        if (resources == null) return null;
        return resources.stream().filter(Resources::getIsPrimary).map(Resources::getUrl).findFirst().orElse(null);
    }

    private List<ProductVariantDto> mapProductVariantListToDto(List<ProductVariant> variants) {
        if (variants == null) return new ArrayList<>();
        return variants.stream().map(v -> ProductVariantDto.builder()
                .id(v.getId())
                .sku(v.getSku())
                .price(v.getPrice())
                .stockQuantity(v.getStockQuantity())
                .attributes(v.getAttributes() != null
                        ? v.getAttributes().stream()
                        .collect(Collectors.toMap(
                                ProductVariantAttribute::getAttributeName,
                                ProductVariantAttribute::getAttributeValue,
                                (existing, replacement) -> existing
                        ))
                        : new HashMap<>())
                .build()).collect(Collectors.toList());
    }

    private List<ProductResourceDto> mapProductResourcesListToDto(List<Resources> resources) {
        if (resources == null) return new ArrayList<>();
        return resources.stream().map(r -> ProductResourceDto.builder()
                .id(r.getId()).name(r.getName()).url(r.getUrl()).type(r.getType()).isPrimary(r.getIsPrimary()).build())
                .collect(Collectors.toList());
    }

    private List<ProductSpecificationDto> mapProductSpecificationsToDto(List<ProductSpecification> specs) {
        if (specs == null) return new ArrayList<>();
        return specs.stream().map(ps -> ProductSpecificationDto.builder()
                .name(ps.getName()).value(ps.getValue()).build()).collect(Collectors.toList());
    }
    
     public FlashSaleDtos.ProductFlashSaleInfo mapToFlashSaleInfo(FlashSaleItem item) {
        if (item == null || item.getFlashSale() == null) return null;
        return FlashSaleDtos.ProductFlashSaleInfo.builder()
                .id(item.getFlashSale().getId())
                .discountPercent(item.getDiscountPercent())
                .quantity(item.getQuantity())
                .sold(item.getSold())
                .startDate(item.getFlashSale().getStartDate())
                .endDate(item.getFlashSale().getEndDate())
                .build();
    }
    
    public List<ProductDto> mapToProductDtos(List<Product> products) {
        if (products == null) return new ArrayList<>();
        return products.stream().map(this::mapToProductDto).collect(Collectors.toList());
    }
}