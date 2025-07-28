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
    @Query("SELECT tt FROM TourTransport tt WHERE tt.tour.id = :tourId ORDER BY tt.date")
    List<TourTransport> findByTourId(@Param("tourId") Long tourId);
    
    // Find transport selection by tour and transport
    @Query("SELECT tt FROM TourTransport tt WHERE tt.tour.id = :tourId AND tt.transport.id = :transportId")
    TourTransport findByTourIdAndTransportId(@Param("tourId") Long tourId, @Param("transportId") Long transportId);
    
    // Delete all transport selections for a tour
    @Query("DELETE FROM TourTransport tt WHERE tt.tour.id = :tourId")
    void deleteByTourId(@Param("tourId") Long tourId);
} 