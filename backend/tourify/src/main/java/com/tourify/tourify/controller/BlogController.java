package com.tourify.tourify.controller;

import com.tourify.tourify.dto.BlogCreateRequest;
import com.tourify.tourify.dto.CommentRequest;
import com.tourify.tourify.dto.CommentResponse;
import com.tourify.tourify.dto.MediaRequest;
import com.tourify.tourify.dto.BlogDetailResponse;
import com.tourify.tourify.dto.BlogSuggestionResponse;
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
import java.util.stream.Collectors;

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

    // Get recent blogs (last N days)
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentBlogs(@RequestParam(defaultValue = "5") int days) {
        try {
            // Calculate start date (N days ago)
            java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(days);
            
            List<Blog> recentBlogs = blogRepository.findRecentPublishedBlogs(startDate);
            
            // Convert to response DTOs to avoid circular references
            List<BlogSuggestionResponse> responseBlogs = recentBlogs.stream()
                    .map(this::convertToBlogSuggestionResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseBlogs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error loading recent blogs: " + e.getMessage()));
        }
    }

    // Get popular blogs (by likes)
    @GetMapping("/popular")
    public ResponseEntity<?> getPopularBlogs(@RequestParam(defaultValue = "6") int limit) {
        try {
            List<Blog> popularBlogs = blogRepository.findPublishedBlogsOrderByLikes();
            
            // Limit the results
            List<Blog> limitedBlogs = popularBlogs.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
            
            // Convert to response DTOs to avoid circular references
            List<BlogSuggestionResponse> responseBlogs = limitedBlogs.stream()
                    .map(this::convertToBlogSuggestionResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseBlogs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error loading popular blogs: " + e.getMessage()));
        }
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
            
            // Convert to response DTO to avoid circular references
            BlogDetailResponse response = convertToBlogDetailResponse(blog);
            
            return ResponseEntity.ok(response);
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
    public List<CommentResponse> getBlogComments(@PathVariable Long id) {
        List<BlogComment> comments = blogCommentRepository.findTopLevelCommentsByBlogId(id);
        return comments.stream()
                .map(comment -> {
                    CommentResponse response = convertToCommentResponse(comment);
                    // Fetch replies for this comment
                    List<BlogComment> replies = blogCommentRepository.findRepliesByParentCommentId(comment.getId());
                    List<CommentResponse> replyResponses = replies.stream()
                            .map(this::convertToCommentResponse)
                            .collect(Collectors.toList());
                    response.setReplies(replyResponses);
                    return response;
                })
                .collect(Collectors.toList());
    }

    // Get replies for a comment
    @GetMapping("/comments/{commentId}/replies")
    public List<CommentResponse> getCommentReplies(@PathVariable Long commentId) {
        List<BlogComment> replies = blogCommentRepository.findRepliesByParentCommentId(commentId);
        return replies.stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
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

            // Convert to response DTO to avoid circular references
            CommentResponse response = convertToCommentResponse(savedComment);
            return ResponseEntity.ok(response);
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

    // Helper method to convert BlogComment to CommentResponse
    private CommentResponse convertToCommentResponse(BlogComment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        response.setLikes(comment.getLikes());
        
        // Set user info (flattened to avoid circular references)
        if (comment.getUser() != null) {
            response.setUserId(comment.getUser().getId());
            response.setUsername(comment.getUser().getUsername());
            response.setUserProfileImage(comment.getUser().getProfileImage());
        }
        
        // Set parent comment info if this is a reply
        if (comment.getParentComment() != null) {
            response.setParentCommentId(comment.getParentComment().getId());
        }
        
        // Set user liked status (default to false, will be updated by frontend if needed)
        response.setUserLiked(false);
        
        return response;
    }

    // Helper method to convert Blog to BlogDetailResponse
    private BlogDetailResponse convertToBlogDetailResponse(Blog blog) {
        BlogDetailResponse response = new BlogDetailResponse();
        response.setId(blog.getId());
        response.setTitle(blog.getTitle());
        response.setContent(blog.getContent());
        response.setThumbnailUrl(blog.getThumbnailUrl());
        response.setLikes(blog.getLikes());
        response.setStatus(blog.getStatus());
        response.setCreatedAt(blog.getCreatedAt());
        response.setUpdatedAt(blog.getUpdatedAt());
        
        // Set author info (flattened to avoid circular references)
        if (blog.getUser() != null) {
            response.setAuthorUsername(blog.getUser().getUsername());
            response.setAuthorProfileImage(blog.getUser().getProfileImage());
        }
        
        // Set destinations (flattened)
        response.setDestinations(blog.getDestinations());
        response.setCustomDestinations(blog.getCustomDestinations());
        
        // Set counts
        response.setCommentsCount(blog.getCommentsCount());
        response.setMediaCount(blog.getMediaCount());
        response.setHasMedia(blog.getHasMedia());
        
        return response;
    }

    // Helper method to convert Blog to BlogSuggestionResponse
    private BlogSuggestionResponse convertToBlogSuggestionResponse(Blog blog) {
        BlogSuggestionResponse response = new BlogSuggestionResponse();
        response.setId(blog.getId());
        response.setTitle(blog.getTitle());
        response.setContent(blog.getContent());
        response.setThumbnailUrl(blog.getThumbnailUrl());
        response.setLikes(blog.getLikes());
        response.setStatus(blog.getStatus());
        response.setCreatedAt(blog.getCreatedAt());
        response.setUpdatedAt(blog.getUpdatedAt());
        
        // Set author info (flattened to avoid circular references)
        if (blog.getUser() != null) {
            response.setAuthorUsername(blog.getUser().getUsername());
            response.setAuthorProfileImage(blog.getUser().getProfileImage());
        }
        
        // Set destinations (flattened)
        response.setDestinations(blog.getDestinations());
        response.setCustomDestinations(blog.getCustomDestinations());
        
        // Set counts
        response.setCommentsCount(blog.getCommentsCount());
        response.setMediaCount(blog.getMediaCount());
        response.setHasMedia(blog.getHasMedia());
        
        return response;
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