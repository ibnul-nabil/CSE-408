package com.tourify.tourify.service;

import com.tourify.tourify.dto.TransportResponse;
import com.tourify.tourify.dto.TransportStopResponse;
import com.tourify.tourify.entity.Transport;
import com.tourify.tourify.entity.TransportStop;
import com.tourify.tourify.repository.TransportRepository;
import com.tourify.tourify.repository.TransportStopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class TransportService {
    
    @Autowired
    private TransportRepository transportRepository;
    
    @Autowired
    private TransportStopRepository transportStopRepository;
    
    /**
     * Get all transports with their stops
     */
    public List<TransportResponse> getAllTransports() {
        try {
            System.out.println("🔍 TransportService: Starting to fetch all transports");
            List<Transport> transports = transportRepository.findAllWithStops();
            System.out.println("🔍 TransportService: Found " + transports.size() + " transports from repository");
            
            // Fetch stops separately for each transport to avoid POINT column issues
            List<TransportResponse> responses = new ArrayList<>();
            for (Transport transport : transports) {
                List<TransportStop> stops = transportStopRepository.findByTransportId(transport.getId());
                transport.setStops(stops);
                responses.add(convertToTransportResponse(transport));
            }
            
            System.out.println("✅ TransportService: Successfully converted to " + responses.size() + " responses");
            return responses;
        } catch (Exception e) {
            System.out.println("❌ TransportService: Failed to fetch transports - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch transports", e);
        }
    }
    
    /**
     * Get transports by type
     */
    public List<TransportResponse> getTransportsByType(String type) {
        try {
            List<Transport> transports = transportRepository.findByType(type);
            return transports.stream()
                    .map(this::convertToTransportResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch transports by type", e);
        }
    }
    
    /**
     * Get transports by class
     */
    public List<TransportResponse> getTransportsByClass(String transportClass) {
        try {
            List<Transport> transports = transportRepository.findByTransportClass(transportClass);
            return transports.stream()
                    .map(this::convertToTransportResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch transports by class", e);
        }
    }
    
    /**
     * Get transports by type and class
     */
    public List<TransportResponse> getTransportsByTypeAndClass(String type, String transportClass) {
        try {
            List<Transport> transports = transportRepository.findByTypeAndTransportClass(type, transportClass);
            return transports.stream()
                    .map(this::convertToTransportResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch transports by type and class", e);
        }
    }
    
    /**
     * Get transports by route (start to end)
     */
    public List<TransportResponse> getTransportsByRoute(Long startId, Long endId) {
        try {
            List<Transport> transports = transportRepository.findByRoute(startId, endId);
            return transports.stream()
                    .map(this::convertToTransportResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch transports by route", e);
        }
    }
    
    /**
     * Get transports by name search
     */
    public List<TransportResponse> searchTransportsByName(String name) {
        try {
            List<Transport> transports = transportRepository.findByNameContainingIgnoreCase(name);
            return transports.stream()
                    .map(this::convertToTransportResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to search transports by name", e);
        }
    }
    
    /**
     * Get transports that have stops at specific destinations
     */
    public List<TransportResponse> getTransportsByStops(List<Long> destinationIds) {
        try {
            // Use a simpler approach to avoid POINT column issues
            List<Transport> allTransports = transportRepository.findAll();
            List<TransportResponse> filteredTransports = new ArrayList<>();
            
            for (Transport transport : allTransports) {
                List<TransportStop> stops = transportStopRepository.findByTransportId(transport.getId());
                boolean hasMatchingStop = stops.stream()
                    .anyMatch(stop -> destinationIds.contains(stop.getStop().getId()));
                
                if (hasMatchingStop) {
                    transport.setStops(stops);
                    filteredTransports.add(convertToTransportResponse(transport));
                }
            }
            
            return filteredTransports;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch transports by stops", e);
        }
    }
    
    /**
     * Get all transport stops
     */
    public List<TransportStopResponse> getAllTransportStops() {
        try {
            List<TransportStop> stops = transportStopRepository.findAll();
            return stops.stream()
                    .map(this::convertToTransportStopResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch transport stops", e);
        }
    }
    
    /**
     * Get stops for specific transports
     */
    public List<TransportStopResponse> getStopsByTransportIds(List<Long> transportIds) {
        try {
            List<TransportStop> allStops = transportStopRepository.findAll();
            return allStops.stream()
                    .filter(stop -> transportIds.contains(stop.getTransport().getId()))
                    .map(this::convertToTransportStopResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch stops by transport IDs", e);
        }
    }
    
    /**
     * Convert Transport entity to TransportResponse DTO
     */
    private TransportResponse convertToTransportResponse(Transport transport) {
        List<TransportStopResponse> stops = null;
        if (transport.getStops() != null) {
            stops = transport.getStops().stream()
                    .map(this::convertToTransportStopResponse)
                    .collect(Collectors.toList());
        }
        
        return new TransportResponse(
                transport.getId(),
                transport.getName(),
                transport.getType(),
                transport.getTransportClass(),
                transport.getDescription(),
                transport.getStartPlace() != null ? transport.getStartPlace().getName() : null,
                transport.getEndPlace() != null ? transport.getEndPlace().getName() : null,
                transport.getStartPlace() != null ? transport.getStartPlace().getId() : null,
                transport.getEndPlace() != null ? transport.getEndPlace().getId() : null,
                stops
        );
    }
    
    /**
     * Convert TransportStop entity to TransportStopResponse DTO
     */
    private TransportStopResponse convertToTransportStopResponse(TransportStop stop) {
        return new TransportStopResponse(
                stop.getStop().getId(),
                stop.getStop().getName(),
                stop.getCumulativePrice()
        );
    }
} 