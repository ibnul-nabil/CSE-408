package com.tourify.tourify.controller;

import com.tourify.tourify.dto.StopDTO;
import com.tourify.tourify.dto.TourCreationRequest;
import com.tourify.tourify.dto.TourResponseDTO;
import com.tourify.tourify.dto.TourAccommodationRequest;
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
import com.tourify.tourify.dto.BlogSuggestionResponse;
import com.tourify.tourify.dto.SpecialEventResponse;

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
    @Autowired
    private TourAccommodationRepository tourAccommodationRepository;
    @Autowired
    private HotelRepository hotelRepository;
    @Autowired
    private SpecialEventRepository specialEventRepository;

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

            // 5. Create Tour Accommodations
            if (req.getAccommodations() != null && !req.getAccommodations().isEmpty()) {
                for (TourAccommodationRequest accommodationReq : req.getAccommodations()) {
                    // Get the hotel
                    Hotel hotel = hotelRepository.findById(accommodationReq.getHotelId())
                            .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + accommodationReq.getHotelId()));
                    
                    // Create tour accommodation with proper ID
                    TourAccommodation accommodation = new TourAccommodation(tour, hotel, accommodationReq.getCheckIn(), accommodationReq.getCheckOut(), accommodationReq.getTotalCost());
                    
                    tourAccommodationRepository.save(accommodation);
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

            // Update tour accommodations
            // First, delete existing accommodations
            List<TourAccommodation> existingAccommodations = tourAccommodationRepository.findByTourId(existingTour.getId());
            tourAccommodationRepository.deleteAll(existingAccommodations);

            // Create new accommodations
            if (req.getAccommodations() != null && !req.getAccommodations().isEmpty()) {
                for (TourAccommodationRequest accommodationReq : req.getAccommodations()) {
                    // Get the hotel
                    Hotel hotel = hotelRepository.findById(accommodationReq.getHotelId())
                            .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + accommodationReq.getHotelId()));
                    
                    // Create tour accommodation with proper ID
                    TourAccommodation accommodation = new TourAccommodation(existingTour, hotel, accommodationReq.getCheckIn(), accommodationReq.getCheckOut(), accommodationReq.getTotalCost());
                    
                    tourAccommodationRepository.save(accommodation);
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

            // Get accommodations information
            List<TourAccommodation> tourAccommodations = tourAccommodationRepository.findByTourId(tour.getId());
            if (tourAccommodations != null && !tourAccommodations.isEmpty()) {
                List<TourResponseDTO.AccommodationInfo> accommodations = new ArrayList<>();
                for (TourAccommodation accommodation : tourAccommodations) {
                    Hotel hotel = accommodation.getHotel();
                    TourResponseDTO.AccommodationInfo accommodationInfo = new TourResponseDTO.AccommodationInfo(
                            hotel.getId(),
                            hotel.getName(),
                            hotel.getLocation(),
                            hotel.getPricePerNight(),
                            accommodation.getCheckIn() != null ? accommodation.getCheckIn().toString() : null,
                            accommodation.getCheckOut() != null ? accommodation.getCheckOut().toString() : null,
                            accommodation.getTotalCost()
                    );
                    accommodations.add(accommodationInfo);
                }
                dto.setAccommodations(accommodations);
                System.out.println("🏨 Tour " + tour.getId() + " has " + accommodations.size() + " accommodations");
            } else {
                System.out.println("🏨 Tour " + tour.getId() + " has no accommodations");
            }

            System.out.println("✅ Returning tour DTO with " + places.size() + " places and " + (dto.getAccommodations() != null ? dto.getAccommodations().size() : 0) + " accommodations");
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
            List<List<Double>> coordinates = getCoordinatesFromPlaces(places);
            if (coordinates == null || coordinates.size() < 2) {
                return ResponseEntity.badRequest().body("Could not get coordinates for places");
            }

            // Add coordinates to places for optimization
            List<Map<String, Object>> placesWithCoords = new ArrayList<>();
            for (int i = 0; i < places.size(); i++) {
                Map<String, Object> placeWithCoords = new HashMap<>(places.get(i));
                placeWithCoords.put("coordinates", new double[]{coordinates.get(i).get(0), coordinates.get(i).get(1)});
                placesWithCoords.add(placeWithCoords);
            }

            // Use OpenRouteService for optimization
            Map<String, Object> optimizedResult = optimizeRouteWithORS(placesWithCoords);

            if (optimizedResult != null) {
                // Get the optimized route order
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> optimizedRoute = (List<Map<String, Object>>) optimizedResult.get("optimizedRoute");
                
                // Calculate distance for the optimized route using getRouteFromORS
                if (optimizedRoute != null && optimizedRoute.size() >= 2) {
                    List<List<Double>> optimizedCoordinates = new ArrayList<>();
                    for (Map<String, Object> place : optimizedRoute) {
                        @SuppressWarnings("unchecked")
                        double[] coords = (double[]) place.get("coordinates");
                        if (coords != null) {
                            optimizedCoordinates.add(List.of(coords[0], coords[1]));
                        }
                    }
                    
                    // Use getRouteFromORS to calculate the actual road distance for optimized route
                    Map<String, Object> routeResult = getRouteFromORS(optimizedCoordinates);
                    double optimizedDistance = 0.0;
                    if (routeResult != null && routeResult.containsKey("distance")) {
                        optimizedDistance = (Double) routeResult.get("distance");
                    } else {
                        // Fallback to haversine distance
                        optimizedDistance = calculateHaversineDistance(optimizedCoordinates);
                    }
                    
                    // Update the result with the calculated distance
                    optimizedResult.put("totalDistance", optimizedDistance);
                    System.out.println("✅ Optimized route distance calculated: " + optimizedDistance + " km");
                }
                
                return ResponseEntity.ok(optimizedResult);
            } else {
                // Fallback: return original order with distance calculation
                Map<String, Object> fallbackResult = new HashMap<>();
                fallbackResult.put("optimizedRoute", places);
                
                // Calculate distance for original route using getRouteFromORS
                Map<String, Object> routeResult = getRouteFromORS(coordinates);
                double originalDistance = 0.0;
                if (routeResult != null && routeResult.containsKey("distance")) {
                    originalDistance = (Double) routeResult.get("distance");
                } else {
                    // Fallback to haversine distance
                    originalDistance = calculateHaversineDistance(coordinates);
                }
                
                fallbackResult.put("totalDistance", originalDistance);
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

            // Get coordinates for all places using the existing method
            List<List<Double>> coordinates = getCoordinatesFromPlaces(places);
            if (coordinates == null || coordinates.size() < 2) {
                return ResponseEntity.badRequest().body("Could not get coordinates for places");
            }

            // Add coordinates to places for distance calculation
            List<Map<String, Object>> placesWithCoords = new ArrayList<>();
            for (int i = 0; i < places.size(); i++) {
                Map<String, Object> placeWithCoords = new HashMap<>(places.get(i));
                placeWithCoords.put("coordinates", new double[]{coordinates.get(i).get(0), coordinates.get(i).get(1)});
                placesWithCoords.add(placeWithCoords);
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



    @PostMapping("/get-place-coordinates")
    public ResponseEntity<?> getPlaceCoordinates(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📍 Getting coordinates for place");
            
            String placeName = (String) request.get("name");
            String placeType = (String) request.get("type");
            Object placeId = request.get("id");
            
            if (placeName == null || placeType == null || placeId == null) {
                return ResponseEntity.badRequest().body("Place name, type, and ID are required");
            }
            
            double[] coordinates = getCoordinatesForPlace(placeName, placeType, placeId);
            
            Map<String, Object> result = new HashMap<>();
            if (coordinates != null) {
                result.put("coordinates", coordinates); // [lng, lat]
                result.put("success", true);
                System.out.println("✅ Found coordinates for " + placeName + ": [lng: " + coordinates[0] + ", lat: " + coordinates[1] + "]");
            } else {
                result.put("success", false);
                result.put("message", "Coordinates not found in database");
                System.out.println("⚠️ No coordinates found for " + placeName);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting place coordinates: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to get coordinates: " + e.getMessage());
        }
    }

    @PostMapping("/fetch-route-enhanced")
    public ResponseEntity<?> fetchEnhancedRoute(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🛣️ Enhanced route fetching API called");
            
            // Check if we have coordinates directly or places that need coordinate lookup
            @SuppressWarnings("unchecked")
            List<List<Double>> coordinates = (List<List<Double>>) request.get("coordinates");
            
            if (coordinates == null || coordinates.size() < 2) {
                // Try to get coordinates from places if coordinates not provided directly
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> places = (List<Map<String, Object>>) request.get("places");
                
                if (places != null && places.size() >= 2) {
                    coordinates = getCoordinatesFromPlaces(places);
                    if (coordinates == null || coordinates.size() < 2) {
                        return ResponseEntity.badRequest().body("Could not get coordinates for places");
                    }
                } else {
                    return ResponseEntity.badRequest().body("Need at least 2 coordinates or places for route");
                }
            }

            // Try to get route from OpenRouteService
            Map<String, Object> routeResult = getRouteFromORS(coordinates);
            
            return ResponseEntity.ok(routeResult);
            
        } catch (Exception e) {
            System.out.println("❌ Error fetching enhanced route: " + e.getMessage());
            return ResponseEntity.status(500).body("Route fetching failed: " + e.getMessage());
        }
    }

    // Helper methods for route optimization and coordinate lookup
    
    private List<List<Double>> getCoordinatesFromPlaces(List<Map<String, Object>> places) {
        try {
            List<List<Double>> coordinates = new ArrayList<>();
            
            for (Map<String, Object> place : places) {
                String placeName = (String) place.get("name");
                String placeType = (String) place.get("type");
                Object placeId = place.get("id");
                
                double[] coords = getCoordinatesForPlace(placeName, placeType, placeId);
                if (coords != null) {
                    coordinates.add(List.of(coords[0], coords[1])); // [lng, lat]
                    System.out.println("📍 " + placeName + " coordinates: [lng: " + coords[0] + ", lat: " + coords[1] + "]");
                } else {
                    System.out.println("⚠️ Could not get coordinates for: " + placeName);
                    return null; // Return null if any place is missing coordinates
                }
            }
            
            return coordinates;
            
        } catch (Exception e) {
            System.out.println("❌ Error getting coordinates from places: " + e.getMessage());
            return null;
        }
    }
    
    private double[] getCoordinatesForPlace(String placeName, String placeType, Object placeId) {
        try {
            // Get coordinates from our database
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
                                System.out.println("📍 Found coordinates in database for destination " + placeName + ": [lng: " + coordinates[0] + ", lat: " + coordinates[1] + "]");
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
                                System.out.println("📍 Found coordinates in database for subplace " + placeName + ": [lng: " + coordinates[0] + ", lat: " + coordinates[1] + "]");
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Error getting subplace coordinates from database: " + e.getMessage());
                }
            }
            
            // No geocoding fallback - only use database coordinates
            return coordinates;
            
        } catch (Exception e) {
            System.out.println("❌ Error getting coordinates for " + placeName + ": " + e.getMessage());
            return null;
        }
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
            vehicle.put("profile", "driving-car");
            vehicles.add(vehicle);

            requestBody.put("jobs", jobs);
            requestBody.put("vehicles", vehicles);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("Authorization", ORS_API_KEY);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            System.out.println(entity);

            System.out.println("🚀 Sending ORS optimization request with profile: driving-car");
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("optimize response " + response);

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

                    // Calculate distance for the optimized route using getRouteFromORS
                    List<List<Double>> optimizedCoordinates = new ArrayList<>();
                    for (Map<String, Object> place : optimizedRoute) {
                        @SuppressWarnings("unchecked")
                        double[] coords = (double[]) place.get("coordinates");
                        if (coords != null) {
                            optimizedCoordinates.add(List.of(coords[0], coords[1]));
                        }
                    }
                    
                    // Use getRouteFromORS to calculate the actual road distance for optimized route
                    Map<String, Object> routeResult = getRouteFromORS(optimizedCoordinates);
                    double optimizedDistance = 0.0;
                    if (routeResult != null && routeResult.containsKey("distance")) {
                        optimizedDistance = (Double) routeResult.get("distance");
                    } else {
                        // Fallback to haversine distance
                        optimizedDistance = calculateHaversineDistance(optimizedCoordinates);
                    }

                    Map<String, Object> result = new HashMap<>();
                    result.put("optimizedRoute", optimizedRoute);
                    result.put("totalDistance", optimizedDistance);
                    result.put("method", "openrouteservice");

                    System.out.println("✅ Route optimized with ORS, distance: " + optimizedDistance + " km");

                    double totalDurationSeconds = route.get("duration").asDouble();
                    double totalDurationMinutes = Math.round(totalDurationSeconds / 60.0 * 100.0) / 100.0;
                    System.out.println("✅ Route optimized with ORS, duration: " + totalDurationMinutes + " minutes");

                    System.out.println("📍 Optimized visit order:");
                    for (Map<String, Object> place : optimizedRoute) {
                        System.out.println("   - " + place.get("name"));
                    }
                    return result;
                }
            }

        } catch (Exception e) {
            System.out.println("❌ ORS optimization failed: " + e.getMessage());
            // Print the full response body for debugging
            if (e.getMessage().contains("400 Bad Request")) {
                System.out.println("🔍 This might be due to:");
                System.out.println("   - Invalid API key");
                System.out.println("   - Rate limiting");
                System.out.println("   - Invalid coordinates format");
                System.out.println("   - Missing required parameters");
            }
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
        System.out.println(" in getRouteFromORS -------------");
        try {
            String url = ORS_BASE_URL + "/v2/directions/driving-car";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("coordinates", coordinates);
            // Remove format=geojson to get the default format that matches your response
            requestBody.put("instructions", false);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", ORS_API_KEY);
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println(response);
            System.out.println(response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                System.out.println("in the ifs");
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());

                // Parse the default ORS format (not GeoJSON)
                JsonNode routes = jsonResponse.get("routes");
                System.out.println("Routes: " + routes);

                if (routes != null && routes.size() > 0) {
                    JsonNode route = routes.get(0);
                    JsonNode summary = route.get("summary");

                    // Get distance from summary (already in meters)
                    double distanceMeters = summary.get("distance").asDouble();
                    double distanceKm = distanceMeters / 1000.0;

                    // Get duration in seconds
                    double durationSeconds = summary.get("duration").asDouble();

                    // Get encoded geometry
                    String encodedGeometry = route.get("geometry").asText();

                    // Decode the polyline geometry to get coordinates
                    List<List<Double>> routeCoordinates = decodePolyline(encodedGeometry);

                    Map<String, Object> result = new HashMap<>();
                    result.put("coordinates", routeCoordinates);
                    result.put("distance", Math.round(distanceKm * 100.0) / 100.0);
                    result.put("duration", Math.round(durationSeconds));
                    result.put("success", true);
                    result.put("method", "road_route");

                    System.out.println("✅ Got route from ORS, distance: " + distanceKm + " km, duration: " + durationSeconds + " seconds");
                    return result;
                }
            }

        } catch (Exception e) {
            System.out.println("❌ ORS route fetching failed: " + e.getMessage());
            e.printStackTrace();
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

    // Helper method to decode polyline geometry
    private List<List<Double>> decodePolyline(String encoded) {
        List<List<Double>> coordinates = new ArrayList<>();

        int index = 0;
        int len = encoded.length();
        int lat = 0;
        int lng = 0;

        while (index < len) {
            int b;
            int shift = 0;
            int result = 0;

            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;

            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            // Convert to decimal degrees and add to coordinates
            // Note: ORS returns [longitude, latitude] format
            coordinates.add(List.of((double) lng / 1e5, (double) lat / 1e5));
        }

        return coordinates;
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
                double lon = Double.parseDouble(parts[0].trim());
                double lat = Double.parseDouble(parts[1].trim());
                
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
            
            // Step 6: Convert to response DTOs to avoid circular references
            List<BlogSuggestionResponse> responseBlogs = uniqueBlogs.stream()
                    .map(this::convertToBlogSuggestionResponse)
                    .collect(Collectors.toList());
            
            // Log some details about found blogs for debugging
            if (!responseBlogs.isEmpty()) {
                System.out.println("📋 Sample blog titles found:");
                responseBlogs.stream().limit(3).forEach(blog -> {
                    System.out.println("   - " + (blog.getTitle() != null ? blog.getTitle() : "Untitled"));
                });
            }
            
            return ResponseEntity.ok(responseBlogs);
            
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
            
            // Convert to response DTOs to avoid circular references
            List<BlogSuggestionResponse> responseBlogs = uniqueBlogs.stream()
                    .map(this::convertToBlogSuggestionResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseBlogs);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting blog suggestions by name: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to get blog suggestions");
        }
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

    // Special Events Endpoints
    @GetMapping("/special-events/{destinationId}")
    public ResponseEntity<?> getSpecialEventsByDestination(@PathVariable Long destinationId) {
        try {
            System.out.println("🎉 Getting special events for destination ID: " + destinationId);
            
            List<SpecialEvent> events = specialEventRepository.findByDestinationId(destinationId);
            System.out.println("🎉 Found " + events.size() + " special events for destination " + destinationId);
            
            List<SpecialEventResponse> responseEvents = events.stream()
                    .map(this::convertToSpecialEventResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseEvents);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting special events: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to get special events");
        }
    }

    @GetMapping("/special-events/suggestions/{destinationId}")
    public ResponseEntity<?> getSpecialEventSuggestions(
            @PathVariable Long destinationId,
            @RequestParam String tourStartDate,
            @RequestParam String tourEndDate) {
        try {
            LocalDate startDate = LocalDate.parse(tourStartDate);
            LocalDate endDate = LocalDate.parse(tourEndDate);
            
            // Calculate extended date range (10 days before and after tour dates)
            LocalDate extendedStartDate = startDate.minusDays(10);
            LocalDate extendedEndDate = endDate.plusDays(10);
            
            List<SpecialEvent> events = specialEventRepository.findEventsWithinDateRange(
                destinationId, extendedStartDate, extendedEndDate);
            
            List<SpecialEventResponse> responseEvents = events.stream()
                    .map(event -> {
                        SpecialEventResponse response = convertToSpecialEventResponse(event);
                        response.setSuggestionMessage(generateSuggestionMessage(event, startDate, endDate));
                        return response;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseEvents);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting special event suggestions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to get special event suggestions");
        }
    }

    // Helper method to convert SpecialEvent to SpecialEventResponse
    private SpecialEventResponse convertToSpecialEventResponse(SpecialEvent event) {
        SpecialEventResponse response = new SpecialEventResponse();
        response.setId(event.getId());
        response.setEventName(event.getEventName());
        response.setDestinationName(event.getDestination().getName());
        response.setStartDate(event.getStartDate());
        response.setEndDate(event.getEndDate());
        response.setDescription(event.getDescription());
        response.setDateRange(formatDateRange(event.getStartDate(), event.getEndDate()));
        return response;
    }

    // Helper method to format date range
    private String formatDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.equals(endDate)) {
            return startDate.toString();
        }
        return startDate.toString() + " to " + endDate.toString();
    }



    // Helper method to generate suggestion message
    private String generateSuggestionMessage(SpecialEvent event, LocalDate tourStartDate, LocalDate tourEndDate) {
        LocalDate eventStart = event.getStartDate();
        LocalDate eventEnd = event.getEndDate();
        
        // Check if event overlaps with tour dates
        boolean overlapsWithTour = !(eventEnd.isBefore(tourStartDate) || eventStart.isAfter(tourEndDate));
        
        if (overlapsWithTour) {
            return "Perfect timing! This event coincides with your tour dates.";
        }
        
        // Calculate days difference
        long daysBeforeTour = java.time.temporal.ChronoUnit.DAYS.between(eventEnd, tourStartDate);
        long daysAfterTour = java.time.temporal.ChronoUnit.DAYS.between(tourEndDate, eventStart);
        
        if (daysBeforeTour >= 0 && daysBeforeTour <= 10) {
            return "Consider extending your tour by " + daysBeforeTour + " days to catch this event!";
        } else if (daysAfterTour >= 0 && daysAfterTour <= 10) {
            return "Consider extending your tour by " + daysAfterTour + " days to catch this event!";
        } else if (daysBeforeTour < 0 && Math.abs(daysBeforeTour) <= 10) {
            return "This event ended " + Math.abs(daysBeforeTour) + " days before your tour starts.";
        } else if (daysAfterTour < 0 && Math.abs(daysAfterTour) <= 10) {
            return "This event starts " + Math.abs(daysAfterTour) + " days after your tour ends.";
        }
        
        return "This event is within 10 days of your tour dates.";
    }
}