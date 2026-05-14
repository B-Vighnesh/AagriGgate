package com.MyWebpage.register.login.crop.ImageStorage;

import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;


@Service
@Profile("dev")
public class DevelopmentImageStorageService{

    private static final Logger logger = LoggerFactory.getLogger(DevelopmentImageStorageService.class);

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );


    public ImageResult store(MultipartFile file)  {
        if (file == null || file.isEmpty()) {
            return ImageResult.empty();
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image size exceeds 5 MB limit");
        }

        Tika tika = new Tika();
        String detectedType = null;
        try {
            detectedType = tika.detect(file.getInputStream());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        if (!ALLOWED_IMAGE_TYPES.contains(detectedType)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed");
        }

        logger.debug("[dev] Storing image '{}' ({}, {} bytes) as DB BLOB",
                file.getOriginalFilename(), detectedType, file.getSize());

        try {
            return ImageResult.ofBlob(
                    file.getOriginalFilename(),
                    detectedType,
                    file.getBytes()
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public ImageResult storeThumbnail(MultipartFile file) {
        return null;
    }

    public void delete(String imageKey) {
        logger.info("[dev] delete() called for key={} — no-op in dev profile", imageKey);
    }

    public ImageResult retrieve(byte[] imageData, String imageName, String imageType, String imageKey) {
        if (imageData == null || imageData.length == 0) {
            logger.debug("[dev] retrieve() called but imageData is empty — returning null (404)");
            return null;
        }

        logger.debug("[dev] retrieve() returning {} bytes from DB BLOB", imageData.length);
        return ImageResult.ofBlob(imageName, imageType, imageData);
    }
}