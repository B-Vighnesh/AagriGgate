package com.MyWebpage.register.login.support;

import java.util.LinkedHashMap;
import java.util.Map;

public class SupportValidationException extends RuntimeException {

    private final Map<String, String> errors;

    public SupportValidationException(Map<String, String> errors) {
        super(errors.values().stream().findFirst().orElse("Validation failed"));
        this.errors = new LinkedHashMap<>(errors);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
