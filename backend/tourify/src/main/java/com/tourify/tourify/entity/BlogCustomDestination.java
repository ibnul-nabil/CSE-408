package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_custom_destinations")
public class BlogCustomDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @JsonBackReference
    private Blog blog;

    @Column(name = "destination_name", nullable = false, length = 100)
    private String destinationName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // JPA Lifecycle Hook
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public BlogCustomDestination() {}

    public BlogCustomDestination(Blog blog, String destinationName) {
        this.blog = blog;
        this.destinationName = destinationName;
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

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "BlogCustomDestination{" +
                "id=" + id +
                ", blog=" + (blog != null ? blog.getId() : null) +
                ", destinationName='" + destinationName + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
} 