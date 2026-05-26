package com.MyWebpage.register.login.crop.ImageStorage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ImageStorageService {
    ImageResult store(MultipartFile file);
    ImageResult storeThumbnail(MultipartFile file);
    ImageResult retrieve(byte[] imageData, String imageName, String imageType, String imageKey);
    ImageResult retrieveThumbnail(byte[] imageData, String imageName, String imageType, String thumbnailKey);
    void delete(String imageKey);
    void deleteThumbnail(String thumbnailKey);
}