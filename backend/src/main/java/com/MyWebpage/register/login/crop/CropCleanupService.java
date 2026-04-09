package com.MyWebpage.register.login.crop;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CropCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(CropCleanupService.class);

    private final CropRepo cropRepo;

    @Scheduled(cron = "${crop.cleanup-cron}")
    public void deleteSoldCrops() {
        int deleted = cropRepo.softDeleteSoldCrops(java.time.LocalDateTime.now());
        if (deleted > 0) {
            logger.info("Soft deleted {} sold crop(s) during scheduled cleanup", deleted);
        }
    }
}
