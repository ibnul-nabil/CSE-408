package com.tourify.tourify.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tour_accommodations")
public class TourAccommodation {
    
    @EmbeddedId
    private TourAccommodationId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tourId")
    @JoinColumn(name = "tour_id")
    private Tour tour;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("hotelId")
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;
    
    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;
    
    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;
    
    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    // Constructors
    public TourAccommodation() {}
    
    public TourAccommodation(Tour tour, Hotel hotel, LocalDate checkIn, LocalDate checkOut, BigDecimal totalCost) {
        this.id = new TourAccommodationId(tour.getId(), hotel.getId());
        this.tour = tour;
        this.hotel = hotel;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.totalCost = totalCost;
    }
    
    // Getters and Setters
    public TourAccommodationId getId() {
        return id;
    }
    
    public void setId(TourAccommodationId id) {
        this.id = id;
    }
    
    public Tour getTour() {
        return tour;
    }
    
    public void setTour(Tour tour) {
        this.tour = tour;
    }
    
    public Hotel getHotel() {
        return hotel;
    }
    
    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }
    
    public LocalDate getCheckIn() {
        return checkIn;
    }
    
    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }
    
    public LocalDate getCheckOut() {
        return checkOut;
    }
    
    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }
    
    public BigDecimal getTotalCost() {
        return totalCost;
    }
    
    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
    
    @Override
    public String toString() {
        return "TourAccommodation{" +
                "tourId=" + (id != null ? id.getTourId() : "null") +
                ", hotelId=" + (id != null ? id.getHotelId() : "null") +
                ", checkIn=" + checkIn +
                ", checkOut=" + checkOut +
                ", totalCost=" + totalCost +
                '}';
    }
    
    // Embedded ID class
    @Embeddable
    public static class TourAccommodationId implements java.io.Serializable {
        private Long tourId;
        private Long hotelId;
        
        public TourAccommodationId() {}
        
        public TourAccommodationId(Long tourId, Long hotelId) {
            this.tourId = tourId;
            this.hotelId = hotelId;
        }
        
        public Long getTourId() {
            return tourId;
        }
        
        public void setTourId(Long tourId) {
            this.tourId = tourId;
        }
        
        public Long getHotelId() {
            return hotelId;
        }
        
        public void setHotelId(Long hotelId) {
            this.hotelId = hotelId;
        }
        
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TourAccommodationId that = (TourAccommodationId) o;
            return tourId.equals(that.tourId) && hotelId.equals(that.hotelId);
        }
        
        @Override
        public int hashCode() {
            return java.util.Objects.hash(tourId, hotelId);
        }
    }
} 