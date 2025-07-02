package com.tourify.tourify.controller;

import com.tourify.tourify.dto.BlogSummary;
import com.tourify.tourify.dto.ProfileResponse;
import com.tourify.tourify.dto.TourSummary;
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

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long id) {
        System.out.println("{-------------/id} api");
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
                dto.setBlogSummaries(user.getBlogs().stream().map(blog -> {
                    BlogSummary b = new BlogSummary();
                    b.setId(blog.getId());
                    b.setTitle(blog.getTitle());
                    b.setDestination(blog.getDestination());
                    return b;
                }).collect(Collectors.toList()));
            }
            // Map tours
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

}
