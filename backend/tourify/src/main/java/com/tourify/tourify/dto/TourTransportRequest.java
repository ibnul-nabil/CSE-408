package com.tourify.tourify.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TourTransportRequest {
    private Long transportId;
    private LocalDate travelDate;
    private Integer passengerCount;
    private BigDecimal costPerPerson;
    private BigDecimal totalCost;
    
    // Constructors
    public TourTransportRequest() {}
    
    public TourTransportRequest(Long transportId, LocalDate travelDate, Integer passengerCount, 
                              BigDecimal costPerPerson, BigDecimal totalCost) {
        this.transportId = transportId;
        this.travelDate = travelDate;
        this.passengerCount = passengerCount;
        this.costPerPerson = costPerPerson;
        this.totalCost = totalCost;
    }
    
    // Getters and Setters
    public Long getTransportId() {
        return transportId;
    }
    
    public void setTransportId(Long transportId) {
        this.transportId = transportId;
    }
    
    public LocalDate getTravelDate() {
        return travelDate;
    }
    
    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }
    
    public Integer getPassengerCount() {
        return passengerCount;
    }
    
    public void setPassengerCount(Integer passengerCount) {
        this.passengerCount = passengerCount;
    }
    
    public BigDecimal getCostPerPerson() {
        return costPerPerson;
    }
    
    public void setCostPerPerson(BigDecimal costPerPerson) {
        this.costPerPerson = costPerPerson;
    }
    
    public BigDecimal getTotalCost() {
        return totalCost;
    }
    
    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
} 