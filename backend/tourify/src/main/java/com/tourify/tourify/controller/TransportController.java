package com.tourify.tourify.controller;

import com.tourify.tourify.dto.TransportResponse;
import com.tourify.tourify.dto.TransportStopResponse;
import com.tourify.tourify.service.TransportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = {"http://localhost:3000", "http://20.40.57.81", "http://20.40.57.81:80"}, allowCredentials = "true")
public class TransportController {
    
    @Autowired
    private TransportService transportService;
    
    // Get all transport options
    @GetMapping
    public ResponseEntity<List<TransportResponse>> getAllTransport() {
        try {
            List<TransportResponse> transports = transportService.getAllTransport();
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            System.err.println("Error in getAllTransport: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get transport by route (start and end points)
    @PostMapping("/route")
    public ResponseEntity<List<TransportResponse>> getTransportByRoute(@RequestBody Map<String, Long> request) {
        try {
            Long startPointId = request.get("startPointId");
            Long endPointId = request.get("endPointId");
            List<TransportResponse> transports = transportService.getTransportByRoute(startPointId, endPointId);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get transport by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransportResponse>> getTransportByType(@PathVariable String type) {
        try {
            List<TransportResponse> transports = transportService.getTransportByType(type);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get transport by class
    @GetMapping("/class/{transportClass}")
    public ResponseEntity<List<TransportResponse>> getTransportByClass(@PathVariable String transportClass) {
        try {
            List<TransportResponse> transports = transportService.getTransportByClass(transportClass);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get transport by type and class
    @GetMapping("/type/{type}/class/{transportClass}")
    public ResponseEntity<List<TransportResponse>> getTransportByTypeAndClass(
            @PathVariable String type, @PathVariable String transportClass) {
        try {
            List<TransportResponse> transports = transportService.getTransportByTypeAndClass(type, transportClass);
            return ResponseEntity.ok(transports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get stops for a specific transport
    @GetMapping("/{transportId}/stops")
    public ResponseEntity<List<TransportStopResponse>> getTransportStops(@PathVariable Long transportId) {
        try {
            List<TransportStopResponse> stops = transportService.getTransportStops(transportId);
            return ResponseEntity.ok(stops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get stops for multiple transports
    @PostMapping("/stops")
    public ResponseEntity<List<TransportStopResponse>> getTransportStopsForMultiple(@RequestBody List<Long> transportIds) {
        try {
            List<TransportStopResponse> stops = transportService.getTransportStopsForMultiple(transportIds);
            return ResponseEntity.ok(stops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Get all transport stops
    @GetMapping("/stops")
    public ResponseEntity<List<TransportStopResponse>> getAllTransportStops() {
        try {
            List<TransportStopResponse> stops = transportService.getAllTransportStops();
            return ResponseEntity.ok(stops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 