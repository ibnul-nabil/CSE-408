package com.tourify.tourify.controller;

import com.tourify.tourify.entity.Blog;
import com.tourify.tourify.entity.User;
import com.tourify.tourify.entity.TourRoute;
import com.tourify.tourify.entity.RouteStop;
import com.tourify.tourify.entity.Destination;
import com.tourify.tourify.entity.SubPlace;
import com.tourify.tourify.repository.BlogRepository;
import com.tourify.tourify.repository.UserRepository;
import com.tourify.tourify.repository.TourRouteRepository;
import com.tourify.tourify.repository.RouteStopRepository;
import com.tourify.tourify.repository.DestinationRepository;
import com.tourify.tourify.repository.SubPlaceRepository;
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
    @Autowired
    private TourRouteRepository tourRouteRepository;
    @Autowired
    private RouteStopRepository routeStopRepository;
    @Autowired
    private DestinationRepository destinationRepository;
    @Autowired
    private SubPlaceRepository subPlaceRepository;

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
                    t.setStartDate(tour.getStartDate() != null ? tour.getStartDate().toString() : null);
                    t.setEndDate(tour.getEndDate() != null ? tour.getEndDate().toString() : null);
                    // Fetch destinations and subplaces
                    TourRoute route = tourRouteRepository.findFirstByTour(tour);
                    if (route != null) {
                        java.util.List<RouteStop> stops = routeStopRepository.findByRoute(route);
                        java.util.List<String> destNames = new java.util.ArrayList<>();
                        java.util.List<String> subplaceNames = new java.util.ArrayList<>();
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
            private String startDate;
            private String endDate;
            private java.util.List<String> destinations;
            private java.util.List<String> subplaces;
            // getters and setters
            public Long getId() { return id; }
            public void setId(Long id) { this.id = id; }
            public String getTitle() { return title; }
            public void setTitle(String title) { this.title = title; }
            public String getStatus() { return status; }
            public void setStatus(String status) { this.status = status; }
            public String getStartDate() { return startDate; }
            public void setStartDate(String startDate) { this.startDate = startDate; }
            public String getEndDate() { return endDate; }
            public void setEndDate(String endDate) { this.endDate = endDate; }
            public java.util.List<String> getDestinations() { return destinations; }
            public void setDestinations(java.util.List<String> destinations) { this.destinations = destinations; }
            public java.util.List<String> getSubplaces() { return subplaces; }
            public void setSubplaces(java.util.List<String> subplaces) { this.subplaces = subplaces; }
        }
    }
}
