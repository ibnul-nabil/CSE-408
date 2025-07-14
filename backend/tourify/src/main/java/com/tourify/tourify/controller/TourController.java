package com.tourify.tourify.controller;

import com.tourify.tourify.dto.StopDTO;
import com.tourify.tourify.dto.TourCreationRequest;
import com.tourify.tourify.dto.TourResponseDTO;
import com.tourify.tourify.entity.*;
import com.tourify.tourify.repository.*;
import com.tourify.tourify.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

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
    @Autowired
    private AuthService authService;
    @Autowired
    private DestinationRepository destinationRepository;
    @Autowired
    private SubPlaceRepository subPlaceRepository;

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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTour(@PathVariable Long id, @RequestBody TourCreationRequest req, @RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("🔄 Update Tour API called for ID: " + id);
            
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ Authorization header missing or invalid");
                return ResponseEntity.status(401).body("Authorization header missing or invalid");
            }
            
            String token = authHeader.substring(7);
            System.out.println("🔑 Token extracted: " + token.substring(0, 8) + "...");
            
            // Validate token and get user
            User user = authService.validateToken(token);
            if (user == null) {
                System.out.println("❌ Invalid or expired token");
                return ResponseEntity.status(401).body("Invalid or expired token");
            }
            
            System.out.println("✅ User authenticated: " + user.getUsername() + " (ID: " + user.getId() + ")");
            
            // Get existing tour
            Tour existingTour = tourRepository.findById(id).orElse(null);
            if (existingTour == null) {
                System.out.println("❌ Tour not found with ID: " + id);
                return ResponseEntity.status(404).body("Tour not found");
            }
            
            // Check if the tour belongs to the authenticated user
            if (!existingTour.getUser().getId().equals(user.getId())) {
                System.out.println("❌ Tour " + id + " does not belong to user " + user.getId());
                return ResponseEntity.status(403).body("Access denied");
            }
            
            System.out.println("✅ Updating tour: " + existingTour.getTitle());
            
            // Update tour fields
            existingTour.setTitle(req.getTitle());
            if (req.getStartDate() != null) existingTour.setStartDate(LocalDate.parse(req.getStartDate()));
            if (req.getEndDate() != null) existingTour.setEndDate(LocalDate.parse(req.getEndDate()));
            if (req.getEstimatedCost() != null) existingTour.setEstimatedCost(req.getEstimatedCost());
            tourRepository.save(existingTour);
            
            // Get existing route
            TourRoute existingRoute = tourRouteRepository.findFirstByTour(existingTour);
            if (existingRoute == null) {
                // Create new route if it doesn't exist
                existingRoute = new TourRoute();
                existingRoute.setTour(existingTour);
                existingRoute.setRouteSource(req.getRoute() != null && req.getRoute().getRouteSource() != null ? req.getRoute().getRouteSource() : "system");
                tourRouteRepository.save(existingRoute);
            } else {
                // Update existing route
                existingRoute.setRouteSource(req.getRoute() != null && req.getRoute().getRouteSource() != null ? req.getRoute().getRouteSource() : "system");
                tourRouteRepository.save(existingRoute);
            }
            
            // Delete existing route stops
            List<RouteStop> existingStops = routeStopRepository.findByRoute_TourOrderByStopOrder(existingTour);
            routeStopRepository.deleteAll(existingStops);
            
            // Create new route stops
            if (req.getRoute() != null && req.getRoute().getStops() != null) {
                for (StopDTO stopDTO : req.getRoute().getStops()) {
                    RouteStop stop = new RouteStop();
                    stop.setRoute(existingRoute);
                    stop.setPlaceType(stopDTO.getPlaceType());
                    stop.setPlaceId(stopDTO.getPlaceId());
                    stop.setStopOrder(stopDTO.getStopOrder());
                    routeStopRepository.save(stop);
                }
            }
            
            System.out.println("✅ Tour updated successfully");
            
            // Return updated tour DTO
            TourResponseDTO responseDTO = new TourResponseDTO(existingTour.getId(), existingTour.getTitle(), existingTour.getStatus().name());
            responseDTO.setStartDate(existingTour.getStartDate() != null ? existingTour.getStartDate().toString() : null);
            responseDTO.setEndDate(existingTour.getEndDate() != null ? existingTour.getEndDate().toString() : null);
            responseDTO.setEstimatedCost(existingTour.getEstimatedCost());
            responseDTO.setCreatedAt(existingTour.getCreatedAt());
            
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.out.println("❌ Error in updateTour: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTour(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("🗑️ Delete Tour API called for ID: " + id);
            
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ Authorization header missing or invalid");
                return ResponseEntity.status(401).body("Authorization header missing or invalid");
            }
            
            String token = authHeader.substring(7);
            System.out.println("🔑 Token extracted: " + token.substring(0, 8) + "...");
            
            // Validate token and get user
            User user = authService.validateToken(token);
            if (user == null) {
                System.out.println("❌ Invalid or expired token");
                return ResponseEntity.status(401).body("Invalid or expired token");
            }
            
            System.out.println("✅ User authenticated: " + user.getUsername() + " (ID: " + user.getId() + ")");
            
            // Get existing tour
            Tour existingTour = tourRepository.findById(id).orElse(null);
            if (existingTour == null) {
                System.out.println("❌ Tour not found with ID: " + id);
                return ResponseEntity.status(404).body("Tour not found");
            }
            
            // Check if the tour belongs to the authenticated user
            if (!existingTour.getUser().getId().equals(user.getId())) {
                System.out.println("❌ Tour " + id + " does not belong to user " + user.getId());
                return ResponseEntity.status(403).body("Access denied");
            }
            
            // Check if tour is upcoming (only upcoming tours can be deleted)
            if (existingTour.getStartDate() != null) {
                LocalDate today = LocalDate.now();
                if (existingTour.getStartDate().isBefore(today) || existingTour.getStartDate().isEqual(today)) {
                    System.out.println("❌ Cannot delete tour that has started or is in the past");
                    return ResponseEntity.status(400).body("Cannot delete tours that have started or are in the past");
                }
            }
            
            System.out.println("✅ Deleting tour: " + existingTour.getTitle());
            
            // Delete related route stops first
            TourRoute tourRoute = tourRouteRepository.findFirstByTour(existingTour);
            if (tourRoute != null) {
                List<RouteStop> routeStops = routeStopRepository.findByRoute_TourOrderByStopOrder(existingTour);
                routeStopRepository.deleteAll(routeStops);
                tourRouteRepository.delete(tourRoute);
            }
            
            // Delete the tour
            tourRepository.delete(existingTour);
            
            System.out.println("✅ Tour deleted successfully");
            return ResponseEntity.ok("Tour deleted successfully");
            
        } catch (Exception e) {
            System.out.println("❌ Error in deleteTour: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-tours")
    public ResponseEntity<?> getMyTours(@RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("🔍 My Tours API called");
            
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ Authorization header missing or invalid");
                return ResponseEntity.status(401).body("Authorization header missing or invalid");
            }
            
            String token = authHeader.substring(7);
            System.out.println("🔑 Token extracted: " + token.substring(0, 8) + "...");
            
            // Validate token and get user
            User user = authService.validateToken(token);
            if (user == null) {
                System.out.println("❌ Invalid or expired token");
                return ResponseEntity.status(401).body("Invalid or expired token");
            }
            
            System.out.println("✅ User authenticated: " + user.getUsername() + " (ID: " + user.getId() + ")");
            
            // Get all tours for this user
            List<Tour> userTours = tourRepository.findByUserOrderByCreatedAtDesc(user);
            System.out.println("📋 Found " + userTours.size() + " tours for user " + user.getId());
            
            // Convert to DTOs with more detailed information
            List<TourResponseDTO> tourDTOs = userTours.stream()
                .map(tour -> {
                    TourResponseDTO dto = new TourResponseDTO(tour.getId(), tour.getTitle(), tour.getStatus().name());
                    dto.setStartDate(tour.getStartDate() != null ? tour.getStartDate().toString() : null);
                    dto.setEndDate(tour.getEndDate() != null ? tour.getEndDate().toString() : null);
                    dto.setEstimatedCost(tour.getEstimatedCost());
                    dto.setCreatedAt(tour.getCreatedAt());
                    
                    // Get route stops to show places
                    List<RouteStop> stops = routeStopRepository.findByRoute_TourOrderByStopOrder(tour);
                    
                    // Convert stops to places information with actual names
                    List<TourResponseDTO.PlaceInfo> places = new ArrayList<>();
                    for (RouteStop stop : stops) {
                        String placeName = "Unknown Place";
                        
                        try {
                            if ("Destination".equals(stop.getPlaceType())) {
                                // Fetch destination name
                                destinationRepository.findById(stop.getPlaceId().longValue())
                                    .ifPresent(destination -> {
                                        // This is a bit hacky but will work for now
                                        places.add(new TourResponseDTO.PlaceInfo(
                                            destination.getName(),
                                            stop.getPlaceType(),
                                            stop.getPlaceId().longValue()
                                        ));
                                    });
                                                } else if ("SubPlace".equals(stop.getPlaceType())) {
                        // Fetch sub-place name and parent destination
                        subPlaceRepository.findById(stop.getPlaceId().longValue())
                            .ifPresent(subPlace -> {
                                TourResponseDTO.PlaceInfo placeInfo = new TourResponseDTO.PlaceInfo(
                                    subPlace.getName(),
                                    stop.getPlaceType(),
                                    stop.getPlaceId().longValue()
                                );
                                // Set parent destination ID for sub-places
                                placeInfo.setParentDestinationId(subPlace.getDestination().getId());
                                places.add(placeInfo);
                            });
                            }
                        } catch (Exception e) {
                            // If there's an error fetching the place, create a fallback
                            TourResponseDTO.PlaceInfo placeInfo = new TourResponseDTO.PlaceInfo(
                                "Place " + stop.getPlaceId(),
                                stop.getPlaceType(),
                                stop.getPlaceId().longValue()
                            );
                            places.add(placeInfo);
                        }
                    }
                    dto.setPlaces(places);
                    
                    return dto;
                })
                .collect(Collectors.toList());
            
            System.out.println("✅ Returning " + tourDTOs.size() + " tour DTOs");
            return ResponseEntity.ok(tourDTOs);
        } catch (Exception e) {
            System.out.println("❌ Error in getMyTours: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTourById(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            System.out.println("🔍 Get Tour By ID API called for ID: " + id);
            
            // Extract token from Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ Authorization header missing or invalid");
                return ResponseEntity.status(401).body("Authorization header missing or invalid");
            }
            
            String token = authHeader.substring(7);
            System.out.println("🔑 Token extracted: " + token.substring(0, 8) + "...");
            
            // Validate token and get user
            User user = authService.validateToken(token);
            if (user == null) {
                System.out.println("❌ Invalid or expired token");
                return ResponseEntity.status(401).body("Invalid or expired token");
            }
            
            System.out.println("✅ User authenticated: " + user.getUsername() + " (ID: " + user.getId() + ")");
            
            // Get tour by ID
            Tour tour = tourRepository.findById(id).orElse(null);
            if (tour == null) {
                System.out.println("❌ Tour not found with ID: " + id);
                return ResponseEntity.status(404).body("Tour not found");
            }
            
            // Check if the tour belongs to the authenticated user
            if (!tour.getUser().getId().equals(user.getId())) {
                System.out.println("❌ Tour " + id + " does not belong to user " + user.getId());
                return ResponseEntity.status(403).body("Access denied");
            }
            
            System.out.println("✅ Tour found: " + tour.getTitle());
            
            // Convert to DTO with detailed information
            TourResponseDTO dto = new TourResponseDTO(tour.getId(), tour.getTitle(), tour.getStatus().name());
            dto.setStartDate(tour.getStartDate() != null ? tour.getStartDate().toString() : null);
            dto.setEndDate(tour.getEndDate() != null ? tour.getEndDate().toString() : null);
            dto.setEstimatedCost(tour.getEstimatedCost());
            dto.setCreatedAt(tour.getCreatedAt());
            
            // Get route stops to show places
            List<RouteStop> stops = routeStopRepository.findByRoute_TourOrderByStopOrder(tour);
            
            // Convert stops to places information with actual names
            List<TourResponseDTO.PlaceInfo> places = new ArrayList<>();
            for (RouteStop stop : stops) {
                try {
                    if ("Destination".equals(stop.getPlaceType())) {
                        // Fetch destination name
                        destinationRepository.findById(stop.getPlaceId().longValue())
                            .ifPresent(destination -> {
                                places.add(new TourResponseDTO.PlaceInfo(
                                    destination.getName(),
                                    stop.getPlaceType(),
                                    stop.getPlaceId().longValue()
                                ));
                            });
                    } else if ("SubPlace".equals(stop.getPlaceType())) {
                        // Fetch sub-place name and parent destination
                        subPlaceRepository.findById(stop.getPlaceId().longValue())
                            .ifPresent(subPlace -> {
                                TourResponseDTO.PlaceInfo placeInfo = new TourResponseDTO.PlaceInfo(
                                    subPlace.getName(),
                                    stop.getPlaceType(),
                                    stop.getPlaceId().longValue()
                                );
                                // Set parent destination ID for sub-places
                                placeInfo.setParentDestinationId(subPlace.getDestination().getId());
                                places.add(placeInfo);
                            });
                    }
                } catch (Exception e) {
                    // If there's an error fetching the place, create a fallback
                    TourResponseDTO.PlaceInfo placeInfo = new TourResponseDTO.PlaceInfo(
                        "Place " + stop.getPlaceId(),
                        stop.getPlaceType(),
                        stop.getPlaceId().longValue()
                    );
                    places.add(placeInfo);
                }
            }
            dto.setPlaces(places);
            
            System.out.println("✅ Returning tour DTO with " + places.size() + " places");
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.out.println("❌ Error in getTourById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Debug endpoint to check all tours
    @GetMapping("/debug/all-tours")
    public ResponseEntity<?> getAllTours() {
        try {
            List<Tour> allTours = tourRepository.findAll();
            System.out.println("📋 Total tours in database: " + allTours.size());
            
            for (Tour tour : allTours) {
                System.out.println("Tour ID: " + tour.getId() + ", Title: " + tour.getTitle() + 
                                 ", User ID: " + tour.getUser().getId() + ", Status: " + tour.getStatus());
            }
            
            return ResponseEntity.ok("Found " + allTours.size() + " tours total");
        } catch (Exception e) {
            System.out.println("❌ Error in getAllTours: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

} 