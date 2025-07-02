package com.tourify.tourify.controller;

import com.tourify.tourify.dto.StopDTO;
import com.tourify.tourify.dto.TourCreationRequest;
import com.tourify.tourify.dto.TourResponseDTO;
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
                for (StopDTO stopDTO : req.getRoute().getStops()) {
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

} 