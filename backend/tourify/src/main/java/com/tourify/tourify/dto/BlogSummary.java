package com.tourify.tourify.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BlogSummary {
    private Long id;
    private String title; // Now optional
    private String content; // Brief content preview
    private String thumbnailUrl;
    private String status; // draft, published, archived
    private Integer likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Destinations (both predefined and custom)
    private List<String> destinations; // Combined list of destination names
    private List<String> customDestinations; // Custom destination names only
    
    // Media information
    private Integer mediaCount;
    private Integer imageCount;
    private Integer videoCount;
    private String firstMediaUrl; // For thumbnail purposes
    
    // Engagement metrics
    private Integer commentsCount;
    private Boolean userLiked; // If the requesting user liked this blog
    
    // User info
    private String authorUsername;
    private String authorProfileImage;

    // Constructors
    public BlogSummary() {}

    public BlogSummary(Long id, String title, String content, String status, Integer likes) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.status = status;
        this.likes = likes;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
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

    public Integer getMediaCount() {
        return mediaCount;
    }

    public void setMediaCount(Integer mediaCount) {
        this.mediaCount = mediaCount;
    }

    public Integer getImageCount() {
        return imageCount;
    }

    public void setImageCount(Integer imageCount) {
        this.imageCount = imageCount;
    }

    public Integer getVideoCount() {
        return videoCount;
    }

    public void setVideoCount(Integer videoCount) {
        this.videoCount = videoCount;
    }

    public String getFirstMediaUrl() {
        return firstMediaUrl;
    }

    public void setFirstMediaUrl(String firstMediaUrl) {
        this.firstMediaUrl = firstMediaUrl;
    }

    public Integer getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }

    public Boolean getUserLiked() {
        return userLiked;
    }

    public void setUserLiked(Boolean userLiked) {
        this.userLiked = userLiked;
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

    // Helper methods
    public String getDisplayTitle() {
        return title != null && !title.trim().isEmpty() ? title : "Untitled";
    }

    public String getContentPreview() {
        if (content == null) return "";
        return content.length() > 150 ? content.substring(0, 150) + "..." : content;
    }

    public boolean hasMedia() {
        return mediaCount != null && mediaCount > 0;
    }

    public boolean isPublished() {
        return "published".equalsIgnoreCase(status);
    }

    public boolean isDraft() {
        return "draft".equalsIgnoreCase(status);
    }

    @Override
    public String toString() {
        return "BlogSummary{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", likes=" + likes +
                ", destinations=" + destinations +
                ", mediaCount=" + mediaCount +
                ", commentsCount=" + commentsCount +
                ", createdAt=" + createdAt +
                '}';
    }
}

