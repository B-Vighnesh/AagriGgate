package com.MyWebpage.register.login.chat.dto;

public class ChatSocketEventDTO {
    private String type;
    private Object data;
    private String message;

    public ChatSocketEventDTO() {
    }

    public ChatSocketEventDTO(String type, Object data, String message) {
        this.type = type;
        this.data = data;
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
