package com.tourify.tourify.dto;

public class MediaRequest {
    private String mediaUrl;
    private String mediaType; // 'image' or 'video'
    private String caption;
    private Integer mediaOrder;
    private Integer fileSize;
    private String fileName;
    private String mimeType;
    private Integer width;
    private Integer height;
    private Integer duration; // for videos
    private Boolean isThumbnail = false;

    // Constructors
    public MediaRequest() {}

    public MediaRequest(String mediaUrl, String mediaType, Integer mediaOrder) {
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.mediaOrder = mediaOrder;
    }

    // Getters and Setters
    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Integer getMediaOrder() {
        return mediaOrder;
    }

    public void setMediaOrder(Integer mediaOrder) {
        this.mediaOrder = mediaOrder;
    }

    public Integer getFileSize() {
        return fileSize;
    }

    public void setFileSize(Integer fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Boolean getIsThumbnail() {
        return isThumbnail;
    }

    public void setIsThumbnail(Boolean isThumbnail) {
        this.isThumbnail = isThumbnail;
    }
}