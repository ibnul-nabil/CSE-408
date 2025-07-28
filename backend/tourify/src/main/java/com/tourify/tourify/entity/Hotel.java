package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "hotels")
public class Hotel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_place_id")
    private SubPlace subPlace;
    
    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;
    
    @Column(name = "location", nullable = false)
    private String location;
    
    @Column(name = "coordinates", columnDefinition = "point")
    private String coordinates;
    
    @Column(name = "thumbnail")
    private String thumbnail;
    
    @Column(name = "external_link")
    private String externalLink;
    
    @Column(name = "amenities", columnDefinition = "text[]")
    private String[] amenities;
    
    // Constructors
    public Hotel() {}
    
    public Hotel(String name, Destination destination, SubPlace subPlace, 
                 BigDecimal pricePerNight, String location) {
        this.name = name;
        this.destination = destination;
        this.subPlace = subPlace;
        this.pricePerNight = pricePerNight;
        this.location = location;
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
    
    public Destination getDestination() {
        return destination;
    }
    
    public void setDestination(Destination destination) {
        this.destination = destination;
    }
    
    public SubPlace getSubPlace() {
        return subPlace;
    }
    
    public void setSubPlace(SubPlace subPlace) {
        this.subPlace = subPlace;
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
    
    public String[] getAmenities() {
        return amenities;
    }
    
    public void setAmenities(String[] amenities) {
        this.amenities = amenities;
    }
    
    @Override
    public String toString() {
        return "Hotel{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", destination=" + (destination != null ? destination.getName() : "null") +
                ", subPlace=" + (subPlace != null ? subPlace.getName() : "null") +
                ", pricePerNight=" + pricePerNight +
                ", location='" + location + '\'' +
                '}';
    }
} 