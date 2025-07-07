package com.tourify.tourify.dto;

public class CommentRequest {
    private Long blogId;
    private Long userId;
    private String content;
    private Long parentCommentId; // Optional - for replies

    // Constructors
    public CommentRequest() {}

    public CommentRequest(Long blogId, Long userId, String content) {
        this.blogId = blogId;
        this.userId = userId;
        this.content = content;
    }

    public CommentRequest(Long blogId, Long userId, String content, Long parentCommentId) {
        this.blogId = blogId;
        this.userId = userId;
        this.content = content;
        this.parentCommentId = parentCommentId;
    }

    // Getters and Setters
    public Long getBlogId() {
        return blogId;
    }

    public void setBlogId(Long blogId) {
        this.blogId = blogId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public boolean isReply() {
        return parentCommentId != null;
    }
} 