package com.tourify.tourify.dto;

import java.util.List;
import com.tourify.tourify.dto.StopDTO;


// DTO for request
public class TourCreationRequest {
    private String title;
    private String startDate;
    private String endDate;
    private String startingPoint;
    private java.math.BigDecimal estimatedCost;
    private RouteDTO route;
    private Long userId;
    private List<TourAccommodationRequest> accommodations;
    private List<TourTransportRequest> transportation;

    // getters and setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getStartingPoint() {
        return startingPoint;
    }

    public void setStartingPoint(String startingPoint) {
        this.startingPoint = startingPoint;
    }

    public java.math.BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(java.math.BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public RouteDTO getRoute() {
        return route;
    }

    public void setRoute(RouteDTO route) {
        this.route = route;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<TourAccommodationRequest> getAccommodations() {
        return accommodations;
    }

    public void setAccommodations(List<TourAccommodationRequest> accommodations) {
        this.accommodations = accommodations;
    }

    public List<TourTransportRequest> getTransportation() {
        return transportation;
    }

    public void setTransportation(List<TourTransportRequest> transportation) {
        this.transportation = transportation;
    }

    public static class RouteDTO {
        private String routeSource;
        private List<StopDTO> stops;
        private Double totalDistance;
        
        public String getRouteSource() { return routeSource; }
        public void setRouteSource(String routeSource) { this.routeSource = routeSource; }
        public List<StopDTO> getStops() { return stops; }
        public void setStops(List<StopDTO> stops) { this.stops = stops; }
        public Double getTotalDistance() { return totalDistance; }
        public void setTotalDistance(Double totalDistance) { this.totalDistance = totalDistance; }
    }
}