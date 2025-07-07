package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_media")
public class BlogMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @JsonBackReference
    private Blog blog;

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

    @Column(name = "media_type", nullable = false, length = 20)
    private String mediaType; // 'image' or 'video'

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "media_order", nullable = false)
    private Integer mediaOrder;

    @Column(name = "file_size")
    private Integer fileSize; // in bytes

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "mime_type", length = 100)
    private String mimeType; // image/jpeg, video/mp4, etc.

    private Integer width;
    
    private Integer height;

    private Integer duration; // for videos in seconds

    @Column(name = "is_thumbnail")
    private Boolean isThumbnail = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // JPA Lifecycle Hook
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public BlogMedia() {}

    public BlogMedia(Blog blog, String mediaUrl, String mediaType, Integer mediaOrder) {
        this.blog = blog;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.mediaOrder = mediaOrder;
    }

    public BlogMedia(Blog blog, String mediaUrl, String mediaType, String caption, Integer mediaOrder) {
        this.blog = blog;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.caption = caption;
        this.mediaOrder = mediaOrder;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Blog getBlog() {
        return blog;
    }

    public void setBlog(Blog blog) {
        this.blog = blog;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Helper methods
    public boolean isImage() {
        return "image".equalsIgnoreCase(this.mediaType);
    }

    public boolean isVideo() {
        return "video".equalsIgnoreCase(this.mediaType);
    }

    @Override
    public String toString() {
        return "BlogMedia{" +
                "id=" + id +
                ", blog=" + (blog != null ? blog.getId() : null) +
                ", mediaType='" + mediaType + '\'' +
                ", caption='" + caption + '\'' +
                ", mediaOrder=" + mediaOrder +
                ", fileName='" + fileName + '\'' +
                ", isThumbnail=" + isThumbnail +
                ", createdAt=" + createdAt +
                '}';
    }
} 