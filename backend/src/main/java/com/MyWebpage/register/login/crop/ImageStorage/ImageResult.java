package com.MyWebpage.register.login.crop.ImageStorage;


import java.util.Arrays;

public class ImageResult {

    private final String name;
    private final String type;
    private final byte[] data;
    private final String key;

    private ImageResult(String name, String type, byte[] data, String key) {
        this.name = name;
        this.type = type;
        this.data = data;
        this.key  = key;
    }

    public static ImageResult ofBlob(String name, String type, byte[] data) {
        return new ImageResult(name, type, data, null);
    }

    public static ImageResult ofKey(String name, String type, String key) {
        return new ImageResult(name, type, null, key);
    }

    public static ImageResult empty() {
        return new ImageResult(null, null, null, null);
    }


    public String getName() { return name; }
    public String getType() { return type; }
    public byte[] getData() { return data; }
    public String getKey()  { return key;  }

    public boolean isEmpty() {
        return name == null && data == null && key == null;
    }

    public boolean hasData() {
        return data != null && data.length > 0;
    }

    public boolean hasKey() {
        return key != null && !key.isBlank();
    }

    @Override
    public String toString() {
        return "ImageResult{" +
                "name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", data=" + Arrays.toString(data) +
                ", key='" + key + '\'' +
                '}';
    }
}