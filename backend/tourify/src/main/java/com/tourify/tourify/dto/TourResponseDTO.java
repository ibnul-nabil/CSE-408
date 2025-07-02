package com.tourify.tourify.dto;


// DTO for response
public class TourResponseDTO {
    private Long id;
    private String title;
    private String status;
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
}