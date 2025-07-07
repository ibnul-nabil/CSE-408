package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment_likes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"comment_id", "user_id"}))
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    @JsonBackReference
    private BlogComment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Transient fields for JSON serialization (avoiding circular references)
    @Transient
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @Transient
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    // JPA Lifecycle Hook
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public CommentLike() {}

    public CommentLike(BlogComment comment, User user) {
        this.comment = comment;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BlogComment getComment() {
        return comment;
    }

    public void setComment(BlogComment comment) {
        this.comment = comment;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "CommentLike{" +
                "id=" + id +
                ", comment=" + (comment != null ? comment.getId() : null) +
                ", user=" + (user != null ? user.getId() : null) +
                ", createdAt=" + createdAt +
                '}';
    }
} 