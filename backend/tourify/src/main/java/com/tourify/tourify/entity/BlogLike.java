package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_likes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"blog_id", "user_id"}))
public class BlogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @JsonBackReference
    private Blog blog;

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
    public BlogLike() {}

    public BlogLike(Blog blog, User user) {
        this.blog = blog;
        this.user = user;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "BlogLike{" +
                "id=" + id +
                ", blog=" + (blog != null ? blog.getId() : null) +
                ", user=" + (user != null ? user.getId() : null) +
                ", createdAt=" + createdAt +
                '}';
    }
} 