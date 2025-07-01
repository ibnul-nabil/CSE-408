package com.tourify.tourify.controller;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.repository.BlogRepository;
import com.tourify.tourify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;
    private BlogRepository blogRepository;

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            ProfileResponse dto = new ProfileResponse();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setProfileImage(user.getProfileImage());
            // Map blogs
            if (user.getBlogs() != null) {
                dto.setBlogs(user.getBlogs().stream().map(blog -> {
                    ProfileResponse.BlogSummary b = new ProfileResponse.BlogSummary();
                    b.setId(blog.getId());
                    b.setTitle(blog.getTitle());
                    b.setDestination(blog.getDestination());
                    return b;
                }).collect(Collectors.toList()));
            }
            // Map tours
            if (user.getTours() != null) {
                dto.setTours(user.getTours().stream().map(tour -> {
                    ProfileResponse.TourSummary t = new ProfileResponse.TourSummary();
                    t.setId(tour.getId());
                    t.setTitle(tour.getTitle());
                    t.setStatus(tour.getStatus().name());
                    return t;
                }).collect(Collectors.toList()));
            }
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/api/blogs/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        return blogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO for profile response
    public static class ProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String profileImage;
        private java.util.List<BlogSummary> blogs;
        private java.util.List<TourSummary> tours;
        // getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getProfileImage() { return profileImage; }
        public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
        public java.util.List<BlogSummary> getBlogs() { return blogs; }
        public void setBlogs(java.util.List<BlogSummary> blogs) { this.blogs = blogs; }
        public java.util.List<TourSummary> getTours() { return tours; }
        public void setTours(java.util.List<TourSummary> tours) { this.tours = tours; }
        public static class BlogSummary {
            private Long id;
            private String title;
            private String destination;
            // getters and setters
            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getTitle() { return title; }
            public void setTitle(String title) { this.title = title; }
            public String getDestination() { return destination; }
            public void setDestination(String destination) { this.destination = destination; }
        }
        public static class TourSummary {
            private Long id;
            private String title;
            private String status;
            // getters and setters
            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getTitle() { return title; }
            public void setTitle(String title) { this.title = title; }
            public String getStatus() { return status; }
            public void setStatus(String status) { this.status = status; }
        }
    }
}
