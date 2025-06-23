package com.tourify.tourify.dto;

import com.tourify.tourify.entity.Blog;
import java.util.List;

public class ProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private List<Blog> blogs;

    // Constructor
    public ProfileResponse(Long userId, String username, String email, List<Blog> blogs) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.blogs = blogs;
    }

    // Getters and setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<Blog> getBlogs() { return blogs; }
    public void setBlogs(List<Blog> blogs) { this.blogs = blogs; }
}
