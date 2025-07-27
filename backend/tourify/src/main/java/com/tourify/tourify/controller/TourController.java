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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    @Autowired
    private BlogRepository blogRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // OpenRouteService API configuration
    private static final String ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEzYzA3MGE5OTEyZTQ5MGM4OGMxN2M4OWQ4ODhkOThmIiwiaCI6Im11cm11cjY0In0="; // Replace with your API key
    private static final String ORS_BASE_URL = "https://api.openrouteservice.org";

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
            
            // Set the total distance if provided
            if (req.getRoute() != null && req.getRoute().getTotalDistance() != null) {
                route.setDistanceKm(req.getRoute().getTotalDistance().intValue());
                System.out.println("✅ Setting tour distance: " + req.getRoute().getTotalDistance() + " km");
            }
            
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
                
                // Set the total distance if provided
                if (req.getRoute() != null && req.getRoute().getTotalDistance() != null) {
                    existingRoute.setDistanceKm(req.getRoute().getTotalDistance().intValue());
                    System.out.println("✅ Setting new route distance: " + req.getRoute().getTotalDistance() + " km");
                }
                
                tourRouteRepository.save(existingRoute);
            } else {
                // Update existing route
                existingRoute.setRouteSource(req.getRoute() != null && req.getRoute().getRouteSource() != null ? req.getRoute().getRouteSource() : "system");
                
                // Update the total distance if provided
                if (req.getRoute() != null && req.getRoute().getTotalDistance() != null) {
                    existingRoute.setDistanceKm(req.getRoute().getTotalDistance().intValue());
                    System.out.println("✅ Updating tour distance: " + req.getRoute().getTotalDistance() + " km");
                }
                
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

                        // Get route information including distance
                        TourRoute tourRoute = tourRouteRepository.findFirstByTour(tour);
                        if (tourRoute != null && tourRoute.getDistanceKm() != null) {
                            dto.setTotalDistance(tourRoute.getDistanceKm());
                            System.out.println("📏 Tour " + tour.getId() + " distance: " + tourRoute.getDistanceKm() + " km");
                        }

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

            // Get route information including distance
            TourRoute tourRoute = tourRouteRepository.findFirstByTour(tour);
            if (tourRoute != null && tourRoute.getDistanceKm() != null) {
                dto.setTotalDistance(tourRoute.getDistanceKm());
                System.out.println("📏 Tour " + tour.getId() + " distance: " + tourRoute.getDistanceKm() + " km");
            }

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

    // Route optimization endpoints
    @PostMapping("/optimize-route")
    public ResponseEntity<?> optimizeRoute(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🚀 Route optimization API called");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> places = (List<Map<String, Object>>) request.get("places");
            
            if (places == null || places.size() < 2) {
                return ResponseEntity.badRequest().body("Need at least 2 places to optimize route");
            }

            // Get coordinates for all places
            List<Map<String, Object>> placesWithCoords = new ArrayList<>();
            for (Map<String, Object> place : places) {
                String placeName = (String) place.get("name");
                String placeType = (String) place.get("type");
                Object placeId = place.get("id");
                
                double[] coordinates = getCoordinatesForPlace(placeName, placeType, placeId);
                if (coordinates != null) {
                    Map<String, Object> placeWithCoords = new HashMap<>(place);
                    placeWithCoords.put("coordinates", new double[]{coordinates[0], coordinates[1]}); // [lng, lat]
                    placesWithCoords.add(placeWithCoords);
                    System.out.println("📍 " + placeName + " coordinates: [" + coordinates[0] + ", " + coordinates[1] + "]");
                } else {
                    System.out.println("⚠️ Could not get coordinates for: " + placeName);
                    // Still add the place without coordinates for fallback
                    placesWithCoords.add(place);
                }
            }

            // Use OpenRouteService for optimization
            Map<String, Object> optimizedResult = optimizeRouteWithORS(placesWithCoords);
            
            if (optimizedResult != null) {
                return ResponseEntity.ok(optimizedResult);
            } else {
                // Fallback: return original order with distance calculation
                Map<String, Object> fallbackResult = new HashMap<>();
                fallbackResult.put("optimizedRoute", places);
                fallbackResult.put("totalDistance", calculateDistanceForRoute(placesWithCoords));
                fallbackResult.put("message", "Using fallback optimization");
                return ResponseEntity.ok(fallbackResult);
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error in route optimization: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Route optimization failed: " + e.getMessage());
        }
    }

    @PostMapping("/optimize-route-ors")
    public ResponseEntity<?> calculateRouteDistance(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📏 Route distance calculation API called");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> places = (List<Map<String, Object>>) request.get("places");
            
            if (places == null || places.size() < 2) {
                return ResponseEntity.badRequest().body("Need at least 2 places to calculate distance");
            }

            // Get coordinates for all places
            List<Map<String, Object>> placesWithCoords = new ArrayList<>();
            for (Map<String, Object> place : places) {
                String placeName = (String) place.get("name");
                String placeType = (String) place.get("type");
                Object placeId = place.get("id");
                
                double[] coordinates = getCoordinatesForPlace(placeName, placeType, placeId);
                if (coordinates != null) {
                    Map<String, Object> placeWithCoords = new HashMap<>(place);
                    placeWithCoords.put("coordinates", new double[]{coordinates[0], coordinates[1]});
                    placesWithCoords.add(placeWithCoords);
                }
            }

            double totalDistance = calculateDistanceForRoute(placesWithCoords);
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalDistance", totalDistance);
            result.put("unit", "km");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.out.println("❌ Error calculating route distance: " + e.getMessage());
            return ResponseEntity.status(500).body("Distance calculation failed: " + e.getMessage());
        }
    }

    @PostMapping("/geocode-simple")
    public ResponseEntity<?> geocodePlace(@RequestBody Map<String, String> request) {
        try {
            String placeName = request.get("placeName");
            if (placeName == null || placeName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Place name is required");
            }

            double[] coordinates = geocodeWithNominatim(placeName);
            
            Map<String, Object> result = new HashMap<>();
            if (coordinates != null) {
                result.put("coordinates", coordinates); // [lng, lat]
                result.put("success", true);
            } else {
                // Fallback to Dhaka coordinates
                result.put("coordinates", new double[]{90.4125, 23.8103});
                result.put("success", false);
                result.put("message", "Geocoding failed, using default coordinates");
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.out.println("❌ Error in geocoding: " + e.getMessage());
            return ResponseEntity.status(500).body("Geocoding failed: " + e.getMessage());
        }
    }

    @PostMapping("/fetch-route-enhanced")
    public ResponseEntity<?> fetchEnhancedRoute(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🛣️ Enhanced route fetching API called");
            
            @SuppressWarnings("unchecked")
            List<List<Double>> coordinates = (List<List<Double>>) request.get("coordinates");
            
            if (coordinates == null || coordinates.size() < 2) {
                return ResponseEntity.badRequest().body("Need at least 2 coordinates for route");
            }

            // Try to get route from OpenRouteService
            Map<String, Object> routeResult = getRouteFromORS(coordinates);
            
            return ResponseEntity.ok(routeResult);
            
        } catch (Exception e) {
            System.out.println("❌ Error fetching enhanced route: " + e.getMessage());
            return ResponseEntity.status(500).body("Route fetching failed: " + e.getMessage());
        }
    }

    // Helper methods for route optimization and geocoding
    
    private double[] getCoordinatesForPlace(String placeName, String placeType, Object placeId) {
        try {
            // First try to get coordinates from our database if we have them stored
            double[] coordinates = null;
            
            if ("Destination".equals(placeType) && placeId != null) {
                try {
                    Long destinationId = Long.valueOf(placeId.toString());
                    Optional<Destination> destination = destinationRepository.findById(destinationId);
                    if (destination.isPresent()) {
                        Destination dest = destination.get();
                        if (dest.getCoordinates() != null && !dest.getCoordinates().trim().isEmpty()) {
                            coordinates = parseCoordinatesString(dest.getCoordinates());
                            if (coordinates != null) {
                                System.out.println("📍 Found coordinates in database for destination " + placeName + ": [" + coordinates[0] + ", " + coordinates[1] + "]");
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Error getting destination coordinates from database: " + e.getMessage());
                }
            } else if ("SubPlace".equals(placeType) && placeId != null) {
                try {
                    Long subPlaceId = Long.valueOf(placeId.toString());
                    Optional<SubPlace> subPlace = subPlaceRepository.findById(subPlaceId);
                    if (subPlace.isPresent()) {
                        SubPlace sub = subPlace.get();
                        if (sub.getCoordinates() != null && !sub.getCoordinates().trim().isEmpty()) {
                            coordinates = parseCoordinatesString(sub.getCoordinates());
                            if (coordinates != null) {
                                System.out.println("📍 Found coordinates in database for subplace " + placeName + ": [" + coordinates[0] + ", " + coordinates[1] + "]");
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Error getting subplace coordinates from database: " + e.getMessage());
                }
            }
            
            // If database lookup failed, try geocoding with place name
//            if (coordinates == null) {
//                coordinates = geocodeWithNominatim(placeName);
//            }
//
//            if (coordinates == null) {
//                // Try with place name + "Bangladesh" for better results
//                coordinates = geocodeWithNominatim(placeName + ", Bangladesh");
//            }
            
            return coordinates;
            
        } catch (Exception e) {
            System.out.println("❌ Error getting coordinates for " + placeName + ": " + e.getMessage());
            return null;
        }
    }

    private double[] geocodeWithNominatim(String placeName) {
        try {
            String url = "https://nominatim.openstreetmap.org/search?q=" + 
                        java.net.URLEncoder.encode(placeName, "UTF-8") + 
                        "&format=json&limit=1&countrycodes=BD";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "ibnul.nabil@gmail.com");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                
                if (jsonResponse.isArray() && jsonResponse.size() > 0) {
                    JsonNode firstResult = jsonResponse.get(0);
                    double lat = firstResult.get("lat").asDouble();
                    double lon = firstResult.get("lon").asDouble();
                    
                    System.out.println("✅ Geocoded " + placeName + " to [" + lon + ", " + lat + "]");
                    return new double[]{lon, lat}; // [longitude, latitude]
                }
            }
            
        } catch (Exception e) {
            System.out.println("❌ Geocoding failed for " + placeName + ": " + e.getMessage());
        }
        
        return null;
    }

    private Map<String, Object> optimizeRouteWithORS(List<Map<String, Object>> places) {
        try {
            // Extract coordinates for ORS optimization
            List<List<Double>> coordinates = new ArrayList<>();
            for (Map<String, Object> place : places) {
                @SuppressWarnings("unchecked")
                double[] coords = (double[]) place.get("coordinates");
                if (coords != null) {
                    coordinates.add(List.of(coords[0], coords[1])); // [lng, lat]
                }
            }

            if (coordinates.size() < 2) {
                return null;
            }

            // Use ORS optimization API
            String url = ORS_BASE_URL + "/optimization";

            Map<String, Object> requestBody = new HashMap<>();

            // Create jobs (destinations to visit)
            List<Map<String, Object>> jobs = new ArrayList<>();
            for (int i = 1; i < coordinates.size(); i++) { // Skip first as starting point
                Map<String, Object> job = new HashMap<>();
                job.put("id", i);
                job.put("location", coordinates.get(i));
                jobs.add(job);
            }

            // Create vehicle (starting from first location)
            List<Map<String, Object>> vehicles = new ArrayList<>();
            Map<String, Object> vehicle = new HashMap<>();
            vehicle.put("id", 1);
            vehicle.put("start", coordinates.get(0));
            vehicle.put("end", coordinates.get(0)); // Return to start
            vehicles.add(vehicle);

            requestBody.put("jobs", jobs);
            requestBody.put("vehicles", vehicles);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", ORS_API_KEY);
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());

                // Parse the optimization result
                JsonNode routes = jsonResponse.get("routes");
                if (routes != null && routes.size() > 0) {
                    JsonNode route = routes.get(0);
                    JsonNode steps = route.get("steps");

                    // Reorder places according to optimization result
                    List<Map<String, Object>> optimizedRoute = new ArrayList<>();
                    optimizedRoute.add(places.get(0)); // Start location

                    if (steps != null) {
                        for (JsonNode step : steps) {
                            if (step.get("type").asText().equals("job")) {
                                int jobId = step.get("job").asInt();
                                optimizedRoute.add(places.get(jobId));
                            }
                        }
                    }

                    double totalDistance = route.get("distance").asDouble() / 1000.0; // Convert to km

                    Map<String, Object> result = new HashMap<>();
                    result.put("optimizedRoute", optimizedRoute);
                    result.put("totalDistance", Math.round(totalDistance * 100.0) / 100.0);
                    result.put("method", "openrouteservice");

                    System.out.println("✅ Route optimized with ORS, distance: " + totalDistance + " km");
                    return result;
                }
            }

        } catch (Exception e) {
            System.out.println("❌ ORS optimization failed: " + e.getMessage());
        }

        return null;
    }

    private double calculateDistanceForRoute(List<Map<String, Object>> places) {
        try {
            if (places.size() < 2) return 0.0;

            List<List<Double>> coordinates = new ArrayList<>();
            for (Map<String, Object> place : places) {
                @SuppressWarnings("unchecked")
                double[] coords = (double[]) place.get("coordinates");
                if (coords != null) {
                    coordinates.add(List.of(coords[0], coords[1]));
                }
            }

            if (coordinates.size() < 2) return 0.0;

            // Use ORS directions API for distance calculation
            Map<String, Object> routeResult = getRouteFromORS(coordinates);
            if (routeResult != null && routeResult.containsKey("distance")) {
                return (Double) routeResult.get("distance");
            }

            // Fallback to haversine distance
            return calculateHaversineDistance(coordinates);

        } catch (Exception e) {
            System.out.println("❌ Distance calculation failed: " + e.getMessage());
            return 0.0;
        }
    }

    private Map<String, Object> getRouteFromORS(List<List<Double>> coordinates) {
        try {
            String url = ORS_BASE_URL + "/v2/directions/driving-car";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("coordinates", coordinates);
            requestBody.put("format", "geojson");
            requestBody.put("instructions", false);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", ORS_API_KEY);
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode features = jsonResponse.get("features");

                if (features != null && features.size() > 0) {
                    JsonNode feature = features.get(0);
                    JsonNode properties = feature.get("properties");
                    JsonNode geometry = feature.get("geometry");

                    double distance = properties.get("segments").get(0).get("distance").asDouble() / 1000.0; // Convert to km

                    // Extract route coordinates
                    JsonNode coords = geometry.get("coordinates");
                    List<List<Double>> routeCoordinates = new ArrayList<>();
                    for (JsonNode coord : coords) {
                        routeCoordinates.add(List.of(coord.get(0).asDouble(), coord.get(1).asDouble()));
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("coordinates", routeCoordinates);
                    result.put("distance", Math.round(distance * 100.0) / 100.0);
                    result.put("success", true);
                    result.put("method", "road_route");

                    System.out.println("✅ Got route from ORS, distance: " + distance + " km");
                    return result;
                }
            }

        } catch (Exception e) {
            System.out.println("❌ ORS route fetching failed: " + e.getMessage());
        }

        // Fallback result
        Map<String, Object> fallbackResult = new HashMap<>();
        fallbackResult.put("coordinates", coordinates);
        fallbackResult.put("distance", calculateHaversineDistance(coordinates));
        fallbackResult.put("success", false);
        fallbackResult.put("method", "direct_line");
        fallbackResult.put("message", "Using direct lines as fallback");

        return fallbackResult;
    }

    private double calculateHaversineDistance(List<List<Double>> coordinates) {
        System.out.println("in haversine distance");
        double totalDistance = 0.0;
        
        for (int i = 0; i < coordinates.size() - 1; i++) {
            List<Double> point1 = coordinates.get(i);
            List<Double> point2 = coordinates.get(i + 1);
            
            totalDistance += haversineDistance(point1.get(1), point1.get(0), point2.get(1), point2.get(0));
        }
        
        return Math.round(totalDistance * 100.0) / 100.0;
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the Earth in kilometers
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in kilometers
    }

    // Helper method to parse coordinate string format like "(23.777176,90.399452)"
    private double[] parseCoordinatesString(String coordinatesStr) {
        try {
            if (coordinatesStr == null || coordinatesStr.trim().isEmpty()) {
                return null;
            }
            
            // Remove parentheses and whitespace
            String cleaned = coordinatesStr.trim().replaceAll("[()]", "");
            
            // Split by comma
            String[] parts = cleaned.split(",");
            if (parts.length == 2) {
                double lat = Double.parseDouble(parts[0].trim());
                double lon = Double.parseDouble(parts[1].trim());
                
                // Return in [longitude, latitude] format for consistency with geocoding
                return new double[]{lon, lat};
            }
            
            System.out.println("⚠️ Invalid coordinate format: " + coordinatesStr);
            return null;
            
        } catch (Exception e) {
            System.out.println("❌ Error parsing coordinates '" + coordinatesStr + "': " + e.getMessage());
            return null;
        }
    }

    // Blog suggestions endpoint
    @GetMapping("/blog-suggestions/{destinationId}")
    public ResponseEntity<?> getBlogSuggestions(@PathVariable Long destinationId) {
        try {
            System.out.println("📚 Getting blog suggestions for destination ID: " + destinationId);
            
            List<Blog> allBlogs = new ArrayList<>();
            
            // Step 1: Get destination name from destination ID
            Optional<Destination> destination = destinationRepository.findById(destinationId);
            if (destination.isPresent()) {
                String destinationName = destination.get().getName();
                System.out.println("📍 Found destination name: " + destinationName);
                
                // Step 2: Get blogs linked to this destination ID (regular destinations)
                List<Blog> regularDestinationBlogs = blogRepository.findPublishedBlogsByDestinationId(destinationId);
                allBlogs.addAll(regularDestinationBlogs);
                System.out.println("📖 Found " + regularDestinationBlogs.size() + " blogs from regular destinations");
                
                // Step 3: Get blogs from custom destinations table using the destination name
                List<Blog> customDestinationBlogs = blogRepository.findPublishedBlogsByCustomDestination(destinationName);
                allBlogs.addAll(customDestinationBlogs);
                System.out.println("📖 Found " + customDestinationBlogs.size() + " blogs from exact custom destination match");
                
                // Step 4: Get blogs from custom destinations table using partial name matching
                List<Blog> partialCustomDestinationBlogs = blogRepository.findPublishedBlogsByCustomDestinationContaining(destinationName);
                allBlogs.addAll(partialCustomDestinationBlogs);
                System.out.println("📖 Found " + partialCustomDestinationBlogs.size() + " blogs from partial custom destination match");
                
            } else {
                System.out.println("⚠️ Destination not found for ID: " + destinationId);
            }
            
            // Step 5: Remove duplicates and limit to top 5 most recent blogs
            List<Blog> uniqueBlogs = allBlogs.stream()
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());
            
            System.out.println("📖 Total unique blog suggestions found: " + uniqueBlogs.size());
            
            // Log some details about found blogs for debugging
            if (!uniqueBlogs.isEmpty()) {
                System.out.println("📋 Sample blog titles found:");
                uniqueBlogs.stream().limit(3).forEach(blog -> {
                    System.out.println("   - " + (blog.getTitle() != null ? blog.getTitle() : "Untitled"));
                });
            }
            
            return ResponseEntity.ok(uniqueBlogs);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting blog suggestions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to get blog suggestions");
        }
    }

    @GetMapping("/blog-suggestions/search/{destinationName}")
    public ResponseEntity<?> getBlogSuggestionsByName(@PathVariable String destinationName) {
        try {
            System.out.println("📚 Getting blog suggestions for destination name: " + destinationName);
            
            List<Blog> blogs = new ArrayList<>();
            
            // 1. Try to find destination by exact name in destinations table
            Optional<Destination> destination = destinationRepository.findByNameIgnoreCase(destinationName);
            if (destination.isPresent()) {
                System.out.println("📍 Found exact destination match: " + destination.get().getName());
                // Get blogs linked to this destination
                List<Blog> destinationBlogs = blogRepository.findPublishedBlogsByDestinationId(destination.get().getId());
                blogs.addAll(destinationBlogs);
                System.out.println("📖 Found " + destinationBlogs.size() + " blogs for exact destination match");
            }
            
            // 2. Search for exact matches in custom destinations table
            List<Blog> exactCustomDestinationBlogs = blogRepository.findPublishedBlogsByCustomDestination(destinationName);
            blogs.addAll(exactCustomDestinationBlogs);
            System.out.println("📖 Found " + exactCustomDestinationBlogs.size() + " blogs for exact custom destination match");
            
            // 3. Search for partial matches in custom destinations table (more flexible)
            List<Blog> partialCustomDestinationBlogs = blogRepository.findPublishedBlogsByCustomDestinationContaining(destinationName);
            blogs.addAll(partialCustomDestinationBlogs);
            System.out.println("📖 Found " + partialCustomDestinationBlogs.size() + " blogs for partial custom destination match");
            
            // Remove duplicates and limit to top 5
            List<Blog> uniqueBlogs = blogs.stream()
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());
            
            System.out.println("📖 Total unique blog suggestions found: " + uniqueBlogs.size() + " for " + destinationName);
            
            return ResponseEntity.ok(uniqueBlogs);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting blog suggestions by name: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to get blog suggestions");
        }
    }
}