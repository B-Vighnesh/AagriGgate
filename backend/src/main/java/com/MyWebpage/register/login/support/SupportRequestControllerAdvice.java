package com.MyWebpage.register.login.support;

import com.MyWebpage.register.login.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(assignableTypes = SupportRequestController.class)
public class SupportRequestControllerAdvice {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
        Map<String, String> errors = extractFieldErrors(exception.getBindingResult().getFieldErrors());
        return ResponseEntity.badRequest().body(ApiResponse.failure(firstMessage(errors), errors));
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleBindException(BindException exception) {
        Map<String, String> errors = extractFieldErrors(exception.getBindingResult().getFieldErrors());
        return ResponseEntity.badRequest().body(ApiResponse.failure(firstMessage(errors), errors));
    }

    @ExceptionHandler(SupportValidationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleSupportValidation(SupportValidationException exception) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure(firstMessage(exception.getErrors()), exception.getErrors()));
    }

    @ExceptionHandler(GuestSupportLimitExceededException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleGuestLimitExceeded(GuestSupportLimitExceededException exception) {
        Map<String, String> errors = Map.of("email", exception.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(ApiResponse.failure(exception.getMessage(), errors));
    }

    private Map<String, String> extractFieldErrors(Iterable<FieldError> fieldErrors) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : fieldErrors) {
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return errors;
    }

    private String firstMessage(Map<String, String> errors) {
        return errors.values().stream().findFirst().orElse("Validation failed");
    }
}
