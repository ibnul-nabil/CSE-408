package com.tourify.tourify.dto;

public class TourSummary {
    private Long id;
    private String title;
    private String status;
    private String startDate;
    private String endDate;
    private java.util.List<String> destinations;
    private java.util.List<String> subplaces;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public java.util.List<String> getDestinations() {
        return destinations;
    }

    public void setDestinations(java.util.List<String> destinations) {
        this.destinations = destinations;
    }

    public java.util.List<String> getSubplaces() {
        return subplaces;
    }

    public void setSubplaces(java.util.List<String> subplaces) {
        this.subplaces = subplaces;
    }
}
