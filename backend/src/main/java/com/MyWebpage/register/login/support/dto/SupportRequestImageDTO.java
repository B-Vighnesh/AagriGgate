package com.MyWebpage.register.login.support.dto;

public class SupportRequestImageDTO {
    private Long id;
    private byte[] imageData;
    private String imageName;
    private String imageType;

    public SupportRequestImageDTO() {
    }

    public SupportRequestImageDTO(Long id, byte[] imageData, String imageName, String imageType) {
        this.id = id;
        this.imageData = imageData;
        this.imageName = imageName;
        this.imageType = imageType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }
}
