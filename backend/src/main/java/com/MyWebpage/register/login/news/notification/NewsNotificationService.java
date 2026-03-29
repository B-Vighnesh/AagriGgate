package com.MyWebpage.register.login.news.notification;

import com.MyWebpage.register.login.common.EmailService;
import com.MyWebpage.register.login.farmer.Farmer;
import com.MyWebpage.register.login.farmer.FarmerRepo;
import com.MyWebpage.register.login.news.entity.News;
import com.MyWebpage.register.login.news.entity.NotificationLog;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.List;

@Service
public class NewsNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NewsNotificationService.class);
    private static final EnumSet<NewsCategory> NOTIFIABLE_CATEGORIES = EnumSet.of(
            NewsCategory.LAW,
            NewsCategory.SUBSIDY,
            NewsCategory.LOAN,
            NewsCategory.ALERT,
            NewsCategory.WEATHER
    );

    private final FarmerRepo farmerRepo;
    private final EmailService emailService;
    private final NotificationLogRepository notificationLogRepository;

    public NewsNotificationService(
            FarmerRepo farmerRepo,
            EmailService emailService,
            NotificationLogRepository notificationLogRepository
    ) {
        this.farmerRepo = farmerRepo;
        this.emailService = emailService;
        this.notificationLogRepository = notificationLogRepository;
    }

    public void notifyImportantNews(News news) {
        if (!Boolean.TRUE.equals(news.getIsImportant()) || !NOTIFIABLE_CATEGORIES.contains(news.getCategory())) {
            return;
        }

        List<Farmer> users = farmerRepo.findAll();
        for (Farmer user : users) {
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                continue;
            }
            NotificationLog log = new NotificationLog();
            log.setUserId(user.getFarmerId());
            log.setNews(news);
            try {
                emailService.sendMail(user.getEmail(), buildEmailMessage(news, user), buildEmailSubject(news));
                log.setStatus("SENT");
                log.setSentAt(LocalDateTime.now(ZoneOffset.UTC));
                logger.info("Important news email sent to userId={} for newsId={}", user.getFarmerId(), news.getId());
            } catch (Exception ex) {
                log.setStatus("FAILED");
                log.setSentAt(LocalDateTime.now(ZoneOffset.UTC));
                logger.warn("Failed to send important news email to userId={} for newsId={}", user.getFarmerId(), news.getId(), ex);
            }
            notificationLogRepository.save(log);
            sendPushNotificationStub(user.getFarmerId(), news);
        }
    }

    private String buildEmailSubject(News news) {
        return "AagriGgate Important Update: " + safeValue(news.getTitle());
    }

    private String buildEmailMessage(News news, Farmer user) {
        String summary = safeValue(news.getSummary());
        if (summary.length() > 280) {
            summary = summary.substring(0, 277) + "...";
        }

        return "Hello " + safeValue(user.getFirstName()) + ",\n\n"
                + "A new important update has been published on AagriGgate.\n\n"
                + "Title: " + safeValue(news.getTitle()) + "\n"
                + "Category: " + safeValue(news.getCategory()) + "\n"
                + "Source: " + safeValue(news.getSourceName()) + "\n"
                + "Summary: " + summary + "\n"
                + "Read more: " + safeValue(news.getSourceUrl()) + "\n\n"
                + "Regards,\nTeam AagriGgate";
    }

    private void sendPushNotificationStub(Long userId, News news) {
        logger.info("Push notification stub for userId={} newsId={}", userId, news.getId());
    }

    private String safeValue(Object value) {
        return value == null ? "-" : value.toString();
    }
}
