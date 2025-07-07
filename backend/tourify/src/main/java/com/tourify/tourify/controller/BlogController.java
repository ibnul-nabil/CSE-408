package com.tourify.tourify.controller;

import com.tourify.tourify.dto.BlogCreateRequest;
import com.tourify.tourify.dto.CommentRequest;
import com.tourify.tourify.dto.MediaRequest;
import com.tourify.tourify.entity.*;
import com.tourify.tourify.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private BlogDestinationRepository blogDestinationRepository;

    @Autowired
    private BlogCustomDestinationRepository blogCustomDestinationRepository;

    @Autowired
    private BlogMediaRepository blogMediaRepository;

    @Autowired
    private BlogCommentRepository blogCommentRepository;

    @Autowired
    private BlogLikeRepository blogLikeRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    // Get all published blogs
    @GetMapping
    public List<Blog> getAllBlogs() {
        return blogRepository.findPublishedBlogsOrderByCreatedAtDesc();
    }

    // Get blogs by destination
    @GetMapping("/destination/{destinationId}")
    public List<Blog> getBlogsByDestination(@PathVariable Long destinationId) {
        return blogRepository.findPublishedBlogsByDestinationId(destinationId);
    }

    // Get blogs by custom destination name
    @GetMapping("/destination")
    public List<Blog> getBlogsByCustomDestination(@RequestParam String name) {
        return blogRepository.findPublishedBlogsByCustomDestination(name);
    }

    // Search blogs
    @GetMapping("/search")
    public List<Blog> searchBlogs(@RequestParam String q) {
        return blogRepository.searchPublishedBlogs(q);
    }

    // Create a new blog post
    @PostMapping
    @Transactional
    public ResponseEntity<?> createBlog(@RequestBody BlogCreateRequest request) {
        try {
            System.out.println("Received blog creation request: " + request);
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Title: " + request.getTitle());
            System.out.println("Content length: " + (request.getContent() != null ? request.getContent().length() : 0));
            System.out.println("Custom destinations: " + request.getCustomDestinations());
            System.out.println("Media count: " + (request.getMedia() != null ? request.getMedia().size() : 0));
            
            // Validate required fields
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                System.out.println("Error: Content is required");
                return ResponseEntity.badRequest().body(Map.of("message", "Content is required"));
            }
            if (request.getUserId() == null) {
                System.out.println("Error: User ID is required");
                return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
            }

            // Find the user
            System.out.println("Looking for user with ID: " + request.getUserId());
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));
            System.out.println("Found user: " + user.getUsername());

            // Create the blog
            System.out.println("Creating blog entity...");
            Blog blog = new Blog(user, request.getTitle(), request.getContent());
            blog.setThumbnailUrl(request.getThumbnailUrl());
            blog.setStatus(request.getStatus() != null ? request.getStatus() : "published");

            // Save the blog first to get the ID
            System.out.println("Saving blog to database...");
            Blog savedBlog = blogRepository.save(blog);
            System.out.println("Blog saved with ID: " + savedBlog.getId());

            // Add destinations (keeping original logic for destinationIds)
            if (request.getDestinationIds() != null && !request.getDestinationIds().isEmpty()) {
                System.out.println("Adding predefined destinations...");
                for (Long destinationId : request.getDestinationIds()) {
                    Optional<Destination> destination = destinationRepository.findById(destinationId);
                    if (destination.isPresent()) {
                        BlogDestination blogDestination = new BlogDestination(savedBlog, destination.get());
                        blogDestinationRepository.save(blogDestination);
                        System.out.println("Added destination: " + destination.get().getName());
                    } else {
                        System.out.println("Warning: Destination with ID " + destinationId + " not found");
                    }
                }
            }

            // Add custom destinations
            if (request.getCustomDestinations() != null && !request.getCustomDestinations().isEmpty()) {
                System.out.println("Adding custom destinations...");
                for (String customDestName : request.getCustomDestinations()) {
                    if (customDestName != null && !customDestName.trim().isEmpty()) {
                        BlogCustomDestination customDestination = new BlogCustomDestination(savedBlog, customDestName.trim());
                        blogCustomDestinationRepository.save(customDestination);
                        System.out.println("Added custom destination: " + customDestName.trim());
                    }
                }
            }

            // Add media
            if (request.getMedia() != null && !request.getMedia().isEmpty()) {
                System.out.println("Adding media files...");
                for (int i = 0; i < request.getMedia().size(); i++) {
                    MediaRequest mediaReq = request.getMedia().get(i);
                    System.out.println("Processing media " + (i + 1) + ": " + mediaReq.getMediaUrl());
                    
                    BlogMedia media = new BlogMedia(savedBlog, mediaReq.getMediaUrl(), 
                                                  mediaReq.getMediaType(), 
                                                  mediaReq.getMediaOrder() != null ? mediaReq.getMediaOrder() : i);
                    media.setCaption(mediaReq.getCaption());
                    media.setFileSize(mediaReq.getFileSize());
                    media.setFileName(mediaReq.getFileName());
                    media.setMimeType(mediaReq.getMimeType());
                    media.setWidth(mediaReq.getWidth());
                    media.setHeight(mediaReq.getHeight());
                    media.setDuration(mediaReq.getDuration());
                    media.setIsThumbnail(mediaReq.getIsThumbnail() != null ? mediaReq.getIsThumbnail() : false);
                    
                    blogMediaRepository.save(media);
                    System.out.println("Saved media: " + media.getFileName());
                }
            }

            System.out.println("Blog creation completed successfully!");
            return ResponseEntity.ok(Map.of(
                "message", "Blog created successfully",
                "blogId", savedBlog.getId(),
                "blog", savedBlog
            ));
        } catch (RuntimeException e) {
            System.err.println("RuntimeException in createBlog: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Exception in createBlog: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "An error occurred while creating the blog: " + e.getMessage()));
        }
    }

    // Get all blogs for a user
    @GetMapping("/user/{userId}")
    @Transactional
    public ResponseEntity<?> getBlogsByUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
            }
            
            List<Blog> blogs = blogRepository.findByUserOrderByCreatedAtDesc(user);
            
            // Create simplified response to avoid circular references
            List<Map<String, Object>> simplifiedBlogs = new ArrayList<>();
            
            for (Blog blog : blogs) {
                try {
                    // Initialize lazy collections to access data
                    blog.getBlogDestinations().size();
                    blog.getBlogCustomDestinations().size();
                    blog.getBlogMedia().size();
                    blog.getBlogLikes().size();
                    
                    Map<String, Object> simpleBlog = new HashMap<>();
                    simpleBlog.put("id", blog.getId());
                    simpleBlog.put("title", blog.getTitle());
                    simpleBlog.put("content", blog.getContent());
                    simpleBlog.put("thumbnailUrl", blog.getThumbnailUrl());
                    simpleBlog.put("likes", blog.getLikes());
                    simpleBlog.put("status", blog.getStatus());
                    simpleBlog.put("createdAt", blog.getCreatedAt());
                    simpleBlog.put("updatedAt", blog.getUpdatedAt());
                    
                    // Add destination info
                    simpleBlog.put("destinations", blog.getDestinations());
                    simpleBlog.put("customDestinations", blog.getCustomDestinations());
                    
                    // Add counts and metadata
                    simpleBlog.put("commentsCount", blog.getCommentsCount());
                    simpleBlog.put("mediaCount", blog.getMediaCount());
                    simpleBlog.put("hasMedia", blog.getHasMedia());
                    simpleBlog.put("authorUsername", blog.getAuthorUsername());
                    simpleBlog.put("authorProfileImage", blog.getAuthorProfileImage());
                    
                    simplifiedBlogs.add(simpleBlog);
                } catch (Exception e) {
                    // If lazy loading fails, continue with next blog
                    System.err.println("Error loading collections for blog " + blog.getId() + ": " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(simplifiedBlogs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error loading user blogs: " + e.getMessage()));
        }
    }

    // Get a single blog by ID with all related data
    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<?> getBlogById(@PathVariable Long id) {
        try {
            Blog blog = blogRepository.findById(id).orElse(null);
            if (blog == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Manually initialize lazy collections to ensure they're loaded
            blog.getBlogDestinations().size(); // Force loading
            blog.getBlogCustomDestinations().size(); // Force loading
            blog.getComments().size(); // Force loading
            blog.getBlogMedia().size(); // Force loading
            blog.getBlogLikes().size(); // Force loading
            
            return ResponseEntity.ok(blog);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error loading blog: " + e.getMessage()));
        }
    }

    // Get media for a blog
    @GetMapping("/{id}/media")
    public List<BlogMedia> getBlogMedia(@PathVariable Long id) {
        return blogMediaRepository.findByBlogIdOrderByMediaOrder(id);
    }

    // Get comments for a blog
    @GetMapping("/{id}/comments")
    public List<BlogComment> getBlogComments(@PathVariable Long id) {
        return blogCommentRepository.findTopLevelCommentsByBlogId(id);
    }

    // Get replies for a comment
    @GetMapping("/comments/{commentId}/replies")
    public List<BlogComment> getCommentReplies(@PathVariable Long commentId) {
        return blogCommentRepository.findRepliesByParentCommentId(commentId);
    }

    // Add a comment to a blog
    @PostMapping("/comments")
    @Transactional
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request) {
        try {
            // Validate required fields
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Comment content is required"));
            }
            if (request.getBlogId() == null || request.getUserId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Blog ID and User ID are required"));
            }

            // Find blog and user
            Blog blog = blogRepository.findById(request.getBlogId())
                .orElseThrow(() -> new RuntimeException("Blog not found"));
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Find parent comment if this is a reply
            BlogComment parentComment = null;
            if (request.getParentCommentId() != null) {
                parentComment = blogCommentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            }

            // Create and save comment
            BlogComment comment = new BlogComment(blog, user, request.getContent(), parentComment);
            BlogComment savedComment = blogCommentRepository.save(comment);

            return ResponseEntity.ok(savedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "An error occurred while adding the comment"));
        }
    }

    // Like a blog post
    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likeBlog(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user already liked this blog
            if (blogLikeRepository.existsByBlogAndUser(blog, user)) {
                return ResponseEntity.badRequest().body(Map.of("message", "You have already liked this blog"));
            }

            // Create and save like
            BlogLike blogLike = new BlogLike(blog, user);
            blogLikeRepository.save(blogLike);

            // Update blog likes count
            blog.setLikes(blog.getLikes() + 1);
            blogRepository.save(blog);

            return ResponseEntity.ok(Map.of("likes", blog.getLikes(), "userLiked", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while liking the blog"));
        }
    }

    // Unlike a blog post
    @DeleteMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> unlikeBlog(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has liked this blog
            Optional<BlogLike> existingLike = blogLikeRepository.findByBlogAndUser(blog, user);
            if (existingLike.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "You haven't liked this blog"));
            }

            // Delete the like
            blogLikeRepository.delete(existingLike.get());

            // Update blog likes count
            if (blog.getLikes() > 0) {
                blog.setLikes(blog.getLikes() - 1);
                blogRepository.save(blog);
            }

            return ResponseEntity.ok(Map.of("likes", blog.getLikes(), "userLiked", false));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while unliking the blog"));
        }
    }

    // Like a comment
    @PostMapping("/comments/{commentId}/like")
    @Transactional
    public ResponseEntity<?> likeComment(@PathVariable Long commentId, @RequestParam Long userId) {
        try {
            BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user already liked this comment
            if (commentLikeRepository.existsByCommentAndUser(comment, user)) {
                return ResponseEntity.badRequest().body(Map.of("message", "You have already liked this comment"));
            }

            // Create and save like
            CommentLike commentLike = new CommentLike(comment, user);
            commentLikeRepository.save(commentLike);

            // Update comment likes count
            comment.setLikes(comment.getLikes() + 1);
            blogCommentRepository.save(comment);

            return ResponseEntity.ok(Map.of("likes", comment.getLikes(), "userLiked", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while liking the comment"));
        }
    }

    // Unlike a comment
    @DeleteMapping("/comments/{commentId}/like")
    @Transactional
    public ResponseEntity<?> unlikeComment(@PathVariable Long commentId, @RequestParam Long userId) {
        try {
            BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has liked this comment
            Optional<CommentLike> existingLike = commentLikeRepository.findByCommentAndUser(comment, user);
            if (existingLike.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "You haven't liked this comment"));
            }

            // Delete the like
            commentLikeRepository.delete(existingLike.get());

            // Update comment likes count
            if (comment.getLikes() > 0) {
                comment.setLikes(comment.getLikes() - 1);
                blogCommentRepository.save(comment);
            }

            return ResponseEntity.ok(Map.of("likes", comment.getLikes(), "userLiked", false));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while unliking the comment"));
        }
    }

    // Check if user has liked a blog
    @GetMapping("/{id}/like/status")
    public ResponseEntity<?> getBlogLikeStatus(@PathVariable Long id, @RequestParam Long userId) {
        try {
            boolean userLiked = blogLikeRepository.existsByBlogIdAndUserId(id, userId);
            Long likesCount = blogLikeRepository.countByBlogId(id);
            
            return ResponseEntity.ok(Map.of(
                "userLiked", userLiked,
                "likes", likesCount
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while checking like status"));
        }
    }

    // Delete a blog (only by owner)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteBlog(@PathVariable Long id, @RequestParam Long userId) {
        try {
            Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

            // Check if the user is the owner
            if (!blog.getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("message", "You can only delete your own blogs"));
            }

            // Delete related data (cascade should handle this, but being explicit)
            blogDestinationRepository.deleteByBlog(blog);
            blogCustomDestinationRepository.deleteByBlog(blog);
            blogMediaRepository.deleteByBlog(blog);
            blogLikeRepository.deleteByBlog(blog);
            blogCommentRepository.deleteByBlog(blog);

            // Delete the blog
            blogRepository.delete(blog);

            return ResponseEntity.ok(Map.of("message", "Blog deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred while deleting the blog"));
        }
    }
}