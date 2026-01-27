package com.tieuluan.laptopstore.services;

import com.tieuluan.laptopstore.dto.FlashSaleDtos;
import com.tieuluan.laptopstore.dto.ProductDto;
import java.util.List;
import java.util.UUID;

public interface FlashSaleService {

    // ==========================================
    // PHẦN 1: CHO NGƯỜI DÙNG (USER VIEW)
    // ==========================================
    
    // Gắn thông tin Sale vào danh sách sản phẩm (Trang chủ, Search)
    void enrichProducts(List<ProductDto> productDtos);

    // Gắn thông tin Sale vào 1 sản phẩm (Trang chi tiết)
    void enrichSingleProduct(ProductDto productDto);

    // ==========================================
    // PHẦN 2: CHO QUẢN TRỊ VIÊN (ADMIN CRUD)
    // ==========================================

    // Lấy danh sách Flash Sale (cho bảng quản lý)
    List<FlashSaleDtos.ListResponse> getAllFlashSales();

    // Lấy chi tiết 1 Flash Sale (để hiển thị lên Form sửa)
    FlashSaleDtos.DetailResponse getFlashSaleDetail(UUID id);

    // Tạo mới hoặc Cập nhật (Logic quan trọng: Giữ nguyên số lượng đã bán)
    void saveFlashSale(FlashSaleDtos.UpsertRequest request);

    // Xóa Flash Sale
    void deleteFlashSale(UUID id);
}