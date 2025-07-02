package com.tourify.tourify.controller;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.repository.BlogRepository;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new blog post
    @PostMapping
    public ResponseEntity<?> createBlog(@RequestBody Blog blog) {
        System.out.println(" ---------blog crate in blog controller");
        try {
            // Get the user ID from the blog object
            Long userId = blog.getUser().getId();
            
            // Find the user
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
            // Set the user and save the blog
            blog.setUser(user);
            Blog savedBlog = blogRepository.save(blog);
            return ResponseEntity.ok(savedBlog);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all blogs for a user
    @GetMapping("/user/{userId}")
    public List<Blog> getBlogsByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();
        return blogRepository.findByUser(user);
    }

    // Get a single blog by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBlogById(@PathVariable Long id) {
        System.out.println("--------{blog id api} slow detailed blog in blog controller ");
        Blog blog = blogRepository.findById(id).orElse(null);
        if (blog == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(blog);
    }
}