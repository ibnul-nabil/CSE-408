package com.tourify.tourify.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BlogDetailResponse {
    private Long id;
    private String title;
    private String content;
    private String thumbnailUrl;
    private Integer likes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Author info (flattened to avoid circular references)
    private String authorUsername;
    private String authorProfileImage;
    
    // Destinations (flattened)
    private List<String> destinations;
    private List<String> customDestinations;
    
    // Counts
    private Integer commentsCount;
    private Integer mediaCount;
    private Boolean hasMedia;
    
    // Constructors
    public BlogDetailResponse() {}
    
    public BlogDetailResponse(Long id, String title, String content, String thumbnailUrl, 
                             Integer likes, String status, LocalDateTime createdAt, LocalDateTime updatedAt,
                             String authorUsername, String authorProfileImage) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.likes = likes;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.authorUsername = authorUsername;
        this.authorProfileImage = authorProfileImage;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public Integer getLikes() {
        return likes;
    }
    
    public void setLikes(Integer likes) {
        this.likes = likes;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getAuthorUsername() {
        return authorUsername;
    }
    
    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }
    
    public String getAuthorProfileImage() {
        return authorProfileImage;
    }
    
    public void setAuthorProfileImage(String authorProfileImage) {
        this.authorProfileImage = authorProfileImage;
    }
    
    public List<String> getDestinations() {
        return destinations;
    }
    
    public void setDestinations(List<String> destinations) {
        this.destinations = destinations;
    }
    
    public List<String> getCustomDestinations() {
        return customDestinations;
    }
    
    public void setCustomDestinations(List<String> customDestinations) {
        this.customDestinations = customDestinations;
    }
    
    public Integer getCommentsCount() {
        return commentsCount;
    }
    
    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }
    
    public Integer getMediaCount() {
        return mediaCount;
    }
    
    public void setMediaCount(Integer mediaCount) {
        this.mediaCount = mediaCount;
    }
    
    public Boolean getHasMedia() {
        return hasMedia;
    }
    
    public void setHasMedia(Boolean hasMedia) {
        this.hasMedia = hasMedia;
    }
    
    @Override
    public String toString() {
        return "BlogDetailResponse{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", authorUsername='" + authorUsername + '\'' +
                ", likes=" + likes +
                ", commentsCount=" + commentsCount +
                '}';
    }
} 