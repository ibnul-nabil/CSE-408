package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tour_transport")
public class TourTransport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transport_id", nullable = false)
    private Transport transport;
    
    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;
    
    @Column(name = "passenger_count", nullable = false)
    private Integer passengerCount;
    
    @Column(name = "cost_per_person", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerPerson;
    
    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public TourTransport() {}
    
    public TourTransport(Tour tour, Transport transport, LocalDate travelDate, 
                        Integer passengerCount, BigDecimal costPerPerson, BigDecimal totalCost) {
        this.tour = tour;
        this.transport = transport;
        this.travelDate = travelDate;
        this.passengerCount = passengerCount;
        this.costPerPerson = costPerPerson;
        this.totalCost = totalCost;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Tour getTour() {
        return tour;
    }
    
    public void setTour(Tour tour) {
        this.tour = tour;
    }
    
    public Transport getTransport() {
        return transport;
    }
    
    public void setTransport(Transport transport) {
        this.transport = transport;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 