package com.tourify.tourify.dto;

import java.math.BigDecimal;

public class TransportStopResponse {
    private Long destinationId;
    private String destinationName;
    private BigDecimal cumulativePrice;
    
    // Constructors
    public TransportStopResponse() {}
    
    public TransportStopResponse(Long destinationId, String destinationName, BigDecimal cumulativePrice) {
        this.destinationId = destinationId;
        this.destinationName = destinationName;
        this.cumulativePrice = cumulativePrice;
    }
    
    // Getters and Setters
    public Long getDestinationId() {
        return destinationId;
    }
    
    public void setDestinationId(Long destinationId) {
        this.destinationId = destinationId;
    }
    
    public String getDestinationName() {
        return destinationName;
    }
    
    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }
    
    public BigDecimal getCumulativePrice() {
        return cumulativePrice;
    }
    
    public void setCumulativePrice(BigDecimal cumulativePrice) {
        this.cumulativePrice = cumulativePrice;
    }
} 