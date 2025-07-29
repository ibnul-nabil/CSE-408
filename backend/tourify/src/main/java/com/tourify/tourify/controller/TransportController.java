package com.tourify.tourify.controller;

import com.tourify.tourify.dto.TransportResponse;
import com.tourify.tourify.dto.TransportStopResponse;
import com.tourify.tourify.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class TransportController {
    
    @Autowired
    private TransportService transportService;
    
    /**
     * Get all transports
     */
    @GetMapping
    public ResponseEntity<List<TransportResponse>> getAllTransports() {
        try {
            List<TransportResponse> transports = transportService.getAllTransports();
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get transports by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransportResponse>> getTransportsByType(@PathVariable String type) {
        try {
            List<TransportResponse> transports = transportService.getTransportsByType(type);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get transports by class
     */
    @GetMapping("/class/{transportClass}")
    public ResponseEntity<List<TransportResponse>> getTransportsByClass(@PathVariable String transportClass) {
        try {
            List<TransportResponse> transports = transportService.getTransportsByClass(transportClass);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get transports by type and class
     */
    @GetMapping("/type/{type}/class/{transportClass}")
    public ResponseEntity<List<TransportResponse>> getTransportsByTypeAndClass(
            @PathVariable String type, 
            @PathVariable String transportClass) {
        try {
            List<TransportResponse> transports = transportService.getTransportsByTypeAndClass(type, transportClass);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get transports by route
     */
    @GetMapping("/route")
    public ResponseEntity<List<TransportResponse>> getTransportsByRoute(
            @RequestParam Long startId, 
            @RequestParam Long endId) {
        try {
            List<TransportResponse> transports = transportService.getTransportsByRoute(startId, endId);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Search transports by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<TransportResponse>> searchTransportsByName(@RequestParam String name) {
        try {
            List<TransportResponse> transports = transportService.searchTransportsByName(name);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get transports by stops (destinations)
     */
    @PostMapping("/stops")
    public ResponseEntity<List<TransportResponse>> getTransportsByStops(@RequestBody List<Long> destinationIds) {
        try {
            List<TransportResponse> transports = transportService.getTransportsByStops(destinationIds);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get all transport stops
     */
    @GetMapping("/stops")
    public ResponseEntity<List<TransportStopResponse>> getAllTransportStops() {
        try {
            List<TransportStopResponse> stops = transportService.getAllTransportStops();
            return ResponseEntity.ok(stops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get stops for specific transports
     */
    @PostMapping("/stops/transports")
    public ResponseEntity<List<TransportStopResponse>> getStopsByTransportIds(@RequestBody List<Long> transportIds) {
        try {
            List<TransportStopResponse> stops = transportService.getStopsByTransportIds(transportIds);
            return ResponseEntity.ok(stops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 