package com.MyWebpage.register.login.crop.ImageStorage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ImageStorageService {
    ImageResult store(MultipartFile file) throws IOException;

    ImageResult retrieve(byte[] imageData, String imageName, String imageType, String imageKey);
}