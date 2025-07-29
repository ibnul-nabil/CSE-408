package com.tourify.tourify.repository;

import com.tourify.tourify.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Long> {
    
    // Find transports by type
    List<Transport> findByType(String type);
    
    // Find transports by class
    List<Transport> findByTransportClass(String transportClass);
    
    // Find transports by type and class
    List<Transport> findByTypeAndTransportClass(String type, String transportClass);
    
    // Find transports by start place
    List<Transport> findByStartPlaceId(Long startPlaceId);
    
    // Find transports by end place
    List<Transport> findByEndPlaceId(Long endPlaceId);
    
    // Find transports by start and end places
    List<Transport> findByStartPlaceIdAndEndPlaceId(Long startPlaceId, Long endPlaceId);
    
    // Find transports by name containing (case insensitive)
    List<Transport> findByNameContainingIgnoreCase(String name);
    
    // Custom query to find transports with stops
    @Query("SELECT t FROM Transport t")
    List<Transport> findAllWithStops();
    
    // Find transports that have stops at specific destinations
    // @Query("SELECT DISTINCT t FROM Transport t JOIN t.stops s WHERE s.stop.id IN :destinationIds")
    // List<Transport> findByStopsInDestinations(@Param("destinationIds") List<Long> destinationIds);
    
    // Find transports by route (start to end)
    @Query("SELECT t FROM Transport t WHERE t.startPlace.id = :startId AND t.endPlace.id = :endId")
    List<Transport> findByRoute(@Param("startId") Long startId, @Param("endId") Long endId);
} 