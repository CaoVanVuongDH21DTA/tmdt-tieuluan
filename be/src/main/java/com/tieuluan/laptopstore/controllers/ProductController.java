package com.tieuluan.laptopstore.controllers;

import com.tieuluan.laptopstore.dto.ProductDto;
import com.tieuluan.laptopstore.mapper.ProductMapper;
import com.tieuluan.laptopstore.repositories.ProductRepository;
import com.tieuluan.laptopstore.services.ProductService;

import jakarta.servlet.http.HttpServletResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductService productService;

    //lấy toàn bộ sản phẩm
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID typeId,
            @RequestParam(required = false) String slug,
            HttpServletResponse response
    ) {
        List<ProductDto> productList = new ArrayList<>();

        if (StringUtils.isNotBlank(slug)) {
            // Tìm theo slug
            ProductDto productDto = productService.getProductBySlug(slug);
            if (productDto != null) productList.add(productDto);
        } else {
            // Lấy tất cả (đã bao gồm Flash Sale bên trong Service)
            productList = productService.getAllProducts(categoryId, typeId);
        }

        response.setHeader("Content-Range", String.valueOf(productList.size()));
        return new ResponseEntity<>(productList, HttpStatus.OK);
    }
    //lấy sản phẩm bằng id
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable UUID id){
        ProductDto productDto = productService.getProductDtoById(id);
        return new ResponseEntity<>(productDto, HttpStatus.OK);
    }

    // thêm mới sản phẩm
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto productDto){
        ProductDto product = productService.addProduct(productDto);
        return new ResponseEntity<>(product,HttpStatus.CREATED);
    }

    //chỉnh sửa sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@RequestBody ProductDto productDto,@PathVariable UUID id){
        System.out.println("productDto: " + productDto);
        ProductDto product = productService.updateProduct(productDto,id);
        return new ResponseEntity<>(product,HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(
            @RequestParam("query") String query) {
        List<ProductDto> products = productService.searchProductsByName(query);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<?> toggleProductStatus(@PathVariable UUID id, @RequestParam boolean enable) {
        productService.updateProductStatus(id, enable);
        
        return ResponseEntity.ok("Cập nhật trạng thái sản phẩm thành công");
    }

    // xóa sản phẩm theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDto> deleteProduct(@PathVariable UUID id) {
        ProductDto deletedProduct = productService.deleteProduct(id);
        return new ResponseEntity<>(deletedProduct, HttpStatus.OK);
    }

    @PostMapping("/by-ids")
    public ResponseEntity<List<ProductDto>> getProductsByIds(@RequestBody List<UUID> ids) {
        List<ProductDto> products = productService.getProductsByIds(ids);
        return ResponseEntity.ok(products);
    }

}
