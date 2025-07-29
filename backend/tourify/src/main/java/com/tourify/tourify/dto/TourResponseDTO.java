package com.tourify.tourify.dto;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

// DTO for response
public class TourResponseDTO {
    private Long id;
    private String title;
    private String status;
    private String startDate;
    private String endDate;
    private String startingPoint;
    private BigDecimal estimatedCost;
    private ZonedDateTime createdAt;
    private List<PlaceInfo> places;
    private Integer totalDistance; // Distance in kilometers
    private List<AccommodationInfo> accommodations; // Hotel information
    
    public TourResponseDTO(Long id, String title, String status) {
        this.id = id;
        this.title = title;
        this.status = status;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public String getStartingPoint() { return startingPoint; }
    public void setStartingPoint(String startingPoint) { this.startingPoint = startingPoint; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public List<PlaceInfo> getPlaces() { return places; }
    public void setPlaces(List<PlaceInfo> places) { this.places = places; }
    public Integer getTotalDistance() { return totalDistance; }
    public void setTotalDistance(Integer totalDistance) { this.totalDistance = totalDistance; }
    public List<AccommodationInfo> getAccommodations() { return accommodations; }
    public void setAccommodations(List<AccommodationInfo> accommodations) { this.accommodations = accommodations; }
    
    // Inner class for place information
    public static class PlaceInfo {
        private String name;
        private String type;
        private Long destinationId;
        private Long parentDestinationId; // For sub-places, this is the parent destination ID
        private List<SubPlaceInfo> subplaces;
        
        public PlaceInfo(String name, String type, Long destinationId) {
            this.name = name;
            this.type = type;
            this.destinationId = destinationId;
        }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Long getDestinationId() { return destinationId; }
        public void setDestinationId(Long destinationId) { this.destinationId = destinationId; }
        public Long getParentDestinationId() { return parentDestinationId; }
        public void setParentDestinationId(Long parentDestinationId) { this.parentDestinationId = parentDestinationId; }
        public List<SubPlaceInfo> getSubplaces() { return subplaces; }
        public void setSubplaces(List<SubPlaceInfo> subplaces) { this.subplaces = subplaces; }
    }
    
    // Inner class for sub-place information
    public static class SubPlaceInfo {
        private String name;
        private String type;
        private Long subplaceId;
        
        public SubPlaceInfo(String name, String type, Long subplaceId) {
            this.name = name;
            this.type = type;
            this.subplaceId = subplaceId;
        }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Long getSubplaceId() { return subplaceId; }
        public void setSubplaceId(Long subplaceId) { this.subplaceId = subplaceId; }
    }
    
    // Inner class for accommodation information
    public static class AccommodationInfo {
        private Long hotelId;
        private String hotelName;
        private String hotelLocation;
        private BigDecimal hotelPrice;
        private String checkIn;
        private String checkOut;
        private BigDecimal totalCost;
        
        public AccommodationInfo(Long hotelId, String hotelName, String hotelLocation, BigDecimal hotelPrice, String checkIn, String checkOut, BigDecimal totalCost) {
            this.hotelId = hotelId;
            this.hotelName = hotelName;
            this.hotelLocation = hotelLocation;
            this.hotelPrice = hotelPrice;
            this.checkIn = checkIn;
            this.checkOut = checkOut;
            this.totalCost = totalCost;
        }
        
        public Long getHotelId() { return hotelId; }
        public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
        public String getHotelName() { return hotelName; }
        public void setHotelName(String hotelName) { this.hotelName = hotelName; }
        public String getHotelLocation() { return hotelLocation; }
        public void setHotelLocation(String hotelLocation) { this.hotelLocation = hotelLocation; }
        public BigDecimal getHotelPrice() { return hotelPrice; }
        public void setHotelPrice(BigDecimal hotelPrice) { this.hotelPrice = hotelPrice; }
        public String getCheckIn() { return checkIn; }
        public void setCheckIn(String checkIn) { this.checkIn = checkIn; }
        public String getCheckOut() { return checkOut; }
        public void setCheckOut(String checkOut) { this.checkOut = checkOut; }
        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    }
}