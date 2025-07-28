package com.tourify.tourify.dto;

import java.math.BigDecimal;

public class TransportStopResponse {
    private Long transportId;
    private Long stopId;
    private String stopName;
    private BigDecimal price;
    
    // Constructors
    public TransportStopResponse() {}
    
    public TransportStopResponse(Long transportId, Long stopId, String stopName, BigDecimal price) {
        this.transportId = transportId;
        this.stopId = stopId;
        this.stopName = stopName;
        this.price = price;
    }
    
    // Getters and Setters
    public Long getTransportId() {
        return transportId;
    }
    
    public void setTransportId(Long transportId) {
        this.transportId = transportId;
    }
    
    public Long getStopId() {
        return stopId;
    }
    
    public void setStopId(Long stopId) {
        this.stopId = stopId;
    }
    
    public String getStopName() {
        return stopName;
    }
    
    public void setStopName(String stopName) {
        this.stopName = stopName;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
} 