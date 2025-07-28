package com.tourify.tourify.repository;

import com.tourify.tourify.entity.SpecialEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SpecialEventRepository extends JpaRepository<SpecialEvent, Long> {
    
    // Find events by destination ID
    List<SpecialEvent> findByDestinationId(Long destinationId);
    
    // Find events by destination ID and date range (within 10 days before or after tour dates)
    @Query("SELECT se FROM SpecialEvent se WHERE se.destination.id = :destinationId " +
           "AND ((se.startDate BETWEEN :tourStartDate AND :tourEndDate) " +
           "OR (se.endDate BETWEEN :tourStartDate AND :tourEndDate) " +
           "OR (se.startDate <= :tourStartDate AND se.endDate >= :tourEndDate) " +
           "OR (se.startDate >= :tourStartDate AND se.startDate <= :tourEndDate) " +
           "OR (se.endDate >= :tourStartDate AND se.endDate <= :tourEndDate) " +
           "OR (se.startDate BETWEEN :extendedStartDate AND :extendedEndDate) " +
           "OR (se.endDate BETWEEN :extendedStartDate AND :extendedEndDate))")
    List<SpecialEvent> findEventsByDestinationAndDateRange(
        @Param("destinationId") Long destinationId,
        @Param("tourStartDate") LocalDate tourStartDate,
        @Param("tourEndDate") LocalDate tourEndDate,
        @Param("extendedStartDate") LocalDate extendedStartDate,
        @Param("extendedEndDate") LocalDate extendedEndDate
    );
    
    // Find events that are within 10 days before or after the tour dates
    @Query("SELECT se FROM SpecialEvent se WHERE se.destination.id = :destinationId " +
           "AND ((se.startDate BETWEEN :extendedStartDate AND :extendedEndDate) " +
           "OR (se.endDate BETWEEN :extendedStartDate AND :extendedEndDate) " +
           "OR (se.startDate <= :extendedStartDate AND se.endDate >= :extendedEndDate))")
    List<SpecialEvent> findEventsWithinDateRange(
        @Param("destinationId") Long destinationId,
        @Param("extendedStartDate") LocalDate extendedStartDate,
        @Param("extendedEndDate") LocalDate extendedEndDate
    );
} 