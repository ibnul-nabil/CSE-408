package com.tourify.tourify.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommentResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer likes;
    private Boolean userLiked;
    
    // User info (flattened to avoid circular references)
    private Long userId;
    private String username;
    private String userProfileImage;
    
    // Parent comment info (for replies)
    private Long parentCommentId;
    
    // Replies (if any)
    private List<CommentResponse> replies;
    
    // Constructors
    public CommentResponse() {}
    
    public CommentResponse(Long id, String content, LocalDateTime createdAt, LocalDateTime updatedAt, 
                          Integer likes, Long userId, String username, String userProfileImage) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.likes = likes;
        this.userId = userId;
        this.username = username;
        this.userProfileImage = userProfileImage;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
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
    
    public Integer getLikes() {
        return likes;
    }
    
    public void setLikes(Integer likes) {
        this.likes = likes;
    }
    
    public Boolean getUserLiked() {
        return userLiked;
    }
    
    public void setUserLiked(Boolean userLiked) {
        this.userLiked = userLiked;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getUserProfileImage() {
        return userProfileImage;
    }
    
    public void setUserProfileImage(String userProfileImage) {
        this.userProfileImage = userProfileImage;
    }
    
    public Long getParentCommentId() {
        return parentCommentId;
    }
    
    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }
    
    public List<CommentResponse> getReplies() {
        return replies;
    }
    
    public void setReplies(List<CommentResponse> replies) {
        this.replies = replies;
    }
    
    @Override
    public String toString() {
        return "CommentResponse{" +
                "id=" + id +
                ", content='" + content + '\'' +
                ", createdAt=" + createdAt +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", likes=" + likes +
                '}';
    }
} 