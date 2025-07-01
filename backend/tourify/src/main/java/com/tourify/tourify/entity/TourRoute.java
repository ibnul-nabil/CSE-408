package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tour_routes")
public class TourRoute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "route_source", nullable = false)
    private String routeSource = "system";

    @Column(name = "estimated_travel_time")
    private String estimatedTravelTime;

    @Column(name = "distance_km")
    private Integer distanceKm;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tour getTour() { return tour; }
    public void setTour(Tour tour) { this.tour = tour; }
    public String getRouteSource() { return routeSource; }
    public void setRouteSource(String routeSource) { this.routeSource = routeSource; }
    public String getEstimatedTravelTime() { return estimatedTravelTime; }
    public void setEstimatedTravelTime(String estimatedTravelTime) { this.estimatedTravelTime = estimatedTravelTime; }
    public Integer getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Integer distanceKm) { this.distanceKm = distanceKm; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
} 