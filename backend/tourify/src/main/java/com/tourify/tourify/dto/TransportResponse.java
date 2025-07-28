package com.tourify.tourify.dto;

import java.time.LocalTime;

public class TransportResponse {
    private Long id;
    private String name;
    private String type;
    private String transportClass;
    private String description;
    private Long startPointId;
    private String startPointName;
    private Long endPointId;
    private String endPointName;
    private LocalTime departStart;
    private LocalTime departEnd;
    
    // Constructors
    public TransportResponse() {}
    
    public TransportResponse(Long id, String name, String type, String transportClass, String description,
                           Long startPointId, String startPointName, Long endPointId, String endPointName,
                           LocalTime departStart, LocalTime departEnd) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.transportClass = transportClass;
        this.description = description;
        this.startPointId = startPointId;
        this.startPointName = startPointName;
        this.endPointId = endPointId;
        this.endPointName = endPointName;
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
    
    public Long getStartPointId() {
        return startPointId;
    }
    
    public void setStartPointId(Long startPointId) {
        this.startPointId = startPointId;
    }
    
    public String getStartPointName() {
        return startPointName;
    }
    
    public void setStartPointName(String startPointName) {
        this.startPointName = startPointName;
    }
    
    public Long getEndPointId() {
        return endPointId;
    }
    
    public void setEndPointId(Long endPointId) {
        this.endPointId = endPointId;
    }
    
    public String getEndPointName() {
        return endPointName;
    }
    
    public void setEndPointName(String endPointName) {
        this.endPointName = endPointName;
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
} 