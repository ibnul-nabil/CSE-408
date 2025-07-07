package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_destinations", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"blog_id", "destination_id"}))
public class BlogDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @JsonBackReference
    private Blog blog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // JPA Lifecycle Hook
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public BlogDestination() {}

    public BlogDestination(Blog blog, Destination destination) {
        this.blog = blog;
        this.destination = destination;
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

    public Destination getDestination() {
        return destination;
    }

    public void setDestination(Destination destination) {
        this.destination = destination;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "BlogDestination{" +
                "id=" + id +
                ", blog=" + (blog != null ? blog.getId() : null) +
                ", destination=" + (destination != null ? destination.getId() : null) +
                ", createdAt=" + createdAt +
                '}';
    }
} 