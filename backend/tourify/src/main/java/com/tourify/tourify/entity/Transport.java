package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "transport")
public class Transport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "type")
    private String type; // 'bus', 'train', 'flight', 'boat'
    
    @Column(name = "class")
    private String transportClass; // 'business' or 'economy'
    
    @Column(name = "description")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "start_point")
    private Destination startPoint;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "end_point")
    private Destination endPoint;
    
    @Column(name = "depart_start")
    private LocalTime departStart;
    
    @Column(name = "depart_end")
    private LocalTime departEnd;
    
    // Constructors
    public Transport() {}
    
    public Transport(String name, String type, String transportClass, String description, 
                    Destination startPoint, Destination endPoint, LocalTime departStart, LocalTime departEnd) {
        this.name = name;
        this.type = type;
        this.transportClass = transportClass;
        this.description = description;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.departStart = departStart;
        this.departEnd = departEnd;
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
    
    public Destination getStartPoint() {
        return startPoint;
    }
    
    public void setStartPoint(Destination startPoint) {
        this.startPoint = startPoint;
    }
    
    public Destination getEndPoint() {
        return endPoint;
    }
    
    public void setEndPoint(Destination endPoint) {
        this.endPoint = endPoint;
    }
    
    public LocalTime getDepartStart() {
        return departStart;
    }
    
    public void setDepartStart(LocalTime departStart) {
        this.departStart = departStart;
    }
    
    public LocalTime getDepartEnd() {
        return departEnd;
    }
    
    public void setDepartEnd(LocalTime departEnd) {
        this.departEnd = departEnd;
    }
    
    @Override
    public String toString() {
        return "Transport{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", transportClass='" + transportClass + '\'' +
                ", description='" + description + '\'' +
                ", startPoint=" + (startPoint != null ? startPoint.getName() : "null") +
                ", endPoint=" + (endPoint != null ? endPoint.getName() : "null") +
                ", departStart=" + departStart +
                ", departEnd=" + departEnd +
                '}';
    }
} 