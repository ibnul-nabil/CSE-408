package com.tourify.tourify.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TourTransportRequest {
    private Long tourId;
    private Long transportId;
    private LocalDate date;
    private BigDecimal cost;
    
    // Constructors
    public TourTransportRequest() {}
    
    public TourTransportRequest(Long tourId, Long transportId, LocalDate date, BigDecimal cost) {
        this.tourId = tourId;
        this.transportId = transportId;
        this.date = date;
        this.cost = cost;
    }
    
    // Getters and Setters
    public Long getTourId() {
        return tourId;
    }
    
    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }
    
    public Long getTransportId() {
        return transportId;
    }
    
    public void setTransportId(Long transportId) {
        this.transportId = transportId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public BigDecimal getCost() {
        return cost;
    }
    
    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
} 