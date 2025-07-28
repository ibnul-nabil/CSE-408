package com.tourify.tourify.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TourAccommodationRequest {
    private Long hotelId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalCost;
    
    // Constructors
    public TourAccommodationRequest() {}
    
    public TourAccommodationRequest(Long hotelId, LocalDate checkIn, LocalDate checkOut, BigDecimal totalCost) {
        this.hotelId = hotelId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.totalCost = totalCost;
    }
    
    // Getters and Setters
    public Long getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }
    
    public LocalDate getCheckIn() {
        return checkIn;
    }
    
    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }
    
    public LocalDate getCheckOut() {
        return checkOut;
    }
    
    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }
    
    public BigDecimal getTotalCost() {
        return totalCost;
    }
    
    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
    
    @Override
    public String toString() {
        return "TourAccommodationRequest{" +
                "hotelId=" + hotelId +
                ", checkIn=" + checkIn +
                ", checkOut=" + checkOut +
                ", totalCost=" + totalCost +
                '}';
    }
} 