package com.MyWebpage.register.login.common;

import java.time.LocalDate;
import java.time.Period;

public final class ProfileUpdateValidator {

    private ProfileUpdateValidator() {
    }

    public static String requirePersonName(String value, String fieldName) {
        String normalized = requireText(value, fieldName, 2, 50);
        if (!normalized.matches("^[a-zA-Z\\s]+$")) {
            throw new IllegalArgumentException(fieldName + " must contain only letters and spaces");
        }
        return normalized;
    }

    public static String normalizeOptionalPersonName(String value, String fieldName) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        if (normalized.length() > 50) {
            throw new IllegalArgumentException(fieldName + " must be at most 50 characters");
        }

        if (!normalized.matches("^[a-zA-Z\\s]+$")) {
            throw new IllegalArgumentException(fieldName + " must contain only letters and spaces");
        }

        return normalized;
    }

    public static String requirePhone(String value) {
        String normalized = requireText(value, "phoneNo", 10, 10);
        if (!normalized.matches("^[6-9][0-9]{9}$")) {
            throw new IllegalArgumentException("phoneNo must be a valid 10-digit number starting with 6-9");
        }
        return normalized;
    }

    public static String requireState(String value) {
        return requireText(value, "state", 2, 100);
    }

    public static String requireDistrict(String value) {
        return requireText(value, "district", 2, 100);
    }

    public static String requireAadhar(String value) {
        String normalized = requireText(value, "aadharNo", 12, 12);
        if (!normalized.matches("^\\d{12}$")) {
            throw new IllegalArgumentException("aadharNo must be exactly 12 digits");
        }
        return normalized;
    }

    public static String requireAdultDob(String value) {
        String normalized = requireText(value, "dob", 10, 10);

        LocalDate dob;
        try {
            dob = LocalDate.parse(normalized);
        } catch (Exception exception) {
            throw new IllegalArgumentException("dob must be a valid date in yyyy-MM-dd format");
        }

        if (Period.between(dob, LocalDate.now()).getYears() < 18) {
            throw new IllegalArgumentException("User must be at least 18 years old");
        }

        return normalized;
    }

    public static String normalizeOptionalUsername(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("username must not be blank");
        }

        if (normalized.length() < 3 || normalized.length() > 50) {
            throw new IllegalArgumentException("username must be between 3 and 50 characters");
        }

        if (!normalized.matches("^[a-zA-Z0-9._]+$")) {
            throw new IllegalArgumentException("username may contain letters, numbers, dot, and underscore only");
        }

        return normalized;
    }

    private static String requireText(String value, String fieldName, int minLength, int maxLength) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }

        if (normalized.length() < minLength || normalized.length() > maxLength) {
            throw new IllegalArgumentException(
                    fieldName + " must be between " + minLength + " and " + maxLength + " characters"
            );
        }

        return normalized;
    }
}
