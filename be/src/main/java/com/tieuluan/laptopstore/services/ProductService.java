package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.entities.Product;
import java.util.List;
import java.util.UUID;

public interface ProductService {
    ProductDto addProduct(ProductDto productDto);
    List<ProductDto> getAllProducts(UUID categoryId, UUID typeId);
    ProductDto getProductBySlug(String slug);
    ProductDto getProductDtoById(UUID id);
    ProductDto updateProduct(ProductDto productDto, UUID id);
    List<ProductDto> searchProductsByName(String keyword);
    List<ProductDto> getProductsByCategory(UUID categoryId);
    Product getProductEntityById(UUID id);
    ProductDto deleteProduct(UUID id);
    List<ProductDto> getProductsByIds(List<UUID> ids);
    void updateProductStatus(UUID id, boolean enable);
}