package com.MyWebpage.register.login.crop.ImageStorage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

import java.io.IOException;
import java.util.Set;

@Service
@Profile("prod")
public class ProductionImageStorageService implements ImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(ProductionImageStorageService.class);

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final S3Client s3Client;

    @Value("${aws.s3.bucket:#{null}}")
    private String bucketName;

    public ProductionImageStorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Override
    public ImageResult store(MultipartFile file) throws IOException {

        if (file != null && !file.isEmpty()) {
            logger.info("[prod] Image upload received but image storage is disabled in Phase 1. " +
                    "File '{}' ({} bytes) was not stored.", file.getOriginalFilename(), file.getSize());
        }
        return ImageResult.empty();

        /*
        if (file == null || file.isEmpty()) {
            return ImageResult.empty();
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image size exceeds 5 MB limit");
        }

        Tika tika = new Tika();
        String detectedType = tika.detect(file.getInputStream());

        if (!ALLOWED_IMAGE_TYPES.contains(detectedType)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed");
        }

        String extension = detectedType.split("/")[1];
        String key = "crops/" + UUID.randomUUID() + "." + extension;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(detectedType)
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

        logger.info("[prod] Uploaded image to private S3: bucket={} key={}", bucketName, key);

        return ImageResult.ofKey(file.getOriginalFilename(), detectedType, key);
        */
    }

    @Override
    public ImageResult retrieve(byte[] imageData, String imageName, String imageType, String imageKey) {
        if (1 == 1) {
            byte[] defaultImage = "No Image".getBytes();

            return ImageResult.ofBlob(
                    "default.png",
                    "image/png",
                    defaultImage
            );
        }
        if (imageKey == null || imageKey.isBlank()) {
            logger.debug("[prod] retrieve() called but imageKey is blank — returning null (404)");
            return null;
        }

        if (s3Client == null || bucketName == null) {
            logger.warn("[prod] retrieve() called but S3Client or bucket is not configured — returning null (404)");
            return null;
        }

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(imageKey)
                    .build();

            ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(getRequest);
            byte[] bytes = response.asByteArray();

            String contentType = response.response().contentType();
            String resolvedType = (contentType != null && !contentType.isBlank()) ? contentType : imageType;

            logger.debug("[prod] retrieve() fetched {} bytes from S3 key={}", bytes.length, imageKey);

            return ImageResult.ofBlob(imageName, resolvedType, bytes);

        } catch (NoSuchKeyException e) {
            logger.warn("[prod] retrieve() S3 key not found: bucket={} key={}", bucketName, imageKey);
            return null;
        } catch (Exception e) {
            logger.error("[prod] retrieve() failed to fetch from S3: key={} error={}", imageKey, e.getMessage());
            return null;
        }
    }
}

