package com.tourify.tourify.dto;

import java.util.List;

public class RouteDTO {
    private String routeSource;
    private List<StopDTO> stops;

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
}
