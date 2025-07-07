package com.tourify.tourify.dto;

import java.util.List;

// Import the standalone MediaRequest
import com.tourify.tourify.dto.MediaRequest;

public class BlogCreateRequest {
    private Long userId;
    private String title; // Optional
    private String content;
    private String thumbnailUrl;
    private String status = "published"; // draft, published, archived
    private List<Long> destinationIds; // Predefined destinations
    private List<String> customDestinations; // Custom destination names
    private List<MediaRequest> media; // Photos and videos

    // Constructors
    public BlogCreateRequest() {}

    public BlogCreateRequest(Long userId, String content) {
        this.userId = userId;
        this.content = content;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Long> getDestinationIds() {
        return destinationIds;
    }

    public void setDestinationIds(List<Long> destinationIds) {
        this.destinationIds = destinationIds;
    }

    public List<String> getCustomDestinations() {
        return customDestinations;
    }

    public void setCustomDestinations(List<String> customDestinations) {
        this.customDestinations = customDestinations;
    }

    public List<MediaRequest> getMedia() {
        return media;
    }

    public void setMedia(List<MediaRequest> media) {
        this.media = media;
    }
} 