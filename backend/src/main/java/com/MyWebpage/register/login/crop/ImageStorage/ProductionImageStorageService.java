package com.MyWebpage.register.login.crop.ImageStorage;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;


//@Profile("prod")
@Service
public class ProductionImageStorageService implements ImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(ProductionImageStorageService.class);

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public ProductionImageStorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @Override
    public ImageResult store(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ImageResult.empty();
            }

            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image size exceeds 5 MB limit");
            }

            String contentType = file.getContentType();
            if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed");
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .size(1200, 1200)
                    .keepAspectRatio(true)
                    .outputQuality(0.8)
                    .outputFormat("jpg")
                    .toOutputStream(outputStream);

            byte[] compressedBytes = outputStream.toByteArray();
            String key = "crops/" + UUID.randomUUID() + ".jpg";

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putRequest,
                    RequestBody.fromBytes(compressedBytes));

            logger.info("[prod] Uploaded compressed image: bucket={} key={} size={}KB",
                    bucketName, key, compressedBytes.length / 1024);

            return ImageResult.ofKey(
                    file.getOriginalFilename(),
                    "image/jpeg",
                    key
            );

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ImageResult storeThumbnail(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ImageResult.empty();
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .size(300, 300)
                    .keepAspectRatio(true)
                    .outputQuality(0.7)
                    .outputFormat("jpg")
                    .toOutputStream(outputStream);

            byte[] compressedBytes = outputStream.toByteArray();
            String key = "thumbnails/" + UUID.randomUUID() + ".jpg";

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putRequest,
                    RequestBody.fromBytes(compressedBytes));

            logger.info("[prod] Uploaded compressed thumbnail: bucket={} key={} size={}KB",
                    bucketName, key, compressedBytes.length / 1024);

            return ImageResult.ofKey(
                    file.getOriginalFilename(),
                    "image/jpeg",
                    key
            );

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Override
    public void delete(String imageKey) {
        if (imageKey == null || imageKey.isBlank()) {
            logger.warn("[prod] delete() called with blank key — skipping");
            return;
        }

        if (s3Client == null || bucketName == null) {
            logger.warn("[prod] delete() S3Client or bucket not configured — skipping");
            return;
        }

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(imageKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("[prod] Deleted S3 object: bucket={} key={}", bucketName, imageKey);

        } catch (NoSuchKeyException e) {
            logger.warn("[prod] delete() key not found (already deleted?): key={}", imageKey);
        } catch (Exception e) {
            logger.error("[prod] delete() failed: key={} error={}", imageKey, e.getMessage());
        }
    }

    @Override
    public ImageResult retrieve(byte[] imageData, String imageName,
                                String imageType, String imageKey) {
        if (imageKey == null || imageKey.isBlank()) {
            return null;
        }

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(imageKey)
                    .build();

            ResponseBytes<GetObjectResponse> response =
                    s3Client.getObjectAsBytes(getRequest);
            byte[] bytes = response.asByteArray();

            String contentType = response.response().contentType();
            String resolvedType = (contentType != null &&
                    !contentType.isBlank()) ? contentType : imageType;

            return ImageResult.ofBlob(imageName, resolvedType, bytes);

        } catch (NoSuchKeyException e) {
            logger.warn("[prod] retrieve() key not found: key={}", imageKey);
            return null;
        } catch (Exception e) {
            logger.error("[prod] retrieve() failed: key={} error={}", imageKey, e.getMessage());
            return null;
        }
    }

    @Override
    public ImageResult retrieveThumbnail(byte[] imageData, String imageName, String imageType, String thumbnailKey) {
        if (thumbnailKey == null || thumbnailKey.isBlank()) {
            logger.debug("[prod] retrieveThumbnail() thumbnailKey is blank — returning null");
            return null;
        }
        if (s3Client == null || bucketName == null) {
            logger.warn("[prod] retrieveThumbnail() S3Client or bucket not configured — returning null");
            return null;
        }
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(thumbnailKey)
                    .build();
            ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(getRequest);
            byte[] bytes = response.asByteArray();
            String contentType = response.response().contentType();
            String resolvedType = (contentType != null && !contentType.isBlank()) ? contentType : imageType;
            logger.debug("[prod] retrieveThumbnail() fetched {} bytes for key={}", bytes.length, thumbnailKey);
            return ImageResult.ofBlob(imageName, resolvedType, bytes);
        } catch (NoSuchKeyException e) {
            logger.warn("[prod] retrieveThumbnail() key not found: key={}", thumbnailKey);
            return null;
        } catch (Exception e) {
            logger.error("[prod] retrieveThumbnail() failed: key={} error={}", thumbnailKey, e.getMessage());
            return null;
        }
    }

    @Override
    public void deleteThumbnail(String thumbnailKey) {
        if (thumbnailKey == null || thumbnailKey.isBlank()) {
            logger.warn("[prod] deleteThumbnail() called with blank key — skipping");
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(thumbnailKey)
                    .build());
            logger.info("[prod] Deleted S3 thumbnail: key={}", thumbnailKey);
        } catch (NoSuchKeyException e) {
            logger.warn("[prod] deleteThumbnail() key not found (already deleted?): key={}", thumbnailKey);
        } catch (Exception e) {
            logger.error("[prod] deleteThumbnail() failed: key={} error={}", thumbnailKey, e.getMessage());
        }
    }
}

