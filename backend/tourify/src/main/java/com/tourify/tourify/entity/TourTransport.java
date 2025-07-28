package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tour_transport")
public class TourTransport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id")
    private Tour tour;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transport_id")
    private Transport transport;
    
    @Column(name = "date")
    private LocalDate date;
    
    @Column(name = "cost")
    private BigDecimal cost;
    
    // Constructors
    public TourTransport() {}
    
    public TourTransport(Tour tour, Transport transport, LocalDate date, BigDecimal cost) {
        this.tour = tour;
        this.transport = transport;
        this.date = date;
        this.cost = cost;
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
    
    @Override
    public String toString() {
        return "TourTransport{" +
                "id=" + id +
                ", tour=" + (tour != null ? tour.getTitle() : "null") +
                ", transport=" + (transport != null ? transport.getName() : "null") +
                ", date=" + date +
                ", cost=" + cost +
                '}';
    }
} 