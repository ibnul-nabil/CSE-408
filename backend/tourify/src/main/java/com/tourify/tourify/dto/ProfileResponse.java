package com.tourify.tourify.dto;

import com.tourify.tourify.entity.Blog;

import java.util.ArrayList;
import java.util.List;

public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String profileImage;
    private String coverPhoto;
    private List<Blog> blogs;

    private List<BlogSummary> blogSummaries;
    private List<TourSummary> tours;
    
    // Profile statistics fields
    private Long totalBlogs;
    private Long publishedBlogs;
    private Long draftBlogs;
    private Long totalLikes;
    private Long totalComments;
    private Long totalTours;
    
    public ProfileResponse(){}

    // Constructor
    public ProfileResponse(Long id, String username, String email, List<Blog> blogs) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.blogs = blogs;
    }

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getCoverPhoto() {
        return coverPhoto;
    }

    public void setCoverPhoto(String coverPhoto) {
        this.coverPhoto = coverPhoto;
    }

    public List<Blog> getBlogs() {
        return blogs;
    }

    public void setBlogs(List<Blog> blogs) {
        this.blogs = blogs;
    }

    public List<BlogSummary> getBlogSummaries() {
        return blogSummaries;
    }

    public void setBlogSummaries(List<BlogSummary> blogSummaries) {
        this.blogSummaries = blogSummaries;
    }

    public List<TourSummary> getTours() {
        return tours;
    }

    public void setTours(List<TourSummary> tours) {
        this.tours = tours;
    }

    // Profile statistics getters and setters
    public Long getTotalBlogs() {
        return totalBlogs;
    }

    public void setTotalBlogs(Long totalBlogs) {
        this.totalBlogs = totalBlogs;
    }

    public Long getPublishedBlogs() {
        return publishedBlogs;
    }

    public void setPublishedBlogs(Long publishedBlogs) {
        this.publishedBlogs = publishedBlogs;
    }

    public Long getDraftBlogs() {
        return draftBlogs;
    }

    public void setDraftBlogs(Long draftBlogs) {
        this.draftBlogs = draftBlogs;
    }

    public Long getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(Long totalLikes) {
        this.totalLikes = totalLikes;
    }

    public Long getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(Long totalComments) {
        this.totalComments = totalComments;
    }

    public Long getTotalTours() {
        return totalTours;
    }

    public void setTotalTours(Long totalTours) {
        this.totalTours = totalTours;
    }
}
        
