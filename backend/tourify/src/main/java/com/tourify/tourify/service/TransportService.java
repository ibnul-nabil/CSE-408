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

@Service
public class TransportService {
    
    @Autowired
    private TransportRepository transportRepository;
    
    @Autowired
    private TransportStopRepository transportStopRepository;
    
    // Get all transport options
    public List<TransportResponse> getAllTransport() {
        try {
            List<Transport> transports = transportRepository.findAll();
            System.out.println("Found " + transports.size() + " transports");
            return transports.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getAllTransport service: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // Get transport by route (start and end points)
    public List<TransportResponse> getTransportByRoute(Long startPointId, Long endPointId) {
        List<Transport> transports = transportRepository.findByStartPointAndEndPoint(startPointId, endPointId);
        return transports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get transport by type
    public List<TransportResponse> getTransportByType(String type) {
        List<Transport> transports = transportRepository.findByType(type);
        return transports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get transport by class
    public List<TransportResponse> getTransportByClass(String transportClass) {
        List<Transport> transports = transportRepository.findByTransportClass(transportClass);
        return transports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get transport by type and class
    public List<TransportResponse> getTransportByTypeAndClass(String type, String transportClass) {
        List<Transport> transports = transportRepository.findByTypeAndTransportClass(type, transportClass);
        return transports.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get stops for a specific transport
    public List<TransportStopResponse> getTransportStops(Long transportId) {
        List<TransportStop> stops = transportStopRepository.findByTransportId(transportId);
        return stops.stream()
                .map(this::convertStopToResponse)
                .collect(Collectors.toList());
    }
    
    // Get stops for multiple transports
    public List<TransportStopResponse> getTransportStopsForMultiple(List<Long> transportIds) {
        List<TransportStop> stops = transportStopRepository.findByTransportIds(transportIds);
        return stops.stream()
                .map(this::convertStopToResponse)
                .collect(Collectors.toList());
    }
    
    // Get all transport stops
    public List<TransportStopResponse> getAllTransportStops() {
        List<TransportStop> stops = transportStopRepository.findAll();
        return stops.stream()
                .map(this::convertStopToResponse)
                .collect(Collectors.toList());
    }
    
    // Convert Transport entity to TransportResponse DTO
    private TransportResponse convertToResponse(Transport transport) {
        return new TransportResponse(
                transport.getId(),
                transport.getName(),
                transport.getType(),
                transport.getTransportClass(),
                transport.getDescription(),
                transport.getStartPoint() != null ? transport.getStartPoint().getId() : null,
                transport.getStartPoint() != null ? transport.getStartPoint().getName() : null,
                transport.getEndPoint() != null ? transport.getEndPoint().getId() : null,
                transport.getEndPoint() != null ? transport.getEndPoint().getName() : null,
                transport.getDepartStart(),
                transport.getDepartEnd()
        );
    }
    
    // Convert TransportStop entity to TransportStopResponse DTO
    private TransportStopResponse convertStopToResponse(TransportStop stop) {
        return new TransportStopResponse(
                stop.getTransport().getId(),
                stop.getStop().getId(),
                stop.getStop().getName(),
                stop.getPrice()
        );
    }
} 