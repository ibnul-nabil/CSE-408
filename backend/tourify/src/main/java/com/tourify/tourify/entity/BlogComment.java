package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blog_comments")
public class BlogComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @JsonBackReference
    private Blog blog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonBackReference
    private BlogComment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BlogComment> replies = new ArrayList<>();

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<CommentLike> commentLikes = new ArrayList<>();

    @Column(nullable = false)
    private Integer likes = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // JPA Lifecycle Hooks
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public BlogComment() {}

    public BlogComment(Blog blog, User user, String content) {
        this.blog = blog;
        this.user = user;
        this.content = content;
    }

    public BlogComment(Blog blog, User user, String content, BlogComment parentComment) {
        this.blog = blog;
        this.user = user;
        this.content = content;
        this.parentComment = parentComment;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public BlogComment getParentComment() {
        return parentComment;
    }

    public void setParentComment(BlogComment parentComment) {
        this.parentComment = parentComment;
    }

    public List<BlogComment> getReplies() {
        return replies;
    }

    public void setReplies(List<BlogComment> replies) {
        this.replies = replies;
    }

    public List<CommentLike> getCommentLikes() {
        return commentLikes;
    }

    public void setCommentLikes(List<CommentLike> commentLikes) {
        this.commentLikes = commentLikes;
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

    // Helper methods
    public void addReply(BlogComment reply) {
        replies.add(reply);
        reply.setParentComment(this);
    }

    public void addLike(CommentLike like) {
        commentLikes.add(like);
        like.setComment(this);
    }

    public boolean isReply() {
        return parentComment != null;
    }

    public boolean hasReplies() {
        return replies != null && !replies.isEmpty();
    }

    @Override
    public String toString() {
        return "BlogComment{" +
                "id=" + id +
                ", blog=" + (blog != null ? blog.getId() : null) +
                ", user=" + (user != null ? user.getId() : null) +
                ", content='" + (content != null ? content.substring(0, Math.min(20, content.length())) + "..." : null) + '\'' +
                ", parentComment=" + (parentComment != null ? parentComment.getId() : null) +
                ", likes=" + likes +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
} 