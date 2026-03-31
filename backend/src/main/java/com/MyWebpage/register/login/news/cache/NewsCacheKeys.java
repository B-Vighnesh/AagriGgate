package com.MyWebpage.register.login.news.cache;

import com.MyWebpage.register.login.news.enums.DateRange;
import com.MyWebpage.register.login.news.enums.NewsCategory;
import com.MyWebpage.register.login.news.enums.NewsType;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class NewsCacheKeys {

    private NewsCacheKeys() {
    }

    public static String feedKey(
            Long userId,
            NewsCategory category,
            NewsType newsType,
            DateRange dateRange,
            Boolean isImportant,
            String keyword,
            int page,
            int size,
            String sortBy
    ) {
        String prefix = normalize(userId) + ":" + normalize(category) + ":" + normalize(newsType) + ":" + page;
        return prefix
                + ":" + normalize(dateRange)
                + ":" + (Boolean.TRUE.equals(isImportant) ? "important" : "all")
                + ":" + hashKeyword(keyword)
                + ":" + size
                + ":" + normalize(sortBy);
    }

    private static String normalize(Object value) {
        return value == null ? "ALL" : String.valueOf(value);
    }

    private static String hashKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return "none";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(keyword.trim().toLowerCase().getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte current : bytes) {
                builder.append(String.format("%02x", current));
            }
            return builder.substring(0, 12);
        } catch (NoSuchAlgorithmException exception) {
            return Integer.toHexString(keyword.trim().toLowerCase().hashCode());
        }
    }
}
