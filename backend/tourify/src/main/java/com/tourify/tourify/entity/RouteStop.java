package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "route_stops")
public class RouteStop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private TourRoute route;

    @Column(name = "place_type", nullable = false)
    private String placeType;

    @Column(name = "place_id", nullable = false)
    private Integer placeId;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TourRoute getRoute() { return route; }
    public void setRoute(TourRoute route) { this.route = route; }
    public String getPlaceType() { return placeType; }
    public void setPlaceType(String placeType) { this.placeType = placeType; }
    public Integer getPlaceId() { return placeId; }
    public void setPlaceId(Integer placeId) { this.placeId = placeId; }
    public Integer getStopOrder() { return stopOrder; }
    public void setStopOrder(Integer stopOrder) { this.stopOrder = stopOrder; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
} 