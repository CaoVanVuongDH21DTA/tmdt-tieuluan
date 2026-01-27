package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.entities.Product;
import com.tieuluan.laptopstore.exceptions.ResourceNotFoundEx;
import com.tieuluan.laptopstore.mapper.ProductMapper;
import com.tieuluan.laptopstore.repositories.ProductRepository;
import com.tieuluan.laptopstore.specification.ProductSpecs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    // 2. Inject FlashSaleService (Clean Architecture)
    @Autowired
    private FlashSaleService flashSaleService;

    // =========================================================================
    // CÁC HÀM GET - TỰ ĐỘNG GỌI FLASH SALE SERVICE
    // =========================================================================

    @Override
    public List<ProductDto> getAllProducts(UUID categoryId, UUID typeId) {
        Specification<Product> spec = Specification
                .where(categoryId != null ? ProductSpecs.hasCategoryId(categoryId) : null)
                .and(typeId != null ? ProductSpecs.hasCategoryTypeId(typeId) : null);

        List<Product> products = productRepository.findAll(spec);
        List<ProductDto> dtos = productMapper.mapToProductDtos(products);

        // Gắn Sale
        flashSaleService.enrichProducts(dtos);

        return dtos;
    }

    @Override
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlugWithSpecifications(slug)
                .orElseThrow(() -> new ResourceNotFoundEx("Product Not Found!"));
        ProductDto dto = productMapper.mapToProductDto(product);
        
        // Gắn Sale
        flashSaleService.enrichSingleProduct(dto);
        
        return dto;
    }

    @Override
    public ProductDto getProductDtoById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product Not Found!"));
        ProductDto dto = productMapper.mapToProductDto(product);

        // Gắn Sale
        flashSaleService.enrichSingleProduct(dto);
        
        return dto;
    }

    @Override
    public List<ProductDto> searchProductsByName(String keyword) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(keyword);
        List<ProductDto> dtos = productMapper.mapToProductDtos(products);
        
        // Gắn Sale
        flashSaleService.enrichProducts(dtos);
        
        return dtos;
    }

    @Override
    public List<ProductDto> getProductsByCategory(UUID categoryId) {
        List<Product> products = productRepository.findByCategory_Id(categoryId);
        List<ProductDto> dtos = products.stream().map(productMapper::mapToProductDto).collect(Collectors.toList());

        // Gắn Sale
        flashSaleService.enrichProducts(dtos);

        return dtos;
    }

    @Override
    public List<ProductDto> getProductsByIds(List<UUID> ids) {
        List<Product> products = productRepository.findByIdIn(ids);
        List<ProductDto> dtos = productMapper.mapToProductDtos(products);
        
        flashSaleService.enrichProducts(dtos);
        
        return dtos;
    }
    
    @Override
    public Product getProductEntityById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // =========================================================================
    // CÁC HÀM WRITE (CREATE/UPDATE/DELETE) - CẦN @TRANSACTIONAL GHI ĐÈ
    // =========================================================================

    @Override
    @Transactional 
    public ProductDto addProduct(ProductDto productDto) {
        Product product = productMapper.mapToProductEntity(productDto);
        Product saved = productRepository.save(product);
        return productMapper.mapToProductDto(saved);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(ProductDto productDto, UUID id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product Not Found!"));

        productMapper.updateProductFromDto(productDto, existing);
        Product updated = productRepository.save(existing);
        log.info("Updated product with id: {}", updated.getId());
        return productMapper.mapToProductDto(updated);
    }

    @Override
    @Transactional
    public ProductDto deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Không tìm thấy sản phẩm với ID: " + id));

        if (!product.isEnable()) {
            throw new IllegalStateException("Sản phẩm đã bị vô hiệu hóa trước đó.");
        }

        product.setEnable(false); 
        Product updated = productRepository.save(product);

        return productMapper.mapToProductDto(updated);
    }

    @Override
    public void updateProductStatus(UUID id, boolean enable) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundEx("Product not found with id: " + id);
        }
        productRepository.updateEnableStatus(id, enable);
    }
}