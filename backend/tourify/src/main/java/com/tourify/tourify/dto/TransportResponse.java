package com.tourify.tourify.dto;

import java.math.BigDecimal;
import java.util.List;

public class TransportResponse {
    private Long id;
    private String name;
    private String type;
    private String transportClass;
    private String description;
    private String startPlaceName;
    private String endPlaceName;
    private Long startPlaceId;
    private Long endPlaceId;
    private List<TransportStopResponse> stops;
    
    // Constructors
    public TransportResponse() {}
    
    public TransportResponse(Long id, String name, String type, String transportClass, 
                           String description, String startPlaceName, String endPlaceName,
                           Long startPlaceId, Long endPlaceId, List<TransportStopResponse> stops) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.transportClass = transportClass;
        this.description = description;
        this.startPlaceName = startPlaceName;
        this.endPlaceName = endPlaceName;
        this.startPlaceId = startPlaceId;
        this.endPlaceId = endPlaceId;
        this.stops = stops;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTransportClass() {
        return transportClass;
    }
    
    public void setTransportClass(String transportClass) {
        this.transportClass = transportClass;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStartPlaceName() {
        return startPlaceName;
    }
    
    public void setStartPlaceName(String startPlaceName) {
        this.startPlaceName = startPlaceName;
    }
    
    public String getEndPlaceName() {
        return endPlaceName;
    }
    
    public void setEndPlaceName(String endPlaceName) {
        this.endPlaceName = endPlaceName;
    }
    
    public Long getStartPlaceId() {
        return startPlaceId;
    }
    
    public void setStartPlaceId(Long startPlaceId) {
        this.startPlaceId = startPlaceId;
    }
    
    public Long getEndPlaceId() {
        return endPlaceId;
    }
    
    public void setEndPlaceId(Long endPlaceId) {
        this.endPlaceId = endPlaceId;
    }
    
    public List<TransportStopResponse> getStops() {
        return stops;
    }
    
    public void setStops(List<TransportStopResponse> stops) {
        this.stops = stops;
    }
} 