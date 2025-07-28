package com.tourify.tourify.repository;

import com.tourify.tourify.entity.TourAccommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourAccommodationRepository extends JpaRepository<TourAccommodation, TourAccommodation.TourAccommodationId> {
    
    /**
     * Find all accommodations for a specific tour
     */
    List<TourAccommodation> findByTourId(Long tourId);
    
    /**
     * Find all accommodations for a specific hotel
     */
    List<TourAccommodation> findByHotelId(Long hotelId);
    
    /**
     * Find accommodation by tour ID and hotel ID
     */
    @Query("SELECT ta FROM TourAccommodation ta WHERE ta.tour.id = :tourId AND ta.hotel.id = :hotelId")
    TourAccommodation findByTourIdAndHotelId(@Param("tourId") Long tourId, @Param("hotelId") Long hotelId);
    
    /**
     * Delete all accommodations for a specific tour
     */
    void deleteByTourId(Long tourId);
    
    /**
     * Check if accommodation exists for tour and hotel
     */
    boolean existsByTourIdAndHotelId(Long tourId, Long hotelId);
} 