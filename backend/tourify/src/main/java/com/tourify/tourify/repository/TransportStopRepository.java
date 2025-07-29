package com.tourify.tourify.repository;

import com.tourify.tourify.entity.TransportStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportStopRepository extends JpaRepository<TransportStop, TransportStop.TransportStopId> {
    
    // Find all stops for a specific transport
    List<TransportStop> findByTransportId(Long transportId);
    
    // Find all stops for multiple transports
    List<TransportStop> findByTransportIdIn(List<Long> transportIds);
    
    // Find stops by destination
    List<TransportStop> findByStopId(Long stopId);
    
    // Find stops by multiple destinations
    List<TransportStop> findByStopIdIn(List<Long> stopIds);
    
    // Find specific stop for a transport and destination
    TransportStop findByTransportIdAndStopId(Long transportId, Long stopId);
    
    // Find all stops with transport and destination details
    // @Query("SELECT ts FROM TransportStop ts JOIN FETCH ts.transport t JOIN FETCH ts.stop s")
    // List<TransportStop> findAllWithDetails();
    
    // Find stops for specific transports with details
    // @Query("SELECT ts FROM TransportStop ts JOIN FETCH ts.transport t JOIN FETCH ts.stop s WHERE ts.transport.id IN :transportIds")
    // List<TransportStop> findByTransportIdsWithDetails(@Param("transportIds") List<Long> transportIds);
    
    // Find stops by destination with details
    // @Query("SELECT ts FROM TransportStop ts JOIN FETCH ts.transport t JOIN FETCH ts.stop s WHERE ts.stop.id = :stopId")
    // List<TransportStop> findByStopIdWithDetails(@Param("stopId") Long stopId);
} 