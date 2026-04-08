package com.MyWebpage.register.login.support.dto;

import com.MyWebpage.register.login.support.SupportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public class AuthenticatedSupportRequestForm {

    @NotNull
    private SupportType type;

    @NotBlank
    private String message;

    private MultipartFile image;

    public SupportType getType() {
        return type;
    }

    public void setType(SupportType type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
