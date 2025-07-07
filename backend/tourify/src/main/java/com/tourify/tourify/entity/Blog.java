package com.tourify.tourify.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blogs")
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @Column(length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(nullable = false)
    private Integer likes = 0;

    @Column(length = 20)
    private String status = "published";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships to new entities
    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BlogDestination> blogDestinations = new ArrayList<>();

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BlogCustomDestination> blogCustomDestinations = new ArrayList<>();

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BlogMedia> blogMedia = new ArrayList<>();

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BlogComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BlogLike> blogLikes = new ArrayList<>();

    // Add getters for destination names that will be included in JSON
    @Transient
    public List<String> getDestinations() {
        if (blogDestinations == null) return List.of();
        try {
            return blogDestinations.stream()
                .filter(bd -> bd.getDestination() != null)
                .map(bd -> bd.getDestination().getName())
                .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transient
    public List<String> getCustomDestinations() {
        if (blogCustomDestinations == null) return List.of();
        try {
            return blogCustomDestinations.stream()
                .map(BlogCustomDestination::getDestinationName)
                .filter(name -> name != null && !name.trim().isEmpty())
                .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    // Add getters for additional metadata that frontend expects
    @Transient
    public String getAuthorUsername() {
        try {
            return user != null ? user.getUsername() : null;
        } catch (Exception e) {
            return null;
        }
    }

    @Transient
    public String getAuthorProfileImage() {
        try {
            return user != null ? user.getProfileImage() : null;
        } catch (Exception e) {
            return null;
        }
    }

    @Transient
    public Integer getCommentsCount() {
        if (comments == null) return 0;
        try {
            return comments.size();
        } catch (Exception e) {
            return 0;
        }
    }

    @Transient
    public Integer getMediaCount() {
        if (blogMedia == null) return 0;
        try {
            return blogMedia.size();
        } catch (Exception e) {
            return 0;
        }
    }

    @Transient
    public Boolean getHasMedia() {
        if (blogMedia == null) return false;
        try {
            return !blogMedia.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

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
    public Blog() {}

    public Blog(User user, String title, String content) {
        this.user = user;
        this.title = title;
        this.content = content;
    }

    public Blog(User user, String content) {
        this.user = user;
        this.content = content;
        this.title = null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    // Relationship getters and setters
    public List<BlogDestination> getBlogDestinations() {
        return blogDestinations;
    }

    public void setBlogDestinations(List<BlogDestination> blogDestinations) {
        this.blogDestinations = blogDestinations;
    }

    public List<BlogCustomDestination> getBlogCustomDestinations() {
        return blogCustomDestinations;
    }

    public void setBlogCustomDestinations(List<BlogCustomDestination> blogCustomDestinations) {
        this.blogCustomDestinations = blogCustomDestinations;
    }

    public List<BlogMedia> getBlogMedia() {
        return blogMedia;
    }

    public void setBlogMedia(List<BlogMedia> blogMedia) {
        this.blogMedia = blogMedia;
    }

    public List<BlogComment> getComments() {
        return comments;
    }

    public void setComments(List<BlogComment> comments) {
        this.comments = comments;
    }

    public List<BlogLike> getBlogLikes() {
        return blogLikes;
    }

    public void setBlogLikes(List<BlogLike> blogLikes) {
        this.blogLikes = blogLikes;
    }

    // Helper methods
    public void addDestination(BlogDestination destination) {
        blogDestinations.add(destination);
        destination.setBlog(this);
    }

    public void addCustomDestination(BlogCustomDestination customDestination) {
        blogCustomDestinations.add(customDestination);
        customDestination.setBlog(this);
    }

    public void addMedia(BlogMedia media) {
        blogMedia.add(media);
        media.setBlog(this);
    }

    public void addComment(BlogComment comment) {
        comments.add(comment);
        comment.setBlog(this);
    }

    public void addLike(BlogLike like) {
        blogLikes.add(like);
        like.setBlog(this);
    }

    @Override
    public String toString() {
        return "Blog{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", title='" + title + '\'' +
                ", content='" + (content != null ? content.substring(0, Math.min(20, content.length())) + "..." : null) + '\'' +
                ", status='" + status + '\'' +
                ", likes=" + likes +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
