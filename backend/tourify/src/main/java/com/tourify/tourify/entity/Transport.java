package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "transport")
public class Transport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "type", nullable = false)
    private String type; // 'bus', 'train', 'flight'
    
    @Column(name = "class", nullable = false)
    private String transportClass; // 'economy', 'business'
    
    @Column(name = "description")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "start_place_id")
    private Destination startPlace;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "end_place_id")
    private Destination endPlace;
    
    @OneToMany(mappedBy = "transport", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TransportStop> stops;
    
    // Constructors
    public Transport() {}
    
    public Transport(String name, String type, String transportClass, String description, 
                    Destination startPlace, Destination endPlace) {
        this.name = name;
        this.type = type;
        this.transportClass = transportClass;
        this.description = description;
        this.startPlace = startPlace;
        this.endPlace = endPlace;
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
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTransportClass() {
        return transportClass;
    }
    
    public void setTransportClass(String transportClass) {
        this.transportClass = transportClass;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Destination getStartPlace() {
        return startPlace;
    }
    
    public void setStartPlace(Destination startPlace) {
        this.startPlace = startPlace;
    }
    
    public Destination getEndPlace() {
        return endPlace;
    }
    
    public void setEndPlace(Destination endPlace) {
        this.endPlace = endPlace;
    }
    
    public List<TransportStop> getStops() {
        return stops;
    }
    
    public void setStops(List<TransportStop> stops) {
        this.stops = stops;
    }
} 