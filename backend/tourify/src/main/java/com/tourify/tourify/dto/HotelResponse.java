package com.tourify.tourify.dto;

import java.math.BigDecimal;
import java.util.List;

public class HotelResponse {
    private Long id;
    private String name;
    private Long destinationId;
    private String destinationName;
    private Long subPlaceId;
    private String subPlaceName;
    private BigDecimal pricePerNight;
    private String location;
    private String coordinates;
    private String thumbnail;
    private String externalLink;
    private List<String> amenities;
    
    // Constructors
    public HotelResponse() {}
    
    public HotelResponse(Long id, String name, Long destinationId, String destinationName,
                        Long subPlaceId, String subPlaceName, BigDecimal pricePerNight,
                        String location, String coordinates, String thumbnail,
                        String externalLink, List<String> amenities) {
        this.id = id;
        this.name = name;
        this.destinationId = destinationId;
        this.destinationName = destinationName;
        this.subPlaceId = subPlaceId;
        this.subPlaceName = subPlaceName;
        this.pricePerNight = pricePerNight;
        this.location = location;
        this.coordinates = coordinates;
        this.thumbnail = thumbnail;
        this.externalLink = externalLink;
        this.amenities = amenities;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getDestinationId() {
        return destinationId;
    }
    
    public void setDestinationId(Long destinationId) {
        this.destinationId = destinationId;
    }
    
    public String getDestinationName() {
        return destinationName;
    }
    
    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }
    
    public Long getSubPlaceId() {
        return subPlaceId;
    }
    
    public void setSubPlaceId(Long subPlaceId) {
        this.subPlaceId = subPlaceId;
    }
    
    public String getSubPlaceName() {
        return subPlaceName;
    }
    
    public void setSubPlaceName(String subPlaceName) {
        this.subPlaceName = subPlaceName;
    }
    
    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }
    
    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getCoordinates() {
        return coordinates;
    }
    
    public void setCoordinates(String coordinates) {
        this.coordinates = coordinates;
    }
    
    public String getThumbnail() {
        return thumbnail;
    }
    
    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
    
    public String getExternalLink() {
        return externalLink;
    }
    
    public void setExternalLink(String externalLink) {
        this.externalLink = externalLink;
    }
    
    public List<String> getAmenities() {
        return amenities;
    }
    
    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }
    
    @Override
    public String toString() {
        return "HotelResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", destinationId=" + destinationId +
                ", destinationName='" + destinationName + '\'' +
                ", subPlaceId=" + subPlaceId +
                ", subPlaceName='" + subPlaceName + '\'' +
                ", pricePerNight=" + pricePerNight +
                ", location='" + location + '\'' +
                '}';
    }
} 