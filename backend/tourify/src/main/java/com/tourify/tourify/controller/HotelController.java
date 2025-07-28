package com.tourify.tourify.controller;

import com.tourify.tourify.dto.HotelResponse;
import com.tourify.tourify.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = {"http://localhost:3000", "http://20.40.57.81", "http://20.40.57.81:80"}, allowCredentials = "true")
public class HotelController {
    
    @Autowired
    private HotelService hotelService;
    
    /**
     * Get all hotels
     */
    @GetMapping
    public ResponseEntity<List<HotelResponse>> getAllHotels() {
        try {
            List<HotelResponse> hotels = hotelService.getAllHotels();
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotel by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        try {
            HotelResponse hotel = hotelService.getHotelById(id);
            return ResponseEntity.ok(hotel);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by destination ID
     */
    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<HotelResponse>> getHotelsByDestination(@PathVariable Long destinationId) {
        try {
            List<HotelResponse> hotels = hotelService.getHotelsByDestination(destinationId);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by sub-place ID
     */
    @GetMapping("/subplace/{subPlaceId}")
    public ResponseEntity<List<HotelResponse>> getHotelsBySubPlace(@PathVariable Long subPlaceId) {
        try {
            List<HotelResponse> hotels = hotelService.getHotelsBySubPlace(subPlaceId);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by destination ID or sub-place ID
     */
    @GetMapping("/search")
    public ResponseEntity<List<HotelResponse>> getHotelsByDestinationOrSubPlace(
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) Long subPlaceId) {
        try {
            List<HotelResponse> hotels = hotelService.getHotelsByDestinationOrSubPlace(destinationId, subPlaceId);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by multiple destination IDs
     */
    @PostMapping("/destinations")
    public ResponseEntity<List<HotelResponse>> getHotelsByDestinations(@RequestBody List<Long> destinationIds) {
        try {
            List<HotelResponse> hotels = hotelService.getHotelsByDestinations(destinationIds);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by multiple sub-place IDs
     */
    @PostMapping("/subplaces")
    public ResponseEntity<List<HotelResponse>> getHotelsBySubPlaces(@RequestBody List<Long> subPlaceIds) {
        try {
            List<HotelResponse> hotels = hotelService.getHotelsBySubPlaces(subPlaceIds);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by destination IDs or sub-place IDs
     */
    @PostMapping("/search-multiple")
    public ResponseEntity<List<HotelResponse>> getHotelsByDestinationsOrSubPlaces(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> destinationIds = request.get("destinationIds");
            List<Long> subPlaceIds = request.get("subPlaceIds");
            List<HotelResponse> hotels = hotelService.getHotelsByDestinationsOrSubPlaces(destinationIds, subPlaceIds);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Search hotels by name
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<HotelResponse>> searchHotelsByName(@RequestParam String searchTerm) {
        try {
            List<HotelResponse> hotels = hotelService.searchHotelsByName(searchTerm);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get hotels by price range
     */
    @GetMapping("/search/price")
    public ResponseEntity<List<HotelResponse>> getHotelsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        try {
            List<HotelResponse> hotels = hotelService.getHotelsByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 