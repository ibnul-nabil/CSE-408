package com.tourify.tourify.dto;

import java.util.List;

public class RouteDTO {
    private String routeSource;
    private List<StopDTO> stops;
    private Double totalDistance;

    // Default constructor
    public RouteDTO() {
    }

    // Constructor with parameters
    public RouteDTO(String routeSource, List<StopDTO> stops, Double totalDistance) {
        this.routeSource = routeSource;
        this.stops = stops;
        this.totalDistance = totalDistance;
    }

    public String getRouteSource() {
        return routeSource;
    }

    public void setRouteSource(String routeSource) {
        this.routeSource = routeSource;
    }

    public List<StopDTO> getStops() {
        return stops;
    }

    public void setStops(List<StopDTO> stops) {
        this.stops = stops;
    }

    public Double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(Double totalDistance) {
        this.totalDistance = totalDistance;
    }

    @Override
    public String toString() {
        return "RouteDTO{" +
                "routeSource='" + routeSource + '\'' +
                ", stops=" + stops +
                ", totalDistance=" + totalDistance +
                '}';
    }
}
