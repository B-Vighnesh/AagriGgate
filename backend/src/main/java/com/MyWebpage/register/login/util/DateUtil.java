package com.MyWebpage.register.login.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateUtil {

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateUtil() {
    }

    public static String nowFormatted() {
        return LocalDateTime.now().format(DEFAULT_FORMATTER);
    }
}
