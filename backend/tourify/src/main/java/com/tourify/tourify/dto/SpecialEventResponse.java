package com.tourify.tourify.dto;

import java.time.LocalDate;

public class SpecialEventResponse {
    private Long id;
    private String eventName;
    private String destinationName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String dateRange;
    private String suggestionMessage;

    // Constructors
    public SpecialEventResponse() {}

    public SpecialEventResponse(Long id, String eventName, String destinationName, 
                              LocalDate startDate, LocalDate endDate, String description) {
        this.id = id;
        this.eventName = eventName;
        this.destinationName = destinationName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.dateRange = formatDateRange(startDate, endDate);
    }

    // Helper method to format date range
    private String formatDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.equals(endDate)) {
            return startDate.toString();
        }
        return startDate.toString() + " to " + endDate.toString();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDateRange() {
        return dateRange;
    }

    public void setDateRange(String dateRange) {
        this.dateRange = dateRange;
    }

    public String getSuggestionMessage() {
        return suggestionMessage;
    }

    public void setSuggestionMessage(String suggestionMessage) {
        this.suggestionMessage = suggestionMessage;
    }
} 