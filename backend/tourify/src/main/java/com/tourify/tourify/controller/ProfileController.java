package com.tourify.tourify.controller;

import com.tourify.tourify.dto.BlogSummary;
import com.tourify.tourify.dto.ProfileResponse;

import com.tourify.tourify.dto.TourSummary;
import com.tourify.tourify.entity.*;
import com.tourify.tourify.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private TourRouteRepository tourRouteRepository;
    @Autowired
    private RouteStopRepository routeStopRepository;
    @Autowired
    private DestinationRepository destinationRepository;
    @Autowired
    private SubPlaceRepository subPlaceRepository;
    
    // Enhanced blog repositories
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

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long id, 
                                                    @RequestParam(required = false) Long currentUserId) {
        System.out.println("{-------------/id} api");
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            ProfileResponse dto = new ProfileResponse();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setProfileImage(user.getProfileImage());
            dto.setCoverPhoto(user.getCoverPhoto());
            
            // Add profile statistics
            dto.setTotalBlogs(blogRepository.countByUserId(id));
            dto.setPublishedBlogs(blogRepository.countByStatus("published"));
            dto.setDraftBlogs(blogRepository.countByStatus("draft"));
            
            // Engagement statistics
            Long totalLikes = user.getBlogs().stream()
                .mapToLong(blog -> blogLikeRepository.countByBlogId(blog.getId()))
                .sum();
            dto.setTotalLikes(totalLikes);
            
            Long totalComments = user.getBlogs().stream()
                .mapToLong(blog -> blogCommentRepository.countByBlogId(blog.getId()))
                .sum();
            dto.setTotalComments(totalComments);
            
            // Map blogs with enhanced data
            if (user.getBlogs() != null) {
                dto.setBlogSummaries(user.getBlogs().stream().map(blog -> 
                    createBlogSummary(blog, currentUserId)
                ).collect(Collectors.toList()));
            }
            
            // Map tours (existing logic remains the same)
            if (user.getTours() != null) {
                dto.setTours(user.getTours().stream().map(tour -> {
                    TourSummary t = new TourSummary();
                    t.setId(tour.getId());
                    t.setTitle(tour.getTitle());
                    t.setStatus(tour.getStatus().name());
                    t.setStartDate(tour.getStartDate() != null ? tour.getStartDate().toString() : null);
                    t.setEndDate(tour.getEndDate() != null ? tour.getEndDate().toString() : null);
                    
                    // Fetch destinations and subplaces
                    TourRoute route = tourRouteRepository.findFirstByTour(tour);
                    if (route != null) {
                        List<RouteStop> stops = routeStopRepository.findByRoute(route);
                        List<String> destNames = new ArrayList<>();
                        List<String> subplaceNames = new ArrayList<>();
                        for (RouteStop stop : stops) {
                            if ("Destination".equals(stop.getPlaceType())) {
                                Destination dest = destinationRepository.findById(stop.getPlaceId().longValue()).orElse(null);
                                if (dest != null) destNames.add(dest.getName());
                            } else if ("SubPlace".equals(stop.getPlaceType())) {
                                SubPlace sub = subPlaceRepository.findById(stop.getPlaceId().longValue()).orElse(null);
                                if (sub != null) subplaceNames.add(sub.getName());
                            }
                        }
                        t.setDestinations(destNames);
                        t.setSubplaces(subplaceNames);
                    }
                    return t;
                }).collect(Collectors.toList()));
            }
            
            // Set total tours count
            dto.setTotalTours((long) (user.getTours() != null ? user.getTours().size() : 0));
            
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/blogs")
    public ResponseEntity<List<BlogSummary>> getUserBlogs(@PathVariable Long id,
                                                         @RequestParam(required = false) Long currentUserId,
                                                         @RequestParam(defaultValue = "published") String status) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<Blog> blogs;
            
            // If requesting own profile, show all statuses, otherwise only published
            if (currentUserId != null && currentUserId.equals(id)) {
                if ("all".equals(status)) {
                    blogs = blogRepository.findByUserOrderByCreatedAtDesc(user);
                } else {
                    blogs = blogRepository.findByUserAndStatus(user, status);
                }
            } else {
                blogs = blogRepository.findByUserAndStatus(user, "published");
            }
            
            List<BlogSummary> blogSummaries = blogs.stream()
                .map(blog -> createBlogSummary(blog, currentUserId))
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(blogSummaries);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ProfileResponse> getProfileStats(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            ProfileResponse stats = new ProfileResponse();
            stats.setId(id);
            stats.setUsername(user.getUsername());
            
            // Blog statistics
            stats.setTotalBlogs(blogRepository.countByUserId(id));
            stats.setPublishedBlogs(blogRepository.countByStatus("published"));
            stats.setDraftBlogs(blogRepository.countByStatus("draft"));
            
            // Engagement statistics
            Long totalLikes = user.getBlogs().stream()
                .mapToLong(blog -> blogLikeRepository.countByBlogId(blog.getId()))
                .sum();
            stats.setTotalLikes(totalLikes);
            
            Long totalComments = user.getBlogs().stream()
                .mapToLong(blog -> blogCommentRepository.countByBlogId(blog.getId()))
                .sum();
            stats.setTotalComments(totalComments);
            
            // Tour statistics (existing)
            stats.setTotalTours((long) (user.getTours() != null ? user.getTours().size() : 0));
            
            return ResponseEntity.ok(stats);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private BlogSummary createBlogSummary(Blog blog, Long currentUserId) {
        BlogSummary summary = new BlogSummary();
        
        // Basic blog information
        summary.setId(blog.getId());
        summary.setTitle(blog.getTitle());
        summary.setContent(blog.getContent());
        summary.setThumbnailUrl(blog.getThumbnailUrl());
        summary.setStatus(blog.getStatus());
        summary.setLikes(blog.getLikes());
        summary.setCreatedAt(blog.getCreatedAt());
        summary.setUpdatedAt(blog.getUpdatedAt());
        
        // Author information
        summary.setAuthorUsername(blog.getUser().getUsername());
        summary.setAuthorProfileImage(blog.getUser().getProfileImage());
        
        // Destinations
        List<String> allDestinations = new ArrayList<>();
        List<String> customDestinations = new ArrayList<>();
        
        // Get predefined destinations
        List<BlogDestination> blogDestinations = blogDestinationRepository.findByBlog(blog);
        for (BlogDestination bd : blogDestinations) {
            allDestinations.add(bd.getDestination().getName());
        }
        
        // Get custom destinations
        List<BlogCustomDestination> blogCustomDestinations = blogCustomDestinationRepository.findByBlog(blog);
        for (BlogCustomDestination bcd : blogCustomDestinations) {
            allDestinations.add(bcd.getDestinationName());
            customDestinations.add(bcd.getDestinationName());
        }
        
        summary.setDestinations(allDestinations);
        summary.setCustomDestinations(customDestinations);
        
        // Media information
        List<BlogMedia> mediaList = blogMediaRepository.findByBlogOrderByMediaOrder(blog);
        summary.setMediaCount(mediaList.size());
        
        long imageCount = mediaList.stream().filter(media -> "image".equals(media.getMediaType())).count();
        long videoCount = mediaList.stream().filter(media -> "video".equals(media.getMediaType())).count();
        
        summary.setImageCount((int) imageCount);
        summary.setVideoCount((int) videoCount);
        
        // Set first media URL for thumbnail
        if (!mediaList.isEmpty()) {
            summary.setFirstMediaUrl(mediaList.get(0).getMediaUrl());
        }
        
        // Comments count
        Long commentsCount = blogCommentRepository.countByBlogId(blog.getId());
        summary.setCommentsCount(commentsCount.intValue());
        
        // Check if current user liked this blog
        if (currentUserId != null) {
            boolean userLiked = blogLikeRepository.existsByBlogIdAndUserId(blog.getId(), currentUserId);
            summary.setUserLiked(userLiked);
        } else {
            summary.setUserLiked(false);
        }
        
        return summary;
    }

    private void deleteImageFile(String imageUrl) {
        try {
            // Extract filename from URL (assuming URL format like "/images/filename.jpg")
            if (imageUrl.startsWith("/") || imageUrl.startsWith("images/")) {
                String filename = imageUrl;
                if (filename.startsWith("/")) {
                    filename = filename.substring(1);
                }
                
                // Create file path relative to the upload directory
                java.io.File fileToDelete = new java.io.File(filename);
                
                if (fileToDelete.exists()) {
                    boolean deleted = fileToDelete.delete();
                    if (deleted) {
                        System.out.println("Successfully deleted old image: " + filename);
                    } else {
                        System.err.println("Failed to delete old image: " + filename);
                    }
                } else {
                    System.out.println("Old image file not found: " + filename);
                }
            }
        } catch (Exception e) {
            System.err.println("Error deleting old image file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PutMapping("/{id}/profile-image")
    public ResponseEntity<?> updateProfileImage(@PathVariable Long id, @RequestBody String profileImageUrl) {
        // Remove any surrounding quotes from the JSON string
        profileImageUrl = profileImageUrl.replaceAll("^\"|\"$", "");
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Store old image URL for deletion
            String oldImageUrl = user.getProfileImage();
            
            // Update profile image
            user.setProfileImage(profileImageUrl);
            userRepository.save(user);
            
            // Delete old image file if it exists and is not a default image
            if (oldImageUrl != null && !oldImageUrl.trim().isEmpty() && 
                !oldImageUrl.contains("unsplash.com") && !oldImageUrl.contains("placeholder")) {
                deleteImageFile(oldImageUrl);
            }
            
            return ResponseEntity.ok().body("{\"message\": \"Profile image updated successfully\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/cover-photo")
    public ResponseEntity<?> updateCoverPhoto(@PathVariable Long id, @RequestBody String coverPhotoUrl) {
        // Remove any surrounding quotes from the JSON string
        coverPhotoUrl = coverPhotoUrl.replaceAll("^\"|\"$", "");
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Store old cover photo URL for deletion
            String oldCoverPhotoUrl = user.getCoverPhoto();
            
            // Update cover photo
            user.setCoverPhoto(coverPhotoUrl);
            userRepository.save(user);
            
            // Delete old cover photo file if it exists and is not a default image
            if (oldCoverPhotoUrl != null && !oldCoverPhotoUrl.trim().isEmpty() && 
                !oldCoverPhotoUrl.contains("unsplash.com") && !oldCoverPhotoUrl.contains("placeholder")) {
                deleteImageFile(oldCoverPhotoUrl);
            }
            
            return ResponseEntity.ok().body("{\"message\": \"Cover photo updated successfully\"}");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
