package com.tourify.tourify.repository;

import com.tourify.tourify.entity.TourTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourTransportRepository extends JpaRepository<TourTransport, Long> {
    
    // Find all transport selections for a specific tour
    List<TourTransport> findByTourId(Long tourId);
    
    // Find transport selections by multiple tours
    List<TourTransport> findByTourIdIn(List<Long> tourIds);
    
    // Find transport selections by transport
    List<TourTransport> findByTransportId(Long transportId);
    
    // Find transport selections by travel date
    List<TourTransport> findByTravelDate(java.time.LocalDate travelDate);
    
    // Find transport selections by tour and travel date
    List<TourTransport> findByTourIdAndTravelDate(Long tourId, java.time.LocalDate travelDate);
    
    // Find all transport selections with details
    @Query("SELECT tt FROM TourTransport tt JOIN FETCH tt.tour t JOIN FETCH tt.transport tr")
    List<TourTransport> findAllWithDetails();
    
    // Find transport selections for a tour with details
    @Query("SELECT tt FROM TourTransport tt JOIN FETCH tt.tour t JOIN FETCH tt.transport tr WHERE tt.tour.id = :tourId")
    List<TourTransport> findByTourIdWithDetails(@Param("tourId") Long tourId);
    
    // Delete all transport selections for a tour
    void deleteByTourId(Long tourId);
    
    // Count transport selections for a tour
    long countByTourId(Long tourId);
} 