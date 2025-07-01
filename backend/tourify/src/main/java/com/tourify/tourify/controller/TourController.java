package com.tourify.tourify.controller;

import com.tourify.tourify.entity.*;
import com.tourify.tourify.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
public class TourController {
    @Autowired
    private TourRepository tourRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TourRouteRepository tourRouteRepository;
    @Autowired
    private RouteStopRepository routeStopRepository;

    @PostMapping
    public ResponseEntity<?> createTour(@RequestBody TourCreationRequest req) {
        try {
            // 1. Get user
            Long userId = req.getUserId();
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // 2. Create Tour (NOT NULL: user, title, status)
            Tour tour = new Tour();
            tour.setUser(user);
            tour.setTitle(req.getTitle());
            tour.setStatus(Tour.TourStatus.Planned); // or Draft/Upcoming as needed
            if (req.getStartDate() != null) tour.setStartDate(LocalDate.parse(req.getStartDate()));
            if (req.getEndDate() != null) tour.setEndDate(LocalDate.parse(req.getEndDate()));
            if (req.getEstimatedCost() != null) tour.setEstimatedCost(req.getEstimatedCost());
            tourRepository.save(tour);

            // 3. Create TourRoute (NOT NULL: tour, routeSource)
            TourRoute route = new TourRoute();
            route.setTour(tour);
            route.setRouteSource(req.getRoute() != null && req.getRoute().getRouteSource() != null ? req.getRoute().getRouteSource() : "system");
            tourRouteRepository.save(route);

            // 4. Create RouteStops (NOT NULL: route, placeType, placeId, stopOrder)
            if (req.getRoute() != null && req.getRoute().getStops() != null) {
                for (TourCreationRequest.StopDTO stopDTO : req.getRoute().getStops()) {
                    RouteStop stop = new RouteStop();
                    stop.setRoute(route);
                    stop.setPlaceType(stopDTO.getPlaceType());
                    stop.setPlaceId(stopDTO.getPlaceId());
                    stop.setStopOrder(stopDTO.getStopOrder());
                    routeStopRepository.save(stop);
                }
            }

            // Return a DTO instead of the full entity
            TourResponseDTO responseDTO = new TourResponseDTO(tour.getId(), tour.getTitle(), tour.getStatus().name());
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTO for request
    public static class TourCreationRequest {
        private String title;
        private String startDate;
        private String endDate;
        private java.math.BigDecimal estimatedCost;
        private RouteDTO route;
        private Long userId;
        // getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public java.math.BigDecimal getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(java.math.BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
        public RouteDTO getRoute() { return route; }
        public void setRoute(RouteDTO route) { this.route = route; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public static class RouteDTO {
            private String routeSource;
            private List<StopDTO> stops;
            public String getRouteSource() { return routeSource; }
            public void setRouteSource(String routeSource) { this.routeSource = routeSource; }
            public List<StopDTO> getStops() { return stops; }
            public void setStops(List<StopDTO> stops) { this.stops = stops; }
        }
        public static class StopDTO {
            private String placeType;
            private Integer placeId;
            private Integer stopOrder;
            public String getPlaceType() { return placeType; }
            public void setPlaceType(String placeType) { this.placeType = placeType; }
            public Integer getPlaceId() { return placeId; }
            public void setPlaceId(Integer placeId) { this.placeId = placeId; }
            public Integer getStopOrder() { return stopOrder; }
            public void setStopOrder(Integer stopOrder) { this.stopOrder = stopOrder; }
        }
    }

    // DTO for response
    public static class TourResponseDTO {
        private Long id;
        private String title;
        private String status;
        public TourResponseDTO(Long id, String title, String status) {
            this.id = id;
            this.title = title;
            this.status = status;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
} 