package com.tieuluan.laptopstore.auth.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    // Biến cloudinary để thao tác với Cloudinary API
    private final Cloudinary cloudinary;

    // Folder mặc định trên Cloudinary
    @Value("${FOLDER}")
    private String folder;

    // Constructor khởi tạo Cloudinary với thông tin từ cấu hình
    public CloudinaryService(
        @Value("${CLOUD_NAME}") String cloudName,
        @Value("${API_KEY}") String apiKey,
        @Value("${API_SECRET}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,  
                "api_key", apiKey,         
                "api_secret", apiSecret    
        ));
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // Upload lên Cloudinary và chỉ định folder
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", folder));
        // Trả về link ảnh an toàn (https)
        return (String) uploadResult.get("secure_url");
    }

    public String uploadFileFromUrl(String imageUrl) throws IOException {
        // Upload trực tiếp từ link URL
        Map uploadResult = cloudinary.uploader().upload(imageUrl, 
                ObjectUtils.asMap("folder", folder));
        // Trả về link ảnh an toàn (https)
        return (String) uploadResult.get("secure_url");
    }

}
